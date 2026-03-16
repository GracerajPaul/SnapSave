import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
  });

  const TG_BOT_TOKEN = (process.env.TG_BOT_TOKEN || ("8585527211:" + "AAFe2LSDTn_EnKqwCKiBt9f_CKi1VJJttOQ")).trim();
  const TG_CHAT_ID = (process.env.TG_CHAT_ID || "7303640347").trim();

  console.log(`[CONFIG] Bot Token: ${process.env.TG_BOT_TOKEN ? 'Loaded from ENV' : 'Using Fallback'}`);
  console.log(`[CONFIG] Chat ID: ${process.env.TG_CHAT_ID ? 'Loaded from ENV' : 'Using Fallback'}`);

  if (!process.env.TG_BOT_TOKEN || !process.env.TG_CHAT_ID) {
    console.warn("WARNING: TG_BOT_TOKEN or TG_CHAT_ID is missing from environment variables. Using fallbacks.");
  }

  // --- API Routes ---

  // Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Telegram Health Check
  app.get("/api/vault/tg-health", async (_req, res) => {
    try {
      const botInfo = await axios.get(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getMe`);
      
      // Also try to check the chat
      let chatInfo = null;
      try {
        const chatRes = await axios.get(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getChat`, {
          params: { chat_id: TG_CHAT_ID }
        });
        chatInfo = chatRes.data.result;
      } catch (chatErr: any) {
        chatInfo = { error: chatErr.response?.data || chatErr.message };
      }

      res.json({ 
        ok: true, 
        bot: botInfo.data.result,
        chat: chatInfo,
        config: {
          hasToken: !!TG_BOT_TOKEN,
          hasChatId: !!TG_CHAT_ID,
          chatIdPrefix: TG_CHAT_ID?.substring(0, 4)
        }
      });
    } catch (error: any) {
      console.error("Telegram Health Check Error:", error.response?.data || error.message);
      res.status(500).json({ ok: false, error: error.response?.data || error.message });
    }
  });

  // Telegram Upload Proxy
  app.post("/api/vault/upload", upload.single("document"), async (req, res) => {
    const fileName = req.file?.originalname || "unknown";
    console.log(`[UPLOAD] Received request for: ${fileName} (${req.file?.size} bytes)`);
    
    try {
      if (!req.file) {
        console.error("[UPLOAD] Error: No file in request");
        return res.status(400).json({ ok: false, description: "No file uploaded. Ensure the field name is 'document'." });
      }

      if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
        console.error("[UPLOAD] Error: Telegram configuration missing");
        return res.status(500).json({ ok: false, description: "Server Telegram configuration is incomplete." });
      }

      const formData = new FormData();
      formData.append("chat_id", TG_CHAT_ID);
      formData.append("document", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      console.log(`[UPLOAD] Forwarding ${fileName} to Telegram...`);
      
      const response = await axios.post(
        `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendDocument`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 120000, // Increase to 120s for larger files
        }
      );

      console.log(`[UPLOAD] Telegram success for ${fileName}: ${response.data.ok}`);
      res.json(response.data);
    } catch (error: any) {
      const errorData = error.response?.data || { ok: false, description: error.message };
      console.error(`[UPLOAD] Telegram Error for ${fileName}:`, JSON.stringify(errorData));
      
      // If it's a timeout or network error
      if (error.code === 'ECONNABORTED') {
        return res.status(504).json({ ok: false, description: "Gateway Timeout: Telegram took too long to respond." });
      }

      res.status(error.response?.status || 500).json(errorData);
    }
  });

  // Telegram Get File Info Proxy
  app.get("/api/vault/shard-info/:fileId", async (req, res) => {
    try {
      const { fileId } = req.params;
      if (!TG_BOT_TOKEN) {
        return res.status(500).json({ ok: false, description: "TG_BOT_TOKEN is not configured on the server." });
      }

      const response = await axios.get(
        `https://api.telegram.org/bot${TG_BOT_TOKEN}/getFile`,
        { 
          params: { file_id: fileId },
          timeout: 10000 
        }
      );
      res.json(response.data);
    } catch (error: any) {
      const status = error.response?.status || 500;
      const data = error.response?.data || { ok: false, description: error.message };
      console.error(`Telegram GetFile Error [${status}]:`, data);
      res.status(status).json(data);
    }
  });

  // Telegram File Download Proxy (to avoid CORS on direct file links)
  app.get("/api/vault/shard-download", async (req, res) => {
    const { filePath } = req.query;
    console.log(`[DOWNLOAD] Request for path: ${filePath}`);
    
    try {
      if (!filePath) return res.status(400).send("Missing filePath");
      if (!TG_BOT_TOKEN) return res.status(500).send("TG_BOT_TOKEN is not configured");

      const fileUrl = `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${filePath as string}`;
      const response = await axios.get(fileUrl, { 
        responseType: "stream",
        timeout: 60000, // 60 second timeout for downloads
        headers: {
          'User-Agent': 'SnapSave/1.0'
        }
      });
      
      // Forward headers
      const contentType = response.headers["content-type"];
      if (contentType) res.setHeader("Content-Type", contentType);
      
      const contentLength = response.headers["content-length"];
      if (contentLength) res.setHeader("Content-Length", contentLength);

      // Cache for 1 hour
      res.setHeader("Cache-Control", "public, max-age=3600");
      
      response.data.pipe(res);

      // Handle stream errors
      response.data.on('error', (err: any) => {
        console.error("[DOWNLOAD] Stream Error:", err.message);
        if (!res.headersSent) {
          res.status(500).send("Stream interrupted");
        }
      });
    } catch (error: any) {
      const status = error.response?.status || 500;
      const data = error.response?.data || error.message;
      console.error(`[DOWNLOAD] Telegram Download Error [${status}]:`, data);
      if (!res.headersSent) {
        res.status(status).send(typeof data === 'string' ? data : "Failed to download file");
      }
    }
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // Global Error Handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Global Server Error:", err);
    res.status(500).json({ ok: false, description: "Internal Server Error", error: err.message });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

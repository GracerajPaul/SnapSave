import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  const upload = multer({ storage: multer.memoryStorage() });

  const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
  const TG_CHAT_ID = process.env.TG_CHAT_ID;

  if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
    console.warn("WARNING: TG_BOT_TOKEN or TG_CHAT_ID is missing from environment variables.");
  }

  // --- API Routes ---

  // Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Telegram Upload Proxy
  app.post("/api/vault/upload", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ ok: false, description: "No file uploaded" });
      }

      const formData = new FormData();
      formData.append("chat_id", TG_CHAT_ID);
      formData.append("document", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const response = await axios.post(
        `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendDocument`,
        formData,
        {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error("Telegram Upload Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { ok: false, description: error.message });
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
    try {
      const { filePath } = req.query;
      if (!filePath) return res.status(400).send("Missing filePath");
      if (!TG_BOT_TOKEN) return res.status(500).send("TG_BOT_TOKEN is not configured");

      const fileUrl = `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${filePath as string}`;
      const response = await axios.get(fileUrl, { 
        responseType: "stream",
        timeout: 30000 // 30 second timeout for downloads
      });
      
      // Forward headers
      const contentType = response.headers["content-type"];
      if (contentType) res.setHeader("Content-Type", contentType);
      
      const contentLength = response.headers["content-length"];
      if (contentLength) res.setHeader("Content-Length", contentLength);
      
      response.data.pipe(res);

      // Handle stream errors
      response.data.on('error', (err: any) => {
        console.error("Stream Error:", err.message);
        if (!res.headersSent) {
          res.status(500).send("Stream interrupted");
        }
      });
    } catch (error: any) {
      console.error("Telegram Download Error:", error.message);
      if (!res.headersSent) {
        res.status(500).send("Failed to download file");
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

import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const TG_BOT_TOKEN = (process.env.TG_BOT_TOKEN || ("8585527211:" + "AAFe2LSDTn_EnKqwCKiBt9f_CKi1VJJttOQ")).trim();
const TG_CHAT_ID = (process.env.TG_CHAT_ID || "7303640347").trim();

// --- API Routes ---

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Telegram Health Check
app.get("/api/vault/tg-health", async (_req, res) => {
  try {
    const botInfo = await axios.get(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getMe`);
    
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
        hasChatId: !!TG_CHAT_ID
      }
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.response?.data || error.message });
  }
});

// Telegram Upload Proxy
app.post("/api/vault/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, description: "No file uploaded." });
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
        headers: { ...formData.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000,
      }
    );

    res.json(response.data);
  } catch (error: any) {
    const errorData = error.response?.data || { ok: false, description: error.message };
    res.status(error.response?.status || 500).json(errorData);
  }
});

// Telegram Get File Info Proxy
app.get("/api/vault/shard-info/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const response = await axios.get(
      `https://api.telegram.org/bot${TG_BOT_TOKEN}/getFile`,
      { params: { file_id: fileId }, timeout: 10000 }
    );
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { ok: false, description: error.message });
  }
});

// Telegram File Download Proxy
app.get("/api/vault/shard-download", async (req, res) => {
  const { filePath } = req.query;
  try {
    if (!filePath) return res.status(400).send("Missing filePath");

    const fileUrl = `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${filePath as string}`;
    const response = await axios.get(fileUrl, { 
      responseType: "arraybuffer",
      timeout: 90000,
    });
    
    const contentType = response.headers["content-type"];
    if (contentType) res.setHeader("Content-Type", contentType);
    
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(Buffer.from(response.data));
  } catch (error: any) {
    res.status(error.response?.status || 500).send("Failed to download file");
  }
});

export default app;

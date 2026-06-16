import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Interpretation Route
  app.post("/api/interpret-tarot", async (req, res) => {
    try {
      const { cards, type, question } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing. Please configure it in the Secrets panel." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Anda adalah seorang ahli pembaca Tarot yang bijaksana, empatik, dan inspiratif.
Pengguna telah memilih bacaan tipe: ${type}.
Kartu yang ditarik: ${cards.map((c: any) => c.name).join(", ")}.
Pertanyaan pengguna (opsional): ${question || "Tidak ada, hanya pembacaan umum harian."}

Berikan interpretasi yang mendalam, bermakna, dan menenangkan dalam bahasa Indonesia.
Tulis dalam format Markdown. Struktur:
- Pendahuluan singkat
- Makna masing-masing kartu (dan posisinya jika relevan)
- Kesimpulan dan pesan inspiratif.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error generating tarot reading:", error);
      res.status(500).json({ error: error.message || "Failed to generate reading." });
    }
  });

  // API Check Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

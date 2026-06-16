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
      const { cards, type, question, profile } = req.body;
      
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

      let profileContext = "";
      if (profile) {
        profileContext = `\nInformasi Klien:
- Nama: ${profile.name || 'Tidak disebutkan'}
- Tanggal Lahir: ${profile.birthDate ? profile.birthDate : 'Tidak disebutkan'} ${profile.birthDate ? '(Tolong sertakan wawasan astrologi/zodiak klien berdasarkan tanggal lahir ini dalam bacaan)' : ''}
- Kesibukan Saat Ini: ${profile.currentActivity ? profile.currentActivity : 'Tidak disebutkan'}
- Status Hubungan: ${profile.relationshipStatus ? profile.relationshipStatus : 'Tidak disebutkan'}\n`;
      }

      const prompt = `Anda adalah seorang ahli pembaca Tarot yang bijaksana, empatik, dan inspiratif.
Pengguna telah memilih bacaan tipe: ${type}.
Kartu yang ditarik: ${cards.map((c: any) => c.name).join(", ")}.
Pertanyaan pengguna (opsional): ${question || "Tidak ada, hanya pembacaan umum harian."}${profileContext}

Berikan interpretasi yang mendalam, bermakna, personal, dan menenangkan dalam bahasa Indonesia dengan mengaitkannya ke informasi klien jika ada. Jika tanggal lahir klien tersedia, identifikasi zodiaknya dan sertakan paragraf khusus mengenai wawasan astrologi yang berhubungan dengan bacaan ini.

Tulis dalam format Markdown. Struktur:
- Pendahuluan singkat
- Wawasan Astrologi (jika tanggal lahir diketahui)
- Makna masing-masing kartu (dan posisinya jika relevan)
- Kesimpulan dan pesan inspiratif.`;

      let responseText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        responseText = response.text || "";
      } catch (err: any) {
        throw new Error(err.message || "Failed to generate reading.");
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Error generating tarot reading:", error);
      res.status(500).json({ error: error.message || "Failed to generate reading." });
    }
  });

  // AI Interpretation for specific card in Encyclopedia
  app.post("/api/interpret-card", async (req, res) => {
    try {
      const { cardName, arcana, isReversed } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing. Please configure it in the Settings." });
      }

      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }});

      const positionText = isReversed ? "terbalik (reversed)" : "tegak (upright)";
      const prompt = `Anda adalah seorang ahli Tarot Ensiklopedia.
Berikan penjelasan mendalam mengenai kartu: ${cardName} (${arcana} Arcana) dalam posisi ${positionText}.
Jelaskan makna intinya, pengaruhnya dalam cinta, karir, spiritualitas, serta pesan kuncinya.
Tuliskan jawabannya dalam format Markdown yang rapi dan mudah dibaca (gunakan judul, bullet points).`;

      let responseText = "";
      try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
        responseText = response.text || "";
      } catch (err: any) {
        throw new Error(err.message || "Failed to generate interpretation.");
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Error generating card interpretation:", error);
      res.status(500).json({ error: error.message || "Failed to generate interpretation." });
    }
  });

  // AI Chat Master Route
  app.post("/api/chat-master", async (req, res) => {
    try {
      const { readingContext, message, chatHistory } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing. Please configure it in the Settings." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `Anda adalah Tarot Master yang bijaksana, empatik, dan berpengalaman.
Pengguna sedang berkonsultasi mengenai hasil bacaan tarot mereka.
Konteks Bacaan:
- Tipe Bacaan: ${readingContext.type}
- Pertanyaan Pengguna: ${readingContext.question || 'Tidak ada'}
- Kartu yang ditarik: ${readingContext.cards}
- Interpretasi Dasar: ${readingContext.interpretation}

Tugas Anda adalah menjawab pertanyaan atau keluh kesah pengguna terkait bacaan ini. 
Berbicaralah selayaknya seorang Master Tarot yang sedang duduk bersama mereka. 
Gunakan bahasa Indonesia yang empatik, sedikit puitis namun tetap membumi dan membantu.
Tuliskan balasan dalam format Markdown.`;

      const rawContents = [];
      
      if (chatHistory && chatHistory.length > 0) {
        for (const msg of chatHistory) {
          rawContents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }

      rawContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      // Ensure alternating roles to avoid 400 Bad Request
      const contents = [];
      let lastRole = null;
      for (const item of rawContents) {
        if (item.role !== lastRole) {
          contents.push({ role: item.role, parts: [...item.parts] });
          lastRole = item.role;
        } else {
          // Flatten adjacent parts
          contents[contents.length - 1].parts.push({ text: "\n\n" }, ...item.parts);
        }
      }

      // Ensure first role is 'user'
      if (contents.length > 0 && contents[0].role === 'model') {
        contents.unshift({ role: 'user', parts: [{ text: 'Halo' }] });
      }

      let responseText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
          }
        });
        responseText = response.text || "";
      } catch (err: any) {
        console.warn(`Model gemini-2.5-flash failed for chat:`, err.message);
        throw err;
      }

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Error generating chat response:", error);
      res.status(500).json({ error: error.message || "Gagal menghubungi Tarot Master." });
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

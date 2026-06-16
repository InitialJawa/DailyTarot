import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { readingContext, message, chatHistory } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured on Vercel. Please add it to Environment Variables and Redeploy." });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    const contents = [];
    let lastRole = null;
    for (const item of rawContents) {
      if (item.role !== lastRole) {
        contents.push({ role: item.role, parts: [...item.parts] });
        lastRole = item.role;
      } else {
        contents[contents.length - 1].parts.push({ text: "\n\n" }, ...item.parts);
      }
    }

    if (contents.length > 0 && contents[0].role === 'model') {
      contents.unshift({ role: 'user', parts: [{ text: 'Halo' }] });
    }

    const modelsToTry = [
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-3.0-flash",
      "gemini-1.5-flash"
    ];
    let responseText = "";
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
          }
        });
        responseText = response.text || "";
        break;
      } catch (err) {
        console.warn(`Model ${model} failed for chat:`, err?.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw new Error(lastError?.message || "Semua model Gemini gagal merespons.");
    }

    res.json({ text: responseText });
  } catch (error) {
    console.error("Gemini API Error in chat-master:", error);
    res.status(500).json({ error: error.message || "Gagal menghubungi Tarot Master." });
  }
}

import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cardName, arcana, isReversed } = req.body;

    if (!cardName) {
      return res.status(400).json({ error: "Invalid card data" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured. Please add it to Environment Variables." });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const positionText = isReversed ? "terbalik (reversed)" : "tegak (upright)";
    const prompt = `Anda adalah seorang ahli Tarot Ensiklopedia.
Berikan penjelasan mendalam mengenai kartu: ${cardName} (${arcana} Arcana) dalam posisi ${positionText}.
Jelaskan makna intinya, pengaruhnya dalam cinta, karir, spiritualitas, serta pesan kuncinya.
Tuliskan jawabannya dalam format Markdown yang rapi dan mudah dibaca (gunakan judul, bullet points).`;

    const modelsToTry = ["gemini-2.5-flash-lite", "gemini-2.5-flash", "gemini-1.5-flash"];
    let responseText = "";
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });
        responseText = response.text || "";
        break;
      } catch (err) {
        console.warn(`Model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw new Error(lastError?.message || "Semua model Gemini gagal merespons.");
    }

    res.status(200).json({ text: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate interpretation." });
  }
}

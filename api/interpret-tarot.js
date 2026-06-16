import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, cards, question } = req.body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: "Invalid cards data" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let prompt = `Anda adalah seorang pembaca Tarot profesional yang empatik dan berwawasan luas. Berikan interpretasi mendalam untuk bacaan berikut:\n\n`;
    prompt += `Jenis Tebaran: ${type}\n`;
    if (question) {
      prompt += `Pertanyaan/Fokus: "${question}"\n\n`;
    }
    
    prompt += `Kartu yang ditarik:\n`;
    cards.forEach((card, index) => {
      prompt += `${index + 1}. ${card.name} (${card.arcana} Arcana)\n`;
    });

    prompt += `\nBerikan interpretasi dalam format Markdown. Struktur yang disarankan:
- Makna keseluruhan dari kombinasi kartu.
- Analisis per kartu dalam konteks tebaran.
- Kesimpulan dan pesan inspiratif.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate interpretation." });
  }
}

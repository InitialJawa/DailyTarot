import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, cards, question, profile } = req.body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: "Invalid cards data" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured on Vercel. Please add it to Environment Variables and Redeploy." });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let profileContext = "";
    if (profile) {
        profileContext = `\nInformasi Klien:
- Nama: ${profile.name || 'Tidak disebutkan'}
- Tanggal Lahir: ${profile.birthDate ? profile.birthDate : 'Tidak disebutkan'} ${profile.birthDate ? '(Tolong sertakan wawasan astrologi/zodiak klien berdasarkan tanggal lahir ini dalam bacaan)' : ''}
- Kesibukan Saat Ini: ${profile.currentActivity ? profile.currentActivity : 'Tidak disebutkan'}
- Status Hubungan: ${profile.relationshipStatus ? profile.relationshipStatus : 'Tidak disebutkan'}\n`;
    }
    
    let prompt = `Anda adalah seorang pembaca Tarot profesional yang empatik dan berwawasan luas. Berikan interpretasi mendalam untuk bacaan berikut berdasarkan profil klien:\n\n`;
    prompt += `Jenis Tebaran: ${type}\n`;
    if (question) {
      prompt += `Pertanyaan/Fokus: "${question}"\n`;
    }
    prompt += profileContext;
    
    prompt += `\nJika tanggal lahir klien tersedia, identifikasi zodiak mereka dan sertakan paragraf khusus wawasan astrologi yang relevan dengan energi kartu-kartu yang ditarik hari ini.\n`;
    
    prompt += `\nKartu yang ditarik:\n`;
    cards.forEach((card, index) => {
      prompt += `${index + 1}. ${card.name} (${card.arcana} Arcana)\n`;
    });

    prompt += `\nBerikan interpretasi dalam format Markdown. Struktur yang disarankan:
- Makna keseluruhan dari kombinasi kartu.
- Wawasan Astrologi (jika tanggal lahir diketahui).
- Analisis per kartu dalam konteks tebaran.
- Kesimpulan dan pesan inspiratif.`;

    const modelsToTry = [
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-3.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash",
      "gemini-2.5-pro"
    ];
    let responseText = "";
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });
        responseText = response.text || "";
        break; // If successful, exit the loop
      } catch (err) {
        console.warn(`Model ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!responseText) {
      throw new Error(lastError?.message || "Semua model Gemini gagal merespons.");
    }

    res.json({ text: responseText });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate interpretation." });
  }
}

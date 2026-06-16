import { TarotCard } from '../data/tarot';

const standardMeanings: Record<string, string> = {
  "0": "Awal yang baru, spontanitas, dan keyakinan akan hal yang belum diketahui. Pertanda bahwa Anda berada di ambang petualangan baru.",
  "1": "Manifestasi, sumber daya, dan kemampuan mengubah visi Anda menjadi kenyataan. Anda memiliki semua alat yang dibutuhkan.",
  "2": "Intuisi, misteri, dan pemahaman batin yang mendalam. Dengarkan suara hati Anda untuk panduan.",
  "3": "Kelimpahan, pengasuhan, dan penciptaan. Waktu yang baik untuk memelihara proyek dan hubungan.",
  "4": "Otoritas, struktur, stabilitas, dan kepemimpinan. Terapkan disiplin untuk mencapai tujuan Anda.",
  "5": "Tradisi, keyakinan spiritual, dan pencarian bimbingan. Terkadang mengikuti aturan yang ada lebih bermanfaat.",
  "6": "Pilihan, harmoni, dan hubungan yang bermakna. Pertimbangkan nilai persatuan dalam keputusan Anda.",
  "7": "Tekad, kendali, kemauan keras, dan kemenangan atas rintangan. Maju terus dengan fokus.",
  "8": "Kekuatan batin, keberanian, kasih sayang, dan kesabaran. Gunakan pendekatan lembut untuk menaklukkan tantangan.",
  "9": "Introspeksi, pencarian jiwa, dan kebijaksanaan batin. Waktu yang tepat untuk menyendiri dan merenung.",
  "10": "Keberuntungan, karma, siklus hidup, dan perubahan nasib. Segalanya sedang berputar, terimalah perubahan.",
  "11": "Keadilan, keseimbangan, kebenaran, dan hukum sebab akibat. Anda akan mendapatkan apa yang pantas Anda terima.",
  "12": "Penundaan, pelepasan, perspektif baru, dan pengorbanan. Biarkan segala sesuatu mengalir tanpa perlawanan.",
  "13": "Akhir, transformasi, transisi, dan perubahan mendalam. Lepaskan yang lama agar yang baru bisa masuk.",
  "14": "Keseimbangan, moderasi, kesabaran, dan memadukan dua hal yang berbeda menjadi satu kesatuan harmoni.",
  "15": "Keterikatan, materialisme, dan godaan. Sadari pikiran atau kebiasaan yang membatasi diri Anda.",
  "16": "Kehancuran struktur, wahyu tiba-tiba. Guncangan ini terjadi untuk membersihkan jalan baru bagi Anda.",
  "17": "Harapan, iman, peremajaan, dan inspirasi spiritual. Masa tenang dan penyembuhan setelah kekacauan.",
  "18": "Ilusi, ketakutan, kecemasan, dan eksplorasi bawah sadar. Jangan biarkan khayalan menguasai diri.",
  "19": "Sukses, pancaran, kepositifan, dan vitalitas. Puncak pencapaian dan kebahagiaan sejati.",
  "20": "Kelahiran kembali, panggilan batin, absolution, dan pengampunan. Anda siap untuk fase kehidupan berikutnya.",
  "21": "Penyelesaian, pencapaian utuh, dan akhir perjalanan yang memuaskan. Rayakan keberhasilan Anda."
};

export function generateOfflineInterpretation(cards: TarotCard[], spreadName: string, question?: string): string {
  let text = `### Interpretasi Keselarasan Batin (Mode Offline)\n\n`;
  
  if (question) {
    text += `*Pertanyaan Fokus: "${question}"*\n\n`;
  }
  
  text += `Berdasarkan bacaan penyebaran **${spreadName}**, berikut adalah makna mendalam dari kartu yang Anda tarik:\n\n`;
  
  cards.forEach((card, index) => {
    const meaning = standardMeanings[card.id] || "Membawa energi tersembunyi yang perlu diresapi.";
    text += `**${index + 1}. ${card.name}**: ${meaning}\n\n`;
  });
  
  text += `**Kesimpulan:**\nKartu-kartu ini menandakan sebuah fase perjalanan jiwa Anda. Setiap penyelarasan energi yang terungkap hari ini ditujukan untuk membawa Anda lebih dekat pada pemahaman sejati. Tetaplah terhubung dengan intuisi Anda, dan gunakan pesan dari kartu-kartu ini sebagai penuntun langkah Anda ke depan.`;
  
  return text;
}

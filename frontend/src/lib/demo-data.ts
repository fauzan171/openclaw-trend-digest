// ============================================
// OpenClaw Trend Digest — Demo Data for Portfolio Showcase
// Tim 6: Frontend & UI Team
// ============================================
// 
// Data demo ini digunakan ketika Supabase belum dikonfigurasi.
// Recruiter bisa langsung melihat tampilan UI tanpa setup database.
// ============================================

import type { DigestJSON } from "./api";

export const DEMO_DIGESTS: Array<{
  id: string;
  publish_date: string;
  raw_json: DigestJSON;
  created_at: string;
}> = [
  {
    id: "demo-1",
    publish_date: "2026-03-01",
    created_at: "2026-03-01T06:00:00Z",
    raw_json: {
      date: "1 Maret 2026",
      totalRawProcessed: 187,
      totalDiscarded: 180,
      topics: [
        {
          category: "Technology",
          headline: "React 20 Beta Dirilis dengan Fitur 'Zero-Bundle' Components",
          summary:
            "Meta merilis React 20 Beta yang memperkenalkan konsep Zero-Bundle Components — komponen yang sepenuhnya dijalankan di server tanpa mengirim JavaScript ke client. Komunitas developer merespons sangat positif, menyebut ini sebagai evolusi terbesar sejak Hooks diperkenalkan di React 16.8.",
          sentiment: "Positive",
          relevanceScore: 10,
          sources: [
            "https://react.dev/blog/2026/03/01/react-20-beta",
            "https://news.ycombinator.com/item?id=demo1",
          ],
          emoji: "⚛️",
        },
        {
          category: "Security",
          headline: "Kerentanan Kritis 'LogJam 2.0' Ditemukan di Library Logging Populer",
          summary:
            "Peneliti keamanan dari Google Project Zero menemukan kerentanan Remote Code Execution (RCE) pada library logging yang digunakan oleh 73% aplikasi Node.js enterprise. Patch sudah dirilis, semua developer diminta segera update.",
          sentiment: "Negative",
          relevanceScore: 9,
          sources: ["https://security.googleblog.com/demo-logjam2"],
          emoji: "🔒",
        },
        {
          category: "AI & Machine Learning",
          headline: "Google DeepMind Merilis Gemini 3.0 dengan Kemampuan 'Self-Correction'",
          summary:
            "DeepMind meluncurkan Gemini 3.0 yang mampu mendeteksi dan memperbaiki kesalahan dalam output-nya sendiri secara real-time. Model ini mencapai skor 92.4% pada benchmark MMLU-Pro, melampaui GPT-5 dan Claude 4.",
          sentiment: "Positive",
          relevanceScore: 9,
          sources: ["https://deepmind.google/blog/gemini-3"],
          emoji: "🤖",
        },
        {
          category: "Business",
          headline: "Startup Indonesia 'KodeKerja' Raih Pendanaan Seri B $45 Juta",
          summary:
            "KodeKerja, platform hiring developer berbasis AI asal Jakarta, berhasil meraih pendanaan Seri B senilai $45 juta yang dipimpin oleh Sequoia Capital Southeast Asia. Perusahaan berencana ekspansi ke pasar India dan Vietnam.",
          sentiment: "Positive",
          relevanceScore: 8,
          sources: ["https://techinasia.com/demo-kodekerja-series-b"],
          emoji: "💰",
        },
        {
          category: "Global",
          headline: "Uni Eropa Resmi Berlakukan 'AI Transparency Act' Mulai April 2026",
          summary:
            "Regulasi baru EU mewajibkan semua perusahaan teknologi yang menggunakan AI untuk mengungkapkan data training, bias model, dan memberikan opsi opt-out kepada pengguna. Perusahaan memiliki waktu 6 bulan untuk comply.",
          sentiment: "Mixed",
          relevanceScore: 8,
          sources: ["https://ec.europa.eu/demo-ai-transparency-act"],
          emoji: "🇪🇺",
        },
        {
          category: "Science",
          headline: "Terobosan Baterai Solid-State: Charging 0-100% dalam 8 Menit",
          summary:
            "Tim peneliti dari MIT dan Toyota mengumumkan baterai solid-state baru yang mampu di-charge penuh hanya dalam 8 menit dengan densitas energi 2x lipat baterai lithium-ion saat ini. Produksi massal diperkirakan 2028.",
          sentiment: "Positive",
          relevanceScore: 7,
          sources: ["https://news.mit.edu/demo-solid-state-battery"],
          emoji: "🔋",
        },
        {
          category: "Technology",
          headline: "Bun 2.0 Rilis dengan Built-in Database dan Deployment Platform",
          summary:
            "Jarred Sumner merilis Bun 2.0 yang kini menyertakan database SQLite built-in dan platform deployment serverless. Benchmark menunjukkan performa 3x lebih cepat dari Node.js 22 untuk workload HTTP standar.",
          sentiment: "Positive",
          relevanceScore: 7,
          sources: ["https://bun.sh/blog/bun-v2"],
          emoji: "🍞",
        },
      ],
    },
  },
  {
    id: "demo-2",
    publish_date: "2026-02-28",
    created_at: "2026-02-28T06:00:00Z",
    raw_json: {
      date: "28 Februari 2026",
      totalRawProcessed: 165,
      totalDiscarded: 160,
      topics: [
        {
          category: "Technology",
          headline: "TypeScript 6.0 Merilis Fitur 'Pattern Matching' yang Ditunggu-tunggu",
          summary:
            "Microsoft merilis TypeScript 6.0 dengan fitur pattern matching, const type parameters yang lebih baik, dan performa compiler 50% lebih cepat. Komunitas menyambut hangat fitur yang sudah lama diminta sejak 2020.",
          sentiment: "Positive",
          relevanceScore: 9,
          sources: ["https://devblogs.microsoft.com/typescript/demo-ts-6"],
          emoji: "📘",
        },
        {
          category: "AI & Machine Learning",
          headline: "OpenAI Meluncurkan 'GPT-5 Mini' untuk Perangkat Mobile",
          summary:
            "OpenAI mengumumkan GPT-5 Mini, model bahasa yang dioptimalkan untuk berjalan langsung di smartphone tanpa koneksi internet. Model berukuran 3GB ini mencapai 85% performa GPT-4 untuk task umum.",
          sentiment: "Positive",
          relevanceScore: 9,
          sources: ["https://openai.com/blog/demo-gpt5-mini"],
          emoji: "📱",
        },
        {
          category: "Security",
          headline: "GitHub Mendeteksi dan Memblokir 15.000 Package npm Berbahaya",
          summary:
            "GitHub Advanced Security mendeteksi kampanye supply chain attack besar-besaran yang menyisipkan malware ke 15.000 package npm. Semua package sudah dihapus dan developer diminta mengecek dependency mereka.",
          sentiment: "Negative",
          relevanceScore: 8,
          sources: ["https://github.blog/demo-npm-malware-detection"],
          emoji: "⚠️",
        },
        {
          category: "National",
          headline: "Pemerintah Indonesia Luncurkan Program 'Digital Talent 2026'",
          summary:
            "Kemkominfo meluncurkan program pelatihan coding gratis untuk 1 juta pemuda Indonesia. Program mencakup Web Development, AI/ML, dan Cloud Computing dengan sertifikasi internasional dari Google dan AWS.",
          sentiment: "Positive",
          relevanceScore: 7,
          sources: ["https://kominfo.go.id/demo-digital-talent-2026"],
          emoji: "🇮🇩",
        },
        {
          category: "Business",
          headline: "Stack Overflow Pivot ke Platform AI-Assisted Q&A",
          summary:
            "Stack Overflow mengumumkan transformasi besar dengan mengintegrasikan AI assistant yang dapat menjawab pertanyaan coding secara real-time. Traffic organik turun 40% sejak ChatGPT, langkah ini dianggap sebagai upaya survival.",
          sentiment: "Mixed",
          relevanceScore: 7,
          sources: ["https://stackoverflow.blog/demo-ai-pivot"],
          emoji: "📊",
        },
      ],
    },
  },
];

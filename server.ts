import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { PRODUCTS } from "./src/data/products";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Get all products
  app.get("/api/products", (req: Request, res: Response) => {
    res.json(PRODUCTS);
  });

  // API 2: AI Stylist chat endpoint (Lazy initialization of GoogleGenAI)
  app.post("/api/stylist", async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      // Handle missing API key gracefully without crashing the server
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is not configured in the environment variables.");
        return res.json({
          text: "Halo Kak! Saya adalah Asisten AI Stylist TrendMode. Maaf sekali, saat ini modul kecerdasan AI saya belum dikonfigurasi dengan API Key oleh developer. \n\nNamun, Kakak bisa tetap berbelanja koleksi fashion premium kami secara manual menggunakan katalog di layar ya! Jika Anda adalah administrator, silakan tambahkan kunci `GEMINI_API_KEY` di menu **Settings > Secrets**."
        });
      }

      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Lazy load client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Prepare catalog data summary for the AI context
      const catalogSummary = PRODUCTS.map((p) => {
        return `- ID: ${p.id}\n  Nama: ${p.name}\n  Kategori: ${p.category}\n  Harga: Rp ${p.price.toLocaleString("id-ID")}${p.originalPrice ? ` (Diskon dari Rp ${p.originalPrice.toLocaleString("id-ID")})` : ""}\n  Rating: ${p.rating} (${p.reviewCount} ulasan)\n  Deskripsi: ${p.description}\n  Pilihan Ukuran: ${p.sizes.join(", ")}\n  Pilihan Warna: ${p.colors.map(c => c.name).join(", ")}`;
      }).join("\n\n");

      // System instruction in Indonesian
      const systemInstruction = `Kamu adalah "Asisten Gaya AI" (AI Personal Stylist) yang ahli, ramah, dan sangat modis untuk TrendMode Fashion Store, butik fashion online premium terbaik di Indonesia.

Tugas utamamu:
1. Menyapa pelanggan dengan ramah dan sopan (panggil pelanggan dengan sebutan "Kak" atau "Kakak").
2. Membantu memberikan inspirasi padu padan pakaian (mix-and-match), tips berbusana berdasarkan cuaca, bentuk tubuh, acara (misal wisuda, liburan pantai, kerja kantor), atau preferensi warna.
3. Merekomendasikan produk NYATA dari katalog toko kami di bawah ini. Sebutkan nama produk secara tepat, harganya, dan kelebihannya secara menarik. Jangan mengarang produk yang tidak ada di katalog!
4. Jika produk yang dicari tidak ada (misal baju renang), katakan dengan jujur dan sarankan alternatif terdekat dari katalog kami (misal gaun floral musim panas atau kemeja linen santai).
5. Berikan respon menggunakan format Markdown yang rapi (gunakan bolding, daftar poin, atau paragraf pendek) agar enak dibaca.

Katalog Produk TrendMode Yang Tersedia:
${catalogSummary}

Silakan jawab pertanyaan pelanggan berdasarkan petunjuk di atas! Jaga gaya bahasa agar tetap antusias, elegan, profesional, dan menyenangkan layaknya asisten fashion pribadi di butik mewah.`;

      // Map chat history to the structure required by Gemini API
      // contents format: Array<{ role: 'user' | 'model', parts: Array<{ text: string }> }>
      const contents = [];

      // Add historical chat messages
      if (Array.isArray(history)) {
        for (const msg of history) {
          if (msg.role === "user" || msg.role === "model") {
            contents.push({
              role: msg.role,
              parts: [{ text: msg.text || "" }],
            });
          }
        }
      }

      // Add the latest user message
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      // Call Gemini API using the recommended gemini-3.5-flash model
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "Maaf Kak, saya tidak dapat merespon saat ini. Silakan coba sesaat lagi!";
      
      return res.json({ text: responseText });
    } catch (error: any) {
      console.error("Error in AI Stylist endpoint:", error);
      return res.status(500).json({ 
        error: "Terjadi kesalahan pada sistem asisten AI.", 
        details: error.message 
      });
    }
  });

  // Integration of Vite middleware for dev or serving built files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files in production mode from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TrendMode] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

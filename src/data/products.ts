export interface Product {
  id: string;
  name: string;
  category: "pria" | "wanita" | "aksesoris" | "sepatu";
  price: number;
  originalPrice?: number;
  discount?: number; // percentage
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  isPopular?: boolean;
  inStock: number;
}

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Jaket Denim Crop Retro",
    category: "pria", // displayed as Atasan & Outer
    price: 389000,
    originalPrice: 489000,
    discount: 20,
    rating: 4.8,
    reviewCount: 142,
    description: "Jaket denim premium wanita dengan potongan crop retro tahun 90-an yang super modis. Terbuat dari katun denim 100% berkualitas tinggi yang tebal namun tetap adem dipakai. Sempurna untuk dipadukan dengan celana high-waist atau dress favorit Anda.",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Biru Klasik", hex: "#2b4c7e" },
      { name: "Biru Wash", hex: "#6082b6" },
      { name: "Hitam Pekat", hex: "#1a1a1a" }
    ],
    isPopular: true,
    inStock: 15
  },
  {
    id: "p2",
    name: "Blouse Silk Satin Premium",
    category: "pria", // displayed as Atasan & Outer
    price: 249000,
    originalPrice: 299000,
    discount: 16,
    rating: 4.6,
    reviewCount: 88,
    description: "Atasan blouse wanita berbahan silk satin organik mewah yang super lembut dan berkilau halus. Desain kerah v-neck yang anggun memberikan kesan jenjang dan leher yang elegan. Sangat mewah untuk ke kantor, rapat formal, maupun gala dinner.",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Putih Mutiara", hex: "#fbf6f0" },
      { name: "Sage Green", hex: "#7a8b7b" },
      { name: "Champagne Gold", hex: "#e1c699" }
    ],
    isPopular: true,
    inStock: 22
  },
  {
    id: "p3",
    name: "Knit Top Ribbed Halter Neck",
    category: "pria", // displayed as Atasan & Outer
    price: 129000,
    rating: 4.9,
    reviewCount: 310,
    description: "Atasan rajut ribbed premium dengan potongan halter neck yang sangat stylish dan mempercantik siluet bahu Anda. Dibuat menggunakan serat rajut katun elastis premium yang menyerap keringat dan lembut di kulit.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
    sizes: ["All Size Fit to L"],
    colors: [
      { name: "Hitam Carbon", hex: "#111111" },
      { name: "Terracotta", hex: "#c35237" },
      { name: "Oatmeal", hex: "#dfd5c6" }
    ],
    isPopular: false,
    inStock: 50
  },
  {
    id: "p4",
    name: "Celana Kulot Linen Highwaist",
    category: "pria", // displayed as Atasan & Outer / Celana
    price: 299000,
    originalPrice: 349000,
    discount: 14,
    rating: 4.7,
    reviewCount: 115,
    description: "Celana kulot wanita berpotongan pinggang tinggi (highwaist) yang memberikan ilusi kaki panjang dan ramping. Terbuat dari serat linen alami premium bebas gatal dan super flowy saat melangkah. Sempurna untuk gaya kasual kasual-formal.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Khaki Pasir", hex: "#c3b091" },
      { name: "Hitam Solid", hex: "#1c1c1c" },
      { name: "Olive Green", hex: "#556b2f" }
    ],
    isPopular: false,
    inStock: 18
  },
  {
    id: "p5",
    name: "Gaun Floral Chiffon Musim Panas",
    category: "wanita", // displayed as Gaun & Dress
    price: 349000,
    originalPrice: 429000,
    discount: 18,
    rating: 4.8,
    reviewCount: 95,
    description: "Gaun midi floral yang sangat anggun dengan bahan sifon berkualitas tinggi yang melambai dengan cantik. Dilengkapi furing sutra lembut di bagian dalam sehingga tidak menerawang. Sangat manis untuk piknik sore maupun kencan romantis.",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Merah Muda Pastel", hex: "#ffb7c5" },
      { name: "Kuning Cerah", hex: "#ffdf00" },
      { name: "Biru Langit", hex: "#87ceeb" }
    ],
    isPopular: true,
    inStock: 12
  },
  {
    id: "p6",
    name: "Blazer Formal Double-Breasted",
    category: "wanita", // displayed as Gaun & Dress
    price: 429000,
    originalPrice: 499000,
    discount: 14,
    rating: 4.7,
    reviewCount: 67,
    description: "Blazer semi-formal dengan potongan double-breasted yang tegas dan elegan untuk wanita modern. Bahan luar semi-wool berkualitas dipadukan dengan satin halus di bagian dalam untuk kenyamanan sepanjang hari di kantor. Memberikan tampilan profesional yang sangat stylish.",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Hitam Formal", hex: "#121212" },
      { name: "Merah Burgundy", hex: "#800020" },
      { name: "Krem Premium", hex: "#f5f5dc" }
    ],
    isPopular: true,
    inStock: 8
  },
  {
    id: "p7",
    name: "Cardigan Rajut Oversize Korea",
    category: "wanita", // displayed as Gaun & Dress
    price: 189000,
    rating: 4.5,
    reviewCount: 204,
    description: "Kardigan rajut tebal wanita dengan gaya rajutan longgar ala Korea Selatan. Potongan oversize yang kasual memberikan kesan cozy dan santai namun tetap modis. Sangat hangat untuk dipakai di ruangan ber-AC maupun saat cuaca dingin.",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80",
    sizes: ["All Size"],
    colors: [
      { name: "Cokelat Almond", hex: "#c2b280" },
      { name: "Hijau Matcha", hex: "#b4c3a2" },
      { name: "Lilac Lembut", hex: "#dbb2d1" }
    ],
    isPopular: false,
    inStock: 30
  },
  {
    id: "p8",
    name: "Rok Pleated (Lipit) Flowy Midi",
    category: "wanita", // displayed as Gaun & Dress / Rok
    price: 169000,
    originalPrice: 199000,
    discount: 15,
    rating: 4.6,
    reviewCount: 130,
    description: "Rok lipit midi wanita dengan pinggang elastis yang nyaman digunakan. Lipatannya presisi dan awet setelah dicuci berulang kali. Menggunakan bahan crepe flowy yang jatuh dengan indah saat melangkah, memberi siluet romantis.",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80",
    sizes: ["All Size Fit to L"],
    colors: [
      { name: "Hitam Klasik", hex: "#1f1f1f" },
      { name: "Cokelat Terakota", hex: "#e2725b" },
      { name: "Misty Grey", hex: "#a9a9a9" }
    ],
    isPopular: false,
    inStock: 25
  },
  {
    id: "p9",
    name: "Kacamata Hitam Cateye Retro",
    category: "aksesoris",
    price: 149000,
    rating: 4.8,
    reviewCount: 74,
    description: "Kacamata hitam wanita model cateye retro yang sangat anggun dan mempertegas garis wajah Anda secara menawan. Dilengkapi lensa polarisasi anti-UV400 untuk perlindungan mata penuh, sempurna untuk berkendara maupun bersantai di pantai.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
    sizes: ["Standar"],
    colors: [
      { name: "Emas / Hitam", hex: "#ffd700" },
      { name: "Perak / Gelap", hex: "#c0c0c0" }
    ],
    isPopular: false,
    inStock: 40
  },
  {
    id: "p10",
    name: "Arloji Minimalis Petite Rose Gold",
    category: "aksesoris",
    price: 329000,
    originalPrice: 429000,
    discount: 23,
    rating: 4.9,
    reviewCount: 112,
    description: "Jam tangan analog ultra-feminin dengan diameter kecil yang anggun di pergelangan tangan wanita. Menampilkan dial minimalis berlapis rose gold berkilau serta strap kulit sapi premium bertekstur lembut.",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80",
    sizes: ["Wanita Standard"],
    colors: [
      { name: "Rose Gold Suede", hex: "#b5651d" },
      { name: "Hitam Onyx", hex: "#000000" }
    ],
    isPopular: true,
    inStock: 10
  },
  {
    id: "p11",
    name: "Tas Bahu Suede Bucket Bag",
    category: "aksesoris",
    price: 279000,
    rating: 4.6,
    reviewCount: 53,
    description: "Tas bahu model bucket wanita yang lapang dan stylish dengan bahan kulit suede bertekstur halus. Dilengkapi tali selempang panjang yang dapat disesuaikan dan kantong dalam beresleting untuk menyimpan kosmetik dan barang berharga Anda.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
    sizes: ["Medium"],
    colors: [
      { name: "Tan Suede", hex: "#b5651d" },
      { name: "Abu-abu Suede", hex: "#808080" },
      { name: "Deep Olive", hex: "#556b2f" }
    ],
    isPopular: false,
    inStock: 14
  },
  {
    id: "p12",
    name: "Sneakers Chunky Korea Putih",
    category: "sepatu",
    price: 359000,
    originalPrice: 459000,
    discount: 21,
    rating: 4.9,
    reviewCount: 198,
    description: "Sneakers low-top chunky putih bersih ala Korean street style. Memberikan kenyamanan melangkah yang maksimal berkat sol karet berkepadatan tinggi setinggi 4cm yang empuk dan ringan, dipadukan dengan vegan leather premium.",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
    sizes: ["36", "37", "38", "39", "40"],
    colors: [
      { name: "Putih Bersih", hex: "#f0f0f0" },
      { name: "Putih / Hitam", hex: "#e5e5e5" }
    ],
    isPopular: true,
    inStock: 20
  },
  {
    id: "p13",
    name: "Heels Mules Beludru Premium",
    category: "sepatu",
    price: 449000,
    rating: 4.7,
    reviewCount: 42,
    description: "Sepatu hak tahu (block heels) setinggi 5cm yang sangat stabil dan empuk dipakai berjam-jam. Dibuat menggunakan bahan kain beludru premium yang mewah dan hiasan buckle mutiara di bagian depannya untuk tampilan feminin yang berkilau.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
    sizes: ["36", "37", "38", "39"],
    colors: [
      { name: "Cokelat Almond", hex: "#a0522d" },
      { name: "Abu Gelap (Charcoal)", hex: "#3a3a3a" }
    ],
    isPopular: false,
    inStock: 6
  }
];

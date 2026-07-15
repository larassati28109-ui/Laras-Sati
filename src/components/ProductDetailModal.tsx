import React, { useState, useEffect } from "react";
import { Product } from "../data/products";
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { Review } from "../types";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }, qty: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

// Generate static fake reviews for each product to make the store feel alive
const MOCK_REVIEWS_TEMPLATES = [
  { name: "Andi Wijaya", rating: 5, comment: "Kualitas bahannya luar biasa! Sangat nyaman dipakai seharian dan potongannya pas banget." },
  { name: "Siti Rahma", rating: 5, comment: "Warnanya persis seperti di foto. Pengiriman cepat dan seller ramah. Recommended banget!" },
  { name: "Rian Prasetyo", rating: 4, comment: "Bagus banget, bahannya tebal tapi adem. Cuma ukurannya agak sedikit lebih besar dari perkiraan saya, tapi masih oke." },
  { name: "Dewi Lestari", rating: 5, comment: "Suka banget! Jahitannya rapi sekali, tidak menyesal beli di sini. Bakal order warna lain lagi nanti." },
  { name: "Budi Santoso", rating: 4, comment: "Barang bagus, pengiriman standar, tapi respon chat cepat sekali. Terima kasih TrendMode!" }
];

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: ProductDetailModalProps) {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [activeTab, setActiveTab] = useState<"detail" | "ulasan">("detail");

  // Reset local states on product change
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "");
      setSelectedColor(product.colors[0] || null);
      setQuantity(1);
      setActiveTab("detail");

      // Generate 2-3 reviews dynamically for this product
      const productReviews: Review[] = [];
      const numReviews = Math.floor(Math.random() * 2) + 2; // 2 or 3 reviews
      for (let i = 0; i < numReviews; i++) {
        const template = MOCK_REVIEWS_TEMPLATES[(product.name.charCodeAt(0) + i) % MOCK_REVIEWS_TEMPLATES.length];
        productReviews.push({
          id: `rev-${product.id}-${i}`,
          productId: product.id,
          name: template.name,
          rating: template.rating,
          comment: template.comment,
          date: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 * 3).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        });
      }
      setReviews(productReviews);
    }
  }, [product]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      name: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };

    setReviews([newRev, ...reviews]);
    setNewReviewName("");
    setNewReviewComment("");
    setNewReviewRating(5);
  };

  const handleAddToCartClick = () => {
    if (!selectedColor) return;
    onAddToCart(product, selectedSize, selectedColor, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-brand-dark/60 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-brand-bg rounded-[32px] overflow-hidden border-2 border-brand-dark flex flex-col md:flex-row shadow-2xl animate-fade-in"
        id="product-detail-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white border-2 border-brand-dark hover:bg-brand-orange hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Image Carousel/Display */}
        <div className="w-full md:w-1/2 p-6 flex items-center justify-center bg-white border-r-2 border-brand-dark md:max-h-[90vh] overflow-y-auto">
          <div className="relative aspect-[3/4] w-full max-w-md rounded-2xl overflow-hidden border border-brand-dark/10">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {product.discount && (
              <span className="absolute top-4 left-4 bg-brand-orange text-white text-xs font-black px-3 py-1.5 rounded uppercase tracking-wider shadow-md">
                DISKON {product.discount}%
              </span>
            )}
            {product.isPopular && (
              <span className="absolute top-4 right-14 bg-brand-blue text-white text-xs font-black px-3 py-1.5 rounded uppercase tracking-wider shadow-md">
                BEST SELLER
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto max-h-[50vh] md:max-h-[90vh] flex flex-col justify-between">
          <div>
            {/* Category */}
            <span className="text-xs uppercase font-black tracking-widest text-brand-orange mb-1 inline-block">
              {product.category === "pria" ? "Atasan & Outer" : product.category === "wanita" ? "Gaun & Dress" : product.category === "aksesoris" ? "Aksesoris" : "Sepatu & Heels"}
            </span>

            {/* Title */}
            <h2 className="font-display font-black text-2xl md:text-3xl text-brand-dark leading-tight uppercase tracking-tight mb-2">
              {product.name}
            </h2>

            {/* Rating Stars & Review Count */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-amber-400" : "text-gray-300"}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-500">
                {product.rating} ({reviews.length + 24} Ulasan)
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mb-6 bg-white p-4 rounded-2xl border border-brand-dark/5">
              <span className="font-display font-black text-2xl text-brand-orange">
                Rp {product.price.toLocaleString("id-ID")}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through font-semibold">
                  Rp {product.originalPrice.toLocaleString("id-ID")}
                </span>
              )}
            </div>

            {/* Tabs for Details and Reviews */}
            <div className="flex border-b border-brand-dark/10 mb-5">
              <button
                onClick={() => setActiveTab("detail")}
                className={`pb-2.5 px-4 font-display font-black text-xs uppercase tracking-wider transition-colors border-b-2 ${
                  activeTab === "detail" 
                    ? "border-brand-orange text-brand-orange" 
                    : "border-transparent text-gray-400 hover:text-brand-dark"
                } cursor-pointer`}
              >
                Deskripsi
              </button>
              <button
                onClick={() => setActiveTab("ulasan")}
                className={`pb-2.5 px-4 font-display font-black text-xs uppercase tracking-wider transition-colors border-b-2 ${
                  activeTab === "ulasan" 
                    ? "border-brand-orange text-brand-orange" 
                    : "border-transparent text-gray-400 hover:text-brand-dark"
                } cursor-pointer`}
              >
                Ulasan Pembeli ({reviews.length})
              </button>
            </div>

            {activeTab === "detail" ? (
              <div className="space-y-5 animate-fade-in text-sm">
                <p className="text-gray-600 leading-relaxed font-medium">
                  {product.description}
                </p>

                {/* Color Selector */}
                <div>
                  <span className="block text-xs uppercase font-black tracking-wider text-brand-dark mb-2">
                    Warna: <span className="text-brand-orange font-bold">{selectedColor?.name}</span>
                  </span>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                          selectedColor?.hex === color.hex 
                            ? "border-brand-dark scale-110" 
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColor?.hex === color.hex && (
                          <span className={`w-2 h-2 rounded-full ${
                            color.hex === "#ffffff" ? "bg-black" : "bg-white"
                          }`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                {product.sizes.length > 0 && (
                  <div>
                    <span className="block text-xs uppercase font-black tracking-wider text-brand-dark mb-2">
                      Pilih Ukuran: <span className="text-brand-orange font-bold">{selectedSize}</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-10 h-10 px-3 rounded-lg border-2 font-display text-xs font-bold transition-all uppercase cursor-pointer ${
                            selectedSize === size
                              ? "bg-brand-dark text-white border-brand-dark"
                              : "bg-white text-brand-dark border-brand-dark/10 hover:border-brand-dark"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-3 pt-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-brand-dark/5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>100% Original</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-brand-dark/5">
                    <Truck className="w-4 h-4 text-brand-blue" />
                    <span>Gratis Ongkir</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-brand-dark/5">
                    <RefreshCw className="w-4 h-4 text-brand-orange" />
                    <span>7 Hari Retur</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Review Lists */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-gray-400 font-medium italic">Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="bg-white p-3 rounded-xl border border-brand-dark/5 text-xs">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-bold text-brand-dark">{rev.name}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-amber-400 gap-0.5 mb-1.5">
                          {[...Array(5)].map((_, idx) => (
                            <Star key={idx} className={`w-3 h-3 ${idx < rev.rating ? "fill-amber-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <p className="text-gray-600 font-medium leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add review form */}
                <form onSubmit={handleAddReview} className="bg-white/80 p-3 rounded-xl border border-brand-dark/10 space-y-2 mt-2">
                  <span className="block text-[11px] uppercase font-black tracking-wider text-brand-dark">Tulis Ulasan Anda</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Anda"
                      required
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="text-xs px-2.5 py-1.5 rounded bg-brand-bg border border-brand-dark/10 focus:outline-none focus:border-brand-dark font-medium"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Rating:</span>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="text-xs px-1 py-1 rounded bg-brand-bg border border-brand-dark/10 focus:outline-none font-bold"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                        <option value={4}>⭐⭐⭐⭐ (4)</option>
                        <option value={3}>⭐⭐⭐ (3)</option>
                        <option value={2}>⭐⭐ (2)</option>
                        <option value={1}>⭐ (1)</option>
                      </select>
                    </div>
                  </div>
                  <textarea
                    placeholder="Tulis ulasan Anda di sini..."
                    required
                    rows={2}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-brand-bg border border-brand-dark/10 focus:outline-none focus:border-brand-dark font-medium resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full bg-brand-dark text-white hover:bg-brand-orange py-1 px-3 rounded text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Kirim Ulasan
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Quantity and Actions at bottom */}
          <div className="mt-6 pt-5 border-t border-brand-dark/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-brand-dark">Jumlah:</span>
                <div className="flex items-center border border-brand-dark/20 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(quantity - 1)}
                    className="px-3 py-1 text-sm font-black hover:bg-gray-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-brand-dark w-8 text-center">{quantity}</span>
                  <button
                    type="button"
                    disabled={quantity >= product.inStock}
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-sm font-black hover:bg-gray-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* In stock info */}
              <span className={`text-xs font-bold ${
                product.inStock <= 8 ? "text-amber-500" : "text-gray-400"
              }`}>
                Sisa stok: {product.inStock} pcs
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddToCartClick}
                disabled={product.inStock === 0}
                className="flex-1 bg-brand-orange text-white hover:bg-brand-blue py-3.5 px-6 rounded-full font-black uppercase text-xs tracking-widest shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{product.inStock === 0 ? "Stok Habis" : "Tambah Ke Keranjang"}</span>
              </button>

              <button
                onClick={() => onToggleWishlist(product)}
                className="p-3.5 border-2 border-brand-dark hover:border-brand-orange hover:text-brand-orange text-brand-dark rounded-full transition-all cursor-pointer"
                title={isWishlisted ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500 border-none" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

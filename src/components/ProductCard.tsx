import React from "react";
import { Product } from "../data/products";
import { Star, Heart, ShoppingBag, Eye } from "lucide-react";

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }, qty?: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: ProductCardProps) {
  const { name, price, originalPrice, discount, rating, reviewCount, image, category } = product;

  const renderStars = (ratingVal: number) => {
    const stars = [];
    const floorRating = Math.floor(ratingVal);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />);
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-300" />);
      }
    }
    return stars;
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes[0] || "All Size";
    const defaultColor = product.colors[0] || { name: "Standar", hex: "#000000" };
    onAddToCart(product, defaultSize, defaultColor);
  };

  return (
    <div 
      className="group relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-brand-dark/5 hover:border-brand-orange/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      id={`product-card-${product.id}`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] w-full bg-brand-bg overflow-hidden p-3">
        <div className="w-full h-full rounded-2xl overflow-hidden relative">
          <img
            src={image}
            alt={name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-brand-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={() => onViewDetails(product)}
              className="p-3 rounded-full bg-white text-brand-dark shadow-md hover:bg-brand-orange hover:text-white transition-all transform scale-90 group-hover:scale-100 duration-300 cursor-pointer"
              title="Lihat Detail"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleQuickAdd}
              className="p-3 rounded-full bg-white text-brand-dark shadow-md hover:bg-brand-blue hover:text-white transition-all transform scale-90 group-hover:scale-100 duration-300 cursor-pointer"
              title="Tambah Cepat"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/90 hover:bg-white text-brand-dark shadow-sm transition-all z-10 hover:scale-110 cursor-pointer"
          id={`wishlist-btn-${product.id}`}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-brand-dark hover:text-red-500"
            }`}
          />
        </button>

        {/* Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-1.5 z-10">
          {discount && (
            <span className="bg-brand-orange text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded">
              DISKON {discount}%
            </span>
          )}
          {product.isPopular && (
            <span className="bg-brand-blue text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded">
              BEST SELLER
            </span>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1 p-5 pt-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-orange mb-1">
          {category === "pria" ? "Atasan & Outer" : category === "wanita" ? "Gaun & Dress" : category === "aksesoris" ? "Aksesoris" : "Sepatu & Heels"}
        </span>
        
        <h3 
          className="font-display font-bold text-sm text-brand-dark hover:text-brand-orange transition-colors truncate uppercase tracking-tight cursor-pointer"
          onClick={() => onViewDetails(product)}
        >
          {name}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-1 mt-1 mb-3">
          <div className="flex items-center">
            {renderStars(rating)}
          </div>
          <span className="text-[11px] text-gray-500 font-bold">({reviewCount})</span>
        </div>

        {/* Price Tag */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="font-display font-black text-brand-dark text-base">
            Rp {price.toLocaleString("id-ID")}
          </span>
          {originalPrice && (
            <span className="text-xs text-gray-400 line-through font-medium">
              Rp {originalPrice.toLocaleString("id-ID")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

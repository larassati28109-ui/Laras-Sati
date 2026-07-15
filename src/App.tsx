import React, { useState, useEffect } from "react";
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  X, 
  Trash2, 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  MapPin, 
  Percent, 
  ClipboardList, 
  RefreshCw,
  Sparkles,
  Info
} from "lucide-react";
import { PRODUCTS, Product } from "./data/products";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import AIStylist from "./components/AIStylist";
import { CartItem, CustomerInfo, Order } from "./types";

export default function App() {
  const categoryLabels: Record<string, string> = {
    semua: "Semua Koleksi",
    pria: "Atasan & Outer",
    wanita: "Gaun & Dress",
    aksesoris: "Aksesoris",
    sepatu: "Sepatu & Heels"
  };

  // State variables
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [sortBy, setSortBy] = useState<string>("populer");
  
  // Interactive Overlays/Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  
  // Cart & Wishlist State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0); // e.g. 20 for 20%
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Checkout Form State
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "complete">("cart");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    courier: "JNE Regular (Gratis)",
    paymentMethod: "Bank Transfer"
  });

  // Orders Placed State
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Fetch products from backend or fallback
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.warn("Could not fetch products from server API, using local mock fallback.", err);
      }
    };
    loadProducts();
  }, []);

  // Toast Helper
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Cart Management
  const handleAddToCart = (product: Product, size: string, color: { name: string; hex: string }, qty: number = 1) => {
    const cartItemId = `${product.id}_${size}_${color.hex.replace("#", "")}`;
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        // Update quantity
        const updatedCart = [...prevCart];
        const newQty = updatedCart[existingIndex].quantity + qty;
        
        // Ensure quantity doesn't exceed stock
        if (newQty > product.inStock) {
          showToast(`Maaf Kak, stok terbatas! Hanya sisa ${product.inStock} item.`, "info");
          updatedCart[existingIndex].quantity = product.inStock;
        } else {
          updatedCart[existingIndex].quantity = newQty;
          showToast(`Berhasil menambahkan ${qty}x ${product.name} ke keranjang!`);
        }
        return updatedCart;
      } else {
        // Add new item
        showToast(`Berhasil menambahkan ${product.name} ke keranjang!`);
        return [
          ...prevCart,
          {
            id: cartItemId,
            product,
            quantity: qty,
            selectedSize: size,
            selectedColor: color
          }
        ];
      }
    });
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item; // Handled by deletion or just ignore
          if (newQty > item.product.inStock) {
            showToast(`Maaf Kak, hanya tersedia ${item.product.inStock} stok!`, "info");
            return { ...item, quantity: item.product.inStock };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
    showToast("Item dihapus dari keranjang.", "info");
  };

  // Wishlist Management
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((p) => p.id === product.id);
      if (exists) {
        showToast("Dihapus dari wishlist.", "info");
        return prevWishlist.filter((p) => p.id !== product.id);
      } else {
        showToast("Ditambahkan ke wishlist! ❤️");
        return [...prevWishlist, product];
      }
    });
  };

  // Coupon application
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    
    if (couponCode.toUpperCase() === "MODE20") {
      setAppliedDiscountPercent(20);
      setCouponSuccess("Selamat! Kupon diskon 20% berhasil digunakan.");
      showToast("Kupon diskon 20% diterapkan!");
    } else if (couponCode.toUpperCase() === "ONGKIRGRATIS") {
      setCouponSuccess("Selamat! Bebas biaya pengiriman ke seluruh Indonesia.");
      showToast("Kupon pengiriman gratis diterapkan!");
    } else {
      setCouponError("Kupon tidak valid. Coba masukkan 'MODE20'!");
    }
  };

  // Filter and Sort Products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "semua" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "populer") {
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    }
    if (sortBy === "harga-rendah") {
      return a.price - b.price;
    }
    if (sortBy === "harga-tinggi") {
      return b.price - a.price;
    }
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    return 0;
  });

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * (appliedDiscountPercent / 100));
  const shippingFee = subtotal > 0 ? 0 : 0; // standard free shipping campaign
  const grandTotal = subtotal - discountAmount + shippingFee;

  // Checkout submission
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Generate Mock Order
    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...cart],
      customerInfo: { ...customerInfo },
      subtotal,
      discount: discountAmount,
      total: grandTotal,
      date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      status: "Diproses",
      trackingNumber: `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`
    };

    setOrders([newOrder, ...orders]);
    setActiveOrder(newOrder);
    setCart([]); // Clear cart
    setCheckoutStep("complete");
    setIsCartOpen(false);
    showToast("Pesanan Anda berhasil dikirim!", "success");
  };

  // Quick Open Modal helper for AI stylist callback
  const handleOpenProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setSelectedProduct(prod);
    }
  };

  // Simulating shipment state changes to look awesome and interactive
  const handleAdvanceOrderStatus = (orderId: string) => {
    setOrders((prevOrders) => {
      return prevOrders.map((o) => {
        if (o.id === orderId) {
          let nextStatus: "Diproses" | "Dikirim" | "Dalam Perjalanan" | "Diterima" = "Diproses";
          if (o.status === "Diproses") nextStatus = "Dikirim";
          else if (o.status === "Dikirim") nextStatus = "Dalam Perjalanan";
          else if (o.status === "Dalam Perjalanan") nextStatus = "Diterima";
          else nextStatus = "Diterima";

          const updated = { ...o, status: nextStatus };
          if (activeOrder && activeOrder.id === orderId) {
            setActiveOrder(updated);
          }
          showToast(`Status Pesanan diperbarui menjadi: ${nextStatus}!`);
          return updated;
        }
        return o;
      });
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-dark overflow-x-hidden font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-brand-dark border-2 border-brand-orange text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-fade-in text-xs uppercase tracking-wider font-bold">
          <Sparkles className="w-4 h-4 text-brand-orange animate-pulse" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner Message */}
      <div className="bg-brand-orange text-white py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] px-4">
        Gratis Ongkos Kirim Ke Seluruh Indonesia + Diskon 20% Dengan Kupon <span className="underline decoration-2">MODE20</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b-2 border-brand-dark/10 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto h-20 px-6 md:px-12 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => {
              setSelectedCategory("semua");
              setActiveOrder(null);
            }}
            className="text-3xl font-black tracking-tighter cursor-pointer font-display select-none flex flex-col justify-center"
            id="store-logo"
          >
            <div className="leading-none">MODE<span className="text-brand-orange">.</span></div>
            <span className="text-[9px] font-sans font-black tracking-widest text-gray-400 mt-0.5">BUTIK WANITA</span>
          </div>

          {/* Navigation Category Desktop Links */}
          <nav className="hidden md:flex gap-10 font-display font-black text-xs uppercase tracking-widest">
            <button
              onClick={() => {
                setSelectedCategory("semua");
                setActiveOrder(null);
              }}
              className={`transition-colors cursor-pointer ${
                selectedCategory === "semua" && !activeOrder ? "text-brand-orange" : "hover:text-brand-orange"
              }`}
            >
              Katalog
            </button>
            <button
              onClick={() => {
                setSelectedCategory("wanita");
                setActiveOrder(null);
              }}
              className={`transition-colors cursor-pointer ${
                selectedCategory === "wanita" && !activeOrder ? "text-brand-orange" : "hover:text-brand-orange"
              }`}
            >
              Gaun & Dress
            </button>
            <button
              onClick={() => {
                setSelectedCategory("pria");
                setActiveOrder(null);
              }}
              className={`transition-colors cursor-pointer ${
                selectedCategory === "pria" && !activeOrder ? "text-brand-orange" : "hover:text-brand-orange"
              }`}
            >
              Atasan & Outer
            </button>
            <button
              onClick={() => {
                setSelectedCategory("aksesoris");
                setActiveOrder(null);
              }}
              className={`transition-colors cursor-pointer ${
                selectedCategory === "aksesoris" && !activeOrder ? "text-brand-orange" : "hover:text-brand-orange"
              }`}
            >
              Aksesoris
            </button>
            <button
              onClick={() => {
                setSelectedCategory("sepatu");
                setActiveOrder(null);
              }}
              className={`transition-colors cursor-pointer ${
                selectedCategory === "sepatu" && !activeOrder ? "text-brand-orange" : "hover:text-brand-orange"
              }`}
            >
              Sepatu & Heels
            </button>
          </nav>

          {/* User Interaction Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Orders Tracking Shortcut */}
            {orders.length > 0 && (
              <button
                onClick={() => {
                  setActiveOrder(orders[0]);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`p-2 rounded-full border-2 transition-all cursor-pointer relative ${
                  activeOrder ? "bg-brand-blue border-brand-dark text-white" : "border-brand-dark/10 hover:border-brand-dark text-brand-dark"
                }`}
                title="Lacak Pesanan Anda"
              >
                <ClipboardList className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-black border border-white">
                  {orders.length}
                </span>
              </button>
            )}

            {/* Wishlist Icon */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-2 rounded-full border-2 border-brand-dark/10 hover:border-brand-dark text-brand-dark transition-all relative cursor-pointer"
              title="Favorit"
              id="wishlist-trigger-btn"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-black border border-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Icon */}
            <button
              onClick={() => {
                setIsCartOpen(true);
                setCheckoutStep("cart");
              }}
              className="p-2 rounded-full border-2 border-brand-dark/10 hover:border-brand-dark bg-brand-dark hover:bg-brand-orange text-white hover:text-white transition-all relative cursor-pointer"
              title="Keranjang"
              id="cart-trigger-btn"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-black border border-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-12 py-6 md:py-10">

        {/* Dynamic Section: Order Status Screen (If activeOrder is set) */}
        {activeOrder ? (
          <div className="bg-white rounded-[32px] border-2 border-brand-dark p-6 md:p-10 mb-12 shadow-md animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b-2 border-brand-dark/10">
              <div>
                <span className="bg-brand-blue text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded">Lacak Pesanan</span>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight text-brand-dark mt-2">
                  No. Invoice: {activeOrder.id}
                </h2>
                <p className="text-xs text-gray-500 font-bold uppercase mt-1">Tanggal Transaksi: {activeOrder.date}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveOrder(null)}
                  className="bg-brand-dark hover:bg-brand-orange text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Kembali Belanja
                </button>
                <button
                  onClick={() => handleAdvanceOrderStatus(activeOrder.id)}
                  disabled={activeOrder.status === "Diterima"}
                  className="bg-brand-orange hover:bg-brand-blue text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Simulasikan Status Pengiriman</span>
                </button>
              </div>
            </div>

            {/* Tracking Status Timeline */}
            <div className="py-10">
              <div className="relative">
                {/* Horizontal line for timeline */}
                <div className="absolute top-1/2 left-4 md:left-10 right-4 md:right-10 h-1 bg-gray-200 -translate-y-1/2 z-0 hidden md:block" />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                  {/* Step 1: Diproses */}
                  <div className="flex md:flex-col items-center md:text-center gap-4 bg-brand-bg md:bg-transparent p-4 md:p-0 rounded-2xl border border-brand-dark/5 md:border-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black border-2 transition-all ${
                      ["Diproses", "Dikirim", "Dalam Perjalanan", "Diterima"].includes(activeOrder.status)
                        ? "bg-brand-orange text-white border-brand-dark"
                        : "bg-white text-gray-400 border-gray-200"
                    }`}>
                      1
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xs uppercase tracking-wider">PESANAN DIPROSES</h4>
                      <p className="text-[11px] text-gray-500 font-medium">Pembayaran Berhasil diverifikasi.</p>
                    </div>
                  </div>

                  {/* Step 2: Dikirim */}
                  <div className="flex md:flex-col items-center md:text-center gap-4 bg-brand-bg md:bg-transparent p-4 md:p-0 rounded-2xl border border-brand-dark/5 md:border-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black border-2 transition-all ${
                      ["Dikirim", "Dalam Perjalanan", "Diterima"].includes(activeOrder.status)
                        ? "bg-brand-blue text-white border-brand-dark"
                        : "bg-white text-gray-400 border-gray-200"
                    }`}>
                      2
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xs uppercase tracking-wider">BARANG DIKIRIM</h4>
                      <p className="text-[11px] text-gray-500 font-medium">Kurir telah menjemput paket.</p>
                    </div>
                  </div>

                  {/* Step 3: Dalam Perjalanan */}
                  <div className="flex md:flex-col items-center md:text-center gap-4 bg-brand-bg md:bg-transparent p-4 md:p-0 rounded-2xl border border-brand-dark/5 md:border-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black border-2 transition-all ${
                      ["Dalam Perjalanan", "Diterima"].includes(activeOrder.status)
                        ? "bg-brand-blue text-white border-brand-dark animate-pulse-ring"
                        : "bg-white text-gray-400 border-gray-200"
                    }`}>
                      3
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xs uppercase tracking-wider">DALAM PERJALANAN</h4>
                      <p className="text-[11px] text-gray-500 font-medium">Paket menuju alamat tujuan.</p>
                    </div>
                  </div>

                  {/* Step 4: Diterima */}
                  <div className="flex md:flex-col items-center md:text-center gap-4 bg-brand-bg md:bg-transparent p-4 md:p-0 rounded-2xl border border-brand-dark/5 md:border-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black border-2 transition-all ${
                      activeOrder.status === "Diterima"
                        ? "bg-emerald-500 text-white border-brand-dark"
                        : "bg-white text-gray-400 border-gray-200"
                    }`}>
                      ✓
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xs uppercase tracking-wider">PAKET DITERIMA</h4>
                      <p className="text-[11px] text-gray-500 font-medium">Terima kasih telah berbelanja!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t-2 border-brand-dark/10">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-dark mb-4">Ringkasan Produk</h3>
                <div className="space-y-3">
                  {activeOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-brand-bg border border-brand-dark/5">
                      <img src={item.product.image} alt={item.product.name} className="w-14 h-18 object-cover rounded-lg border border-brand-dark/10" />
                      <div className="flex-1">
                        <h4 className="font-display font-bold text-xs uppercase text-brand-dark">{item.product.name}</h4>
                        <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                          Ukuran: {item.selectedSize} | Warna: {item.selectedColor.name}
                        </p>
                        <p className="text-xs font-bold mt-1 text-brand-orange">
                          {item.quantity} x Rp {item.product.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery and Customer Information Column */}
              <div className="space-y-6">
                <div className="bg-brand-bg p-6 rounded-3xl border border-brand-dark/10">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-dark mb-4">Informasi Pengiriman</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block text-gray-400 font-semibold uppercase text-[10px]">Penerima:</span>
                      <span className="font-bold text-brand-dark">{activeOrder.customerInfo.name}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 font-semibold uppercase text-[10px]">Alamat Pengiriman:</span>
                      <span className="font-medium text-gray-600 block">{activeOrder.customerInfo.address}, {activeOrder.customerInfo.city}</span>
                      <span className="font-medium text-gray-400">{activeOrder.customerInfo.postalCode}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 font-semibold uppercase text-[10px]">Nomor Resi:</span>
                      <span className="font-mono font-bold text-brand-blue">{activeOrder.trackingNumber}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 font-semibold uppercase text-[10px]">Kurir:</span>
                      <span className="font-bold text-brand-dark">{activeOrder.customerInfo.courier}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 font-semibold uppercase text-[10px]">Metode Pembayaran:</span>
                      <span className="font-bold text-brand-dark">{activeOrder.customerInfo.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-dark text-white p-6 rounded-3xl">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider mb-4">Total Biaya</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="opacity-80">Subtotal</span>
                      <span>Rp {activeOrder.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    {activeOrder.discount > 0 && (
                      <div className="flex justify-between font-medium text-brand-orange">
                        <span>Diskon Kupon</span>
                        <span>-Rp {activeOrder.discount.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium">
                      <span className="opacity-80">Ongkos Kirim</span>
                      <span className="text-emerald-400">GRATIS</span>
                    </div>
                    <div className="h-[1px] bg-white/20 my-3" />
                    <div className="flex justify-between font-display font-black text-sm uppercase">
                      <span>Total Akhir</span>
                      <span>Rp {activeOrder.total.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Hero Section */}
        {!activeOrder && (
          <section className="bg-white rounded-[40px] border-2 border-brand-dark p-6 md:p-12 mb-12 flex flex-col lg:flex-row items-center gap-8 md:gap-12 relative overflow-hidden shadow-sm">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -z-10" />

            {/* Hero text side */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="inline-block bg-brand-orange text-white text-[10px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 mb-6 rounded-sm w-fit shadow-xs">
                Koleksi Baru Tiba
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-black leading-[0.9] mb-6 tracking-tighter uppercase italic text-brand-dark">
                EKSPRESI<br/>MUSIM <span className="text-brand-blue">PANAS</span>
              </h1>
              
              <p className="text-sm md:text-base text-gray-600 mb-8 max-w-md font-medium leading-relaxed">
                Temukan keanggunan fashion wanita modern dengan material premium, siluet yang luwes, dan paduan warna-warna indah yang memancarkan pesona sejati Anda. Koleksi butik edisi terbatas kini resmi tersedia.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => {
                    const el = document.getElementById("catalog-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                    setSelectedCategory("semua");
                  }}
                  className="bg-brand-orange text-white hover:bg-brand-blue px-8 py-4 rounded-full font-display font-black uppercase text-xs tracking-widest shadow-lg shadow-brand-orange/20 transition-all cursor-pointer hover:scale-105"
                >
                  Belanja Sekarang
                </button>
                <button 
                  onClick={() => {
                    // Open AI Stylist drawer directly or set styling help trigger
                    const floatingBtn = document.getElementById("ai-stylist-floating-btn");
                    floatingBtn?.click();
                  }}
                  className="border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white px-8 py-4 rounded-full font-display font-black uppercase text-xs tracking-widest transition-all cursor-pointer hover:scale-105 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-brand-orange" />
                  <span>Rekomendasi AI</span>
                </button>
              </div>
            </div>

            {/* Hero image / featured product side */}
            <div className="w-full lg:w-[45%] aspect-[4/3] md:aspect-[16/10] lg:aspect-square bg-brand-bg rounded-[32px] relative border-2 border-brand-dark overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/15 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=80" 
                alt="Model TrendMode" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              
              {/* Highlight Overlay Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-brand-dark/10 shadow-xl z-20 flex justify-between items-center">
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-500 mb-0.5 tracking-wider">Rekomendasi Utama</p>
                  <p className="text-sm font-display font-black text-brand-dark uppercase tracking-tight">Blouse Silk Satin Premium</p>
                  <p className="text-brand-orange font-bold text-xs mt-0.5">Rp 249.000</p>
                </div>
                <button 
                  onClick={() => handleOpenProduct("p2")}
                  className="bg-brand-dark text-white hover:bg-brand-orange text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Catalog Section Header & Filters */}
        <section id="catalog-grid" className="scroll-mt-24 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-brand-orange">Eksplorasi Koleksi</span>
              <h2 className="text-3xl font-display font-black italic uppercase tracking-tighter text-brand-dark mt-1">
                {selectedCategory === "semua" ? "PRODUK TERPOPULER" : `Koleksi ${categoryLabels[selectedCategory] || selectedCategory}`}
              </h2>
            </div>

            {/* Sorting controls */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold uppercase tracking-wide px-3.5 py-2.5 rounded-xl border-2 border-brand-dark bg-white focus:outline-none focus:border-brand-orange transition-colors cursor-pointer"
              >
                <option value="populer">Paling Populer</option>
                <option value="harga-rendah">Harga Terendah</option>
                <option value="harga-tinggi">Harga Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Search bar & Category Tab Pills */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8 justify-between items-stretch lg:items-center">
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "semua", label: "Semua Koleksi" },
                { id: "wanita", label: "Gaun & Dress" },
                { id: "pria", label: "Atasan & Outer" },
                { id: "aksesoris", label: "Aksesoris" },
                { id: "sepatu", label: "Sepatu & Heels" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id);
                    setActiveOrder(null);
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-display font-black uppercase tracking-wider transition-all border-2 cursor-pointer ${
                    selectedCategory === tab.id
                      ? "bg-brand-dark text-white border-brand-dark scale-102"
                      : "bg-white text-brand-dark border-brand-dark/10 hover:border-brand-dark"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Cari pakaian impian Anda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-xs bg-white border-2 border-brand-dark/10 focus:border-brand-dark rounded-full focus:outline-none font-medium text-brand-dark transition-colors"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Catalog Grid View */}
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-brand-dark p-12 text-center max-w-lg mx-auto">
              <span className="text-4xl">🧥</span>
              <h3 className="font-display font-black text-sm uppercase tracking-wider mt-4 mb-2">Produk Tidak Ditemukan</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Maaf Kak, kami tidak menemukan pakaian yang cocok dengan pencarian "{searchQuery}". Coba ketik kata kunci lain atau tanya ke **Asisten Gaya AI** di pojok kanan bawah!
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("semua");
                }}
                className="mt-6 bg-brand-orange text-white px-5 py-2 rounded-full font-display font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={setSelectedProduct}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlist.some((p) => p.id === product.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Benefits banner */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-8 border-t border-brand-dark/10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-orange/10 rounded-2xl text-brand-orange">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs uppercase tracking-wider">BEBAS ONGKOS KIRIM</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Kami menyediakan layanan pengiriman bebas biaya tanpa batas minimum pembelian ke seluruh Indonesia.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-blue/10 rounded-2xl text-brand-blue">
              <RefreshCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs uppercase tracking-wider">7 HARI RETUR MUDAH</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Ukuran kurang pas? Tenang Kak! Silakan tukar ukuran dalam waktu 7 hari kerja dengan prosedur mudah.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-dark/10 rounded-2xl text-brand-dark">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-black text-xs uppercase tracking-wider">PEMBAYARAN AMAN & COD</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Mendukung transfer bank, e-wallet, hingga sistem pembayaran di tempat (Cash on Delivery / COD).</p>
            </div>
          </div>
        </section>
      </main>

      {/* Shopping Cart Sidebar Drawer */}
      {isCartOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-bg border-l-2 border-brand-dark z-50 flex flex-col shadow-2xl animate-slide-left">
          
          {/* Cart Header */}
          <div className="p-5 bg-white border-b-2 border-brand-dark flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-dark" />
              <h3 className="font-display font-black text-sm uppercase tracking-tight text-brand-dark">Keranjang Belanja</h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stepper indicator in Cart */}
          <div className="bg-brand-dark text-white px-5 py-3 flex justify-around text-[10px] font-black tracking-wider uppercase border-b border-brand-dark">
            <button 
              disabled={cart.length === 0}
              onClick={() => setCheckoutStep("cart")}
              className={checkoutStep === "cart" ? "text-brand-orange" : "opacity-60"}
            >
              1. Keranjang ({cart.length})
            </button>
            <span className="opacity-40">→</span>
            <button 
              disabled={cart.length === 0}
              onClick={() => setCheckoutStep("shipping")}
              className={checkoutStep === "shipping" ? "text-brand-orange" : "opacity-60"}
            >
              2. Pengiriman
            </button>
          </div>

          {/* Drawer Body Container */}
          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 && checkoutStep !== "complete" ? (
              <div className="text-center py-16 space-y-4">
                <span className="text-4xl">🛒</span>
                <h4 className="font-display font-black text-xs uppercase text-brand-dark">Keranjang Kosong</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto font-medium">Wah, belum ada pakaian impian yang dimasukkan nih. Yuk isi keranjang Anda sekarang!</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-brand-orange text-white px-5 py-2.5 rounded-full font-display font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              <>
                {/* STEP 1: CART ITEM LIST */}
                {checkoutStep === "cart" && (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div 
                        key={item.id}
                        className="p-4 bg-white rounded-2xl border border-brand-dark/10 flex gap-4 items-center relative"
                      >
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-14 h-18 object-cover rounded-xl border border-brand-dark/5"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-bold text-xs uppercase text-brand-dark truncate pr-6">{item.product.name}</h4>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            Ukuran: {item.selectedSize} | Warna: 
                            <span className="inline-block w-2.5 h-2.5 rounded-full mx-1 align-middle border border-gray-200" style={{ backgroundColor: item.selectedColor.hex }} />
                            {item.selectedColor.name}
                          </p>
                          <p className="text-xs font-black text-brand-dark mt-1">
                            Rp {item.product.price.toLocaleString("id-ID")}
                          </p>

                          {/* Qty incrementer */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-brand-dark/20 rounded-md overflow-hidden bg-brand-bg scale-90 origin-left">
                              <button
                                onClick={() => updateCartQuantity(item.id, -1)}
                                className="px-2 py-0.5 font-bold hover:bg-gray-200"
                              >
                                -
                              </button>
                              <span className="px-2.5 text-xs font-bold text-brand-dark">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, 1)}
                                className="px-2 py-0.5 font-bold hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Remove item button */}
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Dynamic Coupon Code Section */}
                    <form onSubmit={handleApplyCoupon} className="pt-4 border-t border-brand-dark/10 space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-brand-dark">Gunakan Kode Kupon</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Contoh: 'MODE20'"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-white border border-brand-dark/10 rounded-lg focus:outline-none focus:border-brand-dark uppercase font-bold"
                        />
                        <button
                          type="submit"
                          className="bg-brand-dark hover:bg-brand-orange text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer"
                        >
                          Pakai
                        </button>
                      </div>
                      {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                      {couponSuccess && <p className="text-[10px] text-emerald-600 font-bold">{couponSuccess}</p>}
                    </form>
                  </div>
                )}

                {/* STEP 2: SHIPPING FORM */}
                {checkoutStep === "shipping" && (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4 animate-fade-in text-xs">
                    <h4 className="font-display font-black text-xs uppercase text-brand-dark tracking-wider pb-1 border-b border-brand-dark/10">Data Penerima & Pengiriman</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Nama Lengkap *</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Jane Doe"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/10 bg-white focus:outline-none focus:border-brand-dark font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Email *</label>
                          <input
                            type="email"
                            required
                            placeholder="Contoh: jane@mail.com"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/10 bg-white focus:outline-none focus:border-brand-dark font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Nomor Telepon *</label>
                          <input
                            type="tel"
                            required
                            placeholder="Contoh: 08123456789"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/10 bg-white focus:outline-none focus:border-brand-dark font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Alamat Lengkap *</label>
                        <textarea
                          required
                          rows={2.5}
                          placeholder="Jalan, No. Rumah, RT/RW, Kecamatan"
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/10 bg-white focus:outline-none focus:border-brand-dark font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Kota / Kabupaten *</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Jakarta Selatan"
                            value={customerInfo.city}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/10 bg-white focus:outline-none focus:border-brand-dark font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Kode Pos *</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: 12345"
                            value={customerInfo.postalCode}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/10 bg-white focus:outline-none focus:border-brand-dark font-medium"
                          />
                        </div>
                      </div>

                      {/* Select courier options */}
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Layanan Ekspedisi</label>
                        <select
                          value={customerInfo.courier}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, courier: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/10 bg-white focus:outline-none focus:border-brand-dark font-bold cursor-pointer"
                        >
                          <option value="JNE Regular (Gratis)">JNE Regular — (Estimasi 2-3 Hari) — Rp 0 (FREE)</option>
                          <option value="Sicepat Kilat (Gratis)">SiCepat Kilat — (Estimasi 1-2 Hari) — Rp 0 (FREE)</option>
                          <option value="GoSend Instant (Gratis)">GoSend Sameday — (Estimasi Hari Ini) — Rp 0 (FREE)</option>
                        </select>
                      </div>

                      {/* Select payment method */}
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Metode Pembayaran</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "Bank Transfer", label: "Virtual Account" },
                            { id: "E-Wallet", label: "E-Wallet / QRIS" },
                            { id: "COD", label: "Bayar di Tempat" }
                          ].map((pay) => (
                            <button
                              key={pay.id}
                              type="button"
                              onClick={() => setCustomerInfo({ ...customerInfo, paymentMethod: pay.id })}
                              className={`p-2.5 border-2 rounded-xl font-bold text-[10px] uppercase transition-all ${
                                customerInfo.paymentMethod === pay.id
                                  ? "bg-brand-blue text-white border-brand-dark scale-102"
                                  : "bg-white text-brand-dark border-brand-dark/10"
                              }`}
                            >
                              {pay.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-6 bg-brand-orange hover:bg-brand-blue text-white py-4 rounded-full font-display font-black uppercase text-xs tracking-widest shadow-lg shadow-brand-orange/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Selesaikan Pesanan & Lacak</span>
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Drawer Footer Summary (if items in cart) */}
          {cart.length > 0 && checkoutStep !== "complete" && (
            <div className="p-5 bg-white border-t-2 border-brand-dark space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-bold text-brand-dark">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                {appliedDiscountPercent > 0 && (
                  <div className="flex justify-between font-medium text-brand-orange">
                    <span>Diskon Kupon (-{appliedDiscountPercent}%)</span>
                    <span className="font-bold">-Rp {discountAmount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span className="text-gray-400">Ongkos Kirim</span>
                  <span className="font-bold text-emerald-500 uppercase tracking-wider text-[10px]">Gratis</span>
                </div>
                <div className="h-[1px] bg-brand-dark/10 my-2" />
                <div className="flex justify-between font-display font-black text-sm uppercase">
                  <span>Total Biaya</span>
                  <span className="text-brand-dark">Rp {grandTotal.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {checkoutStep === "cart" && (
                <button
                  onClick={() => setCheckoutStep("shipping")}
                  className="w-full bg-brand-orange hover:bg-brand-blue text-white py-4 rounded-full font-display font-black uppercase text-xs tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Lanjut Ke Pembayaran</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Wishlist Sidebar Drawer */}
      {isWishlistOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-bg border-l-2 border-brand-dark z-50 flex flex-col shadow-2xl animate-slide-left">
          <div className="p-5 bg-white border-b-2 border-brand-dark flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              <h3 className="font-display font-black text-sm uppercase tracking-tight text-brand-dark">Koleksi Favorit ({wishlist.length})</h3>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {wishlist.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <span className="text-4xl">❤️</span>
                <h4 className="font-display font-black text-xs uppercase text-brand-dark">Belum Ada Favorit</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto font-medium">Sukai pakaian favorit Kakak dengan menekan tombol hati saat menjelajahi katalog agar tersimpan di sini!</p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="bg-brand-dark text-white px-5 py-2.5 rounded-full font-display font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Lihat Katalog
                </button>
              </div>
            ) : (
              wishlist.map((p) => (
                <div 
                  key={p.id}
                  className="p-4 bg-white rounded-2xl border border-brand-dark/10 flex gap-4 items-center relative"
                >
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-14 h-18 object-cover rounded-xl border border-brand-dark/5 cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(p);
                      setIsWishlistOpen(false);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-display font-bold text-xs uppercase text-brand-dark truncate pr-6 cursor-pointer hover:text-brand-orange"
                      onClick={() => {
                        setSelectedProduct(p);
                        setIsWishlistOpen(false);
                      }}
                    >
                      {p.name}
                    </h4>
                    <p className="text-xs font-black text-brand-orange mt-1">
                      Rp {p.price.toLocaleString("id-ID")}
                    </p>
                    <button
                      onClick={() => {
                        // Quick Add default size
                        handleAddToCart(p, p.sizes[0] || "All Size", p.colors[0] || { name: "Standar", hex: "#000000" });
                        setIsWishlistOpen(false);
                        setIsCartOpen(true);
                      }}
                      className="mt-2.5 bg-brand-dark hover:bg-brand-blue text-white px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Tambah ke Keranjang
                    </button>
                  </div>

                  {/* Remove favorite button */}
                  <button
                    onClick={() => handleToggleWishlist(p)}
                    className="absolute top-4 right-4 text-red-500 hover:text-brand-dark cursor-pointer"
                    title="Hapus dari Favorit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlist.some((p) => p.id === selectedProduct.id)}
        />
      )}

      {/* AI Stylist Chatbot Floating Box & sliding drawer */}
      <AIStylist products={products} onOpenProduct={handleOpenProduct} />

      {/* Footer Bar */}
      <footer className="mt-auto border-t-2 border-brand-dark bg-brand-dark text-white font-display">
        {/* Upper footer links & info */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-black tracking-tighter mb-4">MODE<span className="text-brand-orange">.</span></h3>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              TrendMode adalah butik online fashion wanita premium terpercaya yang menghadirkan busana berkualitas tinggi, modern, serta desain trendi yang memancarkan pesona dan kecantikan Anda.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange mb-4">Koleksi Kami</h4>
            <ul className="text-xs space-y-2 text-gray-400 font-sans font-bold">
              <li><button onClick={() => { setSelectedCategory("wanita"); setActiveOrder(null); }} className="hover:text-white transition-colors">Koleksi Gaun & Dress</button></li>
              <li><button onClick={() => { setSelectedCategory("pria"); setActiveOrder(null); }} className="hover:text-white transition-colors">Koleksi Atasan & Outer</button></li>
              <li><button onClick={() => { setSelectedCategory("aksesoris"); setActiveOrder(null); }} className="hover:text-white transition-colors">Aksesoris Eksklusif</button></li>
              <li><button onClick={() => { setSelectedCategory("sepatu"); setActiveOrder(null); }} className="hover:text-white transition-colors">Koleksi Sepatu & Heels</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange mb-4">Layanan Pembeli</h4>
            <ul className="text-xs space-y-2 text-gray-400 font-sans font-bold">
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Pengembalian 7 Hari</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hubungi Kami (WhatsApp)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pertanyaan Umum (FAQ)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Panduan Ukuran Pakaian</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange mb-4">Kupon Aktif</h4>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2 font-sans">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Gunakan saat checkout:</p>
              <div className="flex justify-between items-center bg-white/10 px-3 py-1.5 rounded-lg border border-brand-orange/30">
                <span className="font-mono font-black text-brand-orange text-xs tracking-wider">MODE20</span>
                <span className="text-[9px] font-black uppercase bg-brand-orange text-white px-1.5 py-0.5 rounded">DISCOUNT 20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower footer copyright info */}
        <div className="bg-black/40 py-5 text-[10px] font-bold uppercase tracking-widest border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-6 text-gray-400">
              <span>Bebas Biaya Kirim Se-Indonesia</span>
              <span>Cicilan 0% Kartu Kredit & E-Wallet</span>
              <span>Jaminan 100% Produk Original</span>
            </div>
            <div className="flex gap-6 items-center">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Youtube</a>
              <div className="h-4 w-[1px] bg-white/20 hidden md:block" />
              <span className="text-gray-400">© 2026 TRENDMODE FASHION GROUP</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

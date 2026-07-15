import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import { ChatMessage } from "../types";
import { Product } from "../data/products";

interface AIStylistProps {
  products: Product[];
  onOpenProduct: (productId: string) => void;
}

const QUICK_PROMPTS = [
  { text: "Rekomendasi padu-padan kemeja linen", label: "Mix & Match Linen" },
  { text: "Outfit santai tapi stylish untuk wanita", label: "Kasual Wanita" },
  { text: "Rekomendasi aksesoris pelengkap denim", label: "Gaya Denim" },
  { text: "Pilihan sneakers dan cara merawatnya", label: "Tips Sneakers" }
];

export default function AIStylist({ products, onOpenProduct }: AIStylistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: "Halo Kak! Selamat datang di TrendMode. Saya adalah **Asisten Gaya AI** pribadi Kakak. ✨\n\nButuh inspirasi padu padan (mix-and-match), bingung memilih ukuran, atau mencari outfit sempurna untuk acara wisuda, kencan, kerja, atau liburan? Tanya saya apa saja! Saya bisa langsung merekomendasikan koleksi pakaian nyata dari toko kami.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Keep track of unread count when closed
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Map history correctly for the backend endpoint
      const chatHistory = messages.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory
        })
      });

      const data = await response.json();

      const modelMessage: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: "model",
        text: data.text || "Maaf Kak, terjadi masalah jaringan. Silakan coba kembali!",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, modelMessage]);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("AI Stylist request error:", error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "model",
        text: "Waduh Kak, koneksi internet asisten gaya sedang terputus nih. Silakan coba tanya lagi sebentar ya!",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract products mentioned in a message
  const getMentionedProducts = (text: string) => {
    const mentioned: Product[] = [];
    products.forEach((p) => {
      // Look for product code (e.g. p1, p2) or exact names in the text
      const idPattern = new RegExp(`\\b${p.id}\\b`, "i");
      const namePattern = new RegExp(p.name.substring(0, 15).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
      
      if (idPattern.test(text) || namePattern.test(text)) {
        if (!mentioned.some(m => m.id === p.id)) {
          mentioned.push(p);
        }
      }
    });
    return mentioned;
  };

  // Convert custom bolding and paragraphs to very simple safe HTML elements
  const renderMessageContent = (text: string) => {
    return text.split("\n\n").map((para, i) => {
      // Simple parse markdown lists
      if (para.startsWith("- ") || para.startsWith("* ")) {
        return (
          <ul key={i} className="list-disc ml-5 mb-2 text-xs space-y-1">
            {para.split("\n").map((li, idx) => {
              const cleanedLi = li.replace(/^[-*]\s+/, "");
              return (
                <li key={idx} dangerouslySetInnerHTML={{ 
                  __html: cleanedLi.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") 
                }} />
              );
            })}
          </ul>
        );
      }
      
      // Simple parse bold markdown **bold**
      const htmlText = para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <p key={i} className="mb-2 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlText }} />
      );
    });
  };

  return (
    <>
      {/* Floating Button with Unread Indicator and Pulse animation */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-brand-orange text-white p-4 rounded-full shadow-2xl hover:bg-brand-blue hover:scale-105 transition-all flex items-center justify-center cursor-pointer border-2 border-brand-dark animate-pulse-ring"
        title="Konsultasi Gaya AI (AI Stylist)"
        id="ai-stylist-floating-btn"
      >
        <Sparkles className="w-6 h-6 animate-spin-slow" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-display text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Sliding Chat Drawer */}
      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-bg border-l-2 border-brand-dark z-50 flex flex-col shadow-2xl animate-slide-left">
          {/* Drawer Header */}
          <div className="p-5 bg-white border-b-2 border-brand-dark flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-brand-orange text-white border-2 border-brand-dark">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-black text-sm uppercase tracking-tight text-brand-dark flex items-center gap-1.5">
                  Asisten Gaya AI
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TrendMode Personal Stylist</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-brand-dark transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="bg-brand-blue text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
            <span>Rekomendasi Langsung Katalog Toko</span>
            <span className="text-brand-orange font-black">AI ONLINE</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const mentionedProducts = !isUser ? getMentionedProducts(msg.text) : [];

              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl border-2 shadow-xs ${
                    isUser 
                      ? "bg-brand-orange text-white border-brand-dark" 
                      : "bg-white text-brand-dark border-brand-dark/10"
                  }`}>
                    {isUser ? (
                      <p className="text-xs leading-relaxed font-bold">{msg.text}</p>
                    ) : (
                      <div className="markdown-body">
                        {renderMessageContent(msg.text)}
                      </div>
                    )}
                    <span className={`text-[9px] mt-1.5 block text-right font-medium ${
                      isUser ? "text-white/70" : "text-gray-400"
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Render inline product recommendations found in response */}
                  {mentionedProducts.length > 0 && (
                    <div className="mt-2 w-full max-w-[85%] space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-brand-orange flex items-center gap-1.5">
                        <ShoppingBag className="w-3 h-3" /> Rekomendasi Produk Terkait:
                      </p>
                      {mentionedProducts.map((p) => (
                        <div 
                          key={p.id}
                          onClick={() => onOpenProduct(p.id)}
                          className="bg-white hover:bg-brand-orange/5 p-2 rounded-2xl border border-brand-dark/10 hover:border-brand-orange transition-all cursor-pointer flex gap-3 items-center"
                        >
                          <img src={p.image} alt={p.name} className="w-10 h-12 object-cover rounded-lg border border-brand-dark/5" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-bold text-brand-dark truncate uppercase tracking-tight">{p.name}</h4>
                            <p className="text-[11px] font-black text-brand-orange">Rp {p.price.toLocaleString("id-ID")}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-brand-blue" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading/Typing Indicator */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-white border-2 border-brand-dark/10 p-4 rounded-3xl flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-brand-orange rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2.5 h-2.5 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2.5 h-2.5 bg-brand-dark rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-2">Gaya AI Berpikir...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Container */}
          <div className="p-3 bg-white border-t border-brand-dark/10">
            <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5 px-1">Pertanyaan Cepat:</span>
            <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(qp.text)}
                  disabled={isLoading}
                  className="text-[10px] bg-brand-bg hover:bg-brand-orange hover:text-white px-2.5 py-1.5 rounded-lg border border-brand-dark/10 font-bold tracking-tight transition-all cursor-pointer disabled:opacity-50"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Chat */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }} 
            className="p-4 bg-white border-t-2 border-brand-dark flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ketik pertanyaan gaya Anda di sini..."
              className="flex-1 bg-brand-bg border border-brand-dark/10 rounded-full px-4 py-3 text-xs focus:outline-none focus:border-brand-orange font-medium disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-full bg-brand-orange text-white hover:bg-brand-blue transition-colors border-2 border-brand-dark cursor-pointer flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

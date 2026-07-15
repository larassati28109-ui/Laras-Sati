import { Product } from "./data/products";

export interface CartItem {
  id: string; // unique cart item id (productId_size_colorHex)
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  courier: string;
  paymentMethod: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerInfo: CustomerInfo;
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  status: "Diproses" | "Dikirim" | "Dalam Perjalanan" | "Diterima";
  trackingNumber: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

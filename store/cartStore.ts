import { create } from 'zustand';
import { cartAPI } from '@/lib/api';

interface CartItem {
  id: number;
  product: {
    id: number;
    name_en: string;
    price_usd: string;
    price_iqd: string;
    thumbnail_url?: string;
  };
  quantity: number;
  total: string;
  total_iqd: string;
}

interface Cart {
  id: number;
  items: CartItem[];
  total: string;
  total_iqd: string;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartAPI.get();
      set({ cart: response.data, isLoading: false });
    } catch (error) {
      set({ cart: null, isLoading: false });
    }
  },
  addToCart: async (productId: number, quantity: number) => {
    try {
      await cartAPI.addItem(productId, quantity);
      await get().fetchCart();
    } catch (error) {
      throw error;
    }
  },
  updateQuantity: async (itemId: number, quantity: number) => {
    try {
      await cartAPI.updateItem(itemId, quantity);
      await get().fetchCart();
    } catch (error) {
      throw error;
    }
  },
  removeItem: async (itemId: number) => {
    try {
      await cartAPI.removeItem(itemId);
      await get().fetchCart();
    } catch (error) {
      throw error;
    }
  },
  clearCart: async () => {
    try {
      await cartAPI.clear();
      set({ cart: null });
    } catch (error) {
      throw error;
    }
  },
  getCartCount: () => {
    const cart = get().cart;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));


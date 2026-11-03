import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../api/types';
import { useAuth } from './AuthContext';

export interface CartItem {
  productId: number;
  sku: string;
  name: string;
  price: string; // "19.99"
  stockQty: number;
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  lineCount: number;
  totalAmount: string;
  addToCart: (product: Product, qty?: number) => { success: boolean; message?: string };
  updateQty: (productId: number, qty: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'nld_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write issues
    }
  }, [items]);

  const addToCart = useCallback(
    (product: Product, requestedQty = 1): { success: boolean; message?: string } => {
      // Check user permissions: VIEW-only users cannot add to cart
      if (user?.role === 'USER' && user.access === 'VIEW') {
        return {
          success: false,
          message: 'Your account has VIEW-only access. You cannot place orders or add items to cart.',
        };
      }

      if (product.stockQty <= 0) {
        return {
          success: false,
          message: `${product.name} is currently out of stock.`,
        };
      }

      const existing = items.find((item) => item.productId === product.id);
      const currentQty = existing ? existing.qty : 0;
      const newQty = currentQty + requestedQty;

      if (newQty > product.stockQty) {
        return {
          success: false,
          message:
            currentQty > 0
              ? `Cannot add more. Only ${product.stockQty} units available in stock (${currentQty} already in cart).`
              : `Cannot add ${requestedQty} units. Only ${product.stockQty} available.`,
        };
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.productId === product.id);

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...prev[existingIndex],
            qty: newQty,
            stockQty: product.stockQty,
            price: product.price,
          };
          return updated;
        }

        return [
          ...prev,
          {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            stockQty: product.stockQty,
            qty: requestedQty,
          },
        ];
      });

      return { success: true };
    },
    [user, items],
  );

  const updateQty = useCallback((productId: number, newQty: number) => {
    setItems((prev) => {
      if (newQty <= 0) {
        return prev.filter((i) => i.productId !== productId);
      }
      return prev.map((item) => {
        if (item.productId === productId) {
          const clampedQty = Math.min(newQty, item.stockQty);
          return { ...item, qty: clampedQty };
        }
        return item;
      });
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Compute total items and total amount using integer cents
  const { itemCount, lineCount, totalAmount } = useMemo(() => {
    let count = 0;
    let totalCents = 0;

    for (const item of items) {
      count += item.qty;
      const priceCents = Math.round(parseFloat(item.price) * 100);
      totalCents += priceCents * item.qty;
    }

    const formattedTotal = (totalCents / 100).toFixed(2);

    return {
      itemCount: count,
      lineCount: items.length,
      totalAmount: formattedTotal,
    };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      itemCount,
      lineCount,
      totalAmount,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
    }),
    [items, itemCount, lineCount, totalAmount, addToCart, updateQty, removeFromCart, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};


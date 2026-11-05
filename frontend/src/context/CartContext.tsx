import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../api/types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface CartItem {
  productId: number;
  sku: string;
  name: string;
  price: string; // "19.99"
  stockQty: number;
  qty: number;
  imageUrl?: string | null;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  lineCount: number;
  totalAmount: string;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addToCart: (product: Product, qty?: number) => { success: boolean; message?: string };
  updateQty: (productId: number, qty: number) => void;
  removeFromCart: (productId: number, withUndo?: boolean) => void;
  clearCart: () => void;
  reconcileWithStock: (freshProducts: Product[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'nld_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { success } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

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
            imageUrl: product.imageUrl ?? prev[existingIndex].imageUrl,
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
            imageUrl: product.imageUrl,
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

  const removeFromCart = useCallback(
    (productId: number, withUndo = true) => {
      const targetItem = items.find((i) => i.productId === productId);
      if (!targetItem) return;

      setItems((prev) => prev.filter((i) => i.productId !== productId));

      if (withUndo) {
        success(`Removed "${targetItem.name}" from cart`, 'Cart Updated', {
          label: 'Undo',
          onClick: () => {
            setItems((prev) => [...prev, targetItem]);
          },
        });
      }
    },
    [items, success],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const reconcileWithStock = useCallback((freshProducts: Product[]) => {
    if (!freshProducts || freshProducts.length === 0) return;

    setItems((prev) => {
      let changed = false;
      const productMap = new Map<number, Product>();
      freshProducts.forEach((p) => productMap.set(p.id, p));

      const updated = prev
        .map((item) => {
          const fresh = productMap.get(item.productId);
          if (!fresh) return item;

          const freshStock = fresh.stockQty;
          const freshPrice = fresh.price;
          const freshName = fresh.name;

          if (freshStock <= 0) {
            changed = true;
            return null; // out of stock, remove
          }

          const clampedQty = Math.min(item.qty, freshStock);
          if (clampedQty !== item.qty || freshPrice !== item.price || freshStock !== item.stockQty) {
            changed = true;
            return {
              ...item,
              qty: clampedQty,
              stockQty: freshStock,
              price: freshPrice,
              name: freshName,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);

      return changed ? updated : prev;
    });
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
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      reconcileWithStock,
    }),
    [
      items,
      itemCount,
      lineCount,
      totalAmount,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      reconcileWithStock,
    ],
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

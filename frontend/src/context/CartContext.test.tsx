import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { CartProvider, useCart } from './CartContext';
import { Product, User } from '../api/types';

let mockUser: User | null = {
  id: 1,
  email: 'creator@nld.local',
  role: 'USER',
  access: 'CREATE',
};

vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: Boolean(mockUser),
    isAdmin: mockUser?.role === 'ADMIN',
  }),
}));

const sampleProduct: Product = {
  id: 101,
  name: 'Wireless Barcode Scanner',
  sku: 'SCAN-WIFI-01',
  stockQty: 5,
  price: '99.95',
};

const sampleProduct2: Product = {
  id: 102,
  name: 'Thermal Receipt Paper',
  sku: 'PAPR-THRM-01',
  stockQty: 20,
  price: '14.50',
};

describe('CartContext', () => {
  let container: HTMLDivElement | null = null;
  let cartApi: ReturnType<typeof useCart> | null = null;

  const TestConsumer: React.FC = () => {
    cartApi = useCart();
    return <div id="cart-total">{cartApi.totalAmount}</div>;
  };

  beforeEach(() => {
    localStorage.clear();
    mockUser = {
      id: 1,
      email: 'creator@nld.local',
      role: 'USER',
      access: 'CREATE',
    };
    cartApi = null;
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      document.body.removeChild(container);
      container = null;
    }
  });

  it('initializes with empty cart and $0.00 total', async () => {
    const root = createRoot(container!);
    await act(async () => {
      root.render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>,
      );
    });

    expect(cartApi).not.toBeNull();
    expect(cartApi!.items).toEqual([]);
    expect(cartApi!.itemCount).toBe(0);
    expect(cartApi!.totalAmount).toBe('0.00');
  });

  it('adds items and accurately calculates total using integer cents', async () => {
    const root = createRoot(container!);
    await act(async () => {
      root.render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>,
      );
    });

    await act(async () => {
      const res = cartApi!.addToCart(sampleProduct, 2);
      expect(res.success).toBe(true);
    });

    expect(cartApi!.items).toHaveLength(1);
    expect(cartApi!.itemCount).toBe(2);
    expect(cartApi!.totalAmount).toBe('199.90');

    await act(async () => {
      const res = cartApi!.addToCart(sampleProduct2, 3);
      expect(res.success).toBe(true);
    });

    expect(cartApi!.items).toHaveLength(2);
    expect(cartApi!.itemCount).toBe(5);
    expect(cartApi!.totalAmount).toBe('243.40');
  });

  it('rejects adding items when user has VIEW-only access', async () => {
    mockUser = {
      id: 2,
      email: 'viewer@nld.local',
      role: 'USER',
      access: 'VIEW',
    };

    const root = createRoot(container!);
    await act(async () => {
      root.render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>,
      );
    });

    await act(async () => {
      const res = cartApi!.addToCart(sampleProduct, 1);
      expect(res.success).toBe(false);
      expect(res.message).toContain('VIEW-only access');
    });

    expect(cartApi!.items).toHaveLength(0);
  });

  it('prevents adding more items than available warehouse stock', async () => {
    const root = createRoot(container!);
    await act(async () => {
      root.render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>,
      );
    });

    await act(async () => {
      const res = cartApi!.addToCart(sampleProduct, 6);
      expect(res.success).toBe(false);
      expect(res.message).toContain('Only 5 available');
    });

    expect(cartApi!.items).toHaveLength(0);

    await act(async () => {
      cartApi!.addToCart(sampleProduct, 4);
    });
    expect(cartApi!.itemCount).toBe(4);

    await act(async () => {
      const res = cartApi!.addToCart(sampleProduct, 2);
      expect(res.success).toBe(false);
      expect(res.message).toContain('Only 5 units available in stock');
    });

    expect(cartApi!.itemCount).toBe(4);
  });

  it('updates quantity and clamps to stock level', async () => {
    const root = createRoot(container!);
    await act(async () => {
      root.render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>,
      );
    });

    await act(async () => {
      cartApi!.addToCart(sampleProduct, 2);
    });

    await act(async () => {
      cartApi!.updateQty(sampleProduct.id, 4);
    });
    expect(cartApi!.itemCount).toBe(4);

    // Clamps to stockQty 5
    await act(async () => {
      cartApi!.updateQty(sampleProduct.id, 10);
    });
    expect(cartApi!.itemCount).toBe(5);

    // Remove when <= 0
    await act(async () => {
      cartApi!.updateQty(sampleProduct.id, 0);
    });
    expect(cartApi!.items).toHaveLength(0);
  });

  it('removes item and clears cart completely', async () => {
    const root = createRoot(container!);
    await act(async () => {
      root.render(
        <CartProvider>
          <TestConsumer />
        </CartProvider>,
      );
    });

    await act(async () => {
      cartApi!.addToCart(sampleProduct, 2);
      cartApi!.addToCart(sampleProduct2, 1);
    });
    expect(cartApi!.items).toHaveLength(2);

    await act(async () => {
      cartApi!.removeFromCart(sampleProduct.id);
    });
    expect(cartApi!.items).toHaveLength(1);
    expect(cartApi!.items[0].productId).toBe(sampleProduct2.id);

    await act(async () => {
      cartApi!.clearCart();
    });
    expect(cartApi!.items).toHaveLength(0);
    expect(cartApi!.totalAmount).toBe('0.00');
  });
});

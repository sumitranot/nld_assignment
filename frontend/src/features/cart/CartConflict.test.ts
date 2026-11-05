import { describe, it, expect } from 'vitest';
import { StockConflictItem } from '../../api/types';

interface CartItem {
  productId: number;
  sku: string;
  qty: number;
}

const resolveStockConflict = (
  items: CartItem[],
  conflicts: StockConflictItem[],
  action: 'adjust' | 'remove',
  targetSku?: string,
): CartItem[] => {
  const conflictMap = new Map<string, StockConflictItem>(
    conflicts.map((c) => [c.sku, c]),
  );

  return items
    .map((item) => {
      const conflict = conflictMap.get(item.sku);
      if (!conflict) return item;

      if (targetSku && item.sku !== targetSku) return item;

      if (action === 'adjust') {
        return conflict.available > 0
          ? { ...item, qty: conflict.available }
          : null;
      }

      if (action === 'remove') {
        return null;
      }

      return item;
    })
    .filter((item): item is CartItem => item !== null);
};

describe('Cart 409 conflict resolution logic', () => {
  const currentCart: CartItem[] = [
    { productId: 1, sku: 'SKU-001', qty: 5 },
    { productId: 2, sku: 'SKU-002', qty: 3 },
    { productId: 3, sku: 'SKU-003', qty: 2 },
  ];

  const conflicts: StockConflictItem[] = [
    { sku: 'SKU-001', requested: 5, available: 2 },
    { sku: 'SKU-002', requested: 3, available: 0 },
  ];

  it('adjusts requested quantity down to available stock level for single SKU', () => {
    const updated = resolveStockConflict(currentCart, conflicts, 'adjust', 'SKU-001');

    const sku1 = updated.find((i) => i.sku === 'SKU-001');
    expect(sku1?.qty).toBe(2);

    // Other items remain unchanged
    const sku2 = updated.find((i) => i.sku === 'SKU-002');
    expect(sku2?.qty).toBe(3);
  });

  it('removes completely out of stock item when adjusted with 0 available', () => {
    const updated = resolveStockConflict(currentCart, conflicts, 'adjust', 'SKU-002');

    expect(updated.find((i) => i.sku === 'SKU-002')).toBeUndefined();
    expect(updated.find((i) => i.sku === 'SKU-001')?.qty).toBe(5);
  });

  it('removes conflicting SKU on one-click remove action', () => {
    const updated = resolveStockConflict(currentCart, conflicts, 'remove', 'SKU-001');

    expect(updated.find((i) => i.sku === 'SKU-001')).toBeUndefined();
    expect(updated.find((i) => i.sku === 'SKU-002')?.qty).toBe(3);
  });
});


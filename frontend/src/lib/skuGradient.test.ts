import { describe, it, expect } from 'vitest';
import { getSkuGradient } from './skuGradient';

describe('skuGradient utilities', () => {
  it('generates deterministic gradient for identical SKU string', () => {
    const sku = 'SKU-BOX-SM-001';
    const gradient1 = getSkuGradient(sku);
    const gradient2 = getSkuGradient(sku);

    expect(gradient1).toEqual(gradient2);
    expect(gradient1.gradient).toContain('linear-gradient');
    expect(gradient1.accentColor).toContain('hsl(');
    expect(gradient1.initials).toBe('BS');
  });

  it('generates different gradients for different SKUs', () => {
    const grad1 = getSkuGradient('SKU-BOX-SM-001');
    const grad2 = getSkuGradient('SKU-TAPE-CLR-005');

    expect(grad1.gradient).not.toEqual(grad2.gradient);
  });

  it('extracts initials from SKU segments or falls back gracefully', () => {
    const info = getSkuGradient('SKU-BOX-SM-001');
    expect(info.initials).toBe('BS');

    const single = getSkuGradient('BOX');
    expect(single.initials).toBe('BO');

    const empty = getSkuGradient('');
    expect(empty.initials).toBe('SK');
  });
});

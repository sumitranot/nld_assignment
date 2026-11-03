import { toCents, fromCents, multiplyCents, computeTotalAmount } from './money';

describe('Money Utilities (Integer Cents Precision)', () => {
  describe('toCents', () => {
    it('converts standard decimal string to integer cents', () => {
      expect(toCents('12.34')).toBe(1234);
      expect(toCents('0.99')).toBe(99);
      expect(toCents('0.05')).toBe(5);
      expect(toCents('0.00')).toBe(0);
    });

    it('converts integers and single decimal digit strings', () => {
      expect(toCents('12')).toBe(1200);
      expect(toCents('12.5')).toBe(1250);
      expect(toCents(12.5)).toBe(1250);
      expect(toCents(45)).toBe(4500);
    });

    it('rounds half up for extra decimal places', () => {
      expect(toCents('12.345')).toBe(1235);
      expect(toCents('12.344')).toBe(1234);
    });
  });

  describe('fromCents', () => {
    it('formats cents to 2-decimal string', () => {
      expect(fromCents(1234)).toBe('12.34');
      expect(fromCents(99)).toBe('0.99');
      expect(fromCents(5)).toBe('0.05');
      expect(fromCents(0)).toBe('0.00');
      expect(fromCents(1200)).toBe('12.00');
    });
  });

  describe('multiplyCents', () => {
    it('multiplies cents with integer quantities accurately', () => {
      expect(multiplyCents(185, 3)).toBe(555);
      expect(multiplyCents(295, 0)).toBe(0);
    });

    it('throws error for non-integer or negative quantity', () => {
      expect(() => multiplyCents(100, -1)).toThrow();
      expect(() => multiplyCents(100, 1.5)).toThrow();
    });
  });

  describe('computeTotalAmount', () => {
    it('calculates aggregate total with zero floating-point error', () => {
      // 0.1 + 0.2 in standard JS floats is 0.30000000000000004
      const items = [
        { unitPrice: '0.10', quantity: 1 },
        { unitPrice: '0.20', quantity: 1 },
      ];
      expect(computeTotalAmount(items)).toBe('0.30');
    });

    it('calculates complex multi-item cart totals', () => {
      const items = [
        { unitPrice: '1.85', quantity: 10 }, // 18.50
        { unitPrice: '2.95', quantity: 4 },  // 11.80
        { unitPrice: '12.40', quantity: 2 }, // 24.80
      ];
      // 18.50 + 11.80 + 24.80 = 55.10
      expect(computeTotalAmount(items)).toBe('55.10');
    });
  });
});


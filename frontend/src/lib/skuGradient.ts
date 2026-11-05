/**
 * Generates a deterministic, aesthetically pleasing gradient and initials
 * for any product SKU string. Strictly image-free, highly performant.
 */

export interface SkuGradientInfo {
  gradient: string;
  initials: string;
  textColor: string;
  accentColor: string;
}

export function getSkuGradient(sku: string, name?: string): SkuGradientInfo {
  const cleanSku = (sku || 'SKU').toUpperCase().trim();

  // Simple string hash function
  let hash = 0;
  for (let i = 0; i < cleanSku.length; i++) {
    hash = (hash << 5) - hash + cleanSku.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  // Deterministic hues (spaced 35-50 degrees apart for rich gradient depth)
  const hue1 = positiveHash % 360;
  const hue2 = (hue1 + 35 + (positiveHash % 25)) % 360;

  // Extract initials: take letters from SKU segments (e.g. SKU-BOX-SM-001 -> "BS" or "BX")
  const parts = cleanSku.replace(/^SKU[-_]?/i, '').split(/[-_]/).filter(Boolean);
  let initials = '';

  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length >= 2) {
    initials = parts[0].substring(0, 2).toUpperCase();
  } else if (name && name.trim().length >= 2) {
    const words = name.trim().split(/\s+/);
    initials = (words[0][0] + (words[1] ? words[1][0] : words[0][1])).toUpperCase();
  } else {
    initials = cleanSku.substring(0, 2).toUpperCase();
  }

  return {
    gradient: `linear-gradient(135deg, hsl(${hue1}, 72%, 46%) 0%, hsl(${hue2}, 78%, 32%) 100%)`,
    initials,
    textColor: '#ffffff',
    accentColor: `hsl(${hue1}, 80%, 75%)`,
  };
}


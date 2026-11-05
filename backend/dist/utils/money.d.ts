/**
 * Money utilities using integer cents to guarantee 100% precision with zero floating-point drift.
 * In DB, monetary columns use DECIMAL(12, 2).
 */
/**
 * Converts a string or numeric decimal price into integer cents without floating point precision loss.
 * E.g.: "12.34" -> 1234, "12" -> 1200, "12.5" -> 1250
 */
export declare const toCents: (amount: string | number) => number;
/**
 * Converts integer cents into a fixed 2-decimal string representation for DECIMAL(12,2) storage and API response.
 * E.g.: 1234 -> "12.34", 99 -> "0.99", 5 -> "0.05", 0 -> "0.00"
 */
export declare const fromCents: (cents: number) => string;
/**
 * Multiplies unit price (in integer cents) by integer quantity.
 */
export declare const multiplyCents: (unitCents: number, quantity: number) => number;
/**
 * Computes the grand total for a list of items with unit price and quantity.
 * Returns the 2-decimal string formatted total.
 */
export declare const computeTotalAmount: (items: Array<{
    unitPrice: string | number;
    quantity: number;
}>) => string;

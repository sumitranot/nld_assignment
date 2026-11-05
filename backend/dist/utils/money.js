"use strict";
/**
 * Money utilities using integer cents to guarantee 100% precision with zero floating-point drift.
 * In DB, monetary columns use DECIMAL(12, 2).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTotalAmount = exports.multiplyCents = exports.fromCents = exports.toCents = void 0;
/**
 * Converts a string or numeric decimal price into integer cents without floating point precision loss.
 * E.g.: "12.34" -> 1234, "12" -> 1200, "12.5" -> 1250
 */
const toCents = (amount) => {
    const str = typeof amount === 'number' ? amount.toFixed(2) : amount.trim();
    const isNegative = str.startsWith('-');
    const clean = isNegative ? str.slice(1) : str;
    const [dollarsStr = '0', rawCentsStr = '00'] = clean.split('.');
    const dollars = parseInt(dollarsStr, 10);
    if (Number.isNaN(dollars)) {
        throw new Error(`Invalid monetary amount: ${amount}`);
    }
    // Pad or slice cents to exactly 2 digits
    let centsStr = rawCentsStr.slice(0, 2);
    if (centsStr.length === 1) {
        centsStr += '0';
    }
    else if (centsStr.length === 0) {
        centsStr = '00';
    }
    const cents = parseInt(centsStr, 10);
    if (Number.isNaN(cents)) {
        throw new Error(`Invalid monetary amount: ${amount}`);
    }
    // Handle rounding if there was a 3rd decimal place >= 5
    const remainder = rawCentsStr.length > 2 ? parseInt(rawCentsStr[2] ?? '0', 10) : 0;
    let totalCents = dollars * 100 + cents;
    if (remainder >= 5) {
        totalCents += 1;
    }
    return isNegative ? -totalCents : totalCents;
};
exports.toCents = toCents;
/**
 * Converts integer cents into a fixed 2-decimal string representation for DECIMAL(12,2) storage and API response.
 * E.g.: 1234 -> "12.34", 99 -> "0.99", 5 -> "0.05", 0 -> "0.00"
 */
const fromCents = (cents) => {
    const isNegative = cents < 0;
    const abs = Math.abs(Math.round(cents));
    const dollars = Math.floor(abs / 100);
    const remainderCents = abs % 100;
    const paddedCents = remainderCents < 10 ? `0${remainderCents}` : `${remainderCents}`;
    const formatted = `${dollars}.${paddedCents}`;
    return isNegative ? `-${formatted}` : formatted;
};
exports.fromCents = fromCents;
/**
 * Multiplies unit price (in integer cents) by integer quantity.
 */
const multiplyCents = (unitCents, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 0) {
        throw new Error(`Quantity must be a non-negative integer, received: ${quantity}`);
    }
    return unitCents * quantity;
};
exports.multiplyCents = multiplyCents;
/**
 * Computes the grand total for a list of items with unit price and quantity.
 * Returns the 2-decimal string formatted total.
 */
const computeTotalAmount = (items) => {
    const totalCents = items.reduce((accum, item) => {
        const itemCents = (0, exports.toCents)(item.unitPrice);
        return accum + (0, exports.multiplyCents)(itemCents, item.quantity);
    }, 0);
    return (0, exports.fromCents)(totalCents);
};
exports.computeTotalAmount = computeTotalAmount;
//# sourceMappingURL=money.js.map
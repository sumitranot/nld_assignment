import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createOrder } from '../../api/orders.api';
import { Spinner } from '../../components/Spinner';
import { getProductMetadata } from '../../utils/productImages';

interface StockConflictItem {
  sku: string;
  requested: number;
  available: number;
}

export const CartPage: React.FC = () => {
  const { items, updateQty, removeFromCart, clearCart, itemCount, totalAmount } = useCart();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stockConflicts, setStockConflicts] = useState<Map<string, StockConflictItem>>(new Map());

  const isViewOnly = user?.role === 'USER' && user?.access === 'VIEW';

  const handleCheckout = async () => {
    if (items.length === 0 || isSubmitting || isViewOnly) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setStockConflicts(new Map());

    try {
      const payload = {
        items: items.map((item) => ({
          sku: item.sku,
          qty: item.qty,
        })),
      };

      const createdOrder = await createOrder(payload);

      clearCart();
      success(`Order #${createdOrder.orderNumber} placed successfully!`, 'Order Confirmed');
      navigate('/orders');
    } catch (err: unknown) {
      // Check for 409 Conflict with insufficientItems
      const axiosError = err as {
        response?: {
          status?: number;
          data?: {
            error?: {
              message?: string;
              details?: {
                insufficientItems?: StockConflictItem[];
              };
            };
          };
        };
        message?: string;
      };

      const respData = axiosError.response?.data?.error;
      const conflicts = respData?.details?.insufficientItems;

      if (conflicts && Array.isArray(conflicts)) {
        const conflictMap = new Map<string, StockConflictItem>();
        for (const c of conflicts) {
          conflictMap.set(c.sku, c);
        }
        setStockConflicts(conflictMap);
        setErrorMessage(
          'One or more items in your cart exceed available inventory. Please adjust quantities below.',
        );
        toastError('Insufficient inventory to complete your order', 'Stock Conflict');
      } else {
        const msg = respData?.message || axiosError.message || 'Failed to place order. Please try again.';
        setErrorMessage(msg);
        toastError(msg, 'Order Failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-state card">
        <div className="empty-state__icon">&#128722;</div>
        <h2 className="empty-state__title">Your cart is empty</h2>
        <p className="empty-state__desc">
          Browse our catalog to select products and add them to your order.
        </p>
        <Link to="/products" className="btn btn--primary">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Shopping Cart</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 2 }}>
            Review selected items and proceed to order placement
          </p>
        </div>

        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={clearCart}
          disabled={isSubmitting}
        >
          Clear Cart
        </button>
      </div>

      {/* VIEW-only Warning Alert */}
      {isViewOnly && (
        <div className="alert alert--warning" role="alert">
          <strong>Restricted Access:</strong> Your account is assigned <strong>VIEW</strong>-only access.
          You cannot place orders. Please contact an administrator if you require order creation privileges.
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="alert alert--danger" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="cart-layout">
        {/* Cart Items Table */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const conflict = stockConflicts.get(item.sku);
                const itemPriceCents = Math.round(parseFloat(item.price) * 100);
                const subtotal = ((itemPriceCents * item.qty) / 100).toFixed(2);

                return (
                  <tr
                    key={item.productId}
                    style={conflict ? { background: '#fef2f2' } : undefined}
                  >
                    <td>
                      {(() => {
                        const metaInfo = getProductMetadata(item.sku, item.name, item.imageUrl);
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <img
                              src={metaInfo.image}
                              alt={item.name}
                              className="product-thumb"
                              loading="lazy"
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</div>
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                SKU: {item.sku} &bull; <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{metaInfo.category}</span>
                              </div>
                              {conflict && (
                                <div
                                  style={{
                                    color: 'var(--danger)',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 600,
                                    marginTop: 4,
                                  }}
                                >
                                  &bull; Available in warehouse: {conflict.available} (You requested {conflict.requested})
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    <td>${item.price}</td>

                    <td>
                      <div className="qty-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          disabled={item.qty <= 1 || isSubmitting}
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="qty-display">{item.qty}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          disabled={item.qty >= item.stockQty || isSubmitting}
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td style={{ fontWeight: 600 }}>${subtotal}</td>

                    <td>
                      <button
                        type="button"
                        className="btn btn--sm btn--danger"
                        disabled={isSubmitting}
                        onClick={() => removeFromCart(item.productId)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 16 }}>
            Order Summary
          </h2>

          <div className="cart-summary__row">
            <span>Total Units</span>
            <strong>{itemCount}</strong>
          </div>

          <div className="cart-summary__row">
            <span>Distinct Products</span>
            <strong>{items.length}</strong>
          </div>

          <div className="cart-summary__row">
            <span>Shipping</span>
            <strong style={{ color: 'var(--success)' }}>FREE</strong>
          </div>

          <div className="cart-summary__row cart-summary__row--total">
            <span>Total Amount</span>
            <span>${totalAmount}</span>
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              type="button"
              className="btn btn--primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={isSubmitting || isViewOnly}
              onClick={handleCheckout}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" ariaLabel="Processing order..." />
                  <span>Placing Order...</span>
                </>
              ) : isViewOnly ? (
                'Order Disabled (VIEW Only)'
              ) : (
                'Place Order'
              )}
            </button>

            <Link
              to="/products"
              className="btn btn--secondary"
              style={{ width: '100%', marginTop: 8, textAlign: 'center' }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

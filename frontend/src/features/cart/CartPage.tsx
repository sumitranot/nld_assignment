import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { createOrder } from '../../api/orders.api';
import { invalidateOrdersAndProducts } from '../../app/QueryClient';
import { SkuGradient } from '../../components/ui/SkuGradient';
import { QuantityStepper } from '../../components/ui/QuantityStepper';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatPrice } from '../../lib/formatters';
import { Order, StockConflictItem, NormalizedApiError } from '../../api/types';
import styles from './CartPage.module.css';

export const CartPage: React.FC = () => {
  const { items, updateQty, removeFromCart, clearCart, itemCount, lineCount, totalAmount } =
    useCart();
  const { user } = useAuth();
  const { toastError, success } = {
    toastError: useToast().error,
    success: useToast().success,
  };
  const navigate = useNavigate();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [stockConflicts, setStockConflicts] = useState<Map<string, StockConflictItem>>(new Map());

  const isViewOnly = user?.role === 'USER' && user?.access === 'VIEW';

  const handleOpenConfirm = () => {
    if (items.length === 0 || isViewOnly) return;
    setIsConfirmModalOpen(true);
  };

  const handleExecuteCheckout = async () => {
    setIsSubmitting(true);
    setStockConflicts(new Map());

    try {
      const payload = {
        items: items.map((i) => ({
          sku: i.sku,
          qty: i.qty,
        })),
      };

      const order = await createOrder(payload);
      await invalidateOrdersAndProducts();

      clearCart();
      setIsConfirmModalOpen(false);
      setConfirmedOrder(order);
      success(`Order #${order.orderNumber} successfully placed!`, 'Order Confirmed');
    } catch (err: unknown) {
      const apiErr = err as NormalizedApiError;

      const conflicts = apiErr.details?.insufficientItems;
      if (conflicts && Array.isArray(conflicts)) {
        const conflictMap = new Map<string, StockConflictItem>();
        conflicts.forEach((c) => conflictMap.set(c.sku, c));
        setStockConflicts(conflictMap);
        setIsConfirmModalOpen(false);
        toastError('Inventory allocation conflict detected. Please review available stock below.', 'Stock Conflict');
      } else {
        toastError(apiErr.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was just placed, display Checkout Result screen
  if (confirmedOrder) {
    return (
      <div className={styles.orderSuccessContainer}>
        <div className={styles.successIcon}>
          <CheckCircle2 size={40} />
        </div>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
          Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-6)' }}>
          Thank you for your order. Your warehouse fulfillment request has been received and scheduled.
        </p>

        <div
          style={{
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            textAlign: 'left',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order Number:</span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {confirmedOrder.orderNumber}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Status:</span>
            <StatusBadge status={confirmedOrder.status} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
              {formatPrice(confirmedOrder.totalAmount)}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'left', marginBottom: 'var(--space-6)' }}>
          <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, marginBottom: 4 }}>What&apos;s Next?</h4>
          <ul style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', paddingLeft: 'var(--space-4)', lineHeight: 1.6 }}>
            <li>Our warehouse team will assemble your packing units.</li>
            <li>An administrator will confirm shipment dispatch once packages are palletized.</li>
            <li>Track live fulfillment progress anytime from the Orders tab.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
          <Button variant="primary" onClick={() => navigate('/orders')}>
            Track Order Details
          </Button>
          <Button variant="secondary" onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // Empty cart view
  if (items.length === 0) {
    return (
      <div style={{ padding: '60px var(--space-4)' }}>
        <EmptyState
          icon={<ShoppingBag size={40} />}
          title="Your shopping cart is empty"
          description="Browse our warehouse inventory catalog to select packing cartons, strapping, or protective cushioning."
          action={
            <Button variant="primary" onClick={() => navigate('/products')}>
              Explore Catalog
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>Shopping Cart</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 2 }}>
          Review selected warehouse materials and proceed to order confirmation
        </p>
      </div>

      {/* VIEW-only restriction banner */}
      {isViewOnly && (
        <div
          role="alert"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-warning-light)',
            color: 'var(--color-warning-text)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-warning-border)',
            fontSize: 'var(--font-sm)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <ShieldAlert size={18} />
          <span>
            <strong>Restricted Access:</strong> Your account is assigned VIEW-only access. You can
            inspect cart totals, but order placement is disabled.
          </span>
        </div>
      )}

      {/* 409 Resolution Alert if present */}
      {stockConflicts.size > 0 && (
        <div
          role="alert"
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-danger-light)',
            color: 'var(--color-danger-text)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-danger-border)',
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--font-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 4 }}>
            <AlertTriangle size={18} />
            <span>Inventory Conflicts Detected (HTTP 409)</span>
          </div>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-danger-text)' }}>
            One or more items in your cart exceed available stock. Use the quick resolution actions below to adjust or remove conflicting quantities.
          </p>
        </div>
      )}

      <div className={styles.layout}>
        {/* Line Items Table */}
        <div className={styles.tableWrapper}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-default)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                  PRODUCT
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                  PRICE
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                  QUANTITY
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                  SUBTOTAL
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', width: 48 }} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const conflict = stockConflicts.get(item.sku);
                const priceCents = Math.round(parseFloat(item.price) * 100);
                const subtotal = ((priceCents * item.qty) / 100).toFixed(2);

                return (
                  <tr
                    key={item.productId}
                    className={conflict ? styles.conflictItem : undefined}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <td style={{ padding: 'var(--space-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <SkuGradient sku={item.sku} name={item.name} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--font-sm)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {item.sku}
                          </div>

                          {/* 409 Conflict Resolution Panel per SKU */}
                          {conflict && (
                            <div className={styles.conflictBox}>
                              <span>
                                Available in stock: <strong>{conflict.available}</strong> (You requested{' '}
                                {conflict.requested})
                              </span>
                              <div className={styles.conflictActions}>
                                {conflict.available > 0 && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    style={{ fontSize: '11px', height: 26, padding: '0 8px' }}
                                    onClick={() => {
                                      updateQty(item.productId, conflict.available);
                                      setStockConflicts((prev) => {
                                        const next = new Map(prev);
                                        next.delete(item.sku);
                                        return next;
                                      });
                                    }}
                                  >
                                    Adjust to {conflict.available}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="danger"
                                  style={{ fontSize: '11px', height: 26, padding: '0 8px' }}
                                  onClick={() => {
                                    removeFromCart(item.productId, false);
                                    setStockConflicts((prev) => {
                                      const next = new Map(prev);
                                      next.delete(item.sku);
                                      return next;
                                    });
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: 'var(--space-4)', fontSize: 'var(--font-sm)' }}>
                      {formatPrice(item.price)}
                    </td>

                    <td style={{ padding: 'var(--space-4)' }}>
                      <QuantityStepper
                        value={item.qty}
                        min={1}
                        max={item.stockQty}
                        onChange={(val) => updateQty(item.productId, val)}
                        ariaLabel={`quantity for ${item.name}`}
                      />
                    </td>

                    <td style={{ padding: 'var(--space-4)', fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--primary)' }}>
                      {formatPrice(subtotal)}
                    </td>

                    <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                      <IconButton
                        icon={<Trash2 size={16} />}
                        ariaLabel={`Remove ${item.name} from cart`}
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.productId, true)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Order Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.summaryTitle}>Order Summary</div>

          <div className={styles.summaryRow}>
            <span>Line Items:</span>
            <span>{lineCount} items</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Total Units:</span>
            <span>{itemCount} units</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Items Subtotal:</span>
            <span style={{ fontWeight: 600 }}>{formatPrice(totalAmount)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Warehouse Handling:</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Free</span>
          </div>

          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total Amount:</span>
            <span style={{ color: 'var(--primary)', fontSize: 'var(--font-xl)' }}>
              {formatPrice(totalAmount)}
            </span>
          </div>

          <Button
            variant="primary"
            fullWidth
            size="lg"
            rightIcon={<ArrowRight size={18} />}
            disabled={isViewOnly || stockConflicts.size > 0}
            onClick={handleOpenConfirm}
          >
            Create Order
          </Button>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
            <Link to="/products" style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              &larr; Return to Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => !isSubmitting && setIsConfirmModalOpen(false)}
        title="Confirm Order Placement"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isSubmitting}
              onClick={handleExecuteCheckout}
            >
              Place Order (${totalAmount})
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
          You are about to place an order for <strong>{itemCount} units</strong> totaling{' '}
          <strong style={{ color: 'var(--primary)' }}>{formatPrice(totalAmount)}</strong>.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
          Inventory stock will be allocated immediately and cannot be claimed by other concurrent sessions.
        </p>
      </Modal>
    </div>
  );
};

export default CartPage;

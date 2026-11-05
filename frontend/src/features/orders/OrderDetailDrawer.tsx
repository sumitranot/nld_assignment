import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../../api/orders.api';
import { orderKeys } from '../../app/QueryClient';
import { Drawer } from '../../components/ui/Drawer';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SkuGradient } from '../../components/ui/SkuGradient';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDate, formatPrice } from '../../lib/formatters';
import styles from './OrdersPage.module.css';

export interface OrderDetailDrawerProps {
  orderId: number | null;
  onClose: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({ orderId, onClose }) => {
  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: orderKeys.detail(orderId || 0),
    queryFn: () => getOrderById(orderId!),
    enabled: Boolean(orderId),
  });

  return (
    <Drawer
      isOpen={Boolean(orderId)}
      onClose={onClose}
      title={order ? `Order #${order.orderNumber}` : 'Order Details'}
      position="right"
      maxWidth={520}
      footer={
        order ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              fontSize: 'var(--font-base)',
            }}
          >
            <span style={{ fontWeight: 600 }}>Total Order Value:</span>
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 'var(--font-xl)' }}>
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        ) : null
      }
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spinner size="lg" ariaLabel="Loading order details..." />
        </div>
      ) : isError ? (
        <ErrorState
          title="Could Not Load Order"
          message={error instanceof Error ? error.message : 'Failed to retrieve order items.'}
          onRetry={() => refetch()}
        />
      ) : order ? (
        <div>
          {/* Order Meta Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 'var(--space-4)',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Status</div>
              <div style={{ marginTop: 4 }}>
                <StatusBadge status={order.status} />
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Placed At</div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginTop: 4 }}>
                {formatDate(order.createdAt)}
              </div>
            </div>
          </div>

          {/* Customer info if present (for Admin view) */}
          {order.user && (
            <div
              style={{
                marginTop: 'var(--space-3)',
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-xs)',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Account: </span>
              <strong>{order.user.email}</strong>
            </div>
          )}

          {/* Status Timeline */}
          <div style={{ marginTop: 'var(--space-6)' }}>
            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Fulfillment Timeline
            </h4>

            <div className={styles.timeline}>
              <div className={styles.timelineStep}>
                <div className={`${styles.timelineDot} ${styles.timelineDotActive}`} />
                <div className={styles.timelineTitle}>Order Placed & Stock Reserved</div>
                <div className={styles.timelineTime}>{formatDate(order.createdAt)}</div>
              </div>

              <div className={styles.timelineStep}>
                <div
                  className={`${styles.timelineDot} ${
                    order.status === 'CONFIRMED'
                      ? styles.timelineDotActive
                      : order.status === 'CANCELLED'
                      ? ''
                      : ''
                  }`}
                  style={order.status === 'CANCELLED' ? { borderColor: 'var(--color-danger)', backgroundColor: 'var(--color-danger)' } : undefined}
                />
                <div className={styles.timelineTitle}>
                  {order.status === 'CONFIRMED'
                    ? 'Order Confirmed by Warehouse'
                    : order.status === 'CANCELLED'
                    ? 'Order Cancelled'
                    : 'Awaiting Admin Confirmation'}
                </div>
                <div className={styles.timelineTime}>
                  {order.status !== 'PENDING' ? formatDate(order.updatedAt) : 'In Queue'}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div style={{ marginTop: 'var(--space-6)' }}>
            <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Allocated Items ({order.items?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {order.items?.map((item) => {
                const subtotal = (
                  (Math.round(parseFloat(item.unitPrice) * 100) * item.quantity) /
                  100
                ).toFixed(2);

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--bg-muted)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <SkuGradient
                      sku={item.product?.sku ?? 'SKU'}
                      name={item.product?.name}
                      size="sm"
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 'var(--font-sm)',
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.product?.name ?? `Product #${item.productId}`}
                      </div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {item.product?.sku ?? '-'} &bull; {item.quantity} units @ {formatPrice(item.unitPrice)}
                      </div>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--primary)' }}>
                      {formatPrice(subtotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
};


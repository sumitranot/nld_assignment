import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { FileText, Eye, Ban, RotateCcw } from 'lucide-react';
import { getOrders, cancelOrder } from '../../api/orders.api';
import { orderKeys, productKeys } from '../../app/QueryClient';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Tabs, TabItem } from '../../components/ui/Tabs';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Tooltip } from '../../components/ui/Tooltip';
import { OrderDetailDrawer } from './OrderDetailDrawer';
import { formatDate, formatPrice } from '../../lib/formatters';
import { OrderStatus, OrderListItem } from '../../api/types';
import styles from './OrdersPage.module.css';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '10', 10);
  const statusParam = (searchParams.get('status') as OrderStatus) || '';
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';

  // Local drawer and modal state
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<OrderListItem | null>(null);

  const isViewOnly = user?.role === 'USER' && user?.access === 'VIEW';

  // TanStack Query for Orders
  const queryFilters = {
    page: pageParam,
    limit: limitParam,
    status: statusParam || undefined,
    from: fromParam || undefined,
    to: toParam || undefined,
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: orderKeys.list(queryFilters),
    queryFn: () => getOrders(queryFilters),
    placeholderData: keepPreviousData,
  });

  // Cancel order mutation with optimistic UI rollback
  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId),
    onSuccess: (updatedOrder) => {
      success(`Order #${updatedOrder.orderNumber} was cancelled.`, 'Order Cancelled');
      setCancellingOrder(null);
      // Invalidate both orders and products to restore stock
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (err: unknown) => {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Failed to cancel order.';
      toastError(msg, 'Cancellation Failed');
    },
  });

  // Tab definitions
  const statusTabs: TabItem[] = [
    { id: '', label: 'All Orders' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  const handleStatusTabChange = (newStatus: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newStatus) {
        next.set('status', newStatus);
      } else {
        next.delete('status');
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleDateChange = (key: 'from' | 'to', value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchParams({ page: '1', limit: String(limitParam) });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('limit', String(newLimit));
      next.set('page', '1');
      return next;
    });
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Orders Management</h1>
            <p className={styles.subtitle}>
              Monitor procurement statuses, track line items, and audit inventory allocations
            </p>
          </div>
        </div>

        {/* Status Tabs and Date Range Filter Card */}
        <div className={styles.filterCard}>
          <Tabs
            tabs={statusTabs}
            activeId={statusParam}
            onChange={handleStatusTabChange}
            variant="pills"
          />

          <div className={styles.dateFilterRow}>
            <div className={styles.dateInputGroup}>
              <span className={styles.dateLabel}>From:</span>
              <input
                type="date"
                value={fromParam}
                onChange={(e) => handleDateChange('from', e.target.value)}
                style={{
                  height: 32,
                  padding: '0 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-xs)',
                }}
              />
            </div>

            <div className={styles.dateInputGroup}>
              <span className={styles.dateLabel}>To:</span>
              <input
                type="date"
                value={toParam}
                onChange={(e) => handleDateChange('to', e.target.value)}
                style={{
                  height: 32,
                  padding: '0 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-xs)',
                }}
              />
            </div>

            {(statusParam || fromParam || toParam) && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw size={14} />}
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isError ? (
        <ErrorState
          title="Failed to Load Orders"
          message={error instanceof Error ? error.message : 'Unable to connect to order management server.'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={64} />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<FileText size={36} />}
          title="No orders found"
          description={
            statusParam || fromParam || toParam
              ? 'No orders match your selected filter criteria. Try clearing date filters or switching status tabs.'
              : 'You have not placed any orders yet. Visit the catalog to create your first order.'
          }
          action={
            statusParam || fromParam || toParam ? (
              <Button variant="secondary" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className={styles.desktopTable}>
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-default)' }}>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                      ORDER #
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                      DATE
                    </th>
                    {user?.role === 'ADMIN' && (
                      <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                        CUSTOMER
                      </th>
                    )}
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                      STATUS
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                      UNITS / LINES
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                      TOTAL
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((order) => {
                    const isCancelled = order.status === 'CANCELLED';
                    const canCancel = !isCancelled && !isViewOnly;
                    const cancelReason = isViewOnly
                      ? 'VIEW-only access cannot cancel orders'
                      : isCancelled
                      ? 'Order is already cancelled'
                      : '';

                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: 'var(--font-sm)' }}>
                          {order.orderNumber}
                        </td>
                        <td style={{ padding: 'var(--space-4)', fontSize: 'var(--font-sm)' }}>
                          {formatDate(order.createdAt)}
                        </td>
                        {user?.role === 'ADMIN' && (
                          <td style={{ padding: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                            {order.user?.email ?? `User #${order.userId}`}
                          </td>
                        )}
                        <td style={{ padding: 'var(--space-4)' }}>
                          <StatusBadge status={order.status} />
                        </td>
                        <td style={{ padding: 'var(--space-4)', fontSize: 'var(--font-sm)' }}>
                          {order.itemCount} units ({order.lineCount} lines)
                        </td>
                        <td style={{ padding: 'var(--space-4)', fontWeight: 700, fontSize: 'var(--font-sm)' }}>
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<Eye size={14} />}
                              onClick={() => setSelectedOrderId(order.id)}
                            >
                              Details
                            </Button>

                            <Tooltip content={cancelReason}>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!canCancel}
                                style={canCancel ? { color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)' } : undefined}
                                onClick={() => setCancellingOrder(order)}
                              >
                                Cancel
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout */}
          <div className={styles.mobileCards}>
            {data?.data.map((order) => {
              const isCancelled = order.status === 'CANCELLED';
              const canCancel = !isCancelled && !isViewOnly;

              return (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderCardHeader}>
                    <span className={styles.orderNumber}>{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    <span>{formatDate(order.createdAt)}</span>
                    <span>{order.itemCount} units ({order.lineCount} lines)</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 'var(--font-base)', color: 'var(--text-primary)' }}>
                      {formatPrice(order.totalAmount)}
                    </span>

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        Details
                      </Button>
                      {canCancel && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setCancellingOrder(order)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {data?.meta && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              limit={data.meta.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          )}
        </>
      )}

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancellingOrder)}
        onClose={() => !cancelMutation.isPending && setCancellingOrder(null)}
        title="Confirm Order Cancellation"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={cancelMutation.isPending}
              onClick={() => setCancellingOrder(null)}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              leftIcon={<Ban size={16} />}
              loading={cancelMutation.isPending}
              onClick={() => cancellingOrder && cancelMutation.mutate(cancellingOrder.id)}
            >
              Yes, Cancel Order
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
          Are you sure you want to cancel order{' '}
          <strong style={{ fontFamily: 'var(--font-mono)' }}>#{cancellingOrder?.orderNumber}</strong>?
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
          Cancelling will immediately release all reserved items back into the warehouse inventory catalog. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default OrdersPage;

import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  Package,
  FileText,
  Eye,
  CheckCircle,
  Ban,
  X,
  Calendar,
} from 'lucide-react';
import { getOrders, confirmOrder, cancelOrder } from '../../api/orders.api';
import { orderKeys, productKeys } from '../../app/QueryClient';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs, TabItem } from '../../components/ui/Tabs';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Modal } from '../../components/ui/Modal';
import { OrderDetailDrawer } from '../orders/OrderDetailDrawer';
import { formatDate, formatPrice } from '../../lib/formatters';
import { OrderListItem, OrderStatus, NormalizedApiError } from '../../api/types';

const adminTabs: TabItem[] = [
  { id: 'products', label: 'Inventory Products', icon: <Package size={16} /> },
  { id: 'orders', label: 'Customer Orders', icon: <FileText size={16} /> },
];

const statusTabs: TabItem[] = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

export const AdminOrdersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '10', 10);
  const statusParam = (searchParams.get('status') || 'ALL') as OrderStatus | 'ALL';
  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';
  const userIdParam = searchParams.get('userId') || '';

  // Local state for filters
  const [userIdInput, setUserIdInput] = useState(userIdParam);
  const [fromDate, setFromDate] = useState(fromParam);
  const [toDate, setToDate] = useState(toParam);

  // Modal / Drawer state
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderListItem | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<OrderListItem | null>(null);

  // Construct query parameters
  const queryParams = {
    page: pageParam,
    limit: limitParam,
    status: statusParam !== 'ALL' ? statusParam : undefined,
    from: fromParam || undefined,
    to: toParam || undefined,
    userId: userIdParam ? parseInt(userIdParam, 10) : undefined,
  };

  // Fetch orders with keepPreviousData for smooth pagination
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: orderKeys.list(queryParams),
    queryFn: () => getOrders(queryParams),
    placeholderData: keepPreviousData,
  });

  // Confirm order mutation
  const confirmMutation = useMutation({
    mutationFn: (orderId: number) => confirmOrder(orderId),
    onSuccess: (confirmedOrder) => {
      success(`Order #${confirmedOrder.orderNumber} successfully confirmed!`);
      setOrderToConfirm(null);
      // Invalidate both orders and products caches
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (err: unknown) => {
      const apiErr = err as NormalizedApiError;
      toastError(apiErr.message || 'Failed to confirm order.');
    },
  });

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId),
    onSuccess: (cancelledOrder) => {
      success(`Order #${cancelledOrder.orderNumber} cancelled and stock returned.`);
      setOrderToCancel(null);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (err: unknown) => {
      const apiErr = err as NormalizedApiError;
      toastError(apiErr.message || 'Failed to cancel order.');
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newStatus === 'ALL') {
        next.delete('status');
      } else {
        next.set('status', newStatus);
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleApplyUserFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (userIdInput.trim()) {
        next.set('userId', userIdInput.trim());
      } else {
        next.delete('userId');
      }
      next.set('page', '1');
      return next;
    });
  };

  const handleApplyDateFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (fromDate) next.set('from', fromDate);
      else next.delete('from');

      if (toDate) next.set('to', toDate);
      else next.delete('to');

      next.set('page', '1');
      return next;
    });
  };

  const handleClearAllFilters = () => {
    setUserIdInput('');
    setFromDate('');
    setToDate('');
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
  };

  const handleLimitChange = (newLimit: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('limit', String(newLimit));
      next.set('page', '1');
      return next;
    });
  };

  const hasActiveFilters = Boolean(
    statusParam !== 'ALL' || fromParam || toParam || userIdParam
  );

  return (
    <div>
      {/* Admin Section Tabs */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Tabs
          tabs={adminTabs}
          activeId="orders"
          onChange={(tabId) => navigate(tabId === 'products' ? '/admin/products' : '/admin/orders')}
          variant="pills"
          ariaLabel="Admin navigation"
        />
      </div>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>Orders Administration</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 2 }}>
            Manage and fulfill customer orders across all system accounts
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {/* Status Tabs */}
        <div>
          <Tabs
            tabs={statusTabs}
            activeId={statusParam}
            onChange={handleStatusChange}
            variant="underline"
            ariaLabel="Filter orders by status"
          />
        </div>

        {/* Toolbar: User ID filter + Date range */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: 'var(--space-4)',
          }}
        >
          {/* User ID Filter */}
          <div style={{ flex: '1 1 200px', maxWidth: 280 }}>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-xs)',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Filter by User ID
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Input
                type="number"
                placeholder="e.g. 1, 2, 3"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyUserFilter()}
              />
              <Button variant="secondary" onClick={handleApplyUserFilter}>
                Filter
              </Button>
            </div>
          </div>

          {/* Date range filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                From Date
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                To Date
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <Button
              variant="secondary"
              leftIcon={<Calendar size={14} />}
              onClick={handleApplyDateFilter}
            >
              Apply Dates
            </Button>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              leftIcon={<X size={14} />}
              onClick={handleClearAllFilters}
              style={{ alignSelf: 'flex-end' }}
            >
              Clear All Filters
            </Button>
          )}
        </div>
      </div>

      {/* Orders Table Content */}
      {isError ? (
        <ErrorState
          title="Failed to Load Orders"
          message={error instanceof Error ? error.message : 'Error fetching orders from server.'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rect" height={54} />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<FileText size={36} />}
          title="No orders found"
          description={
            hasActiveFilters
              ? 'No customer orders match the applied filter criteria.'
              : 'There are currently no orders in the system.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={handleClearAllFilters}>
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    ORDER NUMBER
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    CUSTOMER
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    DATE
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    STATUS
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                    ITEMS
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
                  const isPending = order.status === 'PENDING';
                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                    >
                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-xs)' }}>
                          {order.orderNumber}
                        </span>
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-sm)' }}>
                        <div>{order.user?.email || `User #${order.userId}`}</div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                          ID: {order.userId}
                        </div>
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                        {formatDate(order.createdAt)}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <StatusBadge status={order.status} />
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-sm)' }}>
                        {order.itemCount} {order.itemCount === 1 ? 'unit' : 'units'} ({order.lineCount} {order.lineCount === 1 ? 'line' : 'lines'})
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-sm)', fontWeight: 700 }}>
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Eye size={14} />}
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            Details
                          </Button>

                          {isPending && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                leftIcon={<CheckCircle size={14} />}
                                onClick={() => setOrderToConfirm(order)}
                              >
                                Confirm
                              </Button>

                              <Button
                                size="sm"
                                variant="danger"
                                leftIcon={<Ban size={14} />}
                                onClick={() => setOrderToCancel(order)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.meta && (
            <div style={{ marginTop: 'var(--space-6)' }}>
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                limit={data.meta.limit}
                total={data.meta.total}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </div>
          )}
        </>
      )}

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />

      {/* Confirm Order Confirmation Modal */}
      <Modal
        isOpen={Boolean(orderToConfirm)}
        onClose={() => setOrderToConfirm(null)}
        title="Confirm Order Fulfillment"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button
              variant="outline"
              onClick={() => setOrderToConfirm(null)}
              disabled={confirmMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={confirmMutation.isPending}
              onClick={() => orderToConfirm && confirmMutation.mutate(orderToConfirm.id)}
            >
              Confirm Fulfillment
            </Button>
          </div>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
          Are you sure you want to transition order{' '}
          <strong style={{ color: 'var(--text-primary)' }}>#{orderToConfirm?.orderNumber}</strong> to{' '}
          <strong style={{ color: 'var(--success)' }}>CONFIRMED</strong> status?
        </p>

        {orderToConfirm && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div><strong>Customer:</strong> {orderToConfirm.user?.email || `User #${orderToConfirm.userId}`}</div>
            <div><strong>Total Value:</strong> {formatPrice(orderToConfirm.totalAmount)}</div>
            <div><strong>Total Units:</strong> {orderToConfirm.itemCount}</div>
          </div>
        )}
      </Modal>

      {/* Cancel Order Confirmation Modal */}
      <Modal
        isOpen={Boolean(orderToCancel)}
        onClose={() => setOrderToCancel(null)}
        title="Cancel Order"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button
              variant="outline"
              onClick={() => setOrderToCancel(null)}
              disabled={cancelMutation.isPending}
            >
              Back
            </Button>
            <Button
              variant="danger"
              loading={cancelMutation.isPending}
              onClick={() => orderToCancel && cancelMutation.mutate(orderToCancel.id)}
            >
              Confirm Cancellation
            </Button>
          </div>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
          Are you sure you want to cancel order{' '}
          <strong style={{ color: 'var(--text-primary)' }}>#{orderToCancel?.orderNumber}</strong>?
          All items will be returned to available warehouse stock.
        </p>
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;

import React, { useState, useEffect, useCallback } from 'react';
import { getOrders, getOrderById, cancelOrder, confirmOrder } from '../../api/orders.api';
import { OrderListItem, Order, OrderStatus, PaginationMeta } from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import { Pagination } from '../../components/Pagination';
import { Modal } from '../../components/Modal';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Order to cancel modal state
  const [cancellingOrder, setCancellingOrder] = useState<OrderListItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Order to confirm modal/state (Admin only)
  const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);

  const fetchOrders = useCallback(
    async (pageToFetch = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOrders({
          page: pageToFetch,
          limit: meta.limit,
          status: statusFilter ? statusFilter : undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        });
        setOrders(response.data);
        setMeta(response.meta);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load orders';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, fromDate, toDate, meta.limit],
  );

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage);
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setFromDate('');
    setToDate('');
  };

  // Open Order Detail modal
  const handleViewDetails = async (orderId: number) => {
    setLoadingDetails(true);
    setSelectedOrder(null);
    try {
      const response = await getOrderById(orderId);
      setSelectedOrder(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load order details';
      toastError(message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Confirm Order (Admin action)
  const handleConfirmOrder = async (orderId: number) => {
    setConfirmingOrderId(orderId);
    try {
      await confirmOrder(orderId);
      success('Order confirmed successfully');
      fetchOrders(meta.page);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to confirm order';
      toastError(message);
    } finally {
      setConfirmingOrderId(null);
    }
  };

  // Cancel Order action
  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;

    setIsCancelling(true);
    try {
      await cancelOrder(cancellingOrder.id);
      success(`Order #${cancellingOrder.orderNumber} cancelled. Reserved stock restored.`);
      setCancellingOrder(null);
      fetchOrders(meta.page);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel order';
      toastError(message);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="badge badge--confirmed">Confirmed</span>;
      case 'CANCELLED':
        return <span className="badge badge--cancelled">Cancelled</span>;
      case 'PENDING':
      default:
        return <span className="badge badge--pending">Pending</span>;
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Orders Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 2 }}>
            Track order fulfillment statuses and monitor inventory allocations
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label" htmlFor="status-filter">
              Status
            </label>
            <select
              id="status-filter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
              style={{ minWidth: 150 }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="from-filter">
              From Date
            </label>
            <input
              id="from-filter"
              type="date"
              className="form-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="to-filter">
              To Date
            </label>
            <input
              id="to-filter"
              type="date"
              className="form-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {(statusFilter || fromDate || toDate) && (
            <div>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--danger" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn--sm btn--secondary"
            style={{ marginLeft: 16 }}
            onClick={() => fetchOrders(meta.page)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spinner size="lg" ariaLabel="Loading orders..." />
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon">&#128230;</div>
          <h2 className="empty-state__title">No orders found</h2>
          <p className="empty-state__desc">
            {statusFilter || fromDate || toDate
              ? 'No orders matched your selected filter criteria.'
              : 'You have not placed any orders yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  {user?.role === 'ADMIN' && <th>Customer</th>}
                  <th>Status</th>
                  <th>Items / Lines</th>
                  <th>Total Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isEligibleForCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';
                  const isEligibleForConfirm = user?.role === 'ADMIN' && order.status === 'PENDING';
                  const formattedDate = new Date(order.createdAt).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        {formattedDate}
                      </td>
                      {user?.role === 'ADMIN' && (
                        <td>
                          <span style={{ fontSize: 'var(--font-size-xs)' }}>
                            {order.user?.email || `User #${order.userId}`}
                          </span>
                        </td>
                      )}
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        {order.itemCount} units ({order.lineCount} {order.lineCount === 1 ? 'line' : 'lines'})
                      </td>
                      <td style={{ fontWeight: 600 }}>${order.totalAmount}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={() => handleViewDetails(order.id)}
                          >
                            Details
                          </button>

                          {isEligibleForConfirm && (
                            <button
                              type="button"
                              className="btn btn--primary btn--sm"
                              disabled={confirmingOrderId === order.id}
                              onClick={() => handleConfirmOrder(order.id)}
                            >
                              {confirmingOrderId === order.id ? (
                                <Spinner size="sm" ariaLabel="Confirming..." />
                              ) : (
                                'Confirm'
                              )}
                            </button>
                          )}

                          {isEligibleForCancel && (
                            <button
                              type="button"
                              className="btn btn--danger btn--sm"
                              onClick={() => setCancellingOrder(order)}
                            >
                              Cancel
                            </button>
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
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={Boolean(selectedOrder || loadingDetails)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order #${selectedOrder.orderNumber}` : 'Loading Order...'}
        footer={
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setSelectedOrder(null)}
          >
            Close
          </button>
        }
      >
        {loadingDetails ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <Spinner size="md" ariaLabel="Loading details..." />
          </div>
        ) : selectedOrder ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Status</div>
                <div style={{ marginTop: 2 }}>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Created</div>
                <div style={{ fontSize: 'var(--font-size-sm)', marginTop: 2 }}>
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="table-wrapper" style={{ marginTop: 16 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item) => {
                    const priceCents = Math.round(parseFloat(item.unitPrice) * 100);
                    const subtotal = ((priceCents * item.quantity) / 100).toFixed(2);

                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.product?.name ?? `Product #${item.productId}`}</td>
                        <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          {item.product?.sku ?? '-'}
                        </td>
                        <td>${item.unitPrice}</td>
                        <td>{item.quantity}</td>
                        <td style={{ fontWeight: 600 }}>${subtotal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 16,
                fontSize: 'var(--font-size-base)',
              }}
            >
              <span>
                Grand Total:{' '}
                <strong style={{ fontSize: 'var(--font-size-lg)', color: 'var(--primary-dark)' }}>
                  ${selectedOrder.totalAmount}
                </strong>
              </span>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={Boolean(cancellingOrder)}
        onClose={() => !isCancelling && setCancellingOrder(null)}
        title="Confirm Order Cancellation"
        footer={
          <>
            <button
              type="button"
              className="btn btn--secondary"
              disabled={isCancelling}
              onClick={() => setCancellingOrder(null)}
            >
              Keep Order
            </button>
            <button
              type="button"
              className="btn btn--danger"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
            >
              {isCancelling ? (
                <>
                  <Spinner size="sm" ariaLabel="Cancelling..." />
                  <span>Cancelling...</span>
                </>
              ) : (
                'Yes, Cancel Order'
              )}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-main)', marginBottom: 12 }}>
          Are you sure you want to cancel order{' '}
          <strong>#{cancellingOrder?.orderNumber}</strong>?
        </p>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          This will set the order status to <strong>CANCELLED</strong> and automatically restore{' '}
          <strong>{cancellingOrder?.itemCount}</strong> reserved inventory units back to warehouse stock.
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

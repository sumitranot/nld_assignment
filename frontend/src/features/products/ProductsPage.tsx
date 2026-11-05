import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  LayoutGrid,
  List,
  Search,
  ShoppingCart,
  X,
  ShieldAlert,
} from 'lucide-react';
import { getProducts } from '../../api/products.api';
import { productKeys } from '../../app/QueryClient';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { SkuGradient } from '../../components/ui/SkuGradient';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriceTag } from '../../components/ui/PriceTag';
import { QuantityStepper } from '../../components/ui/QuantityStepper';
import { Button } from '../../components/ui/Button';
import { Tooltip } from '../../components/ui/Tooltip';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Product } from '../../api/types';
import styles from './ProductsPage.module.css';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, items: cartItems, reconcileWithStock } = useCart();
  const { success, warning } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '12', 10);
  const queryParam = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(queryParam);
  const debouncedSearch = useDebounce(searchInput, 300);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Sync debounced search with URL parameters
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch.trim()) {
          next.set('q', debouncedSearch.trim());
        } else {
          next.delete('q');
        }
        next.set('page', '1');
        return next;
      },
      { replace: true },
    );
  }, [debouncedSearch, setSearchParams]);

  // TanStack Query with keepPreviousData for smooth pagination
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: productKeys.list({ page: pageParam, limit: limitParam, search: debouncedSearch }),
    queryFn: () =>
      getProducts({
        page: pageParam,
        limit: limitParam,
        search: debouncedSearch,
      }),
    placeholderData: keepPreviousData,
  });

  // Reconcile cart items with fresh stock levels on data load
  useEffect(() => {
    if (data?.data) {
      reconcileWithStock(data.data);
    }
  }, [data, reconcileWithStock]);

  const isViewOnly = user?.role === 'USER' && user?.access === 'VIEW';

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

  const getQuantityForProduct = (productId: number): number => {
    return quantities[productId] || 1;
  };

  const setQuantityForProduct = (productId: number, qty: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: qty }));
  };

  const getInCartQuantity = (productId: number): number => {
    const item = cartItems.find((i) => i.productId === productId);
    return item ? item.qty : 0;
  };

  const handleAddToCart = (product: Product) => {
    if (isViewOnly) {
      warning('Your account has VIEW-only access. You cannot place orders.');
      return;
    }

    const qtyToAdd = getQuantityForProduct(product.id);
    const result = addToCart(product, qtyToAdd);

    if (result.success) {
      success(`Added ${qtyToAdd} × "${product.name}" to cart`);
      setQuantityForProduct(product.id, 1);
    } else if (result.message) {
      warning(result.message);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Products Catalog</h1>
            <p className={styles.subtitle}>
              Warehouse inventory with live stock allocation and instant fulfillment
            </p>
          </div>
        </div>

        {/* View-Only Alert Banner */}
        {isViewOnly && (
          <div
            role="status"
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-info-light)',
              color: 'var(--color-info-text)',
              border: '1px solid var(--color-info-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <ShieldAlert size={18} />
            <span>
              <strong>VIEW-only account:</strong> You can explore warehouse stock, but ordering is disabled.
            </span>
          </div>
        )}

        {/* Search & Layout Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Input
              type="search"
              placeholder="Search by product name or SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search size={16} />}
              rightIcon={
                searchInput ? (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                ) : null
              }
              aria-label="Search catalog"
            />
          </div>

          <div className={styles.controls}>
            {/* View Mode Toggle */}
            <div className={styles.viewToggle} role="group" aria-label="Catalog view mode">
              <button
                type="button"
                className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.toggleBtnActive : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.toggleBtnActive : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isError ? (
        <ErrorState
          title="Failed to Load Products"
          message={error instanceof Error ? error.message : 'Unable to connect to inventory server.'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        /* Skeletons while loading (preserves layout) */
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <Skeleton variant="card" height={180} />
              <div className={styles.cardBody}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="title" width="85%" />
                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="rect" height={36} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState
          icon={<Search size={32} />}
          title="No products found"
          description={
            debouncedSearch
              ? `No catalog items matched "${debouncedSearch}". Try checking your spelling or using different keywords.`
              : 'There are currently no products available in the inventory catalog.'
          }
          action={
            debouncedSearch ? (
              <Button variant="secondary" onClick={() => setSearchInput('')}>
                Clear Search Query
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          {/* Products Grid or List View */}
          <div className={viewMode === 'grid' ? styles.grid : styles.list}>
            {data?.data.map((product) => {
              const inCartQty = getInCartQuantity(product.id);
              const isOutOfStock = product.stockQty <= 0;
              const remainingStock = Math.max(0, product.stockQty - inCartQty);
              const isMaxInCart = inCartQty >= product.stockQty;
              const selectedQty = getQuantityForProduct(product.id);

              const stockStatusType = isOutOfStock
                ? 'OUT_OF_STOCK'
                : product.stockQty <= 5
                ? 'LOW_STOCK'
                : 'IN_STOCK';

              const addDisabled = isOutOfStock || isViewOnly || isMaxInCart;

              const disabledReason = isViewOnly
                ? 'Your account has VIEW-only access. You cannot place orders.'
                : isOutOfStock
                ? 'Product is currently out of stock.'
                : isMaxInCart
                ? `All available stock (${product.stockQty}) is already in your cart.`
                : '';

              return (
                <div
                  key={product.id}
                  className={`${styles.card} ${viewMode === 'list' ? styles.listItem : ''}`}
                >
                  {/* Deterministic Gradient SKU Placeholder */}
                  <SkuGradient
                    sku={product.sku}
                    name={product.name}
                    size={viewMode === 'list' ? 'md' : 'card'}
                  />

                  {/* Product Details */}
                  <div className={styles.cardBody}>
                    <div className={styles.cardHeader}>
                      <span className={styles.productSku}>{product.sku}</span>
                      <StatusBadge status={stockStatusType} count={product.stockQty} />
                    </div>

                    <h2 className={styles.productName} title={product.name}>
                      {product.name}
                    </h2>

                    <div className={styles.cardFooter}>
                      <div className={styles.priceStockRow}>
                        <PriceTag price={product.price} size="lg" unit="/ unit" />
                        {inCartQty > 0 && (
                          <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                            {inCartQty} in cart
                          </span>
                        )}
                      </div>

                      {/* Stepper & Add to Cart Controls */}
                      <div className={styles.actionRow}>
                        {!isOutOfStock && !isViewOnly && !isMaxInCart && (
                          <QuantityStepper
                            value={selectedQty}
                            min={1}
                            max={remainingStock}
                            onChange={(val) => setQuantityForProduct(product.id, val)}
                            disabled={addDisabled}
                          />
                        )}

                        <Tooltip content={disabledReason}>
                          <Button
                            variant="primary"
                            fullWidth
                            leftIcon={<ShoppingCart size={16} />}
                            disabled={addDisabled}
                            onClick={() => handleAddToCart(product)}
                          >
                            {isOutOfStock
                              ? 'Out of Stock'
                              : isMaxInCart
                              ? 'Max in Cart'
                              : inCartQty > 0
                              ? `Add +${selectedQty}`
                              : 'Add to Cart'}
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
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
    </div>
  );
};

export default ProductsPage;

import React, { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../../api/products.api';
import { Product, PaginationMeta } from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { Spinner } from '../../components/Spinner';
import { Pagination } from '../../components/Pagination';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, items: cartItems } = useCart();
  const { success, warning } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (pageToFetch = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProducts({
          page: pageToFetch,
          limit: meta.limit,
          search: debouncedSearch,
        });
        setProducts(response.data);
        setMeta(response.meta);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load products';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, meta.limit],
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handlePageChange = (newPage: number) => {
    fetchProducts(newPage);
  };

  const isViewOnly = user?.role === 'USER' && user?.access === 'VIEW';

  const handleAddToCart = (product: Product) => {
    if (isViewOnly) {
      warning('Your account has VIEW-only access. You cannot place orders.');
      return;
    }

    const result = addToCart(product, 1);
    if (result.success) {
      success(`Added "${product.name}" to cart`);
    } else if (result.message) {
      warning(result.message);
    }
  };

  const getCartQtyForProduct = (productId: number): number => {
    const item = cartItems.find((i) => i.productId === productId);
    return item ? item.qty : 0;
  };

  return (
    <div>
      {/* Page Title & Search Toolbar */}
      <div className="toolbar">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Products Catalog</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 2 }}>
            Explore logistics inventory with real-time stock availability
          </p>
        </div>

        <div className="toolbar__left">
          <input
            type="search"
            className="form-input toolbar__search"
            placeholder="Search by name or SKU..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search products"
          />
        </div>
      </div>

      {/* VIEW-only notice banner */}
      {isViewOnly && (
        <div className="alert alert--info" role="status">
          <strong>Notice:</strong> You are logged in with <strong>VIEW</strong>-only access. You can
          explore products and track orders, but ordering is disabled.
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="alert alert--danger" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn--sm btn--secondary"
            style={{ marginLeft: 16 }}
            onClick={() => fetchProducts(meta.page)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spinner size="lg" ariaLabel="Loading products..." />
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon">&#128269;</div>
          <h2 className="empty-state__title">No products found</h2>
          <p className="empty-state__desc">
            {searchInput
              ? `No products matched "${searchInput}". Try adjusting your search query.`
              : 'There are currently no products available in the catalog.'}
          </p>
          {searchInput && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setSearchInput('')}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="product-grid">
            {products.map((product) => {
              const inCartQty = getCartQtyForProduct(product.id);
              const isOutOfStock = product.stockQty <= 0;
              const isMaxInCart = inCartQty >= product.stockQty;

              let stockClass = 'stock--in';
              let stockLabel = `${product.stockQty} in stock`;
              if (isOutOfStock) {
                stockClass = 'stock--out';
                stockLabel = 'Out of stock';
              } else if (product.stockQty <= 5) {
                stockClass = 'stock--low';
                stockLabel = `Only ${product.stockQty} left`;
              }

              return (
                <div key={product.id} className="product-card">
                  <div className="product-card__header">
                    <span className="product-card__sku">{product.sku}</span>
                    <h3 className="product-card__title">{product.name}</h3>
                  </div>

                  <div>
                    <div className="product-card__meta">
                      <span className="product-card__price">${product.price}</span>
                      <span className={`product-card__stock ${stockClass}`}>&bull; {stockLabel}</span>
                    </div>

                    <button
                      type="button"
                      className="btn btn--primary"
                      style={{ width: '100%' }}
                      disabled={isOutOfStock || isViewOnly || isMaxInCart}
                      onClick={() => handleAddToCart(product)}
                      title={
                        isViewOnly
                          ? 'VIEW-only access cannot add to cart'
                          : isOutOfStock
                          ? 'Product is out of stock'
                          : isMaxInCart
                          ? 'Maximum available quantity already in cart'
                          : 'Add to Cart'
                      }
                    >
                      {isOutOfStock
                        ? 'Out of Stock'
                        : isMaxInCart
                        ? `In Cart (${inCartQty})`
                        : inCartQty > 0
                        ? `Add Another (${inCartQty} in cart)`
                        : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
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
    </div>
  );
};

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getProducts } from '../../api/products.api';
import { Product, PaginationMeta } from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { Spinner } from '../../components/Spinner';
import { Pagination } from '../../components/Pagination';
import { getProductMetadata } from '../../utils/productImages';

const CATEGORIES = [
  'All Items',
  'Boxes & Cartons',
  'Tape & Adhesives',
  'Protective Wrap',
  'Void Fill & Cushioning',
  'Pallets & Material Handling',
  'Warehouse Equipment',
  'Shipping Labels',
  'Tools & Cutters',
  'Safety & Facility',
];

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
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'stock-desc'>('default');
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

  // Filter by category client-side if a specific category chip is chosen
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All Items') {
      return products;
    }
    return products.filter((product) => {
      const info = getProductMetadata(product.sku, product.name, product.imageUrl);
      return info.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(info.category.toLowerCase());
    });
  }, [products, selectedCategory]);

  // Sort products
  const displayedProducts = useMemo(() => {
    const items = [...filteredProducts];
    if (sortBy === 'price-asc') {
      items.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-desc') {
      items.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'stock-desc') {
      items.sort((a, b) => b.stockQty - a.stockQty);
    }
    return items;
  }, [filteredProducts, sortBy]);

  return (
    <div>
      {/* eCommerce Hero Showcase */}
      <div className="ecommerce-hero">
        <div>
          <h1 className="ecommerce-hero__title">Logistics & Packaging Supplies</h1>
          <p className="ecommerce-hero__desc">
            Commercial-grade shipping cartons, protective cushioning, heavy-duty pallets, and warehouse handling gear. 
            Direct fulfillment with real-time stock allocation.
          </p>
        </div>
        <div className="ecommerce-hero__stats">
          <div className="ecommerce-hero__stat-box">
            <div className="ecommerce-hero__stat-num">30+</div>
            <div className="ecommerce-hero__stat-lbl">Active SKUs</div>
          </div>
          <div className="ecommerce-hero__stat-box">
            <div className="ecommerce-hero__stat-num">100%</div>
            <div className="ecommerce-hero__stat-lbl">Warehouse Sync</div>
          </div>
        </div>
      </div>

      {/* Page Title & Search Toolbar */}
      <div className="toolbar" style={{ alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-main)' }}>
            Products Catalog
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 2 }}>
            Showing {meta.total} inventory items across logistics categories
          </p>
        </div>

        <div className="toolbar__left" style={{ gap: 'var(--space-3)' }}>
          {/* Search Box with Search Icon */}
          <div className="search-input-wrapper">
            <span className="search-input-wrapper__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              className="form-input toolbar__search"
              placeholder="Search by name or SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search products"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            className="form-input"
            style={{ width: 'auto', minWidth: 160 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sort products"
          >
            <option value="default">Sort: Default Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-desc">Stock: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills Filter Strip */}
      <div className="category-strip" role="tablist" aria-label="Filter by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-pill ${selectedCategory === cat ? 'category-pill--active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
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
      ) : displayedProducts.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon">&#128269;</div>
          <h2 className="empty-state__title">No products found</h2>
          <p className="empty-state__desc">
            {searchInput
              ? `No products matched "${searchInput}". Try adjusting your search query.`
              : selectedCategory !== 'All Items'
              ? `No products found on this page in the "${selectedCategory}" category.`
              : 'There are currently no products available in the catalog.'}
          </p>
          {(searchInput || selectedCategory !== 'All Items') && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setSearchInput('');
                setSelectedCategory('All Items');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="product-grid">
            {displayedProducts.map((product) => {
              const metaInfo = getProductMetadata(product.sku, product.name, product.imageUrl);
              const inCartQty = getCartQtyForProduct(product.id);
              const isOutOfStock = product.stockQty <= 0;
              const isMaxInCart = inCartQty >= product.stockQty;

              let stockClass = 'stock--in';
              let stockLabel = `${product.stockQty} in stock`;
              let indicatorType: 'in' | 'low' | 'out' = 'in';

              if (isOutOfStock) {
                stockClass = 'stock--out';
                stockLabel = 'Out of stock';
                indicatorType = 'out';
              } else if (product.stockQty <= 5) {
                stockClass = 'stock--low';
                stockLabel = `Only ${product.stockQty} left`;
                indicatorType = 'low';
              }

              return (
                <div key={product.id} className="product-card">
                  {/* Product Photography Container */}
                  <div className="product-card__image-container">
                    <img
                      src={metaInfo.image}
                      alt={product.name}
                      className="product-card__image"
                      loading="lazy"
                    />

                    {/* Badge Overlay */}
                    {isOutOfStock ? (
                      <span className="product-card__badge-overlay product-card__badge-overlay--out">
                        Out of Stock
                      </span>
                    ) : metaInfo.badge ? (
                      <span className={`product-card__badge-overlay ${
                        metaInfo.badge.toLowerCase().includes('seller')
                          ? 'product-card__badge-overlay--bestseller'
                          : 'product-card__badge-overlay--popular'
                      }`}>
                        {metaInfo.badge}
                      </span>
                    ) : null}
                  </div>

                  {/* Product Information Body */}
                  <div className="product-card__body">
                    <div className="product-card__category">{metaInfo.category}</div>
                    <div className="product-card__sku">SKU: {product.sku}</div>

                    <h3 className="product-card__title" title={product.name}>
                      {product.name}
                    </h3>

                    {/* Rating Stars & Count */}
                    <div className="product-card__rating">
                      <span className="product-card__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                      <span style={{ fontWeight: 600 }}>{metaInfo.rating}</span>
                      <span className="product-card__reviews">({metaInfo.reviewsCount} reviews)</span>
                    </div>

                    {/* Footer with Price, Stock and Action Button */}
                    <div className="product-card__footer">
                      <div className="product-card__meta">
                        <div>
                          <span className="product-card__price">${product.price}</span>
                          <span className="product-card__price-sub">/ unit</span>
                        </div>
                        <span className={`product-card__stock ${stockClass}`}>
                          <span className={`stock-indicator stock-indicator--${indicatorType}`} />
                          {stockLabel}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn--primary"
                        style={{ width: '100%', gap: 8 }}
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        <span>
                          {isOutOfStock
                            ? 'Out of Stock'
                            : isMaxInCart
                            ? `In Cart (${inCartQty})`
                            : inCartQty > 0
                            ? `Add Another (${inCartQty} in cart)`
                            : 'Add to Cart'}
                        </span>
                      </button>
                    </div>
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

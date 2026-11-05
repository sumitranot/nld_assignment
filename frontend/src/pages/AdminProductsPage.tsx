import React, { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, CreateProductInput } from '../api/products.api';
import { Product, PaginationMeta } from '../api/types';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { Spinner } from '../components/Spinner';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { getProductMetadata } from '../utils/productImages';

interface ProductFormData {
  name: string;
  sku: string;
  stockQty: number;
  price: string;
}

const initialFormData: ProductFormData = {
  name: '',
  sku: '',
  stockQty: 0,
  price: '',
};

export const AdminProductsPage: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      stockQty: product.stockQty,
      price: product.price,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData(initialFormData);
      setFormErrors({});
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      errors.sku = 'SKU is required';
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.sku.trim())) {
      errors.sku = 'SKU must contain only letters, numbers, hyphens, and underscores';
    }

    if (formData.stockQty < 0 || !Number.isInteger(Number(formData.stockQty))) {
      errors.stockQty = 'Stock quantity must be a non-negative integer';
    }

    if (!formData.price.trim()) {
      errors.price = 'Price is required';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price.trim()) || parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be a positive number with up to 2 decimal places (e.g. 19.99)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload: CreateProductInput = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        stockQty: Number(formData.stockQty),
        price: parseFloat(formData.price).toFixed(2),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        success(`Product "${payload.name}" updated successfully`);
      } else {
        await createProduct(payload);
        success(`Product "${payload.name}" created successfully`);
      }

      handleCloseModal();
      fetchProducts(meta.page);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          status?: number;
          data?: {
            error?: {
              message?: string;
              code?: string;
            };
          };
        };
        message?: string;
      };

      const respError = axiosError.response?.data?.error;
      const message = respError?.message || axiosError.message || 'Operation failed';

      if (respError?.code === 'CONFLICT' || axiosError.response?.status === 409) {
        setFormErrors({ sku: 'This SKU is already in use by another product' });
      } else {
        toastError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
            Inventory Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 2 }}>
            Manage warehouse SKUs, update real-time stock levels, and adjust product pricing
          </p>
        </div>

        <button type="button" className="btn btn--primary" onClick={handleOpenCreateModal}>
          + Add New Product
        </button>
      </div>

      {/* Search Toolbar */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <input
          type="search"
          className="form-input toolbar__search"
          placeholder="Filter inventory by name or SKU..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Filter inventory"
        />
      </div>

      {/* Error Alert */}
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

      {/* Table / Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spinner size="lg" ariaLabel="Loading inventory..." />
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state__icon">&#128230;</div>
          <h2 className="empty-state__title">No inventory products found</h2>
          <p className="empty-state__desc">
            {searchInput
              ? `No products matched "${searchInput}".`
              : 'Add your first product to begin tracking warehouse stock.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Stock Qty</th>
                  <th>Price (USD)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  let stockStatus = 'In Stock';
                  let stockBadgeClass = 'badge--confirmed';
                  if (p.stockQty <= 0) {
                    stockStatus = 'Out of Stock';
                    stockBadgeClass = 'badge--cancelled';
                  } else if (p.stockQty <= 5) {
                    stockStatus = 'Low Stock';
                    stockBadgeClass = 'badge--pending';
                  }

                  return (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        #{p.id}
                      </td>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{p.sku}</td>
                      <td>
                        {(() => {
                          const meta = getProductMetadata(p.sku, p.name);
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img
                                src={meta.image}
                                alt={p.name}
                                className="product-thumb product-thumb--sm"
                                loading="lazy"
                              />
                              <div>
                                <div style={{ fontWeight: 600 }}>{p.name}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                  {meta.category}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, marginRight: 8 }}>{p.stockQty}</span>
                        <span className={`badge ${stockBadgeClass}`}>{stockStatus}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>${p.price}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          onClick={() => handleOpenEditModal(p)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? `Edit Product: ${editingProduct.sku}` : 'Add New Product'}
        footer={
          <>
            <button
              type="button"
              className="btn btn--secondary"
              disabled={isSubmitting}
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" ariaLabel="Saving product..." />
                  <span>Saving...</span>
                </>
              ) : editingProduct ? (
                'Save Changes'
              ) : (
                'Create Product'
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="prod-name">
              Product Name *
            </label>
            <input
              id="prod-name"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ergonomic Standing Desk"
              disabled={isSubmitting}
            />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-sku">
              SKU (Stock Keeping Unit) *
            </label>
            <input
              id="prod-sku"
              type="text"
              className="form-input"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              placeholder="e.g. DESK-ERGO-01"
              disabled={isSubmitting}
            />
            {formErrors.sku && <div className="form-error">{formErrors.sku}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-stock">
              Available Stock Quantity *
            </label>
            <input
              id="prod-stock"
              type="number"
              min="0"
              step="1"
              className="form-input"
              value={formData.stockQty}
              onChange={(e) => setFormData({ ...formData, stockQty: parseInt(e.target.value, 10) || 0 })}
              disabled={isSubmitting}
            />
            {formErrors.stockQty && <div className="form-error">{formErrors.stockQty}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prod-price">
              Price (USD) *
            </label>
            <input
              id="prod-price"
              type="text"
              className="form-input"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. 299.99"
              disabled={isSubmitting}
            />
            {formErrors.price && <div className="form-error">{formErrors.price}</div>}
          </div>
        </form>
      </Modal>
    </div>
  );
};

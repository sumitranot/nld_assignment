import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Package, X, FileText } from 'lucide-react';
import { getProducts, createProduct, updateProduct, CreateProductInput } from '../../api/products.api';
import { productKeys } from '../../app/QueryClient';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { SkuGradient } from '../../components/ui/SkuGradient';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FormField } from '../../components/ui/FormField';
import { Modal } from '../../components/ui/Modal';
import { Tabs, TabItem } from '../../components/ui/Tabs';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatPrice } from '../../lib/formatters';
import { Product, NormalizedApiError } from '../../api/types';

const adminTabs: TabItem[] = [
  { id: 'products', label: 'Inventory Products', icon: <Package size={16} /> },
  { id: 'orders', label: 'Customer Orders', icon: <FileText size={16} /> },
];

const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').trim(),
  sku: z
    .string()
    .min(1, 'SKU is required')
    .regex(/^[A-Za-z0-9_-]+$/, 'SKU can only contain letters, numbers, hyphens, and underscores')
    .trim(),
  stockQty: z.coerce
    .number({ invalid_type_error: 'Stock quantity must be a number' })
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
  price: z
    .string()
    .min(1, 'Price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid dollar amount (e.g. 19.99)')
    .refine((val) => parseFloat(val) > 0, 'Price must be greater than zero'),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export const AdminProductsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '10', 10);
  const queryParam = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(queryParam);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isValid },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    mode: 'onChange',
  });

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

  const saveMutation = useMutation({
    mutationFn: async (formData: ProductFormData) => {
      const payload: CreateProductInput = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        stockQty: Number(formData.stockQty),
        price: parseFloat(formData.price).toFixed(2),
      };

      if (editingProduct) {
        return await updateProduct(editingProduct.id, payload);
      } else {
        return await createProduct(payload);
      }
    },
    onSuccess: (savedProduct) => {
      success(
        editingProduct
          ? `Product "${savedProduct.name}" updated successfully`
          : `Product "${savedProduct.name}" created successfully`,
      );
      setIsModalOpen(false);
      setEditingProduct(null);
      reset();
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
    onError: (err: unknown) => {
      const apiErr = err as NormalizedApiError;
      if (apiErr.code === 'CONFLICT' || apiErr.status === 409) {
        setFormError('sku', { message: 'This SKU is already in use by another product.' });
      } else {
        toastError(apiErr.message || 'Failed to save product');
      }
    },
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    reset({
      name: '',
      sku: '',
      stockQty: 0,
      price: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku,
      stockQty: product.stockQty,
      price: product.price,
    });
    setIsModalOpen(true);
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

  return (
    <div>
      {/* Admin Section Tabs */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Tabs
          tabs={adminTabs}
          activeId="products"
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
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>Inventory Administration</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 2 }}>
            Manage warehouse SKUs, update stock quantities, and adjust unit pricing
          </p>
        </div>

        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={handleOpenCreate}>
          Add New Product
        </Button>
      </div>

      {/* Search Toolbar */}
      <div style={{ maxWidth: 420, marginBottom: 'var(--space-6)' }}>
        <Input
          type="search"
          placeholder="Filter inventory by name or SKU..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          leftIcon={<Search size={16} />}
          rightIcon={
            searchInput ? (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            ) : null
          }
        />
      </div>

      {/* Main Table / State */}
      {isError ? (
        <ErrorState
          title="Failed to Load Inventory"
          message={error instanceof Error ? error.message : 'Error fetching inventory.'}
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
          icon={<Package size={36} />}
          title="No products found"
          description={
            debouncedSearch
              ? `No items matched "${debouncedSearch}".`
              : 'Add your first product to begin tracking warehouse inventory stock.'
          }
          action={
            debouncedSearch ? (
              <Button variant="secondary" onClick={() => setSearchInput('')}>
                Clear Filter
              </Button>
            ) : (
              <Button variant="primary" onClick={handleOpenCreate}>
                Add Product
              </Button>
            )
          }
        />
      ) : (
        <>
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>ID</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>PRODUCT</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>SKU</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>STOCK QTY</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>PRICE</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((product) => {
                  const stockStatusType =
                    product.stockQty <= 0
                      ? 'OUT_OF_STOCK'
                      : product.stockQty <= 5
                      ? 'LOW_STOCK'
                      : 'IN_STOCK';

                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                        #{product.id}
                      </td>

                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <SkuGradient sku={product.sku} name={product.name} size="sm" />
                          <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                            {product.name}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)', fontWeight: 600 }}>
                        {product.sku}
                      </td>

                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <span style={{ fontWeight: 700 }}>{product.stockQty}</span>
                          <StatusBadge status={stockStatusType} />
                        </div>
                      </td>

                      <td style={{ padding: 'var(--space-4)', fontWeight: 700, fontSize: 'var(--font-sm)' }}>
                        {formatPrice(product.price)}
                      </td>

                      <td style={{ padding: 'var(--space-4)', textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Edit2 size={14} />}
                          onClick={() => handleOpenEdit(product)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !saveMutation.isPending && setIsModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.sku}` : 'Add New Product'}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={saveMutation.isPending}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={saveMutation.isPending}
              disabled={!isValid || saveMutation.isPending}
              onClick={handleSubmit((data) => saveMutation.mutate(data))}
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} noValidate>
          <FormField
            label="Product Name"
            htmlFor="p-name"
            error={errors.name?.message}
            required
          >
            <Input
              id="p-name"
              placeholder="e.g. Extra Large Double-Wall Master Carton"
              error={Boolean(errors.name)}
              {...register('name')}
            />
          </FormField>

          <FormField
            label="SKU (Stock Keeping Unit)"
            htmlFor="p-sku"
            error={errors.sku?.message}
            helpText="Unique catalog identifier (uppercase, letters, numbers, hyphens)"
            required
          >
            <Input
              id="p-sku"
              placeholder="e.g. SKU-BOX-XL-099"
              error={Boolean(errors.sku)}
              {...register('sku')}
            />
          </FormField>

          <FormField
            label="Stock Quantity"
            htmlFor="p-stock"
            error={errors.stockQty?.message}
            required
          >
            <Input
              id="p-stock"
              type="number"
              min={0}
              placeholder="0"
              error={Boolean(errors.stockQty)}
              {...register('stockQty')}
            />
          </FormField>

          <FormField
            label="Price (USD)"
            htmlFor="p-price"
            error={errors.price?.message}
            required
          >
            <Input
              id="p-price"
              placeholder="e.g. 29.99"
              error={Boolean(errors.price)}
              {...register('price')}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;

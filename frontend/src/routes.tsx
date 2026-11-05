import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Spinner } from './components/ui/Spinner';

// Lazy-loaded route components for maximum code splitting & Lighthouse performance
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const ProductsPage = lazy(() => import('./features/products/ProductsPage'));
const CartPage = lazy(() => import('./features/cart/CartPage'));
const OrdersPage = lazy(() => import('./features/orders/OrdersPage'));
const AdminProductsPage = lazy(() => import('./features/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./features/admin/AdminOrdersPage'));
const ForbiddenPage = lazy(() => import('./pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const pageFallback = (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      width: '100%',
    }}
  >
    <Spinner size="lg" ariaLabel="Loading view..." />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={pageFallback}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={pageFallback}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/products" replace />,
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={pageFallback}>
            <ProductsPage />
          </Suspense>
        ),
      },
      {
        path: 'cart',
        element: (
          <Suspense fallback={pageFallback}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={pageFallback}>
            <OrdersPage />
          </Suspense>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <ProtectedRoute adminOnly>
            <Suspense fallback={pageFallback}>
              <AdminProductsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/orders',
        element: (
          <ProtectedRoute adminOnly>
            <Suspense fallback={pageFallback}>
              <AdminOrdersPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: <Navigate to="/admin/products" replace />,
      },
    ],
  },
  {
    path: '/403',
    element: (
      <Suspense fallback={pageFallback}>
        <ForbiddenPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={pageFallback}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

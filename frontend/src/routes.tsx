import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ProductsPage } from './features/products/ProductsPage';
import { CartPage } from './features/cart/CartPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { AdminProductsPage } from './pages/AdminProductsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
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
        element: <ProductsPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'admin/products',
        element: (
          <ProtectedRoute adminOnly>
            <AdminProductsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <div className="container" style={{ padding: 'var(--space-8) 0', textAlign: 'center' }}>
        <h2>404 — Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: 'var(--space-4) 0' }}>
          The page you requested does not exist.
        </p>
        <a href="/products" className="btn btn--primary">
          Back to Products
        </a>
      </div>
    ),
  },
]);


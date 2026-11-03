import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Authenticating session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="container" style={{ padding: 'var(--space-8) 0' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div className="badge badge--cancelled" style={{ marginBottom: 'var(--space-3)' }}>
            Access Restricted
          </div>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>Administrator Access Required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
            This section is restricted to accounts with the ADMIN role.
          </p>
          <a href="/products" className="btn btn--primary">
            Return to Products Catalog
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};


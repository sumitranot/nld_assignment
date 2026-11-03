import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

interface LayoutProps {
  cartItemCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({ cartItemCount = 0 }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar cartItemCount={cartItemCount} />
      <main style={{ flex: 1, padding: 'var(--space-6) 0' }}>
        <Outlet />
      </main>
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', padding: 'var(--space-4) 0', textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
        <div className="container">
          NLD Logistics Order Management Service • Enterprise Concurrency & RBAC Architecture
        </div>
      </footer>
    </div>
  );
};


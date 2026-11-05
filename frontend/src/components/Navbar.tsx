import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  cartItemCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ cartItemCount: propCount }) => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const cartItemCount = propCount !== undefined ? propCount : itemCount;
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/products" className="navbar__brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 8h-3V4H7v4H4c-1.1 0-2 .9-2 2v10h20V10c0-1.1-.9-2-2-2zM9 6h6v2H9V6zm11 12H4v-6h16v6z" />
          </svg>
          <span>NLD Logistics</span>
        </NavLink>

        <nav className="navbar__nav">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5, verticalAlign: 'text-bottom' }}>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Products
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5, verticalAlign: 'text-bottom' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Orders
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 5, verticalAlign: 'text-bottom' }}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Cart
            {cartItemCount > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  padding: '1px 7px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {cartItemCount}
              </span>
            )}
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
            >
              Admin Products
            </NavLink>
          )}

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginLeft: 'var(--space-2)' }}>
              <div className="navbar__user-badge">
                <span>{user.email}</span>
                <span className={`badge ${isAdmin ? 'badge--admin' : 'badge--user'}`}>
                  {isAdmin ? 'ADMIN' : `USER (${user.access ?? 'VIEW'})`}
                </span>
              </div>

              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={handleLogout}
                title="Sign out of system"
              >
                Sign Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

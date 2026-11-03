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
            Products
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            Orders
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
          >
            Cart {cartItemCount > 0 && <span className="badge badge--user" style={{ marginLeft: 4 }}>{cartItemCount}</span>}
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

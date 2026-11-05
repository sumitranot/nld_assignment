import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Sun,
  Moon,
  Menu,
  LogOut,
  User as UserIcon,
  ShoppingBag,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../hooks/useTheme';
import { Dropdown } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';
import { IconButton } from '../ui/IconButton';
import styles from './Header.module.css';

export interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      id: 'user-info',
      label: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontWeight: 600 }}>{user?.email}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Role: {isAdmin ? 'Administrator' : `User (${user?.access ?? 'VIEW'})`}
          </span>
        </div>
      ),
      icon: <UserIcon size={16} />,
    },
    {
      id: 'divider-1',
      label: '',
      divider: true,
    },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut size={16} />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* Brand Logo & Title */}
        <NavLink to="/products" className={styles.brand} aria-label="NLD Logistics Homepage">
          <div className={styles.brandLogo}>
            <Package size={20} />
          </div>
          <span>NLD Logistics</span>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className={styles.nav} aria-label="Primary Navigation">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <ShoppingBag size={16} />
            <span>Shop</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <FileText size={16} />
            <span>Orders</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <ShieldAlert size={16} />
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        {/* Action Controls */}
        <div className={styles.actions}>
          {/* Theme Switcher */}
          <IconButton
            icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
            ariaLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            variant="ghost"
            onClick={toggleTheme}
          />

          {/* Cart Button triggering Cart Drawer */}
          <button
            type="button"
            className={styles.cartButton}
            onClick={openDrawer}
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <ShoppingCart size={18} />
            {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
          </button>

          {/* User Profile Dropdown */}
          {user && (
            <Dropdown
              align="right"
              trigger={
                <button type="button" className={styles.userMenuTrigger}>
                  <span>{user.email.split('@')[0]}</span>
                  <Badge variant={isAdmin ? 'brand' : user.access === 'CREATE' ? 'success' : 'neutral'}>
                    {isAdmin ? 'ADMIN' : user.access ?? 'VIEW'}
                  </Badge>
                </button>
              }
              items={userMenuItems}
            />
          )}

          {/* Mobile Navigation Hamburger Button */}
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={onOpenMobileNav}
            aria-label="Open mobile navigation"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

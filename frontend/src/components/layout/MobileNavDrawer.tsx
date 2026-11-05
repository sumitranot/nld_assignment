import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, FileText, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import styles from './Header.module.css';

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Navigation Menu"
      position="left"
      footer={
        user ? (
          <Button
            variant="danger"
            fullWidth
            leftIcon={<LogOut size={16} />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        ) : null
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {user && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Signed in as</span>
            <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{user.email}</span>
            <div style={{ marginTop: 4 }}>
              <Badge variant={isAdmin ? 'brand' : user.access === 'CREATE' ? 'success' : 'neutral'}>
                {isAdmin ? 'ADMINISTRATOR' : `USER (${user.access ?? 'VIEW'})`}
              </Badge>
            </div>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <NavLink
            to="/products"
            onClick={onClose}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <ShoppingBag size={18} />
            <span>Products Catalog</span>
          </NavLink>

          <NavLink
            to="/orders"
            onClick={onClose}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <FileText size={18} />
            <span>My Orders</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/products"
              onClick={onClose}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <ShieldAlert size={18} />
              <span>Admin Management</span>
            </NavLink>
          )}
        </nav>
      </div>
    </Drawer>
  );
};

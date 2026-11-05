import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, LogOut } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '60px var(--space-4)', display: 'flex', justifyContent: 'center' }}>
      <EmptyState
        icon={
          <div style={{ color: 'var(--color-danger)' }}>
            <ShieldAlert size={36} />
          </div>
        }
        title="403 — Access Forbidden"
        description={`Your account (${user?.email ?? 'current user'}) does not possess the required administrator privileges to view this management section.`}
        action={
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button
              variant="primary"
              leftIcon={<Home size={16} />}
              onClick={() => navigate('/products')}
            >
              Return to Catalog
            </Button>
            <Button
              variant="secondary"
              leftIcon={<LogOut size={16} />}
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Sign Out
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default ForbiddenPage;

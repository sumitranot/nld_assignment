import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '60px var(--space-4)', display: 'flex', justifyContent: 'center' }}>
      <EmptyState
        icon={<FileQuestion size={36} />}
        title="404 — Page Not Found"
        description="The page you requested does not exist or has been moved to another location."
        action={
          <Button variant="primary" leftIcon={<Home size={16} />} onClick={() => navigate('/products')}>
            Back to Catalog
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../api/types';

interface RoleGateProps {
  children: React.ReactNode;
  roles?: UserRole[];
  requireCreate?: boolean;
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  children,
  roles,
  requireCreate = false,
  fallback = null,
}) => {
  const { user, isAdmin, canCreate } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (roles && !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // Check create privilege requirement (Admin always bypasses)
  if (requireCreate && !isAdmin && !canCreate) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

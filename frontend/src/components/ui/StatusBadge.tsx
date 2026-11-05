import React from 'react';
import { Badge } from './Badge';
import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export type StatusBadgeType =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'IN_STOCK'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK';

export interface StatusBadgeProps {
  status: StatusBadgeType | string;
  count?: number;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, count, className }) => {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case 'PENDING':
      return (
        <Badge variant="warning" icon={<Clock size={12} />} className={className}>
          Pending
        </Badge>
      );
    case 'CONFIRMED':
      return (
        <Badge variant="success" icon={<CheckCircle2 size={12} />} className={className}>
          Confirmed
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="danger" icon={<XCircle size={12} />} className={className}>
          Cancelled
        </Badge>
      );
    case 'IN_STOCK':
      return (
        <Badge variant="success" className={className}>
          {count !== undefined ? `${count} in stock` : 'In Stock'}
        </Badge>
      );
    case 'LOW_STOCK':
      return (
        <Badge variant="warning" icon={<AlertTriangle size={12} />} className={className}>
          {count !== undefined ? `Only ${count} left` : 'Low Stock'}
        </Badge>
      );
    case 'OUT_OF_STOCK':
      return (
        <Badge variant="danger" className={className}>
          Out of Stock
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" className={className}>
          {status}
        </Badge>
      );
  }
};

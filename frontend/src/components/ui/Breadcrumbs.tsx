import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={className} style={{ marginBottom: 'var(--space-4)' }}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: 'var(--font-xs)',
          color: 'var(--text-muted)',
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{
                    color: isLast ? 'var(--text-primary)' : 'inherit',
                    fontWeight: isLast ? 600 : 'normal',
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              )}
              {!isLast && <ChevronRight size={12} aria-hidden="true" style={{ opacity: 0.6 }} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

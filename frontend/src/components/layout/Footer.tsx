import React from 'react';
import { Package } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandInfo}>
          <Package size={16} color="var(--primary)" />
          <span>NLD Logistics & Inventory Fulfillment Platform</span>
        </div>

        <div className={styles.links}>
          <span>Real-time warehouse stock synchronization</span>
          <span>&bull;</span>
          <span>Security & RBAC Protected</span>
        </div>
      </div>
    </footer>
  );
};


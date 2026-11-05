import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { MobileNavDrawer } from './MobileNavDrawer';

export const AppShell: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-page)',
      }}
    >
      <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />
      <CartDrawer />
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      <main
        style={{
          flex: 1,
          paddingTop: 'var(--space-6)',
          paddingBottom: 'var(--space-12)',
        }}
      >
        <div className="container">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};

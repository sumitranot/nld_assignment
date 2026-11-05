import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

let mockAuthState = {
  isAuthenticated: true,
  isAdmin: false,
  isLoading: false,
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

describe('ProtectedRoute', () => {
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders children when authenticated', async () => {
    mockAuthState = { isAuthenticated: true, isAdmin: false, isLoading: false };
    const root = createRoot(container!);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Access Granted</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>,
      );
    });

    expect(container!.textContent).toContain('Access Granted');
  });

  it('redirects to /login when unauthenticated', async () => {
    mockAuthState = { isAuthenticated: false, isAdmin: false, isLoading: false };
    const root = createRoot(container!);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Secret</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page Redirect</div>} />
          </Routes>
        </MemoryRouter>,
      );
    });

    expect(container!.textContent).toContain('Login Page Redirect');
    expect(container!.textContent).not.toContain('Secret');
  });

  it('redirects to /403 when user is not admin and route is adminOnly', async () => {
    mockAuthState = { isAuthenticated: true, isAdmin: false, isLoading: false };
    const root = createRoot(container!);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/products']}>
          <Routes>
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute adminOnly>
                  <div>Admin Secret</div>
                </ProtectedRoute>
              }
            />
            <Route path="/403" element={<div>Access Forbidden 403</div>} />
          </Routes>
        </MemoryRouter>,
      );
    });

    expect(container!.textContent).toContain('Access Forbidden 403');
    expect(container!.textContent).not.toContain('Admin Secret');
  });

  it('allows access to adminOnly route when user isAdmin is true', async () => {
    mockAuthState = { isAuthenticated: true, isAdmin: true, isLoading: false };
    const root = createRoot(container!);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/products']}>
          <Routes>
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute adminOnly>
                  <div>Admin Secret</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>,
      );
    });

    expect(container!.textContent).toContain('Admin Secret');
  });
});

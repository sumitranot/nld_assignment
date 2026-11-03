import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Spinner } from './Spinner';

describe('Spinner component', () => {
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container) {
      document.body.removeChild(container);
      container = null;
    }
  });

  it('renders with role="status" and default accessible label', async () => {
    const root = createRoot(container!);
    await act(async () => {
      root.render(<Spinner />);
    });

    const spinner = container!.querySelector('[role="status"]');
    expect(spinner).not.toBeNull();
    expect(spinner?.getAttribute('aria-label')).toBe('Loading...');
  });

  it('renders custom size and aria label', async () => {
    const root = createRoot(container!);
    await act(async () => {
      root.render(<Spinner size="lg" ariaLabel="Loading items..." />);
    });

    const spinner = container!.querySelector('[role="status"]');
    expect(spinner).not.toBeNull();
    expect(spinner?.getAttribute('aria-label')).toBe('Loading items...');
    expect(spinner?.className).toContain('spinner--lg');
  });
});

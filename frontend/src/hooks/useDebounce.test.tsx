import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useDebounce } from './useDebounce';

describe('useDebounce hook', () => {
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.useRealTimers();
    if (container) {
      document.body.removeChild(container);
      container = null;
    }
  });

  it('debounces rapid value updates', async () => {
    let capturedValue = '';

    const TestComponent: React.FC<{ value: string }> = ({ value }) => {
      const debounced = useDebounce(value, 300);
      capturedValue = debounced;
      return <div>{debounced}</div>;
    };

    const root = createRoot(container!);

    await act(async () => {
      root.render(<TestComponent value="hello" />);
    });

    expect(capturedValue).toBe('hello');

    // Update prop
    await act(async () => {
      root.render(<TestComponent value="hello world" />);
    });

    // Before timer advances: still old value
    expect(capturedValue).toBe('hello');

    // Advance 150ms: still old value
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(capturedValue).toBe('hello');

    // Advance remaining 150ms: now updated!
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(capturedValue).toBe('hello world');
  });
});


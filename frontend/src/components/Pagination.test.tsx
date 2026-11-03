import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Pagination } from './Pagination';

describe('Pagination component', () => {
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

  it('renders pagination details and buttons accurately', async () => {
    const onPageChange = vi.fn();
    const root = createRoot(container!);

    await act(async () => {
      root.render(
        <Pagination page={2} totalPages={5} total={48} onPageChange={onPageChange} />,
      );
    });

    const info = container!.querySelector('.pagination__info');
    expect(info?.textContent).toContain('Showing page 2 of 5 (48 total items)');

    const buttons = Array.from(container!.querySelectorAll('button'));
    const prevBtn = buttons.find((b) => b.textContent?.includes('Prev'));
    const nextBtn = buttons.find((b) => b.textContent?.includes('Next'));

    expect(prevBtn?.disabled).toBe(false);
    expect(nextBtn?.disabled).toBe(false);

    // Click next button
    await act(async () => {
      nextBtn?.click();
    });
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables Prev button on first page and Next on last page', async () => {
    const onPageChange = vi.fn();
    const root = createRoot(container!);

    await act(async () => {
      root.render(
        <Pagination page={1} totalPages={1} total={10} onPageChange={onPageChange} />,
      );
    });

    const buttons = Array.from(container!.querySelectorAll('button'));
    const prevBtn = buttons.find((b) => b.textContent?.includes('Prev'));
    const nextBtn = buttons.find((b) => b.textContent?.includes('Next'));

    expect(prevBtn?.disabled).toBe(true);
    expect(nextBtn?.disabled).toBe(true);
  });
});

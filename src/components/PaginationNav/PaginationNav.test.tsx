import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { getNavigationSnapshot } from '../../hooks/navigationStore.ts';
import { render, screen } from '../../test-utils/render';
import { resetMockNavigation } from '../../test-utils/navigationStore.ts';
import { PaginationNav } from './PaginationNav';

describe('PaginationNav', () => {
  it('renders current page status', () => {
    render(
      <PaginationNav page={2} totalPages={5} query="" detailsId={null} />
    );

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('navigates to the next page when next link is clicked', async () => {
    const user = userEvent.setup();
    resetMockNavigation('/?page=2');

    render(
      <PaginationNav page={2} totalPages={5} query="" detailsId={null} />
    );

    await user.click(screen.getByRole('link', { name: /next/i }));

    expect(getNavigationSnapshot().searchParams.toString()).toBe('page=3');
  });

  it('disables previous on first page', () => {
    render(
      <PaginationNav page={1} totalPages={3} query="" detailsId={null} />
    );

    expect(screen.queryByRole('link', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('navigates to the previous page when previous link is clicked', async () => {
    const user = userEvent.setup();
    resetMockNavigation('/?page=3');

    render(
      <PaginationNav page={3} totalPages={5} query="" detailsId={null} />
    );

    await user.click(screen.getByRole('link', { name: /previous/i }));

    expect(getNavigationSnapshot().searchParams.toString()).toBe('page=2');
  });

  it('preserves details id in pagination links', () => {
    render(
      <PaginationNav page={1} totalPages={3} query="" detailsId={25} />
    );

    expect(screen.getByRole('link', { name: /next/i })).toHaveAttribute(
      'href',
      '/?page=2&details=25'
    );
  });
});

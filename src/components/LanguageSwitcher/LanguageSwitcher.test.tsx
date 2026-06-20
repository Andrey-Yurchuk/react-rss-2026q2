import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { getNavigationSnapshot } from '../../hooks/navigationStore.ts';
import { render, screen, within } from '../../test-utils/render';
import { resetMockNavigation } from '../../test-utils/navigationStore.ts';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('renders an accessible language group with locale buttons', () => {
    render(<LanguageSwitcher />);

    const group = screen.getByRole('group', { name: /language/i });
    expect(within(group).getByRole('button', { name: 'EN' })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: 'RU' })).toBeInTheDocument();
  });

  it('marks the active locale as pressed', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'RU' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('switches locale while preserving current search params', async () => {
    const user = userEvent.setup();
    resetMockNavigation('/?page=2&query=pikachu&details=25');

    render(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', { name: 'RU' }));

    expect(getNavigationSnapshot().pathname).toBe('/ru');
    expect(getNavigationSnapshot().searchParams.toString()).toBe(
      'page=2&query=pikachu&details=25'
    );
  });
});

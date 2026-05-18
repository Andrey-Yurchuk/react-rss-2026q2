import { describe, expect, it } from 'vitest';
import { renderWithRouter, screen } from '../../test-utils/render';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('shows author info and RS School React course link', () => {
    renderWithRouter(<AboutPage />);

    expect(
      screen.getByRole('heading', { name: /pokedex browser/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /andrey yurchuk/i })).toHaveAttribute(
      'href',
      'https://github.com/Andrey-Yurchuk'
    );
    expect(
      screen.getByRole('link', { name: /rs school reactjs course/i })
    ).toHaveAttribute('href', 'https://rs.school/courses/reactjs');
    expect(
      screen.getByRole('link', { name: /back to pokemon search/i })
    ).toHaveAttribute('href', '/?page=1');
  });
});

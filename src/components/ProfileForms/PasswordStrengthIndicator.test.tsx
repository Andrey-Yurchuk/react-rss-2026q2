import { describe, expect, it } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  it('shows all requirements as unmet for an empty password', () => {
    render(<PasswordStrengthIndicator password="" />);

    expect(screen.getByText('1 number')).not.toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 uppercase letter')).not.toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 lowercase letter')).not.toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 special character')).not.toHaveClass(
      'password-strength__item--met'
    );
  });

  it('marks satisfied password strength rules', () => {
    render(<PasswordStrengthIndicator password="Aa1!" />);

    expect(screen.getByText('1 number')).toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 uppercase letter')).toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 lowercase letter')).toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 special character')).toHaveClass(
      'password-strength__item--met'
    );
  });

  it('accepts a precomputed strength object without duplicating utility logic', () => {
    render(
      <PasswordStrengthIndicator
        strength={{
          number: true,
          uppercase: false,
          lowercase: true,
          specialCharacter: false,
        }}
      />
    );

    expect(screen.getByText('1 number')).toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 uppercase letter')).not.toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 lowercase letter')).toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 special character')).not.toHaveClass(
      'password-strength__item--met'
    );
  });
});

import {
  getPasswordStrength,
  type PasswordStrength,
} from '../../utils/passwordStrength';

const STRENGTH_ITEMS = [
  { key: 'number', label: '1 number' },
  { key: 'uppercase', label: '1 uppercase letter' },
  { key: 'lowercase', label: '1 lowercase letter' },
  { key: 'specialCharacter', label: '1 special character' },
] as const satisfies ReadonlyArray<{
  key: keyof PasswordStrength;
  label: string;
}>;

export type PasswordStrengthIndicatorProps = {
  password?: string;
  strength?: PasswordStrength;
};

export function PasswordStrengthIndicator({
  password = '',
  strength,
}: PasswordStrengthIndicatorProps) {
  const resolvedStrength = strength ?? getPasswordStrength(password);

  return (
    <div
      className="password-strength"
      aria-label="Password strength requirements"
    >
      <p className="password-strength__title">Password strength</p>
      <ul className="password-strength__list">
        {STRENGTH_ITEMS.map((item) => {
          const isMet = resolvedStrength[item.key];

          return (
            <li
              key={item.key}
              className={`password-strength__item${
                isMet ? ' password-strength__item--met' : ''
              }`}
            >
              {item.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

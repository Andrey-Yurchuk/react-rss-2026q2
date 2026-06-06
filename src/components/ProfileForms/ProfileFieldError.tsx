export type ProfileFieldErrorProps = {
  id: string;
  message?: string;
};

export function ProfileFieldError({ id, message }: ProfileFieldErrorProps) {
  return (
    <p
      id={id}
      className={`profile-field__error${
        message ? ' profile-field__error--visible' : ''
      }`}
      role={message ? 'alert' : undefined}
      aria-live={message ? 'polite' : undefined}
    >
      {message ?? '\u00A0'}
    </p>
  );
}

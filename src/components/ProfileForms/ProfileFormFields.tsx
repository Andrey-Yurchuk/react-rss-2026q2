import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import {
  PROFILE_GENDERS,
  PROFILE_GENDER_LABELS,
  PROFILE_IMAGE_MIME_TYPES,
} from '../../constants/profileForm';
import { ProfileFieldError } from './ProfileFieldError';

type ProfileFieldControlProps = {
  id: string;
  name: string;
  label: string;
  error?: string;
  hint?: ReactNode;
};

function buildErrorId(id: string): string {
  return `${id}-error`;
}

function buildFieldAriaProps(id: string, error?: string) {
  const errorId = buildErrorId(id);

  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  } as const;
}

export type ProfileTextFieldProps = ProfileFieldControlProps &
  Omit<
    ComponentPropsWithoutRef<'input'>,
    'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby'
  > & {
    inputClassName?: string;
  };

export function ProfileTextField({
  id,
  name,
  label,
  error,
  hint,
  inputClassName,
  type = 'text',
  ...inputProps
}: ProfileTextFieldProps) {
  const errorId = buildErrorId(id);

  return (
    <div className="profile-field">
      <label className="profile-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className={['profile-field__input', inputClassName]
          .filter(Boolean)
          .join(' ')}
        {...buildFieldAriaProps(id, error)}
        {...inputProps}
      />
      {hint}
      <ProfileFieldError id={errorId} message={error} />
    </div>
  );
}

export type ProfileGenderFieldProps = ProfileFieldControlProps &
  Omit<
    ComponentPropsWithoutRef<'select'>,
    'id' | 'name' | 'className' | 'aria-invalid' | 'aria-describedby' | 'children'
  >;

export function ProfileGenderField({
  id,
  name,
  label,
  error,
  hint,
  defaultValue,
  ...selectProps
}: ProfileGenderFieldProps) {
  const errorId = buildErrorId(id);

  return (
    <div className="profile-field">
      <label className="profile-field__label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        className="profile-field__input profile-field__select"
        {...buildFieldAriaProps(id, error)}
        {...(defaultValue !== undefined ? { defaultValue } : {})}
        {...selectProps}
      >
        <option value="" disabled>
          Select gender
        </option>
        {PROFILE_GENDERS.map((gender) => (
          <option key={gender} value={gender}>
            {PROFILE_GENDER_LABELS[gender]}
          </option>
        ))}
      </select>
      {hint}
      <ProfileFieldError id={errorId} message={error} />
    </div>
  );
}

export type ProfileTermsFieldProps = ProfileFieldControlProps &
  Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'id'
    | 'name'
    | 'type'
    | 'className'
    | 'aria-invalid'
    | 'aria-describedby'
  >;

export function ProfileTermsField({
  id,
  name,
  label,
  error,
  hint,
  ...checkboxProps
}: ProfileTermsFieldProps) {
  const errorId = buildErrorId(id);

  return (
    <div className="profile-field profile-field--checkbox">
      <div className="profile-field__checkbox-row">
        <input
          id={id}
          name={name}
          type="checkbox"
          className="profile-field__checkbox"
          {...buildFieldAriaProps(id, error)}
          {...checkboxProps}
        />
        <label className="profile-field__checkbox-label" htmlFor={id}>
          {label}
        </label>
      </div>
      {hint}
      <ProfileFieldError id={errorId} message={error} />
    </div>
  );
}

export type ProfileImageUploadFieldProps = ProfileFieldControlProps &
  Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'id'
    | 'name'
    | 'type'
    | 'className'
    | 'accept'
    | 'aria-invalid'
    | 'aria-describedby'
  >;

const PROFILE_IMAGE_ACCEPT = [
  ...PROFILE_IMAGE_MIME_TYPES,
  '.png',
  '.jpg',
  '.jpeg',
].join(',');

export function ProfileImageUploadField({
  id,
  name,
  label,
  error,
  hint,
  ...inputProps
}: ProfileImageUploadFieldProps) {
  const errorId = buildErrorId(id);

  return (
    <div className="profile-field">
      <label className="profile-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="file"
        accept={PROFILE_IMAGE_ACCEPT}
        className="profile-field__input profile-field__file-input"
        {...buildFieldAriaProps(id, error)}
        {...inputProps}
      />
      {hint}
      <ProfileFieldError id={errorId} message={error} />
    </div>
  );
}

export type ProfileCountryAutocompleteFieldProps = ProfileFieldControlProps & {
  countries: readonly string[];
  listId?: string;
} & Omit<
    ComponentPropsWithoutRef<'input'>,
    'id' | 'name' | 'list' | 'className' | 'aria-invalid' | 'aria-describedby'
  >;

export function ProfileCountryAutocompleteField({
  id,
  name,
  label,
  error,
  hint,
  countries,
  listId,
  ...inputProps
}: ProfileCountryAutocompleteFieldProps) {
  const errorId = buildErrorId(id);
  const resolvedListId = listId ?? `${id}-options`;

  return (
    <div className="profile-field">
      <label className="profile-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        list={resolvedListId}
        className="profile-field__input"
        autoComplete="off"
        {...buildFieldAriaProps(id, error)}
        {...inputProps}
      />
      <datalist id={resolvedListId}>
        {countries.map((country) => (
          <option key={country} value={country} />
        ))}
      </datalist>
      {hint}
      <ProfileFieldError id={errorId} message={error} />
    </div>
  );
}

export type ProfilePasswordFieldProps = Omit<ProfileTextFieldProps, 'type'>;

export function ProfilePasswordField(props: ProfilePasswordFieldProps) {
  return <ProfileTextField {...props} type="password" />;
}

export type ProfileConfirmPasswordFieldProps = Omit<
  ProfileTextFieldProps,
  'type'
>;

export function ProfileConfirmPasswordField(
  props: ProfileConfirmPasswordFieldProps
) {
  return <ProfileTextField {...props} type="password" />;
}

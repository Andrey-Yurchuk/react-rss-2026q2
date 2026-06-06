import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { Controller, useForm, type DefaultValues } from 'react-hook-form';
import {
  selectCountries,
  useFormSubmissionsStore,
} from '../../store/formSubmissionsStore';
import { fileToBase64 } from '../../utils/fileToBase64';
import {
  createProfileFormSchema,
  type ProfileFormInput,
  type ProfileFormValues,
} from '../../utils/formValidation';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import {
  ProfileConfirmPasswordField,
  ProfileCountryAutocompleteField,
  ProfileGenderField,
  ProfileImageUploadField,
  ProfilePasswordField,
  ProfileTermsField,
  ProfileTextField,
} from './ProfileFormFields';

export type ReactHookProfileFormProps = {
  onSuccess: () => void;
  submitLabel?: string;
};

const EMPTY_FILE = new File([], '', { type: 'application/octet-stream' });

const DEFAULT_FORM_VALUES: DefaultValues<ProfileFormValues> = {
  name: '',
  age: Number.NaN,
  email: '',
  termsAccepted: false,
  password: '',
  confirmPassword: '',
  image: EMPTY_FILE,
  country: '',
};

export function ReactHookProfileForm({
  onSuccess,
  submitLabel = 'Submit profile',
}: ReactHookProfileFormProps) {
  const countries = useFormSubmissionsStore(selectCountries);
  const addSubmission = useFormSubmissionsStore((state) => state.addSubmission);

  const schema = useMemo(
    () => createProfileFormSchema(countries),
    [countries]
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ProfileFormValues, unknown, ProfileFormInput>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const passwordValue = watch('password') ?? '';

  const onSubmit = handleSubmit(async (data) => {
    const imageBase64 = await fileToBase64(data.image);

    addSubmission({
      source: 'react-hook-form',
      name: data.name,
      age: data.age,
      email: data.email,
      gender: data.gender,
      termsAccepted: true,
      imageBase64,
      imageName: data.image.name,
      country: data.country,
    });

    reset(DEFAULT_FORM_VALUES);
    await trigger();
    onSuccess();
  });

  return (
    <form className="profile-form" onSubmit={onSubmit} noValidate>
      <ProfileTextField
        id="rhf-profile-name"
        label="Name"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />
      <ProfileTextField
        id="rhf-profile-age"
        label="Age"
        type="number"
        min={0}
        inputMode="numeric"
        error={errors.age?.message}
        {...register('age', { valueAsNumber: true })}
      />
      <ProfileTextField
        id="rhf-profile-email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <ProfileGenderField
        id="rhf-profile-gender"
        label="Gender"
        error={errors.gender?.message}
        defaultValue=""
        {...register('gender')}
      />
      <ProfileTermsField
        id="rhf-profile-terms"
        label="I accept the Terms and Conditions"
        error={errors.termsAccepted?.message}
        {...register('termsAccepted')}
      />
      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <ProfileImageUploadField
            id="rhf-profile-image"
            name={field.name}
            label="Profile image"
            error={errors.image?.message}
            onBlur={field.onBlur}
            onChange={(event) => {
              field.onChange(event.target.files?.[0] ?? EMPTY_FILE);
            }}
          />
        )}
      />
      <ProfilePasswordField
        id="rhf-profile-password"
        label="Password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordStrengthIndicator password={passwordValue} />
      <ProfileConfirmPasswordField
        id="rhf-profile-confirm-password"
        label="Confirm password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <ProfileCountryAutocompleteField
        id="rhf-profile-country"
        label="Country"
        countries={countries}
        listId="rhf-profile-country-options"
        error={errors.country?.message}
        {...register('country')}
      />
      <button
        className="profile-form__submit"
        type="submit"
        disabled={!isValid || isSubmitting}
      >
        {submitLabel}
      </button>
    </form>
  );
}

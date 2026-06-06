import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEventHandler,
} from 'react';
import type { ZodError } from 'zod';
import {
  selectCountries,
  useFormSubmissionsStore,
} from '../../store/formSubmissionsStore';
import { fileToBase64 } from '../../utils/fileToBase64';
import { createProfileFormSchema } from '../../utils/formValidation';
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

type ProfileFormFieldName =
  | 'name'
  | 'age'
  | 'email'
  | 'gender'
  | 'termsAccepted'
  | 'password'
  | 'confirmPassword'
  | 'image'
  | 'country';

type ProfileFormFieldErrors = Partial<Record<ProfileFormFieldName, string>>;

export type UncontrolledProfileFormProps = {
  onSuccess: () => void;
  submitLabel?: string;
};

function getImageFromForm(form: HTMLFormElement): File {
  const imageInput = form.elements.namedItem('image');

  if (imageInput instanceof HTMLInputElement && imageInput.files?.[0]) {
    return imageInput.files[0];
  }

  const imageEntry = new FormData(form).get('image');

  if (imageEntry instanceof File) {
    return imageEntry;
  }

  return new File([], '', { type: 'application/octet-stream' });
}

function parseFormElement(form: HTMLFormElement) {
  const formData = new FormData(form);

  return {
    name: String(formData.get('name') ?? ''),
    age: formData.get('age') ?? '',
    email: String(formData.get('email') ?? ''),
    gender: String(formData.get('gender') ?? ''),
    termsAccepted: formData.get('termsAccepted') === 'on',
    password: String(formData.get('password') ?? ''),
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
    image: getImageFromForm(form),
    country: String(formData.get('country') ?? ''),
  };
}

function mapZodErrors(error: ZodError): ProfileFormFieldErrors {
  const fieldErrors: ProfileFormFieldErrors = {};

  for (const issue of error.issues) {
    const fieldName = issue.path[0];

    if (typeof fieldName !== 'string') {
      continue;
    }

    const key = fieldName as ProfileFormFieldName;

    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}

export function UncontrolledProfileForm({
  onSuccess,
  submitLabel = 'Submit profile',
}: UncontrolledProfileFormProps) {
  const countries = useFormSubmissionsStore(selectCountries);
  const addSubmission = useFormSubmissionsStore((state) => state.addSubmission);
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<ProfileFormFieldErrors>({});
  const [passwordDraft, setPasswordDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = useMemo(
    () => createProfileFormSchema(countries),
    [countries]
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const form = formRef.current;
    if (!form) {
      return;
    }

    const validationResult = schema.safeParse(parseFormElement(form));

    if (!validationResult.success) {
      setFieldErrors(mapZodErrors(validationResult.error));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const validated = validationResult.data;
      const imageBase64 = await fileToBase64(validated.image);

      addSubmission({
        source: 'uncontrolled',
        name: validated.name,
        age: validated.age,
        email: validated.email,
        gender: validated.gender,
        termsAccepted: true,
        imageBase64,
        imageName: validated.image.name,
        country: validated.country,
      });

      form.reset();
      setPasswordDraft('');
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPasswordDraft(event.currentTarget.value);
  };

  return (
    <form
      ref={formRef}
      className="profile-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <ProfileTextField
        id="uncontrolled-profile-name"
        name="name"
        label="Name"
        autoComplete="name"
        error={fieldErrors.name}
      />
      <ProfileTextField
        id="uncontrolled-profile-age"
        name="age"
        label="Age"
        type="number"
        min={0}
        inputMode="numeric"
        error={fieldErrors.age}
      />
      <ProfileTextField
        id="uncontrolled-profile-email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={fieldErrors.email}
      />
      <ProfileGenderField
        id="uncontrolled-profile-gender"
        name="gender"
        label="Gender"
        error={fieldErrors.gender}
      />
      <ProfileTermsField
        id="uncontrolled-profile-terms"
        name="termsAccepted"
        label="I accept the Terms and Conditions"
        error={fieldErrors.termsAccepted}
      />
      <ProfileImageUploadField
        id="uncontrolled-profile-image"
        name="image"
        label="Profile image"
        error={fieldErrors.image}
      />
      <ProfilePasswordField
        id="uncontrolled-profile-password"
        name="password"
        label="Password"
        autoComplete="new-password"
        error={fieldErrors.password}
        onChange={handlePasswordChange}
      />
      <PasswordStrengthIndicator password={passwordDraft} />
      <ProfileConfirmPasswordField
        id="uncontrolled-profile-confirm-password"
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
      />
      <ProfileCountryAutocompleteField
        id="uncontrolled-profile-country"
        name="country"
        label="Country"
        countries={countries}
        listId="uncontrolled-profile-country-options"
        error={fieldErrors.country}
      />
      <button
        className="profile-form__submit"
        type="submit"
        disabled={isSubmitting}
      >
        {submitLabel}
      </button>
    </form>
  );
}

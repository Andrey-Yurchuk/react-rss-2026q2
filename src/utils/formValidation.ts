import { z } from 'zod';
import {
  MAX_PROFILE_IMAGE_SIZE_BYTES,
  PROFILE_GENDERS,
  PROFILE_IMAGE_MIME_TYPES,
} from '../constants/profileForm';

export function validateBasicEmail(email: string): boolean {
  const atParts = email.split('@');

  if (atParts.length !== 2) {
    return false;
  }

  const [localPart, domain] = atParts;

  if (localPart.length === 0) {
    return false;
  }

  if (domain.length === 0) {
    return false;
  }

  if (!domain.includes('.')) {
    return false;
  }

  return true;
}

export function nameStartsWithUppercase(name: string): boolean {
  if (name.length === 0) {
    return false;
  }

  const firstChar = name.charAt(0);

  return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
}

function isAllowedProfileImageType(type: string): boolean {
  return PROFILE_IMAGE_MIME_TYPES.some((allowedType) => allowedType === type);
}

export function createProfileFormSchema(countries: readonly string[]) {
  const allowedCountries = new Set(countries);

  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, 'Name is required')
        .refine(nameStartsWithUppercase, {
          message: 'Name must start with an uppercase letter',
        }),
      age: z.coerce
        .number({
          error: 'Age must be a number',
        })
        .min(0, 'Age cannot be negative'),
      email: z
        .string()
        .trim()
        .min(1, 'Email is required')
        .refine(validateBasicEmail, {
          message: 'Email format is invalid',
        }),
      gender: z.enum(PROFILE_GENDERS, {
        error: 'Gender is required',
      }),
      termsAccepted: z.literal(true, {
        error: 'Terms and Conditions must be accepted',
      }),
      password: z.string().min(1, 'Password is required'),
      confirmPassword: z.string().min(1, 'Confirm password is required'),
      image: z
        .file({
          error: 'Image is required',
        })
        .max(
          MAX_PROFILE_IMAGE_SIZE_BYTES,
          `Image must be ${MAX_PROFILE_IMAGE_SIZE_BYTES} bytes or smaller`
        )
        .refine((file) => file.size > 0, {
          message: 'Image is required',
        })
        .refine((file) => isAllowedProfileImageType(file.type), {
          message: 'Image must be a PNG or JPEG file',
        }),
      country: z
        .string()
        .trim()
        .min(1, 'Country is required')
        .refine((country) => allowedCountries.has(country), {
          message: 'Country must be selected from the list',
        }),
    })
    .superRefine((values, context) => {
      if (values.password !== values.confirmPassword) {
        context.addIssue({
          code: 'custom',
          message: 'Passwords must match',
          path: ['confirmPassword'],
        });
      }
    });
}

export type ProfileFormInput = z.infer<
  ReturnType<typeof createProfileFormSchema>
>;

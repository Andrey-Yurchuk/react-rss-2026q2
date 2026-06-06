export const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export const PROFILE_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg'] as const;

export type ProfileImageMimeType = (typeof PROFILE_IMAGE_MIME_TYPES)[number];

export const PROFILE_GENDERS = ['male', 'female', 'not-specified'] as const;

export type ProfileGender = (typeof PROFILE_GENDERS)[number];

export const PROFILE_GENDER_LABELS: Record<ProfileGender, string> = {
  male: 'Male',
  female: 'Female',
  'not-specified': 'Not specified',
};

export const PROFILE_COUNTRIES = [
  'Belarus',
  'France',
  'Germany',
  'Italy',
  'Poland',
  'Russian Federation',
  'Spain',
  'Ukraine',
  'United Kingdom',
  'United States',
] as const;

export type ProfileCountry = (typeof PROFILE_COUNTRIES)[number];

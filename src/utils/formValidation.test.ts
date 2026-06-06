import { describe, expect, it } from 'vitest';
import {
  MAX_PROFILE_IMAGE_SIZE_BYTES,
  PROFILE_COUNTRIES,
} from '../constants/profileForm';
import {
  createProfileFormSchema,
  validateBasicEmail,
} from './formValidation';

const profileFormSchema = createProfileFormSchema(PROFILE_COUNTRIES);

function createPngFile(size = 4, name = 'avatar.png'): File {
  return new File([new Uint8Array(size)], name, { type: 'image/png' });
}

function createValidProfileFormInput() {
  return {
    name: 'Alice',
    age: 28,
    email: 'alice@example.com',
    gender: 'female' as const,
    termsAccepted: true as const,
    password: 'Aa1!',
    confirmPassword: 'Aa1!',
    image: createPngFile(),
    country: 'Poland',
  };
}

function getIssuePaths(input: unknown) {
  const result = profileFormSchema.safeParse(input);

  if (result.success) {
    return [];
  }

  return result.error.issues.map((issue) => issue.path.join('.'));
}

function expectSchemaFailure(input: unknown, path: string) {
  const result = profileFormSchema.safeParse(input);

  expect(result.success).toBe(false);

  if (result.success) {
    return;
  }

  expect(result.error.issues.some((issue) => issue.path.join('.') === path)).toBe(
    true
  );
}

describe('validateBasicEmail', () => {
  it('accepts a basic valid email', () => {
    expect(validateBasicEmail('alice@example.com')).toBe(true);
  });

  it('rejects emails without exactly one @', () => {
    expect(validateBasicEmail('alice.example.com')).toBe(false);
    expect(validateBasicEmail('alice@@example.com')).toBe(false);
  });

  it('rejects emails with an empty local part', () => {
    expect(validateBasicEmail('@example.com')).toBe(false);
  });

  it('rejects emails with an empty domain', () => {
    expect(validateBasicEmail('alice@')).toBe(false);
  });

  it('rejects domains without a dot', () => {
    expect(validateBasicEmail('alice@example')).toBe(false);
  });
});

describe('createProfileFormSchema', () => {
  it('accepts valid profile form input', () => {
    const result = profileFormSchema.safeParse(createValidProfileFormInput());

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe('Alice');
      expect(result.data.country).toBe('Poland');
    }
  });

  it('rejects a name that does not start with an uppercase letter', () => {
    expectSchemaFailure(
      {
        ...createValidProfileFormInput(),
        name: 'alice',
      },
      'name'
    );
  });

  it('rejects negative age values', () => {
    expectSchemaFailure(
      {
        ...createValidProfileFormInput(),
        age: -1,
      },
      'age'
    );
  });

  it('rejects non-numeric age values', () => {
    expect(getIssuePaths({
      ...createValidProfileFormInput(),
      age: 'abc',
    })).toContain('age');
  });

  it('rejects invalid email values', () => {
    expectSchemaFailure(
      {
        ...createValidProfileFormInput(),
        email: 'alice@example',
      },
      'email'
    );
  });

  it('rejects mismatched passwords', () => {
    expectSchemaFailure(
      {
        ...createValidProfileFormInput(),
        confirmPassword: 'Different1!',
      },
      'confirmPassword'
    );
  });

  it('rejects unsupported image mime types', () => {
    expectSchemaFailure(
      {
        ...createValidProfileFormInput(),
        image: new File(['gif'], 'avatar.gif', { type: 'image/gif' }),
      },
      'image'
    );
  });

  it('rejects images larger than the configured limit', () => {
    expectSchemaFailure(
      {
        ...createValidProfileFormInput(),
        image: createPngFile(MAX_PROFILE_IMAGE_SIZE_BYTES + 1),
      },
      'image'
    );
  });

  it('rejects countries that are not in the provided list', () => {
    expectSchemaFailure(
      {
        ...createValidProfileFormInput(),
        country: 'Atlantis',
      },
      'country'
    );
  });

  it('rejects submissions when terms are not accepted', () => {
    expectSchemaFailure(
      {
        ...createValidProfileFormInput(),
        termsAccepted: false,
      },
      'termsAccepted'
    );
  });

  it('uses the provided countries list for validation', () => {
    const customSchema = createProfileFormSchema(['Japan']);

    const result = customSchema.safeParse({
      ...createValidProfileFormInput(),
      country: 'Poland',
    });

    expect(result.success).toBe(false);
  });
});

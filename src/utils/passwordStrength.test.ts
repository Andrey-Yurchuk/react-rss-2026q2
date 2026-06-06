import { describe, expect, it } from 'vitest';
import { getPasswordStrength } from './passwordStrength';

describe('getPasswordStrength', () => {
  it('returns all false flags for an empty password', () => {
    expect(getPasswordStrength('')).toEqual({
      number: false,
      uppercase: false,
      lowercase: false,
      specialCharacter: false,
    });
  });

  it('detects a number character', () => {
    expect(getPasswordStrength('pass1')).toMatchObject({
      number: true,
      lowercase: true,
    });
  });

  it('detects uppercase and lowercase letters', () => {
    expect(getPasswordStrength('Aa')).toEqual({
      number: false,
      uppercase: true,
      lowercase: true,
      specialCharacter: false,
    });
  });

  it('detects a special character', () => {
    expect(getPasswordStrength('Pass!')).toEqual({
      number: false,
      uppercase: true,
      lowercase: true,
      specialCharacter: true,
    });
  });

  it('detects all strength flags in a complex password', () => {
    expect(getPasswordStrength('Aa1!')).toEqual({
      number: true,
      uppercase: true,
      lowercase: true,
      specialCharacter: true,
    });
  });
});

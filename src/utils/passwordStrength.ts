export type PasswordStrength = {
  number: boolean;
  uppercase: boolean;
  lowercase: boolean;
  specialCharacter: boolean;
};

export function getPasswordStrength(password: string): PasswordStrength {
  const strength: PasswordStrength = {
    number: false,
    uppercase: false,
    lowercase: false,
    specialCharacter: false,
  };

  for (const char of password) {
    if (char >= '0' && char <= '9') {
      strength.number = true;
      continue;
    }

    if (char >= 'A' && char <= 'Z') {
      strength.uppercase = true;
      continue;
    }

    if (char >= 'a' && char <= 'z') {
      strength.lowercase = true;
      continue;
    }

    strength.specialCharacter = true;
  }

  return strength;
}

import type { ProfileGender } from '../constants/profileForm';

export type ProfileFormSource = 'uncontrolled' | 'react-hook-form';

export type ProfileFormSubmission = {
  id: string;
  source: ProfileFormSource;
  createdAt: string;
  name: string;
  age: number;
  email: string;
  gender: ProfileGender;
  termsAccepted: true;
  imageBase64: string;
  imageName: string;
  country: string;
};

import { create } from 'zustand';
import { PROFILE_COUNTRIES } from '../constants/profileForm';
import type { ProfileFormSubmission } from '../types/profileForm';

export type AddProfileFormSubmissionInput = Omit<
  ProfileFormSubmission,
  'id' | 'createdAt'
>;

type FormSubmissionsState = {
  countries: readonly string[];
  submissions: ProfileFormSubmission[];
  lastSubmissionId: string | null;
  addSubmission: (input: AddProfileFormSubmissionInput) => void;
  clearSubmissions: () => void;
};

function createSubmissionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `profile-submission-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useFormSubmissionsStore = create<FormSubmissionsState>()((set) => ({
  countries: [...PROFILE_COUNTRIES],
  submissions: [],
  lastSubmissionId: null,
  addSubmission: (input) =>
    set((state) => {
      const id = createSubmissionId();
      const submission: ProfileFormSubmission = {
        ...input,
        id,
        createdAt: new Date().toISOString(),
      };

      return {
        submissions: [submission, ...state.submissions],
        lastSubmissionId: id,
      };
    }),
  clearSubmissions: () =>
    set({
      submissions: [],
      lastSubmissionId: null,
    }),
}));

export function selectCountries(state: FormSubmissionsState): readonly string[] {
  return state.countries;
}

export function selectSubmissions(
  state: FormSubmissionsState
): ProfileFormSubmission[] {
  return state.submissions;
}

export function selectLastSubmissionId(
  state: FormSubmissionsState
): string | null {
  return state.lastSubmissionId;
}

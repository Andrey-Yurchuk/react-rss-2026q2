import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROFILE_COUNTRIES } from '../constants/profileForm';
import type { AddProfileFormSubmissionInput } from './formSubmissionsStore';
import {
  selectCountries,
  selectLastSubmissionId,
  selectSubmissions,
  useFormSubmissionsStore,
} from './formSubmissionsStore';

function createSubmissionInput(
  overrides: Partial<AddProfileFormSubmissionInput> = {}
): AddProfileFormSubmissionInput {
  return {
    source: 'uncontrolled',
    name: 'Alice',
    age: 28,
    email: 'alice@example.com',
    gender: 'female',
    termsAccepted: true,
    imageBase64: 'data:image/png;base64,abc',
    imageName: 'avatar.png',
    country: 'Poland',
    ...overrides,
  };
}

function resetStore() {
  useFormSubmissionsStore.setState({
    countries: [...PROFILE_COUNTRIES],
    submissions: [],
    lastSubmissionId: null,
  });
}

describe('formSubmissionsStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('exposes countries through selectCountries', () => {
    const state = useFormSubmissionsStore.getState();

    expect(selectCountries(state)).toEqual([...PROFILE_COUNTRIES]);
  });

  it('adds an uncontrolled submission with generated id and createdAt', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '11111111-1111-4111-8111-111111111111'
    );

    useFormSubmissionsStore
      .getState()
      .addSubmission(createSubmissionInput({ source: 'uncontrolled' }));

    const state = useFormSubmissionsStore.getState();
    const [submission] = selectSubmissions(state);

    expect(submission).toMatchObject({
      id: '11111111-1111-4111-8111-111111111111',
      source: 'uncontrolled',
      name: 'Alice',
      imageBase64: 'data:image/png;base64,abc',
      imageName: 'avatar.png',
      country: 'Poland',
    });
    expect(submission.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('adds a react-hook-form submission', () => {
    useFormSubmissionsStore
      .getState()
      .addSubmission(createSubmissionInput({ source: 'react-hook-form' }));

    expect(selectSubmissions(useFormSubmissionsStore.getState())[0].source).toBe(
      'react-hook-form'
    );
  });

  it('keeps the full submission history', () => {
    useFormSubmissionsStore
      .getState()
      .addSubmission(createSubmissionInput({ name: 'Alice', source: 'uncontrolled' }));
    useFormSubmissionsStore
      .getState()
      .addSubmission(
        createSubmissionInput({ name: 'Bob', source: 'react-hook-form' })
      );

    expect(
      selectSubmissions(useFormSubmissionsStore.getState()).map(
        (submission) => submission.name
      )
    ).toEqual(['Bob', 'Alice']);
  });

  it('stores submissions newest first', () => {
    useFormSubmissionsStore
      .getState()
      .addSubmission(createSubmissionInput({ name: 'First' }));
    useFormSubmissionsStore
      .getState()
      .addSubmission(createSubmissionInput({ name: 'Second' }));

    const submissions = selectSubmissions(useFormSubmissionsStore.getState());

    expect(submissions[0].name).toBe('Second');
    expect(submissions[1].name).toBe('First');
  });

  it('updates lastSubmissionId after each addSubmission call', () => {
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('11111111-1111-4111-8111-111111111111')
      .mockReturnValueOnce('22222222-2222-4222-8222-222222222222');

    const store = useFormSubmissionsStore.getState();

    store.addSubmission(createSubmissionInput({ name: 'Alice' }));
    expect(selectLastSubmissionId(useFormSubmissionsStore.getState())).toBe(
      '11111111-1111-4111-8111-111111111111'
    );

    store.addSubmission(createSubmissionInput({ name: 'Bob' }));
    expect(selectLastSubmissionId(useFormSubmissionsStore.getState())).toBe(
      '22222222-2222-4222-8222-222222222222'
    );
  });

  it('clears submissions and lastSubmissionId but keeps countries', () => {
    useFormSubmissionsStore.getState().addSubmission(createSubmissionInput());
    useFormSubmissionsStore.getState().clearSubmissions();

    const state = useFormSubmissionsStore.getState();

    expect(selectSubmissions(state)).toEqual([]);
    expect(selectLastSubmissionId(state)).toBeNull();
    expect(selectCountries(state)).toEqual([...PROFILE_COUNTRIES]);
  });

  it('returns expected data from selectors after multiple submissions', () => {
    useFormSubmissionsStore
      .getState()
      .addSubmission(createSubmissionInput({ name: 'Alice' }));
    useFormSubmissionsStore
      .getState()
      .addSubmission(createSubmissionInput({ name: 'Bob' }));

    const state = useFormSubmissionsStore.getState();

    expect(selectCountries(state)).toEqual([...PROFILE_COUNTRIES]);
    expect(selectSubmissions(state)).toHaveLength(2);
    expect(selectLastSubmissionId(state)).toBe(selectSubmissions(state)[0].id);
  });
});

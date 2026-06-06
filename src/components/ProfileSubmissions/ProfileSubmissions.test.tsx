import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROFILE_COUNTRIES } from '../../constants/profileForm';
import type { AddProfileFormSubmissionInput } from '../../store/formSubmissionsStore';
import { useFormSubmissionsStore } from '../../store/formSubmissionsStore';
import { act } from 'react';
import { render, screen, waitFor } from '../../test-utils/render';
import {
  PROFILE_SUBMISSION_HIGHLIGHT_MS,
  ProfileSubmissions,
} from './ProfileSubmissions';

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

function addSubmissionWithId(
  id: string,
  input: AddProfileFormSubmissionInput,
  createdAt = '2026-06-06T12:30:00.000Z'
) {
  useFormSubmissionsStore.setState((state) => ({
    submissions: [
      {
        ...input,
        id,
        createdAt,
      },
      ...state.submissions,
    ],
    lastSubmissionId: id,
  }));
}

describe('ProfileSubmissions', () => {
  beforeEach(() => {
    resetStore();
    vi.useRealTimers();
  });

  it('shows an empty state when there are no submissions', () => {
    render(<ProfileSubmissions />);

    expect(
      screen.getByText(/no profile submissions yet/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('renders multiple submissions', () => {
    addSubmissionWithId('submission-1', createSubmissionInput({ name: 'Alice' }));
    addSubmissionWithId(
      'submission-2',
      createSubmissionInput({
        source: 'react-hook-form',
        name: 'Bob',
        email: 'bob@example.com',
        gender: 'male',
        country: 'France',
      })
    );

    render(<ProfileSubmissions />);

    expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bob' })).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('Uncontrolled form')).toBeInTheDocument();
    expect(screen.getByText('React Hook Form')).toBeInTheDocument();
  });

  it('uses a name-only alt when imageName is empty', () => {
    addSubmissionWithId(
      'submission-1',
      createSubmissionInput({
        name: 'Alice',
        imageName: '',
      })
    );

    render(<ProfileSubmissions />);

    expect(
      screen.getByRole('img', { name: 'Profile photo for Alice' })
    ).toBeInTheDocument();
  });

  it('uses the base64 image as the preview source and sets a meaningful alt', () => {
    addSubmissionWithId(
      'submission-1',
      createSubmissionInput({
        name: 'Alice',
        imageBase64: 'data:image/png;base64,preview-data',
        imageName: 'avatar.png',
      })
    );

    render(<ProfileSubmissions />);

    const image = screen.getByRole('img', {
      name: 'Profile photo for Alice (avatar.png)',
    });

    expect(image).toHaveAttribute('src', 'data:image/png;base64,preview-data');
  });

  it('does not render password or confirm password fields', () => {
    addSubmissionWithId('submission-1', createSubmissionInput());

    render(<ProfileSubmissions />);

    expect(screen.queryByText(/^password$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/confirm password/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/secret/i)).not.toBeInTheDocument();
  });

  it('highlights the newest submission', async () => {
    addSubmissionWithId('submission-old', createSubmissionInput({ name: 'Alice' }));
    addSubmissionWithId('submission-new', createSubmissionInput({ name: 'Bob' }));

    render(<ProfileSubmissions />);

    const oldCard = screen
      .getByRole('heading', { name: 'Alice' })
      .closest('article');
    const newCard = screen.getByRole('heading', { name: 'Bob' }).closest('article');

    expect(oldCard).not.toHaveClass('profile-submission-card--new');

    await waitFor(() =>
      expect(newCard).toHaveClass('profile-submission-card--new')
    );
  });

  it('removes the highlight after the timer expires', async () => {
    vi.useFakeTimers();

    addSubmissionWithId('submission-new', createSubmissionInput({ name: 'Alice' }));

    render(<ProfileSubmissions />);

    const card = screen
      .getByRole('heading', { name: 'Alice' })
      .closest('article');

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(card).toHaveClass('profile-submission-card--new');

    await act(async () => {
      vi.advanceTimersByTime(PROFILE_SUBMISSION_HIGHLIGHT_MS);
    });

    expect(card).not.toHaveClass('profile-submission-card--new');

    vi.useRealTimers();
  });

  it('keeps older submissions visible after highlighting the newest one', () => {
    addSubmissionWithId('submission-old', createSubmissionInput({ name: 'Alice' }));
    addSubmissionWithId('submission-new', createSubmissionInput({ name: 'Bob' }));

    render(<ProfileSubmissions />);

    expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bob' })).toBeInTheDocument();
  });

  it('shows the submission timestamp', () => {
    addSubmissionWithId(
      'submission-1',
      createSubmissionInput(),
      '2026-06-06T12:30:00.000Z'
    );

    render(<ProfileSubmissions />);

    expect(
      screen.getByText((_, element) => element?.tagName === 'TIME')
    ).toHaveAttribute('datetime', '2026-06-06T12:30:00.000Z');
  });
});

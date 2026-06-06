import { useEffect, useState } from 'react';
import { PROFILE_GENDER_LABELS } from '../../constants/profileForm';
import {
  selectLastSubmissionId,
  selectSubmissions,
  useFormSubmissionsStore,
} from '../../store/formSubmissionsStore';
import type {
  ProfileFormSource,
  ProfileFormSubmission,
} from '../../types/profileForm';

export const PROFILE_SUBMISSION_HIGHLIGHT_MS = 3000;

const PROFILE_FORM_SOURCE_LABELS: Record<ProfileFormSource, string> = {
  uncontrolled: 'Uncontrolled form',
  'react-hook-form': 'React Hook Form',
};

function formatSubmissionCreatedAt(createdAt: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(createdAt));
}

function buildImageAlt(submission: ProfileFormSubmission): string {
  if (submission.imageName) {
    return `Profile photo for ${submission.name} (${submission.imageName})`;
  }

  return `Profile photo for ${submission.name}`;
}

type ProfileSubmissionCardProps = {
  submission: ProfileFormSubmission;
  isNew: boolean;
};

function ProfileSubmissionCard({
  submission,
  isNew,
}: ProfileSubmissionCardProps) {
  const titleId = `profile-submission-name-${submission.id}`;

  return (
    <article
      className={[
        'profile-submission-card',
        isNew ? 'profile-submission-card--new' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={titleId}
    >
      <img
        className="profile-submission-card__image"
        src={submission.imageBase64}
        alt={buildImageAlt(submission)}
      />
      <div className="profile-submission-card__content">
        <h3 id={titleId} className="profile-submission-card__name">
          {submission.name}
        </h3>
        <dl className="profile-submission-card__details">
          <div className="profile-submission-card__detail">
            <dt>Age</dt>
            <dd>{submission.age}</dd>
          </div>
          <div className="profile-submission-card__detail">
            <dt>Email</dt>
            <dd className="profile-submission-card__email">{submission.email}</dd>
          </div>
          <div className="profile-submission-card__detail">
            <dt>Gender</dt>
            <dd>{PROFILE_GENDER_LABELS[submission.gender]}</dd>
          </div>
          <div className="profile-submission-card__detail">
            <dt>Country</dt>
            <dd>{submission.country}</dd>
          </div>
          <div className="profile-submission-card__detail">
            <dt>Source</dt>
            <dd>{PROFILE_FORM_SOURCE_LABELS[submission.source]}</dd>
          </div>
          <div className="profile-submission-card__detail">
            <dt>Submitted</dt>
            <dd>
              <time dateTime={submission.createdAt}>
                {formatSubmissionCreatedAt(submission.createdAt)}
              </time>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export function ProfileSubmissions() {
  const submissions = useFormSubmissionsStore(selectSubmissions);
  const lastSubmissionId = useFormSubmissionsStore(selectLastSubmissionId);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    if (!lastSubmissionId) {
      return;
    }

    const showTimerId = window.setTimeout(() => {
      setHighlightedId(lastSubmissionId);
    }, 0);

    const hideTimerId = window.setTimeout(() => {
      setHighlightedId((currentId) =>
        currentId === lastSubmissionId ? null : currentId
      );
    }, PROFILE_SUBMISSION_HIGHLIGHT_MS);

    return () => {
      window.clearTimeout(showTimerId);
      window.clearTimeout(hideTimerId);
    };
  }, [lastSubmissionId]);

  return (
    <section
      className="profile-submissions"
      aria-label="Profile form submissions"
    >
      <h2 className="profile-submissions__title">Submitted profiles</h2>
      {submissions.length === 0 ? (
        <p className="profile-submissions__empty">
          No profile submissions yet. Submit a form to see it here.
        </p>
      ) : (
        <ul className="profile-submissions__list">
          {submissions.map((submission) => (
            <li key={submission.id} className="profile-submissions__item">
              <ProfileSubmissionCard
                submission={submission}
                isNew={submission.id === highlightedId}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

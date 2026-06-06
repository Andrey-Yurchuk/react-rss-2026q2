import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_PROFILE_IMAGE_SIZE_BYTES,
  PROFILE_COUNTRIES,
} from '../../constants/profileForm';
import {
  selectSubmissions,
  useFormSubmissionsStore,
} from '../../store/formSubmissionsStore';
import { fireEvent, render, screen, waitFor } from '../../test-utils/render';
import { ReactHookProfileForm } from './ReactHookProfileForm';

function createPngFile(size = 4, name = 'avatar.png'): File {
  return new File([new Uint8Array(size)], name, { type: 'image/png' });
}

function assignFileToInput(input: HTMLInputElement, file: File) {
  const fileList = Object.assign([file], {
    item: (index: number) => fileList[index] ?? null,
  });

  Object.defineProperty(input, 'files', {
    configurable: true,
    value: fileList,
  });
}

function resetStore() {
  useFormSubmissionsStore.setState({
    countries: [...PROFILE_COUNTRIES],
    submissions: [],
    lastSubmissionId: null,
  });
}

type FillRhfFormOptions = {
  confirmPassword?: string;
  country?: string;
  email?: string;
  image?: File;
  name?: string;
  skipImage?: boolean;
};

async function assignImage(
  user: ReturnType<typeof userEvent.setup>,
  file: File
) {
  const imageInput = screen.getByLabelText(
    'Profile image'
  ) as HTMLInputElement;

  if (file.type === 'image/png' || file.type === 'image/jpeg') {
    await user.upload(imageInput, file);
    return;
  }

  assignFileToInput(imageInput, file);
  fireEvent.change(imageInput, {
    target: {
      files: [file],
    },
  });
}

async function fillRhfForm(
  user: ReturnType<typeof userEvent.setup>,
  options: FillRhfFormOptions = {}
) {
  await user.type(screen.getByLabelText('Name'), options.name ?? 'Alice');
  await user.type(screen.getByLabelText('Age'), '28');
  await user.type(
    screen.getByLabelText('Email'),
    options.email ?? 'alice@example.com'
  );
  await user.selectOptions(screen.getByLabelText('Gender'), 'female');
  await user.click(
    screen.getByLabelText('I accept the Terms and Conditions')
  );

  if (!options.skipImage) {
    await assignImage(user, options.image ?? createPngFile());
  }

  await user.type(screen.getByLabelText('Password'), 'Secret1@');
  await user.type(
    screen.getByLabelText('Confirm password'),
    options.confirmPassword ?? 'Secret1@'
  );
  await user.type(
    screen.getByLabelText('Country'),
    options.country ?? 'Poland'
  );
}

describe('ReactHookProfileForm', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders all fields and labels', () => {
    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(
      screen.getByLabelText('I accept the Terms and Conditions')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Profile image')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
  });

  it('keeps submit disabled while the form is empty or invalid', () => {
    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeDisabled();
  });

  it('shows live validation errors for invalid email', async () => {
    const user = userEvent.setup();

    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('Email'), 'alice@example');

    await waitFor(() => {
      expect(screen.getByText('Email format is invalid')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeDisabled();
  });

  it('rejects a name that does not start with an uppercase letter', async () => {
    const user = userEvent.setup();

    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    await fillRhfForm(user, { name: 'alice' });

    await waitFor(() => {
      expect(
        screen.getByText('Name must start with an uppercase letter')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeDisabled();
  });

  it('rejects a negative age with live validation', async () => {
    const user = userEvent.setup();

    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    await fillRhfForm(user);
    await user.clear(screen.getByLabelText('Age'));
    await user.type(screen.getByLabelText('Age'), '-1');

    await waitFor(() => {
      expect(screen.getByText('Age cannot be negative')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeDisabled();
  });

  it('rejects mismatched passwords with live validation', async () => {
    const user = userEvent.setup();

    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    await fillRhfForm(user, { confirmPassword: 'Different1@' });

    await waitFor(() => {
      expect(screen.getByText('Passwords must match')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeDisabled();
  });

  it('rejects an unsupported image type with live validation', async () => {
    const user = userEvent.setup();

    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    await fillRhfForm(user, {
      image: new File(['gif'], 'avatar.gif', { type: 'image/gif' }),
    });

    await waitFor(() => {
      expect(
        screen.getByText('Image must be a PNG or JPEG file')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeDisabled();
  });

  it('rejects an oversized image with live validation', async () => {
    const user = userEvent.setup();

    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    await fillRhfForm(user, {
      image: createPngFile(MAX_PROFILE_IMAGE_SIZE_BYTES + 1),
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          `Image must be ${MAX_PROFILE_IMAGE_SIZE_BYTES} bytes or smaller`
        )
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeDisabled();
  });

  it('rejects a country that is not in the store list', async () => {
    const user = userEvent.setup();

    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    await fillRhfForm(user, { country: 'Atlantis' });

    await waitFor(() => {
      expect(
        screen.getByText('Country must be selected from the list')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeDisabled();
  });

  it('rejects unchecked terms with live validation', async () => {
    const user = userEvent.setup();

    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    await fillRhfForm(user);
    await user.click(
      screen.getByLabelText('I accept the Terms and Conditions')
    );

    await waitFor(() => {
      expect(
        screen.getByText('Terms and Conditions must be accepted')
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeDisabled();
  });

  it('updates password strength indicator through watch', async () => {
    const user = userEvent.setup();

    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('Password'), 'Aa1!');

    await waitFor(() => {
      expect(screen.getByText('1 number')).toHaveClass(
        'password-strength__item--met'
      );
      expect(screen.getByText('1 special character')).toHaveClass(
        'password-strength__item--met'
      );
    });
  });

  it('enables submit after the form becomes valid', async () => {
    const user = userEvent.setup();

    render(<ReactHookProfileForm onSuccess={vi.fn()} />);

    await fillRhfForm(user);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /submit profile/i })
      ).toBeEnabled();
    });
  });

  it('submits valid data, stores submission, resets the form and calls onSuccess', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(<ReactHookProfileForm onSuccess={onSuccess} />);

    await fillRhfForm(user);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /submit profile/i })
      ).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: /submit profile/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    const [submission] = selectSubmissions(useFormSubmissionsStore.getState());

    expect(submission).toMatchObject({
      source: 'react-hook-form',
      name: 'Alice',
      age: 28,
      email: 'alice@example.com',
      gender: 'female',
      termsAccepted: true,
      imageName: 'avatar.png',
      country: 'Poland',
    });
    expect(submission.imageBase64).toMatch(/^data:image\/png;base64,/);
    expect(submission).not.toHaveProperty('password');
    expect(submission).not.toHaveProperty('confirmPassword');

    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('Confirm password')).toHaveValue('');
    expect(screen.getByLabelText('Country')).toHaveValue('');
    expect(
      screen.getByLabelText('I accept the Terms and Conditions')
    ).not.toBeChecked();
    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeDisabled();
  });
});

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
import { render, screen, waitFor } from '../../test-utils/render';
import { UncontrolledProfileForm } from './UncontrolledProfileForm';

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

type FillBaseFormOptions = {
  confirmPassword?: string;
  country?: string;
  email?: string;
  image?: File;
  name?: string;
  skipImage?: boolean;
};

async function fillBaseForm(
  user: ReturnType<typeof userEvent.setup>,
  options: FillBaseFormOptions = {}
) {
  await user.type(
    screen.getByLabelText('Name'),
    options.name ?? 'Alice'
  );
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
    const imageInput = screen.getByLabelText(
      'Profile image'
    ) as HTMLInputElement;
    assignFileToInput(imageInput, options.image ?? createPngFile());
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

describe('UncontrolledProfileForm', () => {
  beforeEach(() => {
    resetStore();
  });

  it('renders all fields and labels', () => {
    render(<UncontrolledProfileForm onSuccess={vi.fn()} />);

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
    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeEnabled();
  });

  it('shows validation errors when an empty form is submitted', async () => {
    const user = userEvent.setup();

    render(<UncontrolledProfileForm onSuccess={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /submit profile/i }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Image is required')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /submit profile/i })
    ).toBeEnabled();
  });

  it('updates the password strength indicator while typing without controlling the input', async () => {
    const user = userEvent.setup();

    render(<UncontrolledProfileForm onSuccess={vi.fn()} />);

    await user.type(screen.getByLabelText('Password'), 'Aa1!');

    expect(screen.getByText('1 number')).toHaveClass(
      'password-strength__item--met'
    );
    expect(screen.getByText('1 special character')).toHaveClass(
      'password-strength__item--met'
    );
  });

  it('rejects an invalid email on submit', async () => {
    const user = userEvent.setup();

    render(<UncontrolledProfileForm onSuccess={vi.fn()} />);

    await fillBaseForm(user, { email: 'alice@example' });
    await user.click(screen.getByRole('button', { name: /submit profile/i }));

    expect(screen.getByText('Email format is invalid')).toBeInTheDocument();
  });

  it('rejects a name that does not start with an uppercase letter', async () => {
    const user = userEvent.setup();

    render(<UncontrolledProfileForm onSuccess={vi.fn()} />);

    await fillBaseForm(user, { name: 'alice' });
    await user.click(screen.getByRole('button', { name: /submit profile/i }));

    expect(
      screen.getByText('Name must start with an uppercase letter')
    ).toBeInTheDocument();
  });

  it('rejects a negative age on submit', async () => {
    const user = userEvent.setup();

    render(<UncontrolledProfileForm onSuccess={vi.fn()} />);

    await fillBaseForm(user);
    await user.clear(screen.getByLabelText('Age'));
    await user.type(screen.getByLabelText('Age'), '-1');
    await user.click(screen.getByRole('button', { name: /submit profile/i }));

    expect(screen.getByText('Age cannot be negative')).toBeInTheDocument();
  });

  it('rejects mismatched passwords on submit', async () => {
    const user = userEvent.setup();

    render(<UncontrolledProfileForm onSuccess={vi.fn()} />);

    await fillBaseForm(user, { confirmPassword: 'Different1@' });
    await user.click(screen.getByRole('button', { name: /submit profile/i }));

    expect(screen.getByText('Passwords must match')).toBeInTheDocument();
  });

  it('rejects an unsupported image type on submit', async () => {
    const user = userEvent.setup();

    render(<UncontrolledProfileForm onSuccess={vi.fn()} />);

    await fillBaseForm(user, {
      image: new File(['gif'], 'avatar.gif', { type: 'image/gif' }),
    });
    await user.click(screen.getByRole('button', { name: /submit profile/i }));

    expect(
      screen.getByText('Image must be a PNG or JPEG file')
    ).toBeInTheDocument();
  });

  it('rejects an oversized image on submit', async () => {
    const user = userEvent.setup();

    render(<UncontrolledProfileForm onSuccess={vi.fn()} />);

    await fillBaseForm(user, {
      image: createPngFile(MAX_PROFILE_IMAGE_SIZE_BYTES + 1),
    });
    await user.click(screen.getByRole('button', { name: /submit profile/i }));

    expect(
      screen.getByText(
        `Image must be ${MAX_PROFILE_IMAGE_SIZE_BYTES} bytes or smaller`
      )
    ).toBeInTheDocument();
  });

  it('rejects a country that is not in the store list', async () => {
    const user = userEvent.setup();

    render(<UncontrolledProfileForm onSuccess={vi.fn()} />);

    await fillBaseForm(user, { country: 'Atlantis' });
    await user.click(screen.getByRole('button', { name: /submit profile/i }));

    expect(
      screen.getByText('Country must be selected from the list')
    ).toBeInTheDocument();
  });

  it('rejects unchecked terms on submit', async () => {
    const user = userEvent.setup();

    render(<UncontrolledProfileForm onSuccess={vi.fn()} />);

    await fillBaseForm(user);
    await user.click(
      screen.getByLabelText('I accept the Terms and Conditions')
    );
    await user.click(screen.getByRole('button', { name: /submit profile/i }));

    expect(
      screen.getByText('Terms and Conditions must be accepted')
    ).toBeInTheDocument();
  });

  it('submits valid data, stores submission, resets the form and calls onSuccess', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(<UncontrolledProfileForm onSuccess={onSuccess} />);

    await fillBaseForm(user);
    await user.click(screen.getByRole('button', { name: /submit profile/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

    const [submission] = selectSubmissions(useFormSubmissionsStore.getState());

    expect(submission).toMatchObject({
      source: 'uncontrolled',
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
  });
});

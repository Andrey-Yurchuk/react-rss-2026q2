import { describe, expect, it } from 'vitest';
import { render, screen } from '../../test-utils/render';
import {
  ProfileCountryAutocompleteField,
  ProfileImageUploadField,
  ProfileTextField,
} from './ProfileFormFields';

describe('ProfileFormFields', () => {
  it('associates text field label with input through htmlFor and id', () => {
    render(
      <ProfileTextField id="profile-name" name="name" label="Name" />
    );

    const input = screen.getByLabelText('Name');

    expect(input).toHaveAttribute('id', 'profile-name');
    expect(input).toHaveAttribute('name', 'name');
  });

  it('renders field error and links it with aria-describedby', () => {
    render(
      <ProfileTextField
        id="profile-email"
        name="email"
        label="Email"
        type="email"
        error="Email format is invalid"
      />
    );

    const input = screen.getByLabelText('Email');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'profile-email-error');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Email format is invalid'
    );
  });

  it('reserves error space without aria-describedby when there is no error', () => {
    render(
      <ProfileTextField id="profile-age" name="age" label="Age" type="number" />
    );

    const input = screen.getByLabelText('Age');

    expect(input).not.toHaveAttribute('aria-describedby');
    expect(document.getElementById('profile-age-error')).toHaveClass(
      'profile-field__error'
    );
  });

  it('renders country autocomplete options from props', () => {
    render(
      <ProfileCountryAutocompleteField
        id="profile-country"
        name="country"
        label="Country"
        countries={['Poland', 'Ukraine']}
        listId="profile-country-options"
      />
    );

    const datalist = document.getElementById('profile-country-options');

    expect(datalist).not.toBeNull();
    expect(datalist?.querySelectorAll('option')).toHaveLength(2);
    expect(screen.getByLabelText('Country')).toHaveAttribute(
      'list',
      'profile-country-options'
    );
  });

  it('renders image upload input with file type and png/jpeg accept', () => {
    render(
      <ProfileImageUploadField
        id="profile-image"
        name="image"
        label="Profile image"
      />
    );

    const input = screen.getByLabelText('Profile image');

    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', 'image/png,image/jpeg,.png,.jpg,.jpeg');
  });
});

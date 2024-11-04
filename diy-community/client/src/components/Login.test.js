import { render, screen } from '@testing-library/react';
import Login from './Login';

test('renders login form', () => {
  render(<Login />);
  const usernameInput = screen.getByPlaceholderText(/Benutzername/i);
  const passwordInput = screen.getByPlaceholderText(/Passwort/i);
  const submitButton = screen.getByText(/Anmelden/i);

  expect(usernameInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();
});

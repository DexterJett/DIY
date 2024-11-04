import { render, screen, fireEvent } from '@testing-library/react';
import Register from './Register';

describe('Register Component', () => {
  test('renders register form', () => {
    render(<Register />);
    
    const usernameInput = screen.getByPlaceholderText(/Benutzername/i);
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Passwort/i);
    const submitButton = screen.getByText(/Registrieren/i);

    expect(usernameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  test('updates form data on input change', () => {
    render(<Register />);
    
    const usernameInput = screen.getByPlaceholderText(/Benutzername/i);
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Passwort/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('password123');
  });
});


import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProfile from './EditProfile';

// Mock für window.alert
window.alert = jest.fn();

// Verbesserte Mock-Implementierung für fetch
const mockFetch = jest.fn();

beforeEach(() => {
  // Setup der fetch-Mock-Implementierung für jeden Test
  mockFetch.mockImplementation(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ username: 'testuser', email: 'test@test.com' })
    })
  );
  global.fetch = mockFetch;
  localStorage.setItem('token', 'fake-token');
});

afterEach(() => {
  localStorage.clear();
  mockFetch.mockClear();
  window.alert.mockClear();
});

describe('EditProfile Component', () => {
  test('loads and displays user data', async () => {
    render(<EditProfile />);
    
    await waitFor(() => {
      const usernameInput = screen.getByPlaceholderText(/Benutzername/i);
      expect(usernameInput).toHaveValue('testuser');
    });
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    expect(emailInput).toHaveValue('test@test.com');
  });

  test('handles form submission', async () => {
    render(<EditProfile />);
    
    await waitFor(() => {
      const usernameInput = screen.getByPlaceholderText(/Benutzername/i);
      expect(usernameInput).toHaveValue('testuser');
    });

    const submitButton = screen.getByText(/Aktualisieren/i);
    const usernameInput = screen.getByPlaceholderText(/Benutzername/i);
    const emailInput = screen.getByPlaceholderText(/Email/i);

    // Ändere die Formularwerte
    fireEvent.change(usernameInput, { target: { value: 'neueruser' } });
    fireEvent.change(emailInput, { target: { value: 'neu@test.com' } });
    
    // Simuliere erfolgreiche Aktualisierung
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'success' })
      })
    );

    // Submit das Formular
    fireEvent.click(submitButton);

    // Warte auf den Alert
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Profil erfolgreich aktualisiert');
    });
    expect(mockFetch).toHaveBeenCalledWith('/profile', expect.any(Object));
  });
});

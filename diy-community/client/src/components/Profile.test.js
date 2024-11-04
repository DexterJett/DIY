import { render, screen } from '@testing-library/react';
import Profile from './Profile';

// Verbesserte Mock-Implementierung für fetch
const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockImplementation(() => 
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        username: 'testuser',
        email: 'test@test.com'
      })
    })
  );
  global.fetch = mockFetch;
  localStorage.setItem('token', 'fake-token');
});

afterEach(() => {
  localStorage.clear();
  mockFetch.mockClear();
  jest.clearAllMocks();
});

describe('Profile Component', () => {
  test('renders loading state initially', () => {
    render(<Profile />);
    expect(screen.getByText(/Lade Profil/i)).toBeInTheDocument();
  });

  test('renders profile data after loading', async () => {
    render(<Profile />);

    // Warte auf den Username
    await screen.findByText(/testuser/);

    // Prüfe die Email
    expect(screen.getByText(/test@test.com/)).toBeInTheDocument();

    // Überprüfe den fetch-Aufruf
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/profile', {
      headers: {
        'Authorization': 'Bearer fake-token'
      }
    });
  });
});

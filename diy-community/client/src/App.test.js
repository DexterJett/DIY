import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Willkommen zur DIY Community/i);
  expect(welcomeElement).toBeInTheDocument();
});

test('renders navigation links', () => {
  render(<App />);
  const registerLink = screen.getByText(/^Registrieren$/i);
  const loginLink = screen.getByText(/^Anmelden$/i);
  const profileLink = screen.getByText(/^Profil$/i);
  const editProfileLink = screen.getByText(/^Profil bearbeiten$/i);
  const uploadProfilePicLink = screen.getByText(/^Profilbild hochladen$/i);
  const linkYouTubeVideoLink = screen.getByText(/^YouTube Video verknüpfen$/i);

  expect(registerLink).toBeInTheDocument();
  expect(loginLink).toBeInTheDocument();
  expect(profileLink).toBeInTheDocument();
  expect(editProfileLink).toBeInTheDocument();
  expect(uploadProfilePicLink).toBeInTheDocument();
  expect(linkYouTubeVideoLink).toBeInTheDocument();
});

test('renders home component', () => {
  render(<App />);
  const homeHeading = screen.getByText(/Willkommen zur Startseite/i);
  expect(homeHeading).toBeInTheDocument();
});

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import UploadProfilePic from './components/UploadProfilePic';
import LinkYouTubeVideo from './components/LinkYouTubeVideo';

function App() {
  return (
    <Router>
      <div className="min-vh-100 d-flex flex-column">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/upload-profile-pic" element={<UploadProfilePic />} />
            <Route path="/link-youtube-video" element={<LinkYouTubeVideo />} />
          </Routes>
        </main>
        <footer className="bg-light py-3 mt-auto">
          <div className="container text-center">
            <p className="text-muted mb-0">
              © 2024 DIY Community. Alle Rechte vorbehalten.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setIsLoggedIn(true);
            setUsername(data.username);
          } else {
            handleLogout();
          }
        } catch (error) {
          handleLogout();
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, [location.pathname, handleLogout]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-tools me-2"></i>
          DIY Community
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                to="/"
              >
                <i className="bi bi-house-door me-1"></i>
                Start
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}
                to="/projects"
              >
                <i className="bi bi-grid me-1"></i>
                Projekte
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`}
                to="/community"
              >
                <i className="bi bi-people me-1"></i>
                Community
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            {isLoggedIn ? (
              <div className="dropdown">
                <button
                  className="btn btn-primary dropdown-toggle d-flex align-items-center"
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-expanded={showDropdown}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  {username}
                </button>
                <ul className={`dropdown-menu dropdown-menu-end ${showDropdown ? 'show' : ''}`}>
                  <li>
                    <Link 
                      className="dropdown-item" 
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                    >
                      <i className="bi bi-person me-2"></i>
                      Mein Profil
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className="dropdown-item" 
                      to="/my-projects"
                      onClick={() => setShowDropdown(false)}
                    >
                      <i className="bi bi-folder me-2"></i>
                      Meine Projekte
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className="dropdown-item" 
                      to="/settings"
                      onClick={() => setShowDropdown(false)}
                    >
                      <i className="bi bi-gear me-2"></i>
                      Einstellungen
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Abmelden
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link 
                  to="/login" 
                  className="btn btn-outline-light"
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Anmelden
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-light"
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Registrieren
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

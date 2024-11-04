import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Benutzername ist erforderlich';
    if (!formData.password) newErrors.password = 'Passwort ist erforderlich';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/profile');
      } else {
        setErrors({ submit: data.error || 'Login fehlgeschlagen' });
      }
    } catch (error) {
      setErrors({ submit: 'Netzwerkfehler beim Login' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Anmelden</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Benutzername</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    onChange={handleChange}
                    value={formData.username}
                    placeholder="Benutzername eingeben"
                    disabled={isLoading}
                  />
                  {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Passwort</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    onChange={handleChange}
                    value={formData.password}
                    placeholder="Passwort eingeben"
                    disabled={isLoading}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                {errors.submit && (
                  <div className="alert alert-danger" role="alert">
                    {errors.submit}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Anmelden...
                    </>
                  ) : (
                    'Anmelden'
                  )}
                </button>

                <div className="text-center">
                  <button 
                    type="button" 
                    className="btn btn-link"
                    onClick={() => navigate('/register')}
                    disabled={isLoading}
                  >
                    Noch kein Konto? Jetzt registrieren
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

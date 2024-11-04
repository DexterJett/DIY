import React, { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Lösche Fehler beim Tippen
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Benutzername ist erforderlich';
    if (!formData.email) newErrors.email = 'Email ist erforderlich';
    if (!formData.password) newErrors.password = 'Passwort ist erforderlich';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Registrierung erfolgreich');
      } else {
        const data = await response.json();
        setErrors({ submit: data.error || 'Registrierung fehlgeschlagen' });
      }
    } catch (error) {
      setErrors({ submit: 'Netzwerkfehler' });
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Registrierung</h2>
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
                    placeholder="Benutzername"
                  />
                  {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    onChange={handleChange}
                    value={formData.email}
                    placeholder="Email"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
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
                    placeholder="Passwort"
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                {errors.submit && (
                  <div className="alert alert-danger" role="alert">
                    {errors.submit}
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100">
                  Registrieren
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

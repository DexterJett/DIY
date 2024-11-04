import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    interests: '',
    website: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Fehler beim Laden des Profils');
        }

        const data = await response.json();
        setFormData(prevData => ({
          ...prevData,
          ...data,
          interests: Array.isArray(data.interests) ? data.interests.join(', ') : data.interests
        }));
      } catch (error) {
        setErrors({ fetch: `Fehler beim Laden der Profildaten: ${error.message}` });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username?.trim()) {
      newErrors.username = 'Benutzername ist erforderlich';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Benutzername muss mindestens 3 Zeichen lang sein';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige Email-Adresse';
    }

    if (formData.website && !/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/.test(formData.website)) {
      newErrors.website = 'Ungültige Website-URL';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio darf maximal 500 Zeichen lang sein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          interests: formData.interests?.split(',').map(i => i.trim()).filter(Boolean)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Aktualisieren des Profils');
      }

      setSuccessMessage('Profil erfolgreich aktualisiert');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
        <p className="mt-2">Lade Profildaten...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Profil bearbeiten</h2>

              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}

              {errors.fetch && (
                <div className="alert alert-danger" role="alert">
                  {errors.fetch}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Benutzername*</label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email*</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">Über mich</label>
                  <textarea
                    className="form-control"
                    id="bio"
                    name="bio"
                    rows="3"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="Erzähle etwas über dich..."
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="interests" className="form-label">Interessen</label>
                  <input
                    type="text"
                    className="form-control"
                    id="interests"
                    name="interests"
                    value={formData.interests || ''}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="z.B. Holzarbeiten, Elektronik, 3D-Druck"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="website" className="form-label">Website</label>
                  <input
                    type="url"
                    className={`form-control ${errors.website ? 'is-invalid' : ''}`}
                    id="website"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="https://..."
                  />
                  {errors.website && (
                    <div className="invalid-feedback">{errors.website}</div>
                  )}
                </div>

                {errors.submit && (
                  <div className="alert alert-danger" role="alert">
                    {errors.submit}
                  </div>
                )}

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/profile')}
                    disabled={saving}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Speichern...
                      </>
                    ) : (
                      'Speichern'
                    )}
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

export default EditProfile;

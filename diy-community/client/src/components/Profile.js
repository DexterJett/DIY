import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
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
        setProfile(data);
        setError(null);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Laden...</span>
          </div>
          <p className="mt-2">Lade Profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Fehler!</h4>
          <p>{error}</p>
          <hr />
          <button 
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <div className="text-center mb-4">
                {profile?.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt="Profilbild"
                    className="rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="bg-secondary rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '150px', height: '150px' }}
                  >
                    <i className="bi bi-person-fill text-white" style={{ fontSize: '4rem' }}></i>
                  </div>
                )}
                <h2 className="card-title">{profile?.username}</h2>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Kontaktinformationen</h5>
                      <p className="card-text">
                        <strong>Email:</strong> {profile?.email}
                      </p>
                      <p className="card-text">
                        <strong>Mitglied seit:</strong> {
                          new Date(profile?.createdAt).toLocaleDateString('de-DE')
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">DIY-Aktivitäten</h5>
                      <p className="card-text">
                        <strong>Projekte:</strong> {profile?.projects?.length || 0}
                      </p>
                      <p className="card-text">
                        <strong>Kommentare:</strong> {profile?.comments?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-2 mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/edit-profile')}
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Profil bearbeiten
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/upload-profile-pic')}
                >
                  <i className="bi bi-camera me-2"></i>
                  Profilbild ändern
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function UploadProfilePic() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        setError('Die Datei ist zu groß. Maximale Größe ist 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Bitte wählen Sie eine Bilddatei aus.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      
      // Erstelle Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);
    return interval;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Bitte wählen Sie zuerst ein Bild aus.');
      return;
    }

    setUploading(true);
    setError(null);
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('profilePic', selectedFile);

      const response = await fetch('/upload-profile-pic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Fehler beim Hochladen des Bildes');
      }

      setProgress(100);
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      setError(error.message);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Profilbild hochladen</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="text-center mb-4">
                {preview ? (
                  <img
                    src={preview}
                    alt="Vorschau"
                    className="rounded-circle mb-3"
                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '200px', height: '200px' }}
                  >
                    <i className="bi bi-camera" style={{ fontSize: '3rem' }}></i>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <input
                  type="file"
                  className="d-none"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                />
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                  >
                    <i className="bi bi-image me-2"></i>
                    Bild auswählen
                  </button>
                </div>
                <small className="text-muted d-block text-center mt-2">
                  Maximale Dateigröße: 5MB
                </small>
              </div>

              {selectedFile && (
                <div className="mb-4">
                  <p className="text-center mb-2">
                    Ausgewählte Datei: {selectedFile.name}
                  </p>
                  {progress > 0 && (
                    <div className="progress mb-3">
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {progress}%
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/profile')}
                  disabled={uploading}
                >
                  Abbrechen
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Hochladen...
                    </>
                  ) : (
                    'Hochladen'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadProfilePic;

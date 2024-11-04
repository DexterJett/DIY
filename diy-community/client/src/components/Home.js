import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [featuredResponse, recentResponse] = await Promise.all([
          fetch('/api/projects/featured'),
          fetch('/api/projects/recent')
        ]);

        if (!featuredResponse.ok || !recentResponse.ok) {
          throw new Error('Fehler beim Laden der Projekte');
        }

        const [featuredData, recentData] = await Promise.all([
          featuredResponse.json(),
          recentResponse.json()
        ]);

        setFeaturedProjects(featuredData);
        setRecentProjects(recentData);
      } catch (error) {
        setError('Fehler beim Laden der Projekte');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Hero Section */}
      <div className="p-5 mb-4 bg-primary bg-gradient text-white rounded-3">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">Willkommen in der DIY Community</h1>
          <p className="col-md-8 fs-4">
            Entdecke spannende DIY-Projekte, teile deine Erfahrungen und verbinde dich mit anderen Bastlern.
          </p>
          <Link to="/projects/new" className="btn btn-light btn-lg">
            <i className="bi bi-plus-circle me-2"></i>
            Projekt erstellen
          </Link>
        </div>
      </div>

      {/* Featured Projects */}
      <section className="mb-5">
        <h2 className="mb-4">
          <i className="bi bi-star-fill text-warning me-2"></i>
          Ausgewählte Projekte
        </h2>
        {error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {featuredProjects.map(project => (
              <div key={project.id} className="col">
                <div className="card h-100 shadow-sm">
                  {project.image && (
                    <img
                      src={project.image}
                      className="card-img-top"
                      alt={project.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{project.title}</h5>
                    <p className="card-text text-muted">{project.description.substring(0, 100)}...</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="btn-group">
                        <Link to={`/projects/${project.id}`} className="btn btn-sm btn-outline-primary">
                          Mehr lesen
                        </Link>
                      </div>
                      <small className="text-muted">
                        <i className="bi bi-heart-fill text-danger me-1"></i>
                        {project.likes}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Projects */}
      <section className="mb-5">
        <h2 className="mb-4">
          <i className="bi bi-clock-history me-2"></i>
          Neueste Projekte
        </h2>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {recentProjects.map(project => (
            <div key={project.id} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{project.title}</h5>
                  <p className="card-text small text-muted">
                    {project.description.substring(0, 60)}...
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <Link to={`/projects/${project.id}`} className="btn btn-sm btn-outline-primary">
                      Ansehen
                    </Link>
                    <small className="text-muted">
                      {new Date(project.createdAt).toLocaleDateString('de-DE')}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-5">
        <h2 className="mb-4">
          <i className="bi bi-grid me-2"></i>
          Kategorien
        </h2>
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
          {[
            { name: 'Holzarbeiten', icon: 'tree' },
            { name: 'Elektronik', icon: 'cpu' },
            { name: '3D-Druck', icon: 'printer' },
            { name: 'Garten', icon: 'flower1' },
            { name: 'Heimwerken', icon: 'tools' },
            { name: 'Upcycling', icon: 'recycle' },
            { name: 'Basteln', icon: 'brush' },
            { name: 'Nähen', icon: 'scissors' }
          ].map(category => (
            <div key={category.name} className="col">
              <Link 
                to={`/projects/category/${category.name.toLowerCase()}`}
                className="card h-100 text-decoration-none text-dark hover-shadow"
              >
                <div className="card-body text-center">
                  <i className={`bi bi-${category.icon} display-4 mb-2`}></i>
                  <h5 className="card-title mb-0">{category.name}</h5>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Community Stats */}
      <section className="bg-light rounded p-4 mb-5">
        <h2 className="mb-4">
          <i className="bi bi-graph-up me-2"></i>
          Community Statistiken
        </h2>
        <div className="row text-center">
          <div className="col-md-3 mb-3 mb-md-0">
            <h3 className="display-4 fw-bold text-primary">1.2K</h3>
            <p className="text-muted mb-0">Aktive Mitglieder</p>
          </div>
          <div className="col-md-3 mb-3 mb-md-0">
            <h3 className="display-4 fw-bold text-primary">3.4K</h3>
            <p className="text-muted mb-0">Projekte</p>
          </div>
          <div className="col-md-3 mb-3 mb-md-0">
            <h3 className="display-4 fw-bold text-primary">12K</h3>
            <p className="text-muted mb-0">Kommentare</p>
          </div>
          <div className="col-md-3">
            <h3 className="display-4 fw-bold text-primary">45K</h3>
            <p className="text-muted mb-0">Likes</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

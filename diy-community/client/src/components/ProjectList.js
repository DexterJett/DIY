import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || ''
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          page,
          category: filters.category,
          sort: filters.sort,
          search: filters.search
        });

        const response = await fetch(`/api/projects?${queryParams}`);
        if (!response.ok) throw new Error('Fehler beim Laden der Projekte');

        const data = await response.json();
        setProjects(prev => page === 1 ? data.projects : [...prev, ...data.projects]);
        setHasMore(data.hasMore);
        setError(null);
      } catch (err) {
        setError('Fehler beim Laden der Projekte');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [page, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
    setSearchParams({ ...filters, ...newFilters });
  };

  const categories = [
    { id: 'holzarbeiten', name: 'Holzarbeiten', icon: 'tree' },
    { id: 'elektronik', name: 'Elektronik', icon: 'cpu' },
    { id: '3d-druck', name: '3D-Druck', icon: 'printer' },
    { id: 'garten', name: 'Garten', icon: 'flower1' },
    { id: 'heimwerken', name: 'Heimwerken', icon: 'tools' },
    { id: 'upcycling', name: 'Upcycling', icon: 'recycle' },
    { id: 'basteln', name: 'Basteln', icon: 'brush' },
    { id: 'naehen', name: 'Nähen', icon: 'scissors' }
  ];

  return (
    <div className="container mt-4">
      {/* Filter Section */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Projekte suchen..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
            />
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <select
            className="form-select"
            value={filters.category}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
          >
            <option value="">Alle Kategorien</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-3">
          <select
            className="form-select"
            value={filters.sort}
            onChange={(e) => handleFilterChange({ sort: e.target.value })}
          >
            <option value="newest">Neueste zuerst</option>
            <option value="popular">Beliebteste zuerst</option>
            <option value="comments">Meist kommentiert</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {projects.map(project => (
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
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{project.title}</h5>
                      <span className={`badge bg-${categories.find(c => c.id === project.category)?.color || 'secondary'}`}>
                        {categories.find(c => c.id === project.category)?.name}
                      </span>
                    </div>
                    <p className="card-text text-muted">{project.description.substring(0, 100)}...</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <Link to={`/projects/${project.id}`} className="btn btn-outline-primary btn-sm">
                        Mehr lesen
                      </Link>
                      <div className="d-flex gap-3">
                        <small className="text-muted">
                          <i className="bi bi-heart-fill text-danger me-1"></i>
                          {project.likes}
                        </small>
                        <small className="text-muted">
                          <i className="bi bi-chat-fill text-primary me-1"></i>
                          {project.comments}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-transparent">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <img
                          src={project.author.avatar}
                          alt={project.author.username}
                          className="rounded-circle me-2"
                          width="24"
                          height="24"
                        />
                        <small className="text-muted">{project.author.username}</small>
                      </div>
                      <small className="text-muted">
                        {new Date(project.createdAt).toLocaleDateString('de-DE')}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-4">
              <button
                className="btn btn-outline-primary"
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Lade weitere Projekte...
                  </>
                ) : (
                  'Weitere Projekte laden'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProjectList;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { marked } from 'marked'; // Für Markdown-Rendering
import DOMPurify from 'dompurify'; // Für XSS-Schutz

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const [projectResponse, commentsResponse] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch(`/api/projects/${id}/comments`)
        ]);

        if (!projectResponse.ok) throw new Error('Projekt nicht gefunden');
        if (!commentsResponse.ok) throw new Error('Fehler beim Laden der Kommentare');

        const [projectData, commentsData] = await Promise.all([
          projectResponse.json(),
          commentsResponse.json()
        ]);

        setProject(projectData);
        setComments(commentsData);
        setIsLiked(projectData.isLikedByUser);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  const handleLike = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Fehler beim Liken/Unliken');

      setIsLiked(!isLiked);
      setProject(prev => ({
        ...prev,
        likes: isLiked ? prev.likes - 1 : prev.likes + 1
      }));
    } catch (error) {
      alert('Fehler beim Liken/Unliken des Projekts');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (!response.ok) throw new Error('Fehler beim Kommentieren');

      const comment = await response.json();
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      alert('Fehler beim Erstellen des Kommentars');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Project Header */}
          <div className="mb-4">
            <h1 className="display-5 mb-3">{project.title}</h1>
            <div className="d-flex align-items-center mb-3">
              <img
                src={project.author.avatar}
                alt={project.author.username}
                className="rounded-circle me-2"
                width="32"
                height="32"
              />
              <span className="me-3">
                von <Link to={`/users/${project.author.id}`}>{project.author.username}</Link>
              </span>
              <span className="text-muted">
                {new Date(project.createdAt).toLocaleDateString('de-DE')}
              </span>
            </div>
            <div className="d-flex gap-2">
              <span className="badge bg-primary">{project.category}</span>
              <span className="badge bg-secondary">
                <i className="bi bi-clock me-1"></i>
                {project.duration}
              </span>
              <span className="badge bg-secondary">
                <i className="bi bi-tools me-1"></i>
                {project.difficulty}
              </span>
            </div>
          </div>

          {/* Project Images */}
          {project.images?.length > 0 && (
            <div className="mb-4">
              <div id="projectCarousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                  {project.images.map((image, index) => (
                    <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                      <img
                        src={image}
                        className="d-block w-100 rounded"
                        alt={`Projekt Bild ${index + 1}`}
                        style={{ maxHeight: '500px', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
                {project.images.length > 1 && (
                  <>
                    <button className="carousel-control-prev" type="button" data-bs-target="#projectCarousel" data-bs-slide="prev">
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Zurück</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#projectCarousel" data-bs-slide="next">
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Weiter</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Project Content */}
          <div className="mb-4">
            <div 
              className="project-content"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(marked(project.content)) 
              }}
            />
          </div>

          {/* Materials & Tools */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-box-seam me-2"></i>
                    Materialien
                  </h5>
                  <ul className="list-group list-group-flush">
                    {project.materials.map((material, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {material.name}
                        <span className="text-muted">{material.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-tools me-2"></i>
                    Werkzeuge
                  </h5>
                  <ul className="list-group list-group-flush">
                    {project.tools.map((tool, index) => (
                      <li key={index} className="list-group-item">
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-4">
            <h3 className="mb-4">Kommentare ({comments.length})</h3>
            
            {/* New Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Schreibe einen Kommentar..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submitting}
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sende...
                  </>
                ) : (
                  'Kommentieren'
                )}
              </button>
            </form>

            {/* Comments List */}
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.username}
                          className="rounded-circle me-2"
                          width="32"
                          height="32"
                        />
                        <div>
                          <Link to={`/users/${comment.author.id}`} className="fw-bold text-decoration-none">
                            {comment.author.username}
                          </Link>
                          <small className="text-muted d-block">
                            {new Date(comment.createdAt).toLocaleDateString('de-DE')}
                          </small>
                        </div>
                      </div>
                    </div>
                    <p className="card-text">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="position-sticky" style={{ top: '2rem' }}>
            {/* Action Buttons */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button
                    className={`btn ${isLiked ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={handleLike}
                  >
                    <i className={`bi bi-heart${isLiked ? '-fill' : ''} me-2`}></i>
                    {project.likes} Likes
                  </button>
                  <button className="btn btn-outline-primary">
                    <i className="bi bi-bookmark me-2"></i>
                    Speichern
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-share me-2"></i>
                    Teilen
                  </button>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Projektinfo</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="bi bi-clock me-2"></i>
                    Dauer: {project.duration}
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-bar-chart me-2"></i>
                    Schwierigkeit: {project.difficulty}
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-currency-euro me-2"></i>
                    Kosten: {project.cost}
                  </li>
                  <li>
                    <i className="bi bi-eye me-2"></i>
                    {project.views} Aufrufe
                  </li>
                </ul>
              </div>
            </div>

            {/* Similar Projects */}
            {project.similarProjects?.length > 0 && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Ähnliche Projekte</h5>
                  <div className="list-group list-group-flush">
                    {project.similarProjects.map(similar => (
                      <Link
                        key={similar.id}
                        to={`/projects/${similar.id}`}
                        className="list-group-item list-group-item-action d-flex align-items-center"
                      >
                        <img
                          src={similar.image}
                          alt={similar.title}
                          className="rounded me-2"
                          width="50"
                          height="50"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <h6 className="mb-0">{similar.title}</h6>
                          <small className="text-muted">
                            von {similar.author.username}
                          </small>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;


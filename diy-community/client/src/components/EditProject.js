import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [materials, setMaterials] = useState([{ name: '', amount: '' }]);
  const [tools, setTools] = useState(['']);
  const [originalData, setOriginalData] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    difficulty: 'mittel',
    duration: '',
    cost: '',
    description: ''
  });

  // Kategorien wie in CreateProject
  const categories = [
    { id: 'holzarbeiten', name: 'Holzarbeiten' },
    { id: 'elektronik', name: 'Elektronik' },
    { id: '3d-druck', name: '3D-Druck' },
    { id: 'garten', name: 'Garten' },
    { id: 'heimwerken', name: 'Heimwerken' },
    { id: 'upcycling', name: 'Upcycling' },
    { id: 'basteln', name: 'Basteln' },
    { id: 'naehen', name: 'Nähen' }
  ];

  // Lade existierendes Projekt
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Keine Berechtigung zum Bearbeiten dieses Projekts');
          }
          throw new Error('Projekt konnte nicht geladen werden');
        }

        const data = await response.json();
        setOriginalData(data);
        setFormData({
          title: data.title,
          category: data.category,
          difficulty: data.difficulty,
          duration: data.duration,
          cost: data.cost,
          description: data.description
        });
        setExistingImages(data.images || []);
        setMaterials(data.materials);
        setTools(data.tools);

        if (editorRef.current) {
          editorRef.current.setContent(data.content);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Handler-Funktionen wie in CreateProject, aber angepasst für das Editieren
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length + newImages.length > 10) {
      alert('Maximal 10 Bilder erlaubt');
      return;
    }

    setNewImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Material und Tool Handler wie in CreateProject

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('cost', formData.cost);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('content', editorRef.current.getContent());
      formDataToSend.append('materials', JSON.stringify(materials));
      formDataToSend.append('tools', JSON.stringify(tools));
      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      newImages.forEach(image => {
        formDataToSend.append('newImages', image);
      });

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Fehler beim Aktualisieren des Projekts');

      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // hasUnsavedChanges mit useCallback wrappen
  const hasUnsavedChanges = useCallback(() => {
    if (!originalData) return false;
    
    return (
      formData.title !== originalData.title ||
      formData.category !== originalData.category ||
      formData.difficulty !== originalData.difficulty ||
      formData.duration !== originalData.duration ||
      formData.cost !== originalData.cost ||
      formData.description !== originalData.description ||
      JSON.stringify(materials) !== JSON.stringify(originalData.materials) ||
      JSON.stringify(tools) !== JSON.stringify(originalData.tools) ||
      JSON.stringify(existingImages) !== JSON.stringify(originalData.images) ||
      newImages.length > 0 ||
      editorRef.current?.getContent() !== originalData.content
    );
  }, [originalData, formData, materials, tools, existingImages, newImages, editorRef]);

  // Warnung bei ungespeicherten Änderungen
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]); // Jetzt nur hasUnsavedChanges als Dependency

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </div>
    );
  }

  // Formular-Teil mit Editor:
  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4">Projekt bearbeiten</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-8">
            {/* Basis-Informationen */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Titel*</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Kurzbeschreibung*</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>

                {/* Kategorie, Schwierigkeit, etc. */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="category" className="form-label">Kategorie*</label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Bitte wählen...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* ... weitere Formularfelder ... */}
                </div>
              </div>
            </div>

            {/* Projektanleitung mit TinyMCE Editor */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Projektanleitung*</h5>
                <Editor
                  apiKey="dzx3pux5g7thkeg0nhejw8uoftxel01aomrlzrgdfqxghnra"
                  onInit={(evt, editor) => editorRef.current = editor}
                  initialValue={originalData?.content || ''}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
                      'emoticons', 'save', 'directionality', 'paste'
                    ],
                    toolbar: 'undo redo | formatselect | ' +
                      'bold italic backcolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | image media table | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                    language: 'de',
                    language_url: '/langs/de.js', // Optional: Wenn du deutsche Sprachdatei hast
                    paste_data_images: true,
                    image_advtab: true,
                    automatic_uploads: true,
                    file_picker_types: 'image',
                    images_upload_handler: async function (blobInfo, progress) {
                      // Hier können wir später die Bildupload-Logik implementieren
                      return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(blobInfo.blob());
                        reader.onload = () => {
                          resolve(reader.result);
                        };
                      });
                    }
                  }}
                />
              </div>
            </div>

            {/* Bilder-Upload Bereich */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Projektbilder</h5>
                
                {/* Existierende Bilder */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <h6>Vorhandene Bilder:</h6>
                    <div className="row row-cols-2 row-cols-md-4 g-3">
                      {existingImages.map((image, index) => (
                        <div key={index} className="col">
                          <div className="position-relative">
                            <img
                              src={image}
                              alt={`Projekt Bild ${index + 1}`}
                              className="img-thumbnail"
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                              onClick={() => removeExistingImage(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Neue Bilder Vorschau */}
                {previewImages.length > 0 && (
                  <div className="mb-4">
                    <h6>Neue Bilder:</h6>
                    <div className="row row-cols-2 row-cols-md-4 g-3">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="col">
                          <div className="position-relative">
                            <img
                              src={preview}
                              alt={`Neue Bild Vorschau ${index + 1}`}
                              className="img-thumbnail"
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                              onClick={() => removeNewImage(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="mt-3">
                  <input
                    type="file"
                    className="d-none"
                    id="projectImages"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageChange}
                  />
                  <label 
                    htmlFor="projectImages" 
                    className="btn btn-outline-primary"
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-cloud-upload me-2"></i>
                    Bilder hinzufügen
                    {existingImages.length + newImages.length > 0 && 
                      ` (${existingImages.length + newImages.length}/10)`
                    }
                  </label>
                </div>
              </div>
            </div>

            {/* Materialien und Werkzeuge */}
            {/* ... wie bereits implementiert ... */}
          </div>

          <div className="col-md-4">
            {/* Materialien und Werkzeuge */}
            {/* ... wie bereits implementiert ... */}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="d-grid gap-2">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving || !hasUnsavedChanges()}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Änderungen werden gespeichert...
              </>
            ) : (
              'Änderungen speichern'
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              if (hasUnsavedChanges() && !window.confirm('Ungespeicherte Änderungen verwerfen?')) {
                return;
              }
              navigate(`/projects/${id}`);
            }}
            disabled={saving}
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProject;

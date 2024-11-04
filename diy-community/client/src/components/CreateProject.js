import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react'; // Für Rich Text Editing

function CreateProject() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [materials, setMaterials] = useState([{ name: '', amount: '' }]);
  const [tools, setTools] = useState(['']);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    difficulty: 'mittel',
    duration: '',
    cost: '',
    description: ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      alert('Maximal 10 Bilder erlaubt');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Erstelle Vorschaubilder
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index, field, value) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;
    setMaterials(newMaterials);
  };

  const addMaterial = () => {
    setMaterials(prev => [...prev, { name: '', amount: '' }]);
  };

  const removeMaterial = (index) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleToolChange = (index, value) => {
    const newTools = [...tools];
    newTools[index] = value;
    setTools(newTools);
  };

  const addTool = () => {
    setTools(prev => [...prev, '']);
  };

  const removeTool = (index) => {
    setTools(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Titel ist erforderlich';
    if (!formData.category) return 'Kategorie ist erforderlich';
    if (!formData.description.trim()) return 'Beschreibung ist erforderlich';
    if (!editorRef.current?.getContent()) return 'Projektanleitung ist erforderlich';
    if (materials.some(m => !m.name.trim())) return 'Alle Materialien müssen einen Namen haben';
    if (tools.some(t => !t.trim())) return 'Alle Werkzeuge müssen einen Namen haben';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
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

      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Fehler beim Erstellen des Projekts');

      const data = await response.json();
      navigate(`/projects/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <h1 className="mb-4">Neues Projekt erstellen</h1>

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
                <h5 className="card-title mb-4">Basis-Informationen</h5>
                
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Projekttitel*</label>
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
                      <option value="">Kategorie wählen</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="difficulty" className="form-label">Schwierigkeitsgrad</label>
                    <select
                      className="form-select"
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                    >
                      <option value="einfach">Einfach</option>
                      <option value="mittel">Mittel</option>
                      <option value="schwer">Schwer</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="duration" className="form-label">Zeitaufwand</label>
                    <input
                      type="text"
                      className="form-control"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="z.B. 2-3 Stunden"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="cost" className="form-label">Ungefähre Kosten</label>
                    <input
                      type="text"
                      className="form-control"
                      id="cost"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      placeholder="z.B. 50-100€"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Kurzbeschreibung*</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Bilder Upload */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Projektbilder</h5>
                
                <div className="mb-3">
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  <small className="text-muted">Maximal 10 Bilder (jpg, png)</small>
                </div>

                {previewImages.length > 0 && (
                  <div className="row g-2">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="col-md-3">
                        <div className="position-relative">
                          <img
                            src={preview}
                            alt={`Vorschau ${index + 1}`}
                            className="img-fluid rounded"
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                            onClick={() => removeImage(index)}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Projektanleitung */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Projektanleitung*</h5>
                
                <Editor
                  onInit={(evt, editor) => editorRef.current = editor}
                  init={{
                    height: 500,
                    menubar: false,
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks | ' +
                      'bold italic forecolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'removeformat | help',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-md-4">
            {/* Materialien */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Materialien</h5>
                
                {materials.map((material, index) => (
                  <div key={index} className="mb-3">
                    <div className="row g-2">
                      <div className="col-7">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Material"
                          value={material.name}
                          onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Menge"
                          value={material.amount}
                          onChange={(e) => handleMaterialChange(index, 'amount', e.target.value)}
                        />
                      </div>
                      <div className="col-1">
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeMaterial(index)}
                          disabled={materials.length === 1}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-outline-primary w-100"
                  onClick={addMaterial}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Material hinzufügen
                </button>
              </div>
            </div>

            {/* Werkzeuge */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Werkzeuge</h5>
                
                {tools.map((tool, index) => (
                  <div key={index} className="mb-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Werkzeug"
                        value={tool}
                        onChange={(e) => handleToolChange(index, e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeTool(index)}
                        disabled={tools.length === 1}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-outline-primary w-100"
                  onClick={addTool}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Werkzeug hinzufügen
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Projekt wird erstellt...
                  </>
                ) : (
                  'Projekt veröffentlichen'
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateProject;


import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  getPresentation,
  addPresentation,
  updatePresentation,
  addSlide,
  updateSlide,
  deleteSlide,
  addHotspot,
  updateHotspot,
  deleteHotspot,
  addBranchingScenario,
  updateBranchingScenario,
  deleteBranchingScenario,
  clearPresentation
} from '../../actions/presentation';
import { setAlert } from '../../actions/alert';
import Spinner from '../layout/Spinner';
import SlideEditor from './SlideEditor';
import HotspotEditor from './HotspotEditor';
import BranchingScenarioEditor from './BranchingScenarioEditor';
import PreviewPresentation from './PreviewPresentation';

const PresentationCreator = ({
  auth,
  presentation: { presentation, loading },
  getPresentation,
  addPresentation,
  updatePresentation,
  addSlide,
  updateSlide,
  deleteSlide,
  addHotspot,
  updateHotspot,
  deleteHotspot,
  addBranchingScenario,
  updateBranchingScenario,
  deleteBranchingScenario,
  clearPresentation,
  setAlert,
  match,
  history
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: 'general',
    tags: '',
    thumbnail: null,
    isPublished: false,
    isFeatured: false,
    estimatedTime: 30,
    difficulty: 'beginner',
    prerequisites: '',
    learningObjectives: '',
    targetAudience: '',
    courses: []
  });

  const [settings, setSettings] = useState({
    allowNavigation: true,
    showProgress: true,
    autoPlay: false,
    autoPlayInterval: 5,
    allowFullscreen: true,
    requireCompletion: false,
    showScore: false,
    allowDownload: false,
    theme: 'default',
    customCSS: ''
  });

  const [activeTab, setActiveTab] = useState('details');
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef(null);

  const {
    title,
    description,
    shortDescription,
    category,
    tags,
    thumbnail,
    isPublished,
    isFeatured,
    estimatedTime,
    difficulty,
    prerequisites,
    learningObjectives,
    targetAudience,
    courses
  } = formData;

  useEffect(() => {
    if (match.params.id) {
      getPresentation(match.params.id);
    } else {
      clearPresentation();
    }

    return () => clearPresentation();
  }, [getPresentation, match.params.id, clearPresentation]);

  useEffect(() => {
    if (presentation) {
      setFormData({
        title: presentation.title || '',
        description: presentation.description || '',
        shortDescription: presentation.shortDescription || '',
        category: presentation.category || 'general',
        tags: presentation.tags ? presentation.tags.join(', ') : '',
        thumbnail: presentation.thumbnail || null,
        isPublished: presentation.isPublished || false,
        isFeatured: presentation.isFeatured || false,
        estimatedTime: presentation.estimatedTime || 30,
        difficulty: presentation.difficulty || 'beginner',
        prerequisites: presentation.prerequisites ? presentation.prerequisites.join(', ') : '',
        learningObjectives: presentation.learningObjectives ? presentation.learningObjectives.join(', ') : '',
        targetAudience: presentation.targetAudience ? presentation.targetAudience.join(', ') : '',
        courses: presentation.courses ? presentation.courses.map(course => course._id) : []
      });

      setSettings({
        allowNavigation: presentation.settings?.allowNavigation ?? true,
        showProgress: presentation.settings?.showProgress ?? true,
        autoPlay: presentation.settings?.autoPlay ?? false,
        autoPlayInterval: presentation.settings?.autoPlayInterval ?? 5,
        allowFullscreen: presentation.settings?.allowFullscreen ?? true,
        requireCompletion: presentation.settings?.requireCompletion ?? false,
        showScore: presentation.settings?.showScore ?? false,
        allowDownload: presentation.settings?.allowDownload ?? false,
        theme: presentation.settings?.theme || 'default',
        customCSS: presentation.settings?.customCSS || ''
      });

      if (presentation.slides && presentation.slides.length > 0) {
        setSelectedSlide(presentation.slides[0]._id);
      }
    }
  }, [presentation]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCheck = e => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const onSettingsChange = e => {
    setSettings({ ...settings, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  };

  const onFileChange = e => {
    setFormData({ ...formData, thumbnail: e.target.files[0] });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    const presentationData = new FormData();
    presentationData.append('title', title);
    presentationData.append('description', description);
    presentationData.append('shortDescription', shortDescription);
    presentationData.append('category', category);
    presentationData.append('tags', tags);
    presentationData.append('isPublished', isPublished);
    presentationData.append('isFeatured', isFeatured);
    presentationData.append('estimatedTime', estimatedTime);
    presentationData.append('difficulty', difficulty);
    presentationData.append('prerequisites', prerequisites);
    presentationData.append('learningObjectives', learningObjectives);
    presentationData.append('targetAudience', targetAudience);
    presentationData.append('courses', JSON.stringify(courses));
    presentationData.append('settings', JSON.stringify(settings));
    
    if (thumbnail && typeof thumbnail !== 'string') {
      presentationData.append('thumbnail', thumbnail);
    }

    try {
      if (match.params.id) {
        await updatePresentation(match.params.id, presentationData, history);
        setAlert('Presentation updated successfully', 'success');
      } else {
        await addPresentation(presentationData, history);
        setAlert('Presentation created successfully', 'success');
      }
    } catch (err) {
      setAlert('Error saving presentation', 'danger');
    }
  };

  const handleAddSlide = async slideData => {
    try {
      if (match.params.id) {
        const newSlide = await addSlide(match.params.id, slideData);
        setSelectedSlide(newSlide.payload.slides[newSlide.payload.slides.length - 1]._id);
        setAlert('Slide added successfully', 'success');
      } else {
        setAlert('Please save the presentation first', 'warning');
      }
    } catch (err) {
      setAlert('Error adding slide', 'danger');
    }
  };

  const handleUpdateSlide = async (slideId, slideData) => {
    try {
      if (match.params.id) {
        await updateSlide(match.params.id, slideId, slideData);
        setAlert('Slide updated successfully', 'success');
      }
    } catch (err) {
      setAlert('Error updating slide', 'danger');
    }
  };

  const handleDeleteSlide = async slideId => {
    try {
      if (match.params.id) {
        await deleteSlide(match.params.id, slideId);
        if (presentation.slides.length > 1) {
          setSelectedSlide(presentation.slides[0]._id);
        } else {
          setSelectedSlide(null);
        }
        setAlert('Slide deleted successfully', 'success');
      }
    } catch (err) {
      setAlert('Error deleting slide', 'danger');
    }
  };

  const handleAddHotspot = async hotspotData => {
    try {
      if (match.params.id && selectedSlide) {
        await addHotspot(match.params.id, selectedSlide, hotspotData);
        setAlert('Hotspot added successfully', 'success');
      } else {
        setAlert('Please select a slide first', 'warning');
      }
    } catch (err) {
      setAlert('Error adding hotspot', 'danger');
    }
  };

  const handleUpdateHotspot = async (hotspotId, hotspotData) => {
    try {
      if (match.params.id && selectedSlide) {
        await updateHotspot(match.params.id, selectedSlide, hotspotId, hotspotData);
        setAlert('Hotspot updated successfully', 'success');
      }
    } catch (err) {
      setAlert('Error updating hotspot', 'danger');
    }
  };

  const handleDeleteHotspot = async hotspotId => {
    try {
      if (match.params.id && selectedSlide) {
        await deleteHotspot(match.params.id, selectedSlide, hotspotId);
        setAlert('Hotspot deleted successfully', 'success');
      }
    } catch (err) {
      setAlert('Error deleting hotspot', 'danger');
    }
  };

  const handleAddScenario = async scenarioData => {
    try {
      if (match.params.id) {
        await addBranchingScenario(match.params.id, scenarioData);
        setAlert('Branching scenario added successfully', 'success');
      } else {
        setAlert('Please save the presentation first', 'warning');
      }
    } catch (err) {
      setAlert('Error adding branching scenario', 'danger');
    }
  };

  const handleUpdateScenario = async (scenarioId, scenarioData) => {
    try {
      if (match.params.id) {
        await updateBranchingScenario(match.params.id, scenarioId, scenarioData);
        setAlert('Branching scenario updated successfully', 'success');
      }
    } catch (err) {
      setAlert('Error updating branching scenario', 'danger');
    }
  };

  const handleDeleteScenario = async scenarioId => {
    try {
      if (match.params.id) {
        await deleteBranchingScenario(match.params.id, scenarioId);
        setAlert('Branching scenario deleted successfully', 'success');
      }
    } catch (err) {
      setAlert('Error deleting branching scenario', 'danger');
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  if (loading && match.params.id) {
    return <Spinner />;
  }

  return (
    <div className="presentation-creator">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="display-4">
                {match.params.id ? 'Edit Presentation' : 'Create Presentation'}
              </h1>
              <div>
                <button
                  className="btn btn-outline-secondary mr-2"
                  onClick={togglePreview}
                >
                  {previewMode ? 'Back to Editor' : 'Preview'}
                </button>
                {match.params.id && (
                  <button
                    className="btn btn-danger mr-2"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this presentation?')) {
                        history.push('/dashboard');
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={onSubmit}
                >
                  {match.params.id ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {previewMode && presentation ? (
          <PreviewPresentation presentation={presentation} />
        ) : (
          <div className="row">
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <ul className="nav flex-column">
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                      >
                        Details
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'slides' ? 'active' : ''}`}
                        onClick={() => setActiveTab('slides')}
                        disabled={!match.params.id}
                      >
                        Slides
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'hotspots' ? 'active' : ''}`}
                        onClick={() => setActiveTab('hotspots')}
                        disabled={!match.params.id || !selectedSlide}
                      >
                        Hotspots
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'branching' ? 'active' : ''}`}
                        onClick={() => setActiveTab('branching')}
                        disabled={!match.params.id}
                      >
                        Branching Scenarios
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                      >
                        Settings
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {activeTab === 'slides' && presentation && (
                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="mb-0">Slides</h5>
                  </div>
                  <div className="card-body">
                    <button
                      className="btn btn-sm btn-primary mb-3"
                      onClick={() => handleAddSlide({
                        title: 'New Slide',
                        content: '',
                        order: presentation.slides ? presentation.slides.length : 0
                      })}
                    >
                      Add Slide
                    </button>
                    {presentation.slides && presentation.slides.map((slide, index) => (
                      <div
                        key={slide._id}
                        className={`list-group-item list-group-item-action ${selectedSlide === slide._id ? 'active' : ''}`}
                        onClick={() => setSelectedSlide(slide._id)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{slide.title || `Slide ${index + 1}`}</span>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSlide(slide._id);
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'hotspots' && presentation && selectedSlide && (
                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="mb-0">Hotspots</h5>
                  </div>
                  <div className="card-body">
                    <button
                      className="btn btn-sm btn-primary mb-3"
                      onClick={() => handleAddHotspot({
                        title: 'New Hotspot',
                        type: 'info',
                        position: { x: 50, y: 50 },
                        action: { type: 'popup', content: '' }
                      })}
                    >
                      Add Hotspot
                    </button>
                    {presentation.slides
                      .find(slide => slide._id === selectedSlide)
                      ?.hotspots.map(hotspot => (
                        <div
                          key={hotspot._id}
                          className={`list-group-item list-group-item-action ${selectedHotspot === hotspot._id ? 'active' : ''}`}
                          onClick={() => setSelectedHotspot(hotspot._id)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{hotspot.title}</span>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHotspot(hotspot._id);
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {activeTab === 'branching' && presentation && (
                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="mb-0">Branching Scenarios</h5>
                  </div>
                  <div className="card-body">
                    <button
                      className="btn btn-sm btn-primary mb-3"
                      onClick={() => handleAddScenario({
                        name: 'New Scenario',
                        startSlideId: presentation.slides && presentation.slides.length > 0 ? presentation.slides[0]._id : '',
                        endSlideIds: []
                      })}
                    >
                      Add Scenario
                    </button>
                    {presentation.branchingScenarios && presentation.branchingScenarios.map(scenario => (
                      <div
                        key={scenario._id}
                        className={`list-group-item list-group-item-action ${selectedScenario === scenario._id ? 'active' : ''}`}
                        onClick={() => setSelectedScenario(scenario._id)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{scenario.name}</span>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScenario(scenario._id);
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="col-md-9">
              {activeTab === 'details' && (
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={onSubmit}>
                      <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="title"
                          name="title"
                          value={title}
                          onChange={onChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          value={description}
                          onChange={onChange}
                          rows="3"
                          required
                        ></textarea>
                      </div>

                      <div className="form-group">
                        <label htmlFor="shortDescription">Short Description</label>
                        <textarea
                          className="form-control"
                          id="shortDescription"
                          name="shortDescription"
                          value={shortDescription}
                          onChange={onChange}
                          rows="2"
                        ></textarea>
                      </div>

                      <div className="form-row">
                        <div className="form-group col-md-6">
                          <label htmlFor="category">Category *</label>
                          <select
                            className="form-control"
                            id="category"
                            name="category"
                            value={category}
                            onChange={onChange}
                            required
                          >
                            <option value="general">General</option>
                            <option value="business">Business</option>
                            <option value="technology">Technology</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="compliance">Compliance</option>
                            <option value="safety">Safety</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="form-group col-md-6">
                          <label htmlFor="difficulty">Difficulty</label>
                          <select
                            className="form-control"
                            id="difficulty"
                            name="difficulty"
                            value={difficulty}
                            onChange={onChange}
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="tags">Tags (comma separated)</label>
                        <input
                          type="text"
                          className="form-control"
                          id="tags"
                          name="tags"
                          value={tags}
                          onChange={onChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="thumbnail">Thumbnail</label>
                        <div className="d-flex align-items-center">
                          {thumbnail && (
                            <img
                              src={typeof thumbnail === 'string' ? thumbnail : URL.createObjectURL(thumbnail)}
                              alt="Thumbnail preview"
                              className="img-thumbnail mr-3"
                              style={{ maxWidth: '100px' }}
                            />
                          )}
                          <div>
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={triggerFileInput}
                            >
                              {thumbnail ? 'Change Image' : 'Upload Image'}
                            </button>
                            <input
                              type="file"
                              className="d-none"
                              id="thumbnail"
                              name="thumbnail"
                              onChange={onFileChange}
                              ref={fileInputRef}
                              accept="image/*"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group col-md-6">
                          <label htmlFor="estimatedTime">Estimated Time (minutes) *</label>
                          <input
                            type="number"
                            className="form-control"
                            id="estimatedTime"
                            name="estimatedTime"
                            value={estimatedTime}
                            onChange={onChange}
                            min="1"
                            required
                          />
                        </div>

                        <div className="form-group col-md-6">
                          <div className="form-check mt-4">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="isPublished"
                              name="isPublished"
                              checked={isPublished}
                              onChange={onCheck}
                            />
                            <label className="form-check-label" htmlFor="isPublished">
                              Published
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="prerequisites">Prerequisites (comma separated)</label>
                        <input
                          type="text"
                          className="form-control"
                          id="prerequisites"
                          name="prerequisites"
                          value={prerequisites}
                          onChange={onChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="learningObjectives">Learning Objectives (comma separated)</label>
                        <input
                          type="text"
                          className="form-control"
                          id="learningObjectives"
                          name="learningObjectives"
                          value={learningObjectives}
                          onChange={onChange}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="targetAudience">Target Audience (comma separated)</label>
                        <input
                          type="text"
                          className="form-control"
                          id="targetAudience"
                          name="targetAudience"
                          value={targetAudience}
                          onChange={onChange}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'slides' && presentation && selectedSlide && (
                <SlideEditor
                  slide={presentation.slides.find(slide => slide._id === selectedSlide)}
                  presentationId={presentation._id}
                  onUpdate={handleUpdateSlide}
                  onDelete={handleDeleteSlide}
                />
              )}

              {activeTab === 'hotspots' && presentation && selectedSlide && (
                <HotspotEditor
                  hotspot={selectedHotspot ? 
                    presentation.slides
                      .find(slide => slide._id === selectedSlide)
                      ?.hotspots.find(hotspot => hotspot._id === selectedHotspot) : null
                  }
                  slideId={selectedSlide}
                  presentationId={presentation._id}
                  onAdd={handleAddHotspot}
                  onUpdate={handleUpdateHotspot}
                  onDelete={handleDeleteHotspot}
                />
              )}

              {activeTab === 'branching' && presentation && selectedScenario && (
                <BranchingScenarioEditor
                  scenario={presentation.branchingScenarios.find(scenario => scenario._id === selectedScenario)}
                  presentation={presentation}
                  onUpdate={handleUpdateScenario}
                  onDelete={handleDeleteScenario}
                />
              )}

              {activeTab === 'settings' && (
                <div className="card">
                  <div className="card-body">
                    <h4 className="card-title mb-4">Presentation Settings</h4>
                    
                    <div className="form-group">
                      <label htmlFor="theme">Theme</label>
                      <select
                        className="form-control"
                        id="theme"
                        name="theme"
                        value={settings.theme}
                        onChange={onSettingsChange}
                      >
                        <option value="default">Default</option>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="corporate">Corporate</option>
                        <option value="education">Education</option>
                      </select>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="allowNavigation"
                        name="allowNavigation"
                        checked={settings.allowNavigation}
                        onChange={onSettingsChange}
                      />
                      <label className="form-check-label" htmlFor="allowNavigation">
                        Allow Navigation
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="showProgress"
                        name="showProgress"
                        checked={settings.showProgress}
                        onChange={onSettingsChange}
                      />
                      <label className="form-check-label" htmlFor="showProgress">
                        Show Progress
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoPlay"
                        name="autoPlay"
                        checked={settings.autoPlay}
                        onChange={onSettingsChange}
                      />
                      <label className="form-check-label" htmlFor="autoPlay">
                        Auto Play
                      </label>
                    </div>

                    {settings.autoPlay && (
                      <div className="form-group ml-4">
                        <label htmlFor="autoPlayInterval">Auto Play Interval (seconds)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="autoPlayInterval"
                          name="autoPlayInterval"
                          value={settings.autoPlayInterval}
                          onChange={onSettingsChange}
                          min="1"
                        />
                      </div>
                    )}

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="allowFullscreen"
                        name="allowFullscreen"
                        checked={settings.allowFullscreen}
                        onChange={onSettingsChange}
                      />
                      <label className="form-check-label" htmlFor="allowFullscreen">
                        Allow Fullscreen
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="requireCompletion"
                        name="requireCompletion"
                        checked={settings.requireCompletion}
                        onChange={onSettingsChange}
                      />
                      <label className="form-check-label" htmlFor="requireCompletion">
                        Require Completion
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="showScore"
                        name="showScore"
                        checked={settings.showScore}
                        onChange={onSettingsChange}
                      />
                      <label className="form-check-label" htmlFor="showScore">
                        Show Score
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="allowDownload"
                        name="allowDownload"
                        checked={settings.allowDownload}
                        onChange={onSettingsChange}
                      />
                      <label className="form-check-label" htmlFor="allowDownload">
                        Allow Download
                      </label>
                    </div>

                    <div className="form-group mt-3">
                      <label htmlFor="customCSS">Custom CSS</label>
                      <textarea
                        className="form-control"
                        id="customCSS"
                        name="customCSS"
                        value={settings.customCSS}
                        onChange={onSettingsChange}
                        rows="5"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

PresentationCreator.propTypes = {
  auth: PropTypes.object.isRequired,
  presentation: PropTypes.object.isRequired,
  getPresentation: PropTypes.func.isRequired,
  addPresentation: PropTypes.func.isRequired,
  updatePresentation: PropTypes.func.isRequired,
  addSlide: PropTypes.func.isRequired,
  updateSlide: PropTypes.func.isRequired,
  deleteSlide: PropTypes.func.isRequired,
  addHotspot: PropTypes.func.isRequired,
  updateHotspot: PropTypes.func.isRequired,
  deleteHotspot: PropTypes.func.isRequired,
  addBranchingScenario: PropTypes.func.isRequired,
  updateBranchingScenario: PropTypes.func.isRequired,
  deleteBranchingScenario: PropTypes.func.isRequired,
  clearPresentation: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  presentation: state.presentation
});

export default connect(mapStateToProps, {
  getPresentation,
  addPresentation,
  updatePresentation,
  addSlide,
  updateSlide,
  deleteSlide,
  addHotspot,
  updateHotspot,
  deleteHotspot,
  addBranchingScenario,
  updateBranchingScenario,
  deleteBranchingScenario,
  clearPresentation,
  setAlert
})(withRouter(PresentationCreator));
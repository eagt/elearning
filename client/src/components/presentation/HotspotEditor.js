import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setAlert } from '../../actions/alert';

const HotspotEditor = ({ 
  hotspot, 
  slideId, 
  presentationId, 
  onAdd, 
  onUpdate, 
  onDelete, 
  setAlert 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'info',
    position: { x: 50, y: 50 },
    size: { width: 20, height: 20 },
    shape: 'rectangle',
    style: {
      backgroundColor: 'rgba(0, 172, 193, 0.7)',
      borderColor: '#00ACC1',
      borderWidth: 2,
      textColor: '#FFFFFF',
      icon: 'info'
    },
    action: {
      type: 'popup',
      content: '',
      url: '',
      slideId: '',
      mediaId: '',
      quizId: ''
    },
    isActive: true,
    order: 0
  });

  const [isEditing, setIsEditing] = useState(false);

  const {
    title,
    description,
    type,
    position,
    size,
    shape,
    style,
    action,
    isActive,
    order
  } = formData;

  useEffect(() => {
    if (hotspot) {
      setFormData({
        title: hotspot.title || '',
        description: hotspot.description || '',
        type: hotspot.type || 'info',
        position: hotspot.position || { x: 50, y: 50 },
        size: hotspot.size || { width: 20, height: 20 },
        shape: hotspot.shape || 'rectangle',
        style: hotspot.style || {
          backgroundColor: 'rgba(0, 172, 193, 0.7)',
          borderColor: '#00ACC1',
          borderWidth: 2,
          textColor: '#FFFFFF',
          icon: 'info'
        },
        action: hotspot.action || {
          type: 'popup',
          content: '',
          url: '',
          slideId: '',
          mediaId: '',
          quizId: ''
        },
        isActive: hotspot.isActive !== undefined ? hotspot.isActive : true,
        order: hotspot.order || 0
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [hotspot]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onPositionChange = (axis, value) => {
    setFormData({
      ...formData,
      position: { ...position, [axis]: parseInt(value) }
    });
  };

  const onSizeChange = (dimension, value) => {
    setFormData({
      ...formData,
      size: { ...size, [dimension]: parseInt(value) }
    });
  };

  const onStyleChange = (property, value) => {
    setFormData({
      ...formData,
      style: { ...style, [property]: value }
    });
  };

  const onActionChange = (property, value) => {
    setFormData({
      ...formData,
      action: { ...action, [property]: value }
    });
  };

  const onCheck = e => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      const hotspotData = {
        title,
        description,
        type,
        position,
        size,
        shape,
        style,
        action,
        isActive,
        order
      };

      if (isEditing) {
        await onUpdate(hotspot._id, hotspotData);
        setAlert('Hotspot updated successfully', 'success');
      } else {
        await onAdd(hotspotData);
        setAlert('Hotspot added successfully', 'success');
      }
    } catch (err) {
      setAlert(`Error ${isEditing ? 'updating' : 'adding'} hotspot`, 'danger');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this hotspot?')) {
      onDelete(hotspot._id);
    }
  };

  const getIconOptions = () => {
    const icons = [
      { value: 'info', label: 'Info' },
      { value: 'question', label: 'Question' },
      { value: 'lightbulb', label: 'Lightbulb' },
      { value: 'exclamation', label: 'Exclamation' },
      { value: 'check', label: 'Check' },
      { value: 'times', label: 'Times' },
      { value: 'play', label: 'Play' },
      { value: 'pause', label: 'Pause' },
      { value: 'stop', label: 'Stop' },
      { value: 'link', label: 'Link' },
      { value: 'download', label: 'Download' },
      { value: 'upload', label: 'Upload' }
    ];

    return icons.map(icon => (
      <option key={icon.value} value={icon.value}>
        {icon.label}
      </option>
    ));
  };

  return (
    <div className="hotspot-editor">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{isEditing ? 'Edit Hotspot' : 'Add Hotspot'}</h4>
          {isEditing && (
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete Hotspot
            </button>
          )}
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
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
              <label htmlFor="description">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={description}
                onChange={onChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="type">Type</label>
                <select
                  className="form-control"
                  id="type"
                  name="type"
                  value={type}
                  onChange={onChange}
                >
                  <option value="info">Information</option>
                  <option value="link">Link</option>
                  <option value="branch">Branch</option>
                  <option value="media">Media</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>

              <div className="form-group col-md-6">
                <label htmlFor="shape">Shape</label>
                <select
                  className="form-control"
                  id="shape"
                  name="shape"
                  value={shape}
                  onChange={onChange}
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="circle">Circle</option>
                  <option value="ellipse">Ellipse</option>
                  <option value="polygon">Polygon</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Position</label>
                <div className="form-row">
                  <div className="col">
                    <label htmlFor="positionX">X (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="positionX"
                      name="positionX"
                      value={position.x}
                      onChange={e => onPositionChange('x', e.target.value)}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div className="col">
                    <label htmlFor="positionY">Y (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="positionY"
                      name="positionY"
                      value={position.y}
                      onChange={e => onPositionChange('y', e.target.value)}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group col-md-6">
                <label>Size</label>
                <div className="form-row">
                  <div className="col">
                    <label htmlFor="sizeWidth">Width (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="sizeWidth"
                      name="sizeWidth"
                      value={size.width}
                      onChange={e => onSizeChange('width', e.target.value)}
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                  <div className="col">
                    <label htmlFor="sizeHeight">Height (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="sizeHeight"
                      name="sizeHeight"
                      value={size.height}
                      onChange={e => onSizeChange('height', e.target.value)}
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Style</label>
              <div className="form-row">
                <div className="col-md-6">
                  <label htmlFor="backgroundColor">Background Color</label>
                  <div className="input-group">
                    <input
                      type="color"
                      className="form-control"
                      id="backgroundColor"
                      name="backgroundColor"
                      value={style.backgroundColor}
                      onChange={e => onStyleChange('backgroundColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={style.backgroundColor}
                      onChange={e => onStyleChange('backgroundColor', e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="borderColor">Border Color</label>
                  <div className="input-group">
                    <input
                      type="color"
                      className="form-control"
                      id="borderColor"
                      name="borderColor"
                      value={style.borderColor}
                      onChange={e => onStyleChange('borderColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={style.borderColor}
                      onChange={e => onStyleChange('borderColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row mt-2">
                <div className="col-md-4">
                  <label htmlFor="borderWidth">Border Width</label>
                  <input
                    type="number"
                    className="form-control"
                    id="borderWidth"
                    name="borderWidth"
                    value={style.borderWidth}
                    onChange={e => onStyleChange('borderWidth', parseInt(e.target.value))}
                    min="0"
                    max="10"
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="textColor">Text Color</label>
                  <div className="input-group">
                    <input
                      type="color"
                      className="form-control"
                      id="textColor"
                      name="textColor"
                      value={style.textColor}
                      onChange={e => onStyleChange('textColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={style.textColor}
                      onChange={e => onStyleChange('textColor', e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <label htmlFor="icon">Icon</label>
                  <select
                    className="form-control"
                    id="icon"
                    name="icon"
                    value={style.icon}
                    onChange={e => onStyleChange('icon', e.target.value)}
                  >
                    {getIconOptions()}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="actionType">Action Type</label>
              <select
                className="form-control"
                id="actionType"
                name="actionType"
                value={action.type}
                onChange={e => onActionChange('type', e.target.value)}
              >
                <option value="popup">Show Popup</option>
                <option value="navigate">Navigate to Slide</option>
                <option value="open-link">Open Link</option>
                <option value="play-media">Play Media</option>
                <option value="start-quiz">Start Quiz</option>
              </select>
            </div>

            {action.type === 'popup' && (
              <div className="form-group">
                <label htmlFor="actionContent">Popup Content</label>
                <textarea
                  className="form-control"
                  id="actionContent"
                  name="actionContent"
                  value={action.content}
                  onChange={e => onActionChange('content', e.target.value)}
                  rows="4"
                  placeholder="Enter HTML content for the popup"
                ></textarea>
                <small className="form-text text-muted">
                  You can use HTML tags for formatting.
                </small>
              </div>
            )}

            {action.type === 'open-link' && (
              <div className="form-group">
                <label htmlFor="actionUrl">URL</label>
                <input
                  type="text"
                  className="form-control"
                  id="actionUrl"
                  name="actionUrl"
                  value={action.url}
                  onChange={e => onActionChange('url', e.target.value)}
                  placeholder="https://example.com"
                  required
                />
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="openInNewTab"
                    name="openInNewTab"
                    checked={action.openInNewTab || false}
                    onChange={e => onActionChange('openInNewTab', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="openInNewTab">
                    Open in new tab
                  </label>
                </div>
              </div>
            )}

            {action.type === 'navigate' && (
              <div className="form-group">
                <label htmlFor="actionSlideId">Target Slide</label>
                <select
                  className="form-control"
                  id="actionSlideId"
                  name="actionSlideId"
                  value={action.slideId}
                  onChange={e => onActionChange('slideId', e.target.value)}
                  required
                >
                  <option value="">Select a slide</option>
                  {/* This would be populated with actual slide IDs from the presentation */}
                  <option value="slide1">Slide 1</option>
                  <option value="slide2">Slide 2</option>
                  <option value="slide3">Slide 3</option>
                </select>
              </div>
            )}

            {action.type === 'play-media' && (
              <div className="form-group">
                <label htmlFor="actionMediaId">Media</label>
                <select
                  className="form-control"
                  id="actionMediaId"
                  name="actionMediaId"
                  value={action.mediaId}
                  onChange={e => onActionChange('mediaId', e.target.value)}
                  required
                >
                  <option value="">Select media</option>
                  {/* This would be populated with actual media IDs from the slide */}
                  <option value="media1">Image 1</option>
                  <option value="media2">Video 1</option>
                  <option value="media3">Audio 1</option>
                </select>
              </div>
            )}

            {action.type === 'start-quiz' && (
              <div className="form-group">
                <label htmlFor="actionQuizId">Quiz</label>
                <select
                  className="form-control"
                  id="actionQuizId"
                  name="actionQuizId"
                  value={action.quizId}
                  onChange={e => onActionChange('quizId', e.target.value)}
                  required
                >
                  <option value="">Select a quiz</option>
                  {/* This would be populated with actual quiz IDs from the presentation */}
                  <option value="quiz1">Quiz 1</option>
                  <option value="quiz2">Quiz 2</option>
                  <option value="quiz3">Quiz 3</option>
                </select>
              </div>
            )}

            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="order">Order</label>
                <input
                  type="number"
                  className="form-control"
                  id="order"
                  name="order"
                  value={order}
                  onChange={onChange}
                  min="0"
                />
              </div>

              <div className="form-group col-md-6">
                <div className="form-check mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={isActive}
                    onChange={onCheck}
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update Hotspot' : 'Add Hotspot'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

HotspotEditor.propTypes = {
  hotspot: PropTypes.object,
  slideId: PropTypes.string.isRequired,
  presentationId: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired
};

export default connect(null, { setAlert })(HotspotEditor);
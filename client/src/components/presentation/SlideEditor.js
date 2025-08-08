import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setAlert } from '../../actions/alert';

const SlideEditor = ({ slide, presentationId, onUpdate, onDelete, setAlert }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    backgroundImage: '',
    backgroundColor: '#FFFFFF',
    textColor: '#212121',
    layout: 'content',
    media: [],
    notes: '',
    animation: 'fade',
    transition: 'fade',
    duration: 0
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const fileInputRef = useRef(null);
  const contentEditorRef = useRef(null);

  const {
    title,
    content,
    backgroundImage,
    backgroundColor,
    textColor,
    layout,
    notes,
    animation,
    transition,
    duration
  } = formData;

  useEffect(() => {
    if (slide) {
      setFormData({
        title: slide.title || '',
        content: slide.content || '',
        backgroundImage: slide.backgroundImage || '',
        backgroundColor: slide.backgroundColor || '#FFFFFF',
        textColor: slide.textColor || '#212121',
        layout: slide.layout || 'content',
        media: slide.media || [],
        notes: slide.notes || '',
        animation: slide.animation || 'fade',
        transition: slide.transition || 'fade',
        duration: slide.duration || 0
      });
    }
  }, [slide]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCheck = e => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const onFileChange = e => {
    const files = Array.from(e.target.files);
    setMediaFiles([...mediaFiles, ...files]);
  };

  const removeMediaFile = index => {
    const newFiles = [...mediaFiles];
    newFiles.splice(index, 1);
    setMediaFiles(newFiles);
  };

  const removeExistingMedia = index => {
    const newMedia = [...formData.media];
    newMedia.splice(index, 1);
    setFormData({ ...formData, media: newMedia });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      const slideData = new FormData();
      slideData.append('title', title);
      slideData.append('content', content);
      slideData.append('backgroundImage', backgroundImage);
      slideData.append('backgroundColor', backgroundColor);
      slideData.append('textColor', textColor);
      slideData.append('layout', layout);
      slideData.append('notes', notes);
      slideData.append('animation', animation);
      slideData.append('transition', transition);
      slideData.append('duration', duration);
      
      // Add existing media
      slideData.append('existingMedia', JSON.stringify(formData.media));
      
      // Add new media files
      mediaFiles.forEach((file, index) => {
        slideData.append(`mediaFile${index}`, file);
      });

      await onUpdate(slide._id, slideData);
      setAlert('Slide updated successfully', 'success');
    } catch (err) {
      setAlert('Error updating slide', 'danger');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      onDelete(slide._id);
    }
  };

  const insertContent = (type) => {
    const editor = contentEditorRef.current;
    if (!editor) return;
    
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let replacement = '';
    
    switch (type) {
      case 'bold':
        replacement = `<strong>${selectedText || 'Bold text'}</strong>`;
        break;
      case 'italic':
        replacement = `<em>${selectedText || 'Italic text'}</em>`;
        break;
      case 'underline':
        replacement = `<u>${selectedText || 'Underlined text'}</u>`;
        break;
      case 'heading':
        replacement = `<h2>${selectedText || 'Heading'}</h2>`;
        break;
      case 'list':
        replacement = `<ul><li>${selectedText || 'List item'}</li></ul>`;
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          replacement = `<a href="${url}" target="_blank">${selectedText || 'Link text'}</a>`;
        }
        break;
      case 'image':
        const imageUrl = prompt('Enter image URL:');
        if (imageUrl) {
          replacement = `<img src="${imageUrl}" alt="Image" style="max-width: 100%;">`;
        }
        break;
      case 'video':
        const videoUrl = prompt('Enter video URL:');
        if (videoUrl) {
          replacement = `<video controls style="max-width: 100%;"><source src="${videoUrl}" type="video/mp4">Your browser does not support the video tag.</video>`;
        }
        break;
      default:
        return;
    }
    
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setFormData({ ...formData, content: newContent });
    
    // Focus back on editor
    setTimeout(() => {
      editor.focus();
      editor.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  return (
    <div className="slide-editor">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Edit Slide</h4>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete Slide
          </button>
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
              <label htmlFor="content">Content</label>
              <div className="btn-toolbar mb-2" role="toolbar">
                <div className="btn-group mr-2" role="group">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => insertContent('bold')}
                    title="Bold"
                  >
                    <i className="fas fa-bold"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => insertContent('italic')}
                    title="Italic"
                  >
                    <i className="fas fa-italic"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => insertContent('underline')}
                    title="Underline"
                  >
                    <i className="fas fa-underline"></i>
                  </button>
                </div>
                <div className="btn-group mr-2" role="group">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => insertContent('heading')}
                    title="Heading"
                  >
                    <i className="fas fa-heading"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => insertContent('list')}
                    title="List"
                  >
                    <i className="fas fa-list-ul"></i>
                  </button>
                </div>
                <div className="btn-group mr-2" role="group">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => insertContent('link')}
                    title="Link"
                  >
                    <i className="fas fa-link"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => insertContent('image')}
                    title="Image"
                  >
                    <i className="fas fa-image"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => insertContent('video')}
                    title="Video"
                  >
                    <i className="fas fa-video"></i>
                  </button>
                </div>
              </div>
              <textarea
                className="form-control"
                id="content"
                name="content"
                value={content}
                onChange={onChange}
                rows="8"
                ref={contentEditorRef}
                required
              ></textarea>
              <small className="form-text text-muted">
                You can use HTML tags for formatting. Use the toolbar buttons to insert common elements.
              </small>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="layout">Layout</label>
                <select
                  className="form-control"
                  id="layout"
                  name="layout"
                  value={layout}
                  onChange={onChange}
                >
                  <option value="title">Title Only</option>
                  <option value="content">Content Only</option>
                  <option value="title-content">Title and Content</option>
                  <option value="two-column">Two Column</option>
                  <option value="media-content">Media and Content</option>
                  <option value="content-media">Content and Media</option>
                  <option value="blank">Blank</option>
                </select>
              </div>

              <div className="form-group col-md-6">
                <label htmlFor="animation">Animation</label>
                <select
                  className="form-control"
                  id="animation"
                  name="animation"
                  value={animation}
                  onChange={onChange}
                >
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                  <option value="flip">Flip</option>
                  <option value="rotate">Rotate</option>
                  <option value="bounce">Bounce</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="transition">Transition</label>
                <select
                  className="form-control"
                  id="transition"
                  name="transition"
                  value={transition}
                  onChange={onChange}
                >
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="push">Push</option>
                  <option value="cover">Cover</option>
                  <option value="uncover">Uncover</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div className="form-group col-md-6">
                <label htmlFor="duration">Duration (seconds)</label>
                <input
                  type="number"
                  className="form-control"
                  id="duration"
                  name="duration"
                  value={duration}
                  onChange={onChange}
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="backgroundColor">Background Color</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control"
                    id="backgroundColor"
                    name="backgroundColor"
                    value={backgroundColor}
                    onChange={onChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={backgroundColor}
                    onChange={onChange}
                    name="backgroundColor"
                  />
                </div>
              </div>

              <div className="form-group col-md-6">
                <label htmlFor="textColor">Text Color</label>
                <div className="input-group">
                  <input
                    type="color"
                    className="form-control"
                    id="textColor"
                    name="textColor"
                    value={textColor}
                    onChange={onChange}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={textColor}
                    onChange={onChange}
                    name="textColor"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="backgroundImage">Background Image URL</label>
              <input
                type="text"
                className="form-control"
                id="backgroundImage"
                name="backgroundImage"
                value={backgroundImage}
                onChange={onChange}
              />
            </div>

            <div className="form-group">
              <label>Media Files</label>
              <div className="mb-2">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={triggerFileInput}
                >
                  <i className="fas fa-plus mr-1"></i> Add Media
                </button>
                <input
                  type="file"
                  className="d-none"
                  id="mediaFiles"
                  name="mediaFiles"
                  onChange={onFileChange}
                  ref={fileInputRef}
                  multiple
                  accept="image/*,video/*,audio/*"
                />
              </div>

              {/* Existing media */}
              {formData.media && formData.media.length > 0 && (
                <div className="mb-3">
                  <h6>Existing Media</h6>
                  <div className="d-flex flex-wrap">
                    {formData.media.map((media, index) => (
                      <div key={index} className="media-item mr-2 mb-2 position-relative">
                        {media.type.startsWith('image/') ? (
                          <img
                            src={media.url}
                            alt={`Media ${index}`}
                            className="img-thumbnail"
                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                          />
                        ) : media.type.startsWith('video/') ? (
                          <div className="video-thumbnail bg-secondary text-white d-flex align-items-center justify-content-center"
                               style={{ width: '100px', height: '100px' }}>
                            <i className="fas fa-video fa-2x"></i>
                          </div>
                        ) : (
                          <div className="audio-thumbnail bg-secondary text-white d-flex align-items-center justify-content-center"
                               style={{ width: '100px', height: '100px' }}>
                            <i className="fas fa-music fa-2x"></i>
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute"
                          style={{ top: '5px', right: '5px' }}
                          onClick={() => removeExistingMedia(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New media files */}
              {mediaFiles.length > 0 && (
                <div>
                  <h6>New Media Files</h6>
                  <div className="d-flex flex-wrap">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="media-item mr-2 mb-2 position-relative">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="img-thumbnail"
                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                          />
                        ) : file.type.startsWith('video/') ? (
                          <div className="video-thumbnail bg-secondary text-white d-flex align-items-center justify-content-center"
                               style={{ width: '100px', height: '100px' }}>
                            <i className="fas fa-video fa-2x"></i>
                          </div>
                        ) : (
                          <div className="audio-thumbnail bg-secondary text-white d-flex align-items-center justify-content-center"
                               style={{ width: '100px', height: '100px' }}>
                            <i className="fas fa-music fa-2x"></i>
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute"
                          style={{ top: '5px', right: '5px' }}
                          onClick={() => removeMediaFile(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        <div className="text-center mt-1">
                          <small>{file.name}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (for presenter)</label>
              <textarea
                className="form-control"
                id="notes"
                name="notes"
                value={notes}
                onChange={onChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                Save Slide
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

SlideEditor.propTypes = {
  slide: PropTypes.object.isRequired,
  presentationId: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired
};

export default connect(null, { setAlert })(SlideEditor);
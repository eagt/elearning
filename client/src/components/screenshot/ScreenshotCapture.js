import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { uploadCapturedScreenshot, setAlert } from '../../actions/screenshot';
import Spinner from '../layout/Spinner';
import html2canvas from 'html2canvas';

const ScreenshotCapture = ({ 
  auth, 
  showCaptureModal, 
  uploadCapturedScreenshot, 
  setAlert, 
  history 
}) => {
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('general');
  const [difficulty, setDifficulty] = useState('beginner');
  const [estimatedTime, setEstimatedTime] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [captureArea, setCaptureArea] = useState('window'); // 'window', 'full', 'selection'
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState(null);
  
  const previewRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    // Set up keyboard shortcut listener
    const handleKeyDown = (e) => {
      // Ctrl+Shift+S for Windows/Linux, Cmd+Shift+S for Mac
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        startCapture();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isSelecting && overlayRef.current) {
      const handleMouseMove = (e) => {
        setSelectionEnd({ x: e.clientX, y: e.clientY });
        updateSelectionBox();
      };

      const handleMouseUp = (e) => {
        setIsSelecting(false);
        setSelectionEnd({ x: e.clientX, y: e.clientY });
        updateSelectionBox();
        captureSelection();
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isSelecting, selectionStart]);

  const startCapture = () => {
    if (captureArea === 'selection') {
      setIsSelecting(true);
      setSelectionStart({ x: window.scrollX, y: window.scrollY });
      setSelectionEnd({ x: window.scrollX, y: window.scrollY });
    } else {
      captureScreen();
    }
  };

  const updateSelectionBox = () => {
    const left = Math.min(selectionStart.x, selectionEnd.x);
    const top = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);

    setSelectionBox({
      left,
      top,
      width,
      height
    });
  };

  const captureSelection = async () => {
    if (!selectionBox || selectionBox.width === 0 || selectionBox.height === 0) {
      setAlert('Please select a valid area', 'warning');
      return;
    }

    setCapturing(true);
    
    try {
      // In a real implementation, you would use a more sophisticated method to capture a specific area
      // For now, we'll capture the entire window and then crop it
      const canvas = await html2canvas(document.body);
      
      // Create a new canvas for the cropped image
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');
      
      croppedCanvas.width = selectionBox.width;
      croppedCanvas.height = selectionBox.height;
      
      // Draw the cropped portion of the original canvas
      croppedCtx.drawImage(
        canvas,
        selectionBox.left - window.scrollX,
        selectionBox.top - window.scrollY,
        selectionBox.width,
        selectionBox.height,
        0,
        0,
        selectionBox.width,
        selectionBox.height
      );
      
      // Convert to blob
      croppedCanvas.toBlob((blob) => {
        const file = new File([blob], 'screenshot.png', { type: 'image/png' });
        setCapturedImage(file);
        setCapturing(false);
      });
    } catch (err) {
      console.error('Error capturing selection:', err);
      setAlert('Error capturing screenshot', 'danger');
      setCapturing(false);
    }
  };

  const captureScreen = async () => {
    setCapturing(true);
    
    try {
      let targetElement;
      
      if (captureArea === 'window') {
        targetElement = document.body;
      } else if (captureArea === 'full') {
        // For full screen capture, we would need to use a different approach
        // For now, we'll capture the entire document
        targetElement = document.documentElement;
      }
      
      const canvas = await html2canvas(targetElement);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        const file = new File([blob], 'screenshot.png', { type: 'image/png' });
        setCapturedImage(file);
        setCapturing(false);
      });
    } catch (err) {
      console.error('Error capturing screen:', err);
      setAlert('Error capturing screenshot', 'danger');
      setCapturing(false);
    }
  };

  const onChange = e => {
    if (e.target.name === 'title') setTitle(e.target.value);
    if (e.target.name === 'description') setDescription(e.target.value);
    if (e.target.name === 'tags') setTags(e.target.value);
    if (e.target.name === 'category') setCategory(e.target.value);
    if (e.target.name === 'difficulty') setDifficulty(e.target.value);
    if (e.target.name === 'estimatedTime') setEstimatedTime(parseInt(e.target.value));
    if (e.target.name === 'isPublished') setIsPublished(e.target.checked);
    if (e.target.name === 'captureArea') setCaptureArea(e.target.value);
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!capturedImage) {
      setAlert('Please capture a screenshot first', 'warning');
      return;
    }
    
    if (!title.trim()) {
      setAlert('Title is required', 'warning');
      return;
    }
    
    const formData = new FormData();
    formData.append('image', capturedImage);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('category', category);
    formData.append('difficulty', difficulty);
    formData.append('estimatedTime', estimatedTime);
    formData.append('isPublished', isPublished);
    
    try {
      await uploadCapturedScreenshot(formData, history);
      setAlert('Screenshot uploaded successfully', 'success');
    } catch (err) {
      setAlert('Error uploading screenshot', 'danger');
    }
  };

  const retakeScreenshot = () => {
    setCapturedImage(null);
  };

  const closeModal = () => {
    setCapturedImage(null);
    setTitle('');
    setDescription('');
    setTags('');
    setCategory('general');
    setDifficulty('beginner');
    setEstimatedTime(1);
    setIsPublished(false);
  };

  const renderPreview = () => {
    if (!capturedImage) return null;
    
    const imageUrl = URL.createObjectURL(capturedImage);
    
    return (
      <div className="mb-3">
        <h5>Preview</h5>
        <div className="text-center">
          <img 
            ref={previewRef}
            src={imageUrl} 
            alt="Screenshot preview" 
            className="img-fluid" 
            style={{ maxHeight: '400px' }}
          />
        </div>
        <div className="text-center mt-2">
          <button className="btn btn-outline-secondary" onClick={retakeScreenshot}>
            <i className="fas fa-redo mr-1"></i> Retake
          </button>
        </div>
      </div>
    );
  };

  if (!showCaptureModal) {
    return null;
  }

  return (
    <div className="screenshot-capture-modal">
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Capture Screenshot</h5>
              <button type="button" className="close" onClick={closeModal}>
                <span>&times;</span>
              </button>
            </div>
            
            <div className="modal-body">
              {capturing ? (
                <div className="text-center py-4">
                  <Spinner />
                  <p className="mt-2">Capturing screenshot...</p>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  {!capturedImage ? (
                    <div className="capture-options">
                      <h5>Capture Options</h5>
                      
                      <div className="form-group">
                        <label>Capture Area</label>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="captureArea"
                            id="captureWindow"
                            value="window"
                            checked={captureArea === 'window'}
                            onChange={onChange}
                          />
                          <label className="form-check-label" htmlFor="captureWindow">
                            Current Window
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="captureArea"
                            id="captureFull"
                            value="full"
                            checked={captureArea === 'full'}
                            onChange={onChange}
                          />
                          <label className="form-check-label" htmlFor="captureFull">
                            Full Screen
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="captureArea"
                            id="captureSelection"
                            value="selection"
                            checked={captureArea === 'selection'}
                            onChange={onChange}
                          />
                          <label className="form-check-label" htmlFor="captureSelection">
                            Selection
                          </label>
                        </div>
                      </div>
                      
                      <div className="text-center mt-4">
                        <button 
                          type="button" 
                          className="btn btn-primary btn-lg"
                          onClick={startCapture}
                        >
                          <i className="fas fa-camera mr-2"></i> Capture Screenshot
                        </button>
                        <p className="mt-2 text-muted">
                          You can also use the keyboard shortcut: Ctrl+Shift+S (Windows/Linux) or Cmd+Shift+S (Mac)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {renderPreview()}
                      
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
                          <label htmlFor="category">Category</label>
                          <select
                            className="form-control"
                            id="category"
                            name="category"
                            value={category}
                            onChange={onChange}
                          >
                            <option value="general">General</option>
                            <option value="tutorial">Tutorial</option>
                            <option value="demonstration">Demonstration</option>
                            <option value="process">Process</option>
                            <option value="concept">Concept</option>
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
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group col-md-6">
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
                        
                        <div className="form-group col-md-3">
                          <label htmlFor="estimatedTime">Estimated Time (min)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="estimatedTime"
                            name="estimatedTime"
                            value={estimatedTime}
                            onChange={onChange}
                            min="1"
                          />
                        </div>
                        
                        <div className="form-group col-md-3">
                          <div className="form-check mt-4">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="isPublished"
                              name="isPublished"
                              checked={isPublished}
                              onChange={onChange}
                            />
                            <label className="form-check-label" htmlFor="isPublished">
                              Publish
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <button type="submit" className="btn btn-primary">
                          <i className="fas fa-upload mr-1"></i> Upload Screenshot
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary ml-2"
                          onClick={retakeScreenshot}
                        >
                          <i className="fas fa-redo mr-1"></i> Retake
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isSelecting && (
        <div 
          ref={overlayRef}
          className="screenshot-selection-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            cursor: 'crosshair'
          }}
        >
          {selectionBox && (
            <div
              className="selection-box"
              style={{
                position: 'absolute',
                left: `${selectionBox.left}px`,
                top: `${selectionBox.top}px`,
                width: `${selectionBox.width}px`,
                height: `${selectionBox.height}px`,
                border: '2px dashed #fff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
            ></div>
          )}
          <div className="selection-instructions text-white text-center">
            <p>Click and drag to select an area to capture</p>
          </div>
        </div>
      )}
    </div>
  );
};

ScreenshotCapture.propTypes = {
  auth: PropTypes.object.isRequired,
  showCaptureModal: PropTypes.bool.isRequired,
  uploadCapturedScreenshot: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  showCaptureModal: state.ui.showCaptureModal || false
});

export default connect(mapStateToProps, { uploadCapturedScreenshot, setAlert })(withRouter(ScreenshotCapture));
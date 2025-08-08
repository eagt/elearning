import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { 
  addAnnotation, 
  updateAnnotation, 
  deleteAnnotation, 
  setAlert 
} from '../../actions/screenshot';

const ScreenshotAnnotation = ({ 
  screenshot, 
  addAnnotation, 
  updateAnnotation, 
  deleteAnnotation, 
  setAlert 
}) => {
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationType, setAnnotationType] = useState('rectangle');
  const [annotationColor, setAnnotationColor] = useState('#FF0000');
  const [annotationText, setAnnotationText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (screenshot && canvasRef.current) {
      drawScreenshot();
    }
  }, [screenshot]);

  useEffect(() => {
    if (canvasRef.current && screenshot) {
      drawScreenshot();
      drawAnnotations();
    }
  }, [screenshot?.annotations, currentAnnotation, isAnnotating]);

  const drawScreenshot = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
    };
    
    img.src = screenshot.imageUrl;
  };

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Redraw the screenshot first
    drawScreenshot();
    
    // Draw all annotations
    if (screenshot.annotations) {
      screenshot.annotations.forEach(annotation => {
        drawAnnotation(ctx, annotation);
      });
    }
    
    // Draw the current annotation being created
    if (currentAnnotation) {
      drawAnnotation(ctx, currentAnnotation);
    }
  };

  const drawAnnotation = (ctx, annotation) => {
    ctx.strokeStyle = annotation.color;
    ctx.fillStyle = annotation.color;
    ctx.lineWidth = annotation.strokeWidth;
    
    switch (annotation.type) {
      case 'rectangle':
        ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(annotation.x, annotation.y, Math.max(annotation.width, annotation.height) / 2, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'arrow':
        drawArrow(ctx, annotation.x, annotation.y, annotation.x + annotation.width, annotation.y + annotation.height);
        break;
      case 'text':
        ctx.font = `${annotation.fontSize}px Arial`;
        ctx.fillText(annotation.text, annotation.x, annotation.y);
        break;
      case 'highlight':
        ctx.globalAlpha = 0.3;
        ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
        ctx.globalAlpha = 1.0;
        break;
      default:
        break;
    }
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    // Draw the line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // Draw the arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const getCanvasCoordinates = (clientX, clientY) => {
    if (!canvasRef.current || !containerRef.current) {
      return { x: 0, y: 0 };
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    if (!isAnnotating) {
      // Check if clicking on an existing annotation
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      const clickedAnnotation = findAnnotationAtPoint(coords.x, coords.y);
      
      if (clickedAnnotation) {
        setSelectedAnnotationId(clickedAnnotation._id);
        setIsDragging(true);
        setDragStart(coords);
        return;
      }
    }
    
    // Start creating a new annotation
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    
    setCurrentAnnotation({
      type: annotationType,
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0,
      text: annotationText,
      color: annotationColor,
      fontSize: fontSize,
      strokeWidth: strokeWidth,
      order: screenshot.annotations ? screenshot.annotations.length : 0
    });
    
    if (annotationType === 'text') {
      // For text annotations, we don't need to drag
      finishAnnotation();
    }
  };

  const handleMouseMove = (e) => {
    if (!currentAnnotation && !isDragging) return;
    
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    
    if (isDragging && selectedAnnotationId) {
      // Move the selected annotation
      const dx = coords.x - dragStart.x;
      const dy = coords.y - dragStart.y;
      
      const updatedAnnotations = screenshot.annotations.map(annotation => {
        if (annotation._id === selectedAnnotationId) {
          return {
            ...annotation,
            x: annotation.x + dx,
            y: annotation.y + dy
          };
        }
        return annotation;
      });
      
      // Update the screenshot with the moved annotation
      // In a real implementation, you would dispatch an action to update the annotation
      drawAnnotations();
      setDragStart(coords);
    } else if (currentAnnotation) {
      // Resize the current annotation being created
      setCurrentAnnotation({
        ...currentAnnotation,
        width: coords.x - currentAnnotation.x,
        height: coords.y - currentAnnotation.y
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // In a real implementation, you would save the moved annotation
    } else if (currentAnnotation) {
      finishAnnotation();
    }
  };

  const finishAnnotation = async () => {
    if (!currentAnnotation) return;
    
    // For text annotations, ensure there's text
    if (currentAnnotation.type === 'text' && !currentAnnotation.text.trim()) {
      setAlert('Please enter text for the annotation', 'warning');
      setCurrentAnnotation(null);
      return;
    }
    
    try {
      if (selectedAnnotationId) {
        // Update existing annotation
        await updateAnnotation(screenshot._id, selectedAnnotationId, currentAnnotation);
        setAlert('Annotation updated successfully', 'success');
      } else {
        // Add new annotation
        await addAnnotation(screenshot._id, currentAnnotation);
        setAlert('Annotation added successfully', 'success');
      }
      
      setCurrentAnnotation(null);
      setSelectedAnnotationId(null);
      setIsAnnotating(false);
    } catch (err) {
      setAlert('Error saving annotation', 'danger');
    }
  };

  const findAnnotationAtPoint = (x, y) => {
    if (!screenshot.annotations) return null;
    
    // Check annotations in reverse order (top to bottom)
    for (let i = screenshot.annotations.length - 1; i >= 0; i--) {
      const annotation = screenshot.annotations[i];
      
      if (isPointInAnnotation(x, y, annotation)) {
        return annotation;
      }
    }
    
    return null;
  };

  const isPointInAnnotation = (x, y, annotation) => {
    switch (annotation.type) {
      case 'rectangle':
        return x >= annotation.x && 
               x <= annotation.x + annotation.width && 
               y >= annotation.y && 
               y <= annotation.y + annotation.height;
      case 'circle':
        const radius = Math.max(annotation.width, annotation.height) / 2;
        const distance = Math.sqrt(Math.pow(x - annotation.x, 2) + Math.pow(y - annotation.y, 2));
        return distance <= radius;
      case 'text':
        // For text, check if point is near the text position
        return Math.abs(x - annotation.x) < 50 && Math.abs(y - annotation.y) < 20;
      case 'highlight':
        return x >= annotation.x && 
               x <= annotation.x + annotation.width && 
               y >= annotation.y && 
               y <= annotation.y + annotation.height;
      case 'arrow':
        // For arrows, check if point is near the line
        // This is a simplified check
        const lineLength = Math.sqrt(Math.pow(annotation.width, 2) + Math.pow(annotation.height, 2));
        const distanceToStart = Math.sqrt(Math.pow(x - annotation.x, 2) + Math.pow(y - annotation.y, 2));
        const distanceToEnd = Math.sqrt(
          Math.pow(x - (annotation.x + annotation.width), 2) + 
          Math.pow(y - (annotation.y + annotation.height), 2)
        );
        return distanceToStart < 10 || distanceToEnd < 10 || 
               (distanceToStart + distanceToEnd < lineLength + 10);
      default:
        return false;
    }
  };

  const startNewAnnotation = (type) => {
    setAnnotationType(type);
    setIsAnnotating(true);
    setSelectedAnnotationId(null);
  };

  const deleteSelectedAnnotation = async () => {
    if (!selectedAnnotationId) return;
    
    if (window.confirm('Are you sure you want to delete this annotation?')) {
      try {
        await deleteAnnotation(screenshot._id, selectedAnnotationId);
        setAlert('Annotation deleted successfully', 'success');
        setSelectedAnnotationId(null);
      } catch (err) {
        setAlert('Error deleting annotation', 'danger');
      }
    }
  };

  const cancelAnnotation = () => {
    setIsAnnotating(false);
    setCurrentAnnotation(null);
    setSelectedAnnotationId(null);
  };

  return (
    <div className="screenshot-annotation">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Screenshot Annotations</h5>
          <div>
            {selectedAnnotationId && (
              <button 
                className="btn btn-outline-danger btn-sm mr-2"
                onClick={deleteSelectedAnnotation}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            )}
            {isAnnotating ? (
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={cancelAnnotation}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            ) : (
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={() => startNewAnnotation('rectangle')}
              >
                <i className="fas fa-plus"></i> Add Annotation
              </button>
            )}
          </div>
        </div>
        
        <div className="card-body">
          {isAnnotating && (
            <div className="annotation-tools mb-3">
              <div className="form-row">
                <div className="form-group col-md-3">
                  <label>Annotation Type</label>
                  <select 
                    className="form-control"
                    value={annotationType}
                    onChange={(e) => setAnnotationType(e.target.value)}
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="arrow">Arrow</option>
                    <option value="text">Text</option>
                    <option value="highlight">Highlight</option>
                  </select>
                </div>
                
                <div className="form-group col-md-3">
                  <label>Color</label>
                  <input 
                    type="color" 
                    className="form-control"
                    value={annotationColor}
                    onChange={(e) => setAnnotationColor(e.target.value)}
                  />
                </div>
                
                {annotationType === 'text' && (
                  <div className="form-group col-md-3">
                    <label>Font Size</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      min="8"
                      max="72"
                    />
                  </div>
                )}
                
                {(annotationType === 'rectangle' || annotationType === 'circle' || annotationType === 'arrow') && (
                  <div className="form-group col-md-3">
                    <label>Line Width</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      min="1"
                      max="10"
                    />
                  </div>
                )}
                
                {annotationType === 'text' && (
                  <div className="form-group col-md-6">
                    <label>Text</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={annotationText}
                      onChange={(e) => setAnnotationText(e.target.value)}
                      placeholder="Enter annotation text"
                    />
                  </div>
                )}
              </div>
              
              <div className="alert alert-info">
                <i className="fas fa-info-circle mr-1"></i> 
                Click and drag on the image to create a {annotationType} annotation
                {annotationType === 'text' && ', or just click to place text'}
              </div>
            </div>
          )}
          
          <div 
            ref={containerRef}
            className="screenshot-container position-relative"
            style={{ overflow: 'auto', maxHeight: '500px' }}
          >
            <canvas
              ref={canvasRef}
              className="screenshot-canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isAnnotating ? 'crosshair' : 'default' }}
            />
          </div>
          
          {screenshot.annotations && screenshot.annotations.length > 0 && (
            <div className="mt-3">
              <h6>Annotations List</h6>
              <div className="list-group">
                {screenshot.annotations.map((annotation, index) => (
                  <div 
                    key={annotation._id} 
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                      selectedAnnotationId === annotation._id ? 'active' : ''
                    }`}
                    onClick={() => setSelectedAnnotationId(annotation._id)}
                  >
                    <div>
                      <strong>{annotation.type}</strong>
                      {annotation.text && `: ${annotation.text}`}
                    </div>
                    <span className="badge badge-primary badge-pill">
                      Order: {annotation.order + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ScreenshotAnnotation.propTypes = {
  screenshot: PropTypes.object.isRequired,
  addAnnotation: PropTypes.func.isRequired,
  updateAnnotation: PropTypes.func.isRequired,
  deleteAnnotation: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  // Add any state needed here
});

export default connect(mapStateToProps, { 
  addAnnotation, 
  updateAnnotation, 
  deleteAnnotation, 
  setAlert 
})(ScreenshotAnnotation);
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { incrementViewCount, incrementCompletionCount } from '../../actions/presentation';

const PreviewPresentation = ({ presentation, incrementViewCount, incrementCompletionCount }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHotspots, setShowHotspots] = useState(true);
  const [activePopup, setActivePopup] = useState(null);
  const [autoPlayTimer, setAutoPlayTimer] = useState(null);
  const [slideStartTime, setSlideStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const presentationRef = useRef(null);

  useEffect(() => {
    if (presentation) {
      // Increment view count when presentation is first loaded
      incrementViewCount(presentation._id);
      setSlideStartTime(Date.now());
    }

    return () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
      }
    };
  }, [presentation, incrementViewCount]);

  useEffect(() => {
    // Update time spent on current slide
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - slideStartTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [slideStartTime]);

  useEffect(() => {
    // Handle auto play
    if (isPlaying && presentation.settings?.autoPlay) {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
      }

      const interval = (presentation.settings.autoPlayInterval || 5) * 1000;
      const timer = setInterval(() => {
        goToNextSlide();
      }, interval);

      setAutoPlayTimer(timer);
    } else if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      setAutoPlayTimer(null);
    }

    return () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
      }
    };
  }, [isPlaying, presentation.settings]);

  const goToSlide = index => {
    if (index >= 0 && index < presentation.slides.length) {
      setCurrentSlideIndex(index);
      setSlideStartTime(Date.now());
      setTimeSpent(0);
      setActivePopup(null);
      
      // Update progress
      setProgress(((index + 1) / presentation.slides.length) * 100);
      
      // Check if this is the last slide
      if (index === presentation.slides.length - 1) {
        // Increment completion count
        incrementCompletionCount(presentation._id);
      }
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  };

  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (presentationRef.current) {
      if (!document.fullscreenElement) {
        presentationRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleHotspotClick = hotspot => {
    setActivePopup(hotspot);
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  const executeHotspotAction = hotspot => {
    switch (hotspot.action.type) {
      case 'popup':
        setActivePopup(hotspot);
        break;
      case 'navigate':
        if (hotspot.action.slideId) {
          const slideIndex = presentation.slides.findIndex(
            slide => slide._id === hotspot.action.slideId
          );
          if (slideIndex !== -1) {
            goToSlide(slideIndex);
          }
        }
        break;
      case 'open-link':
        if (hotspot.action.url) {
          window.open(hotspot.action.url, hotspot.action.openInNewTab ? '_blank' : '_self');
        }
        break;
      case 'play-media':
        // Media playback would be handled here
        break;
      case 'start-quiz':
        // Quiz start would be handled here
        break;
      default:
        break;
    }
  };

  const getSlideStyle = slide => {
    const style = {};
    
    if (slide.backgroundColor) {
      style.backgroundColor = slide.backgroundColor;
    }
    
    if (slide.backgroundImage) {
      style.backgroundImage = `url(${slide.backgroundImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
    }
    
    if (slide.textColor) {
      style.color = slide.textColor;
    }
    
    return style;
  };

  const getHotspotStyle = hotspot => {
    return {
      position: 'absolute',
      left: `${hotspot.position.x}%`,
      top: `${hotspot.position.y}%`,
      width: `${hotspot.size.width}%`,
      height: `${hotspot.size.height}%`,
      backgroundColor: hotspot.style.backgroundColor,
      border: `${hotspot.style.borderWidth}px solid ${hotspot.style.borderColor}`,
      borderRadius: hotspot.shape === 'circle' ? '50%' : 
                  hotspot.shape === 'ellipse' ? '50%' : '0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: hotspot.style.textColor,
      fontSize: '14px',
      fontWeight: 'bold',
      zIndex: 10
    };
  };

  const getHotspotIcon = icon => {
    const iconMap = {
      'info': 'ℹ️',
      'question': '❓',
      'lightbulb': '💡',
      'exclamation': '⚠️',
      'check': '✅',
      'times': '❌',
      'play': '▶️',
      'pause': '⏸️',
      'stop': '⏹️',
      'link': '🔗',
      'download': '⬇️',
      'upload': '⬆️'
    };
    
    return iconMap[icon] || 'ℹ️';
  };

  if (!presentation || !presentation.slides || presentation.slides.length === 0) {
    return (
      <div className="preview-presentation text-center p-5">
        <h3>No slides available for preview</h3>
        <p>Please add slides to this presentation.</p>
      </div>
    );
  }

  const currentSlide = presentation.slides[currentSlideIndex];

  return (
    <div className="preview-presentation" ref={presentationRef}>
      <div className="presentation-container position-relative">
        {/* Progress bar */}
        {presentation.settings?.showProgress && (
          <div className="progress-bar-container">
            <div className="progress">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div className="text-center">
              <small>Slide {currentSlideIndex + 1} of {presentation.slides.length}</small>
            </div>
          </div>
        )}

        {/* Slide content */}
        <div 
          className="slide-content p-4"
          style={getSlideStyle(currentSlide)}
        >
          {/* Slide title */}
          {currentSlide.title && (
            <h2 className={currentSlide.layout === 'title' ? 'text-center mb-4' : 'mb-3'}>
              {currentSlide.title}
            </h2>
          )}

          {/* Slide content */}
          <div 
            className="slide-body"
            dangerouslySetInnerHTML={{ __html: currentSlide.content }}
          ></div>

          {/* Slide media */}
          {currentSlide.media && currentSlide.media.length > 0 && (
            <div className="slide-media mt-3">
              {currentSlide.media.map((media, index) => (
                <div key={index} className="media-item mb-3">
                  {media.type.startsWith('image/') && (
                    <img 
                      src={media.url} 
                      alt={`Slide media ${index}`} 
                      className="img-fluid"
                    />
                  )}
                  {media.type.startsWith('video/') && (
                    <video controls className="w-100">
                      <source src={media.url} type={media.type} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {media.type.startsWith('audio/') && (
                    <audio controls className="w-100">
                      <source src={media.url} type={media.type} />
                      Your browser does not support the audio tag.
                    </audio>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Hotspots */}
          {showHotspots && currentSlide.hotspots && currentSlide.hotspots.map(hotspot => (
            <div
              key={hotspot._id}
              style={getHotspotStyle(hotspot)}
              onClick={() => executeHotspotAction(hotspot)}
              title={hotspot.title}
            >
              {getHotspotIcon(hotspot.style.icon)}
            </div>
          ))}
        </div>

        {/* Popup for hotspot content */}
        {activePopup && (
          <div className="hotspot-popup position-absolute p-3 bg-white border rounded shadow-lg"
               style={{
                 left: '50%',
                 top: '50%',
                 transform: 'translate(-50%, -50%)',
                 maxWidth: '80%',
                 maxHeight: '80%',
                 overflow: 'auto',
                 zIndex: 100
               }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>{activePopup.title}</h5>
              <button className="btn btn-sm btn-secondary" onClick={closePopup}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: activePopup.action.content }}></div>
          </div>
        )}

        {/* Navigation controls */}
        {presentation.settings?.allowNavigation && (
          <div className="navigation-controls d-flex justify-content-between align-items-center p-3">
            <div>
              <button
                className="btn btn-secondary mr-2"
                onClick={goToPrevSlide}
                disabled={currentSlideIndex === 0}
              >
                <i className="fas fa-arrow-left"></i> Previous
              </button>
              <button
                className="btn btn-secondary"
                onClick={goToNextSlide}
                disabled={currentSlideIndex === presentation.slides.length - 1}
              >
                Next <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            
            <div>
              <button
                className="btn btn-outline-secondary mr-2"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <i className="fas fa-pause"></i>
                ) : (
                  <i className="fas fa-play"></i>
                )}
              </button>
              
              {presentation.settings?.allowFullscreen && (
                <button
                  className="btn btn-outline-secondary mr-2"
                  onClick={toggleFullscreen}
                >
                  <i className="fas fa-expand"></i>
                </button>
              )}
              
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowHotspots(!showHotspots)}
              >
                {showHotspots ? 'Hide Hotspots' : 'Show Hotspots'}
              </button>
            </div>
          </div>
        )}

        {/* Slide timer */}
        <div className="position-absolute bottom-0 right-0 p-2 text-muted">
          <small>Time on slide: {timeSpent}s</small>
        </div>
      </div>
    </div>
  );
};

PreviewPresentation.propTypes = {
  presentation: PropTypes.object.isRequired,
  incrementViewCount: PropTypes.func.isRequired,
  incrementCompletionCount: PropTypes.func.isRequired
};

export default connect(null, { incrementViewCount, incrementCompletionCount })(PreviewPresentation);
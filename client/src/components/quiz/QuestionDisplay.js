import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Draggable from 'react-draggable';

const QuestionDisplay = ({ 
  question, 
  questionIndex, 
  totalQuestions, 
  answer, 
  onAnswerSubmit, 
  quizSettings,
  optionOrders 
}) => {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [dragItems, setDragItems] = useState([]);
  const [dropTargets, setDropTargets] = useState([]);
  const [matchingPairs, setMatchingPairs] = useState({});
  const dragItemRef = useRef(null);
  const dropTargetRef = useRef(null);

  useEffect(() => {
    // Initialize based on question type
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      setCurrentAnswer(answer || '');
    } else if (question.type === 'fill-blank') {
      setCurrentAnswer(answer || '');
    } else if (question.type === 'drag-drop') {
      // Initialize drag items with shuffled order if needed
      if (quizSettings.shuffleOptions && optionOrders) {
        const optionOrder = optionOrders.find(o => o.questionId === question._id);
        if (optionOrder) {
          const shuffledItems = [];
          optionOrder.orders.forEach(order => {
            const option = question.options.find(opt => opt._id === order.optionId);
            if (option) {
              shuffledItems.push(option);
            }
          });
          setDragItems(shuffledItems);
        } else {
          setDragItems(question.options || []);
        }
      } else {
        setDragItems(question.options || []);
      }
      
      // Initialize drop targets
      setDropTargets(Array(question.options.length).fill(null));
      
      // Set current answer if exists
      if (answer) {
        setDropTargets(answer);
      }
    } else if (question.type === 'matching') {
      // Initialize matching pairs
      const initialPairs = {};
      if (answer) {
        answer.forEach(pair => {
          initialPairs[pair.left] = pair.right;
        });
      }
      setMatchingPairs(initialPairs);
    } else if (question.type === 'essay') {
      setCurrentAnswer(answer || '');
    }
  }, [question, answer, quizSettings, optionOrders]);

  const handleMultipleChoiceChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  const handleFillBlankChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  const handleEssayChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  const handleSubmit = () => {
    if (question.type === 'drag-drop') {
      onAnswerSubmit(question._id, dropTargets);
    } else if (question.type === 'matching') {
      // Convert matching pairs to array format
      const pairsArray = Object.keys(matchingPairs).map(left => ({
        left,
        right: matchingPairs[left]
      }));
      onAnswerSubmit(question._id, pairsArray);
    } else {
      onAnswerSubmit(question._id, currentAnswer);
    }
  };

  const handleDragStart = (e, item) => {
    dragItemRef.current = item;
    e.dataTransfer.setData('text/plain', item._id);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    const item = dragItems.find(i => i._id === itemId);
    
    if (item) {
      const newDropTargets = [...dropTargets];
      newDropTargets[index] = item;
      setDropTargets(newDropTargets);
    }
  };

  const handleRemoveDropItem = (index) => {
    const newDropTargets = [...dropTargets];
    newDropTargets[index] = null;
    setDropTargets(newDropTargets);
  };

  const handleMatchingChange = (leftId, rightId) => {
    setMatchingPairs({
      ...matchingPairs,
      [leftId]: rightId
    });
  };

  const renderQuestionMedia = () => {
    if (!question.media || question.media.length === 0) {
      return null;
    }

    return (
      <div className="question-media mb-3">
        {question.media.map((media, index) => (
          <div key={index} className="mb-2">
            {media.type === 'image' && (
              <img src={media.url} className="img-fluid" alt="Question media" />
            )}
            {media.type === 'video' && (
              <video controls className="w-100">
                <source src={media.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            {media.type === 'audio' && (
              <audio controls className="w-100">
                <source src={media.url} type="audio/mpeg" />
                Your browser does not support the audio tag.
              </audio>
            )}
            {media.caption && (
              <p className="text-muted small">{media.caption}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMultipleChoice = () => {
    return (
      <div className="multiple-choice-options">
        {question.options.map((option, index) => (
          <div key={option._id} className="form-check mb-2">
            <input
              className="form-check-input"
              type="radio"
              id={`option-${option._id}`}
              name={`question-${question._id}`}
              value={option._id}
              checked={currentAnswer === option._id}
              onChange={handleMultipleChoiceChange}
            />
            <label className="form-check-label" htmlFor={`option-${option._id}`}>
              {option.text}
            </label>
          </div>
        ))}
      </div>
    );
  };

  const renderTrueFalse = () => {
    return (
      <div className="true-false-options">
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="radio"
            id={`true-${question._id}`}
            name={`question-${question._id}`}
            value="true"
            checked={currentAnswer === 'true'}
            onChange={handleMultipleChoiceChange}
          />
          <label className="form-check-label" htmlFor={`true-${question._id}`}>
            True
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            id={`false-${question._id}`}
            name={`question-${question._id}`}
            value="false"
            checked={currentAnswer === 'false'}
            onChange={handleMultipleChoiceChange}
          />
          <label className="form-check-label" htmlFor={`false-${question._id}`}>
            False
          </label>
        </div>
      </div>
    );
  };

  const renderFillBlank = () => {
    return (
      <div className="fill-blank-input">
        <input
          type="text"
          className="form-control"
          value={currentAnswer}
          onChange={handleFillBlankChange}
          placeholder="Enter your answer"
        />
      </div>
    );
  };

  const renderDragDrop = () => {
    return (
      <div className="drag-drop-container">
        <div className="row">
          <div className="col-md-6">
            <h6>Drag Items</h6>
            <div className="drag-items">
              {dragItems.map((item, index) => (
                <Draggable key={item._id}>
                  <div
                    className="drag-item alert alert-secondary mb-2"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                  >
                    {item.text}
                  </div>
                </Draggable>
              ))}
            </div>
          </div>
          <div className="col-md-6">
            <h6>Drop Targets</h6>
            <div className="drop-targets">
              {dropTargets.map((target, index) => (
                <div
                  key={index}
                  className="drop-target alert alert-light mb-2 p-3 border"
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{ minHeight: '50px' }}
                >
                  {target ? (
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{target.text}</span>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveDropItem(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted">Drop item here</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMatching = () => {
    // Split options into left and right columns
    const leftOptions = question.options.filter((_, index) => index % 2 === 0);
    const rightOptions = question.options.filter((_, index) => index % 2 === 1);

    return (
      <div className="matching-container">
        <div className="row">
          <div className="col-md-6">
            <h6>Column A</h6>
            <div className="matching-left">
              {leftOptions.map((option, index) => (
                <div key={option._id} className="matching-item alert alert-light mb-2 p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{option.text}</span>
                    <select
                      className="form-control form-control-sm w-50"
                      value={matchingPairs[option._id] || ''}
                      onChange={(e) => handleMatchingChange(option._id, e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {rightOptions.map(rightOption => (
                        <option key={rightOption._id} value={rightOption._id}>
                          {rightOption.text}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-6">
            <h6>Column B</h6>
            <div className="matching-right">
              {rightOptions.map((option, index) => (
                <div key={option._id} className="matching-item alert alert-light mb-2 p-3">
                  {option.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEssay = () => {
    return (
      <div className="essay-input">
        <textarea
          className="form-control"
          value={currentAnswer}
          onChange={handleEssayChange}
          rows="5"
          placeholder="Enter your answer"
        ></textarea>
      </div>
    );
  };

  const renderQuestionByType = () => {
    switch (question.type) {
      case 'multiple-choice':
        return renderMultipleChoice();
      case 'true-false':
        return renderTrueFalse();
      case 'fill-blank':
        return renderFillBlank();
      case 'drag-drop':
        return renderDragDrop();
      case 'matching':
        return renderMatching();
      case 'essay':
        return renderEssay();
      default:
        return null;
    }
  };

  return (
    <div className="question-display">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Question {questionIndex + 1} of {totalQuestions}</h5>
        <span className="badge badge-secondary">{question.points} point{question.points !== 1 ? 's' : ''}</span>
      </div>

      <div className="question-text mb-3">
        {question.question}
      </div>

      {renderQuestionMedia()}

      <div className="question-options mb-4">
        {renderQuestionByType()}
      </div>

      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-secondary"
          disabled={questionIndex === 0}
          onClick={() => onAnswerSubmit(question._id, currentAnswer)}
        >
          <i className="fas fa-arrow-left mr-1"></i> Previous
        </button>
        
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          {questionIndex === totalQuestions - 1 ? (
            <>
              <i className="fas fa-check mr-1"></i> Submit Quiz
            </>
          ) : (
            <>
              Next <i className="fas fa-arrow-right ml-1"></i>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

QuestionDisplay.propTypes = {
  question: PropTypes.object.isRequired,
  questionIndex: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  answer: PropTypes.any,
  onAnswerSubmit: PropTypes.func.isRequired,
  quizSettings: PropTypes.object.isRequired,
  optionOrders: PropTypes.array
};

const mapStateToProps = state => ({
  // Add any state needed here
});

export default connect(mapStateToProps)(QuestionDisplay);
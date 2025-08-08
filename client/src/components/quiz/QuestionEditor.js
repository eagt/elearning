import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setAlert } from '../../actions/alert';

const QuestionEditor = ({ 
  question, 
  quizId, 
  onAdd, 
  onUpdate, 
  onDelete, 
  setAlert 
}) => {
  const [formData, setFormData] = useState({
    type: 'multiple-choice',
    question: '',
    options: [],
    correctAnswer: '',
    explanation: '',
    points: 1,
    isRequired: true,
    media: [],
    order: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newOption, setNewOption] = useState({
    text: '',
    isCorrect: false,
    order: 0
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (question) {
      setFormData({
        type: question.type || 'multiple-choice',
        question: question.question || '',
        options: question.options || [],
        correctAnswer: question.correctAnswer || '',
        explanation: question.explanation || '',
        points: question.points || 1,
        isRequired: question.isRequired !== undefined ? question.isRequired : true,
        media: question.media || [],
        order: question.order || 0
      });
      setIsEditing(true);
    } else {
      setFormData({
        type: 'multiple-choice',
        question: '',
        options: [],
        correctAnswer: '',
        explanation: '',
        points: 1,
        isRequired: true,
        media: [],
        order: 0
      });
      setIsEditing(false);
    }
  }, [question]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCheck = e => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const onOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    setFormData({ ...formData, options: newOptions });
  };

  const onNewOptionChange = e => {
    setNewOption({ ...newOption, [e.target.name]: e.target.value });
  };

  const onNewOptionCheck = e => {
    setNewOption({ ...newOption, [e.target.name]: e.target.checked });
  };

  const addOption = () => {
    if (newOption.text.trim() === '') {
      setAlert('Option text is required', 'danger');
      return;
    }

    const option = {
      text: newOption.text,
      isCorrect: newOption.isCorrect,
      order: formData.options.length
    };

    setFormData({
      ...formData,
      options: [...formData.options, option]
    });

    setNewOption({
      text: '',
      isCorrect: false,
      order: formData.options.length + 1
    });
  };

  const removeOption = index => {
    if (formData.options.length <= 1) {
      setAlert('Question must have at least one option', 'danger');
      return;
    }

    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    
    // Update order
    newOptions.forEach((option, i) => {
      option.order = i;
    });

    setFormData({ ...formData, options: newOptions });
  };

  const setCorrectOption = index => {
    const newOptions = [...formData.options];
    
    // For multiple choice, only one option can be correct
    if (formData.type === 'multiple-choice') {
      newOptions.forEach((option, i) => {
        option.isCorrect = i === index;
      });
    } else {
      // For other types, multiple options can be correct
      newOptions[index].isCorrect = !newOptions[index].isCorrect;
    }

    setFormData({ ...formData, options: newOptions });
  };

  const onFileChange = e => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const media = {
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('video/') ? 'video' : 'audio',
          url: event.target.result,
          caption: ''
        };
        
        setFormData({
          ...formData,
          media: [...formData.media, media]
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeMedia = index => {
    const newMedia = [...formData.media];
    newMedia.splice(index, 1);
    setFormData({ ...formData, media: newMedia });
  };

  const updateMediaCaption = (index, caption) => {
    const newMedia = [...formData.media];
    newMedia[index].caption = caption;
    setFormData({ ...formData, media: newMedia });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Validation
    if (formData.question.trim() === '') {
      setAlert('Question is required', 'danger');
      return;
    }

    if (formData.type === 'multiple-choice' || formData.type === 'true-false') {
      if (formData.options.length < 2) {
        setAlert('Question must have at least two options', 'danger');
        return;
      }

      const hasCorrectOption = formData.options.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        setAlert('Question must have at least one correct option', 'danger');
        return;
      }
    }

    if (formData.type === 'fill-blank' && formData.correctAnswer.trim() === '') {
      setAlert('Correct answer is required', 'danger');
      return;
    }

    try {
      if (isEditing) {
        await onUpdate(question._id, formData);
        setAlert('Question updated successfully', 'success');
      } else {
        await onAdd(formData);
        setAlert('Question added successfully', 'success');
      }
    } catch (err) {
      setAlert('Error saving question', 'danger');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await onDelete(question._id);
        setAlert('Question deleted successfully', 'success');
      } catch (err) {
        setAlert('Error deleting question', 'danger');
      }
    }
  };

  const renderOptionsEditor = () => {
    if (formData.type === 'multiple-choice' || formData.type === 'true-false') {
      return (
        <div className="form-group">
          <label>Options</label>
          {formData.options.map((option, index) => (
            <div key={index} className="input-group mb-2">
              <div className="input-group-prepend">
                <div className="input-group-text">
                  <input
                    type="radio"
                    name={`correct-option-${index}`}
                    checked={option.isCorrect}
                    onChange={() => setCorrectOption(index)}
                  />
                </div>
              </div>
              <input
                type="text"
                className="form-control"
                value={option.text}
                onChange={e => onOptionChange(index, 'text', e.target.value)}
                required
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-danger"
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={formData.options.length <= 1}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
          
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <div className="input-group-text">
                <input
                  type="radio"
                  name="new-option-correct"
                  checked={newOption.isCorrect}
                  onChange={onNewOptionCheck}
                />
              </div>
            </div>
            <input
              type="text"
              className="form-control"
              name="text"
              value={newOption.text}
              onChange={onNewOptionChange}
              placeholder="New option"
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={addOption}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      );
    } else if (formData.type === 'fill-blank') {
      return (
        <div className="form-group">
          <label htmlFor="correctAnswer">Correct Answer</label>
          <input
            type="text"
            className="form-control"
            id="correctAnswer"
            name="correctAnswer"
            value={formData.correctAnswer}
            onChange={onChange}
            required
          />
        </div>
      );
    } else if (formData.type === 'drag-drop' || formData.type === 'matching') {
      return (
        <div className="form-group">
          <label>Correct Answers (comma separated)</label>
          <input
            type="text"
            className="form-control"
            name="correctAnswer"
            value={formData.correctAnswer}
            onChange={onChange}
            placeholder="For drag-drop: item1, item2, item3"
            required
          />
          <small className="form-text text-muted">
            {formData.type === 'drag-drop' 
              ? 'Enter the correct order of items, separated by commas.' 
              : 'Enter the correct matches, separated by commas (e.g., A1,B2,C3).'}
          </small>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="question-editor">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {isEditing ? 'Edit Question' : 'Add New Question'}
          </h5>
          {isEditing && (
            <button className="btn btn-sm btn-danger" onClick={handleDelete}>
              <i className="fas fa-trash"></i> Delete
            </button>
          )}
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="type">Question Type</label>
              <select
                className="form-control"
                id="type"
                name="type"
                value={formData.type}
                onChange={onChange}
                disabled={isEditing}
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="fill-blank">Fill in the Blank</option>
                <option value="drag-drop">Drag and Drop</option>
                <option value="matching">Matching</option>
                <option value="essay">Essay</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="question">Question</label>
              <textarea
                className="form-control"
                id="question"
                name="question"
                value={formData.question}
                onChange={onChange}
                rows="3"
                required
              ></textarea>
            </div>

            {renderOptionsEditor()}

            <div className="form-group">
              <label htmlFor="explanation">Explanation</label>
              <textarea
                className="form-control"
                id="explanation"
                name="explanation"
                value={formData.explanation}
                onChange={onChange}
                rows="2"
              ></textarea>
              <small className="form-text text-muted">
                Explanation will be shown after the quiz is completed if enabled in settings.
              </small>
            </div>

            <div className="form-row">
              <div className="form-group col-md-4">
                <label htmlFor="points">Points</label>
                <input
                  type="number"
                  className="form-control"
                  id="points"
                  name="points"
                  value={formData.points}
                  onChange={onChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group col-md-4">
                <label htmlFor="order">Order</label>
                <input
                  type="number"
                  className="form-control"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={onChange}
                  min="0"
                />
              </div>

              <div className="form-group col-md-4">
                <div className="form-check mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isRequired"
                    name="isRequired"
                    checked={formData.isRequired}
                    onChange={onCheck}
                  />
                  <label className="form-check-label" htmlFor="isRequired">
                    Required
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Media</label>
              <div className="d-flex flex-wrap">
                {formData.media.map((media, index) => (
                  <div key={index} className="card mr-2 mb-2" style={{ width: '150px' }}>
                    {media.type === 'image' && (
                      <img src={media.url} className="card-img-top" alt="Question media" style={{ height: '100px', objectFit: 'cover' }} />
                    )}
                    {media.type === 'video' && (
                      <div className="card-img-top d-flex align-items-center justify-content-center bg-secondary" style={{ height: '100px' }}>
                        <i className="fas fa-video fa-2x text-white"></i>
                      </div>
                    )}
                    {media.type === 'audio' && (
                      <div className="card-img-top d-flex align-items-center justify-content-center bg-secondary" style={{ height: '100px' }}>
                        <i className="fas fa-music fa-2x text-white"></i>
                      </div>
                    )}
                    <div className="card-body p-2">
                      <input
                        type="text"
                        className="form-control form-control-sm mb-1"
                        placeholder="Caption"
                        value={media.caption}
                        onChange={e => updateMediaCaption(index, e.target.value)}
                      />
                      <button
                        className="btn btn-sm btn-danger btn-block"
                        onClick={() => removeMedia(index)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={triggerFileInput}
              >
                <i className="fas fa-plus mr-1"></i> Add Media
              </button>
              <input
                type="file"
                className="d-none"
                ref={fileInputRef}
                onChange={onFileChange}
                accept="image/*,video/*,audio/*"
                multiple
              />
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

QuestionEditor.propTypes = {
  question: PropTypes.object,
  quizId: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired
};

export default connect(null, { setAlert })(QuestionEditor);
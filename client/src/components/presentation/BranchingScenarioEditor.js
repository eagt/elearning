import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setAlert } from '../../actions/alert';

const BranchingScenarioEditor = ({ 
  scenario, 
  presentation, 
  onUpdate, 
  onDelete, 
  setAlert 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startSlideId: '',
    endSlideIds: [],
    conditions: [],
    isDefault: false,
    isActive: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newCondition, setNewCondition] = useState({
    type: 'quiz-score',
    operator: 'greater-than',
    value: '',
    quizId: ''
  });

  const {
    name,
    description,
    startSlideId,
    endSlideIds,
    conditions,
    isDefault,
    isActive
  } = formData;

  useEffect(() => {
    if (scenario) {
      setFormData({
        name: scenario.name || '',
        description: scenario.description || '',
        startSlideId: scenario.startSlideId || '',
        endSlideIds: scenario.endSlideIds || [],
        conditions: scenario.conditions || [],
        isDefault: scenario.isDefault || false,
        isActive: scenario.isActive !== undefined ? scenario.isActive : true
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [scenario]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCheck = e => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const onConditionChange = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setFormData({ ...formData, conditions: newConditions });
  };

  const onNewConditionChange = (field, value) => {
    setNewCondition({ ...newCondition, [field]: value });
  };

  const addCondition = () => {
    if (newCondition.type && newCondition.operator && newCondition.value) {
      setFormData({
        ...formData,
        conditions: [...conditions, newCondition]
      });
      setNewCondition({
        type: 'quiz-score',
        operator: 'greater-than',
        value: '',
        quizId: ''
      });
    }
  };

  const removeCondition = index => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    setFormData({ ...formData, conditions: newConditions });
  };

  const toggleEndSlide = slideId => {
    if (endSlideIds.includes(slideId)) {
      setFormData({
        ...formData,
        endSlideIds: endSlideIds.filter(id => id !== slideId)
      });
    } else {
      setFormData({
        ...formData,
        endSlideIds: [...endSlideIds, slideId]
      });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      const scenarioData = {
        name,
        description,
        startSlideId,
        endSlideIds,
        conditions,
        isDefault,
        isActive
      };

      await onUpdate(scenario._id, scenarioData);
      setAlert('Branching scenario updated successfully', 'success');
    } catch (err) {
      setAlert('Error updating branching scenario', 'danger');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this branching scenario?')) {
      onDelete(scenario._id);
    }
  };

  const getOperatorOptions = () => {
    const operators = [
      { value: 'equal', label: 'Equal to' },
      { value: 'not-equal', label: 'Not equal to' },
      { value: 'greater-than', label: 'Greater than' },
      { value: 'less-than', label: 'Less than' },
      { value: 'greater-equal', label: 'Greater than or equal to' },
      { value: 'less-equal', label: 'Less than or equal to' },
      { value: 'contains', label: 'Contains' },
      { value: 'not-contains', label: 'Does not contain' }
    ];

    return operators.map(op => (
      <option key={op.value} value={op.value}>
        {op.label}
      </option>
    ));
  };

  const getConditionTypeOptions = () => {
    const types = [
      { value: 'quiz-score', label: 'Quiz Score' },
      { value: 'slide-viewed', label: 'Slide Viewed' },
      { value: 'time-spent', label: 'Time Spent' },
      { value: 'hotspot-clicked', label: 'Hotspot Clicked' },
      { value: 'user-role', label: 'User Role' }
    ];

    return types.map(type => (
      <option key={type.value} value={type.value}>
        {type.label}
      </option>
    ));
  };

  return (
    <div className="branching-scenario-editor">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{isEditing ? 'Edit Branching Scenario' : 'Add Branching Scenario'}</h4>
          {isEditing && (
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete Scenario
            </button>
          )}
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={name}
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
                <label htmlFor="startSlideId">Start Slide</label>
                <select
                  className="form-control"
                  id="startSlideId"
                  name="startSlideId"
                  value={startSlideId}
                  onChange={onChange}
                  required
                >
                  <option value="">Select a slide</option>
                  {presentation.slides && presentation.slides.map(slide => (
                    <option key={slide._id} value={slide._id}>
                      {slide.title || `Slide ${presentation.slides.indexOf(slide) + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group col-md-3">
                <div className="form-check mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={isDefault}
                    onChange={onCheck}
                  />
                  <label className="form-check-label" htmlFor="isDefault">
                    Default Scenario
                  </label>
                </div>
              </div>

              <div className="form-group col-md-3">
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
              <label>End Slides</label>
              <div className="card">
                <div className="card-body">
                  {presentation.slides && presentation.slides.map(slide => (
                    <div key={slide._id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`endSlide-${slide._id}`}
                        checked={endSlideIds.includes(slide._id)}
                        onChange={() => toggleEndSlide(slide._id)}
                      />
                      <label className="form-check-label" htmlFor={`endSlide-${slide._id}`}>
                        {slide.title || `Slide ${presentation.slides.indexOf(slide) + 1}`}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Conditions</label>
              <div className="card">
                <div className="card-body">
                  {conditions.length > 0 ? (
                    conditions.map((condition, index) => (
                      <div key={index} className="mb-3 p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6>Condition {index + 1}</h6>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => removeCondition(index)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className="form-row">
                          <div className="form-group col-md-4">
                            <label>Type</label>
                            <select
                              className="form-control"
                              value={condition.type}
                              onChange={e => onConditionChange(index, 'type', e.target.value)}
                            >
                              {getConditionTypeOptions()}
                            </select>
                          </div>
                          <div className="form-group col-md-4">
                            <label>Operator</label>
                            <select
                              className="form-control"
                              value={condition.operator}
                              onChange={e => onConditionChange(index, 'operator', e.target.value)}
                            >
                              {getOperatorOptions()}
                            </select>
                          </div>
                          <div className="form-group col-md-4">
                            <label>Value</label>
                            <input
                              type="text"
                              className="form-control"
                              value={condition.value}
                              onChange={e => onConditionChange(index, 'value', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        {condition.type === 'quiz-score' && (
                          <div className="form-group">
                            <label>Quiz ID</label>
                            <input
                              type="text"
                              className="form-control"
                              value={condition.quizId || ''}
                              onChange={e => onConditionChange(index, 'quizId', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No conditions added yet. This scenario will always be triggered.</p>
                  )}
                  
                  <h6 className="mt-4">Add New Condition</h6>
                  <div className="form-row">
                    <div className="form-group col-md-4">
                      <label>Type</label>
                      <select
                        className="form-control"
                        value={newCondition.type}
                        onChange={e => onNewConditionChange('type', e.target.value)}
                      >
                        {getConditionTypeOptions()}
                      </select>
                    </div>
                    <div className="form-group col-md-4">
                      <label>Operator</label>
                      <select
                        className="form-control"
                        value={newCondition.operator}
                        onChange={e => onNewConditionChange('operator', e.target.value)}
                      >
                        {getOperatorOptions()}
                      </select>
                    </div>
                    <div className="form-group col-md-4">
                      <label>Value</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newCondition.value}
                        onChange={e => onNewConditionChange('value', e.target.value)}
                      />
                    </div>
                  </div>
                  {newCondition.type === 'quiz-score' && (
                    <div className="form-group">
                      <label>Quiz ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newCondition.quizId || ''}
                        onChange={e => onNewConditionChange('quizId', e.target.value)}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={addCondition}
                  >
                    Add Condition
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Update Scenario' : 'Add Scenario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

BranchingScenarioEditor.propTypes = {
  scenario: PropTypes.object,
  presentation: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired
};

export default connect(null, { setAlert })(BranchingScenarioEditor);
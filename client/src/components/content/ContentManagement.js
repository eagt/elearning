import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  toggleFeatureCourse,
  clearCourse
} from '../../actions/course';
import {
  getPresentations,
  getPresentation,
  addPresentation,
  updatePresentation,
  deletePresentation,
  togglePublishPresentation,
  toggleFeaturePresentation,
  clearPresentation
} from '../../actions/presentation';
import {
  getQuizzes,
  getQuiz,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz,
  toggleFeatureQuiz,
  clearQuiz
} from '../../actions/quiz';
import {
  getScreenshots,
  getScreenshot,
  addScreenshot,
  updateScreenshot,
  deleteScreenshot,
  togglePublishScreenshot,
  toggleFeatureScreenshot,
  clearScreenshot
} from '../../actions/screenshot';
import {
  getTutorials,
  getTutorial,
  addTutorial,
  updateTutorial,
  deleteTutorial,
  togglePublishTutorial,
  toggleFeatureTutorial,
  clearTutorial
} from '../../actions/tutorial';
import { setAlert } from '../../actions/alert';
import Spinner from '../layout/Spinner';

const ContentManagement = ({
  auth,
  course,
  presentation,
  quiz,
  screenshot,
  tutorial,
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  toggleFeatureCourse,
  clearCourse,
  getPresentations,
  getPresentation,
  addPresentation,
  updatePresentation,
  deletePresentation,
  togglePublishPresentation,
  toggleFeaturePresentation,
  clearPresentation,
  getQuizzes,
  getQuiz,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz,
  toggleFeatureQuiz,
  clearQuiz,
  getScreenshots,
  getScreenshot,
  addScreenshot,
  updateScreenshot,
  deleteScreenshot,
  togglePublishScreenshot,
  toggleFeatureScreenshot,
  clearScreenshot,
  getTutorials,
  getTutorial,
  addTutorial,
  updateTutorial,
  deleteTutorial,
  togglePublishTutorial,
  toggleFeatureTutorial,
  clearTutorial,
  setAlert,
  history
}) => {
  const [activeTab, setActiveTab] = useState('courses');
  const [contentView, setContentView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedPresentation, setSelectedPresentation] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [assignToCourse, setAssignToCourse] = useState('');
  const [assignToPresentation, setAssignToPresentation] = useState('');
  const [assignToTutorial, setAssignToTutorial] = useState('');

  useEffect(() => {
    // Load content based on active tab
    switch (activeTab) {
      case 'courses':
        getCourses();
        break;
      case 'presentations':
        getPresentations();
        break;
      case 'quizzes':
        getQuizzes();
        break;
      case 'screenshots':
        getScreenshots();
        break;
      case 'tutorials':
        getTutorials();
        break;
      default:
        getCourses();
    }
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setContentView('list');
    setSearchTerm('');
    setSelectedItems([]);
    clearSelections();
  };

  const clearSelections = () => {
    setSelectedCourse(null);
    setSelectedPresentation(null);
    setSelectedQuiz(null);
    setSelectedScreenshot(null);
    setSelectedTutorial(null);
    clearCourse();
    clearPresentation();
    clearQuiz();
    clearScreenshot();
    clearTutorial();
  };

  const handleViewChange = (view) => {
    setContentView(view);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectItem = (item) => {
    switch (activeTab) {
      case 'courses':
        setSelectedCourse(item._id);
        getCourse(item._id);
        break;
      case 'presentations':
        setSelectedPresentation(item._id);
        getPresentation(item._id);
        break;
      case 'quizzes':
        setSelectedQuiz(item._id);
        getQuiz(item._id);
        break;
      case 'screenshots':
        setSelectedScreenshot(item._id);
        getScreenshot(item._id);
        break;
      case 'tutorials':
        setSelectedTutorial(item._id);
        getTutorial(item._id);
        break;
      default:
        break;
    }
    setContentView('detail');
  };

  const handleSelectMultiple = (itemId, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = getCurrentContent().map(item => item._id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'courses':
        return course.courses || [];
      case 'presentations':
        return presentation.presentations || [];
      case 'quizzes':
        return quiz.quizzes || [];
      case 'screenshots':
        return screenshot.screenshots || [];
      case 'tutorials':
        return tutorial.tutorials || [];
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'courses':
        return course.loading;
      case 'presentations':
        return presentation.loading;
      case 'quizzes':
        return quiz.loading;
      case 'screenshots':
        return screenshot.loading;
      case 'tutorials':
        return tutorial.loading;
      default:
        return false;
    }
  };

  const getCurrentItem = () => {
    switch (activeTab) {
      case 'courses':
        return course.course;
      case 'presentations':
        return presentation.presentation;
      case 'quizzes':
        return quiz.quiz;
      case 'screenshots':
        return screenshot.screenshot;
      case 'tutorials':
        return tutorial.tutorial;
      default:
        return null;
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      switch (activeTab) {
        case 'courses':
          await togglePublishCourse(id);
          setAlert('Course publish status updated', 'success');
          break;
        case 'presentations':
          await togglePublishPresentation(id);
          setAlert('Presentation publish status updated', 'success');
          break;
        case 'quizzes':
          await togglePublishQuiz(id);
          setAlert('Quiz publish status updated', 'success');
          break;
        case 'screenshots':
          await togglePublishScreenshot(id);
          setAlert('Screenshot publish status updated', 'success');
          break;
        case 'tutorials':
          await togglePublishTutorial(id);
          setAlert('Tutorial publish status updated', 'success');
          break;
        default:
          break;
      }
    } catch (err) {
      setAlert('Error updating publish status', 'danger');
    }
  };

  const handleToggleFeature = async (id) => {
    try {
      switch (activeTab) {
        case 'courses':
          await toggleFeatureCourse(id);
          setAlert('Course feature status updated', 'success');
          break;
        case 'presentations':
          await toggleFeaturePresentation(id);
          setAlert('Presentation feature status updated', 'success');
          break;
        case 'quizzes':
          await toggleFeatureQuiz(id);
          setAlert('Quiz feature status updated', 'success');
          break;
        case 'screenshots':
          await toggleFeatureScreenshot(id);
          setAlert('Screenshot feature status updated', 'success');
          break;
        case 'tutorials':
          await toggleFeatureTutorial(id);
          setAlert('Tutorial feature status updated', 'success');
          break;
        default:
          break;
      }
    } catch (err) {
      setAlert('Error updating feature status', 'danger');
    }
  };

  const handleDelete = async (id) => {
    try {
      switch (activeTab) {
        case 'courses':
          await deleteCourse(id);
          setAlert('Course deleted successfully', 'success');
          break;
        case 'presentations':
          await deletePresentation(id);
          setAlert('Presentation deleted successfully', 'success');
          break;
        case 'quizzes':
          await deleteQuiz(id);
          setAlert('Quiz deleted successfully', 'success');
          break;
        case 'screenshots':
          await deleteScreenshot(id);
          setAlert('Screenshot deleted successfully', 'success');
          break;
        case 'tutorials':
          await deleteTutorial(id);
          setAlert('Tutorial deleted successfully', 'success');
          break;
        default:
          break;
      }
    } catch (err) {
      setAlert('Error deleting item', 'danger');
    }
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleAssign = () => {
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    try {
      // In a real implementation, this would make API calls to assign items
      setAlert('Items assigned successfully', 'success');
      setShowAssignModal(false);
      setSelectedItems([]);
    } catch (err) {
      setAlert('Error assigning items', 'danger');
    }
  };

  const filteredContent = getCurrentContent().filter(item => {
    if (!searchTerm) return true;
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  });

  const renderContentList = () => {
    if (getCurrentLoading()) {
      return <Spinner />;
    }

    if (filteredContent.length === 0) {
      return (
        <div className="text-center py-5">
          <h4>No content found</h4>
          <p className="text-muted">
            {searchTerm ? 'No content matches your search.' : 'Create your first item to get started.'}
          </p>
          <button className="btn btn-primary" onClick={handleCreate}>
            <i className="fas fa-plus mr-1"></i> Create New
          </button>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th width="50">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={selectedItems.length === filteredContent.length && filteredContent.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContent.map((item) => (
              <tr key={item._id}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedItems.includes(item._id)}
                    onChange={(e) => handleSelectMultiple(item._id, e.target.checked)}
                  />
                </td>
                <td>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleViewChange('detail'); handleSelectItem(item); }}>
                    {item.title}
                  </a>
                  {item.isFeatured && <span className="badge badge-warning ml-2">Featured</span>}
                </td>
                <td>{item.category}</td>
                <td>
                  <span className={`badge ${item.isPublished ? 'badge-success' : 'badge-secondary'}`}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        handleViewChange('detail');
                        handleSelectItem(item);
                      }}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleTogglePublish(item._id)}
                    >
                      <i className={`fas ${item.isPublished ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleToggleFeature(item._id)}
                    >
                      <i className={`fas ${item.isFeatured ? 'fa-star' : 'fa-star-half-alt'}`}></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContentGrid = () => {
    if (getCurrentLoading()) {
      return <Spinner />;
    }

    if (filteredContent.length === 0) {
      return (
        <div className="text-center py-5">
          <h4>No content found</h4>
          <p className="text-muted">
            {searchTerm ? 'No content matches your search.' : 'Create your first item to get started.'}
          </p>
          <button className="btn btn-primary" onClick={handleCreate}>
            <i className="fas fa-plus mr-1"></i> Create New
          </button>
        </div>
      );
    }

    return (
      <div className="row">
        {filteredContent.map((item) => (
          <div key={item._id} className="col-md-4 mb-4">
            <div className="card h-100">
              <img 
                src={item.thumbnail || 'default-thumbnail.jpg'} 
                className="card-img-top" 
                alt={item.title}
                style={{ height: '180px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">
                  {item.title}
                  {item.isFeatured && <span className="badge badge-warning ml-2">Featured</span>}
                </h5>
                <p className="card-text text-muted">{item.shortDescription || item.description?.substring(0, 100)}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className={`badge ${item.isPublished ? 'badge-success' : 'badge-secondary'}`}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <small className="text-muted">{new Date(item.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
              <div className="card-footer bg-transparent">
                <div className="btn-group w-100">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      handleViewChange('detail');
                      handleSelectItem(item);
                    }}
                  >
                    <i className="fas fa-eye mr-1"></i> View
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleTogglePublish(item._id)}
                  >
                    <i className={`fas ${item.isPublished ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(item._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContentDetail = () => {
    const item = getCurrentItem();
    
    if (!item) {
      return <Spinner />;
    }

    return (
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{item.title}</h4>
          <div>
            <button className="btn btn-outline-secondary btn-sm mr-2" onClick={() => setContentView('list')}>
              <i className="fas fa-arrow-left mr-1"></i> Back to List
            </button>
            <button className="btn btn-primary btn-sm mr-2" onClick={handleEdit}>
              <i className="fas fa-edit mr-1"></i> Edit
            </button>
            <button 
              className={`btn btn-sm mr-2 ${item.isPublished ? 'btn-outline-secondary' : 'btn-success'}`}
              onClick={() => handleTogglePublish(item._id)}
            >
              <i className={`fas ${item.isPublished ? 'fa-eye-slash' : 'fa-eye'} mr-1`}></i>
              {item.isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <button 
              className={`btn btn-sm ${item.isFeatured ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => handleToggleFeature(item._id)}
            >
              <i className={`fas ${item.isFeatured ? 'fa-star' : 'fa-star-half-alt'} mr-1`}></i>
              {item.isFeatured ? 'Unfeature' : 'Feature'}
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <div className="mb-4">
                <img 
                  src={item.thumbnail || 'default-thumbnail.jpg'} 
                  className="img-fluid rounded"
                  alt={item.title}
                />
              </div>
              
              <h5>Description</h5>
              <p>{item.description || 'No description available.'}</p>
              
              {item.tags && item.tags.length > 0 && (
                <div className="mb-3">
                  <h5>Tags</h5>
                  <div>
                    {item.tags.map((tag, index) => (
                      <span key={index} className="badge badge-info mr-1">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'courses' && item.presentations && item.presentations.length > 0 && (
                <div className="mb-3">
                  <h5>Presentations</h5>
                  <ul className="list-group">
                    {item.presentations.map(presentation => (
                      <li key={presentation._id} className="list-group-item">
                        {presentation.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {activeTab === 'courses' && item.quizzes && item.quizzes.length > 0 && (
                <div className="mb-3">
                  <h5>Quizzes</h5>
                  <ul className="list-group">
                    {item.quizzes.map(quiz => (
                      <li key={quiz._id} className="list-group-item">
                        {quiz.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {activeTab === 'courses' && item.tutorials && item.tutorials.length > 0 && (
                <div className="mb-3">
                  <h5>Tutorials</h5>
                  <ul className="list-group">
                    {item.tutorials.map(tutorial => (
                      <li key={tutorial._id} className="list-group-item">
                        {tutorial.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {activeTab === 'presentations' && item.slides && item.slides.length > 0 && (
                <div className="mb-3">
                  <h5>Slides ({item.slides.length})</h5>
                  <div className="alert alert-info">
                    This presentation contains {item.slides.length} slides.
                  </div>
                </div>
              )}
              
              {activeTab === 'quizzes' && item.questions && item.questions.length > 0 && (
                <div className="mb-3">
                  <h5>Questions ({item.questions.length})</h5>
                  <div className="alert alert-info">
                    This quiz contains {item.questions.length} questions.
                  </div>
                </div>
              )}
              
              {activeTab === 'tutorials' && item.steps && item.steps.length > 0 && (
                <div className="mb-3">
                  <h5>Steps ({item.steps.length})</h5>
                  <div className="alert alert-info">
                    This tutorial contains {item.steps.length} steps.
                  </div>
                </div>
              )}
            </div>
            
            <div className="col-md-4">
              <div className="card mb-3">
                <div className="card-header">
                  <h6 className="mb-0">Details</h6>
                </div>
                <div className="card-body">
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                          <span className={`badge ${item.isPublished ? 'badge-success' : 'badge-secondary'}`}>
                            {item.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Category:</strong></td>
                        <td>{item.category}</td>
                      </tr>
                      <tr>
                        <td><strong>Difficulty:</strong></td>
                        <td>{item.difficulty}</td>
                      </tr>
                      <tr>
                        <td><strong>Created:</strong></td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td><strong>Updated:</strong></td>
                        <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                      </tr>
                      {item.estimatedTime && (
                        <tr>
                          <td><strong>Estimated Time:</strong></td>
                          <td>{item.estimatedTime} min</td>
                        </tr>
                      )}
                      {item.viewCount !== undefined && (
                        <tr>
                          <td><strong>Views:</strong></td>
                          <td>{item.viewCount}</td>
                        </tr>
                      )}
                      {item.completionCount !== undefined && (
                        <tr>
                          <td><strong>Completions:</strong></td>
                          <td>{item.completionCount}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Actions</h6>
                </div>
                <div className="card-body">
                  <button className="btn btn-primary btn-block mb-2" onClick={handleEdit}>
                    <i className="fas fa-edit mr-1"></i> Edit
                  </button>
                  <button 
                    className={`btn btn-block mb-2 ${item.isPublished ? 'btn-outline-secondary' : 'btn-success'}`}
                    onClick={() => handleTogglePublish(item._id)}
                  >
                    <i className={`fas ${item.isPublished ? 'fa-eye-slash' : 'fa-eye'} mr-1`}></i>
                    {item.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button 
                    className={`btn btn-block mb-2 ${item.isFeatured ? 'btn-warning' : 'btn-outline-warning'}`}
                    onClick={() => handleToggleFeature(item._id)}
                  >
                    <i className={`fas ${item.isFeatured ? 'fa-star' : 'fa-star-half-alt'} mr-1`}></i>
                    {item.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button className="btn btn-outline-danger btn-block" onClick={() => handleDelete(item._id)}>
                    <i className="fas fa-trash mr-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateModal = () => {
    return (
      <div className={`modal ${showCreateModal ? 'd-block' : ''}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create New {activeTab.slice(0, -1)}</h5>
              <button type="button" className="close" onClick={() => setShowCreateModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                This would open a form to create a new {activeTab.slice(0, -1)}. In a real implementation, 
                this would include all the necessary fields for the content type.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary">
                Create {activeTab.slice(0, -1)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    return (
      <div className={`modal ${showEditModal ? 'd-block' : ''}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit {activeTab.slice(0, -1)}</h5>
              <button type="button" className="close" onClick={() => setShowEditModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                This would open a form to edit the selected {activeTab.slice(0, -1)}. In a real implementation, 
                this would include all the necessary fields for the content type.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAssignModal = () => {
    return (
      <div className={`modal ${showAssignModal ? 'd-block' : ''}`} tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Assign Content</h5>
              <button type="button" className="close" onClick={() => setShowAssignModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                You have selected {selectedItems.length} {activeTab} to assign.
              </div>
              
              <div className="form-group">
                <label htmlFor="assignTo">Assign to</label>
                <select 
                  className="form-control" 
                  id="assignTo"
                  value={assignToCourse || assignToPresentation || assignToTutorial || ''}
                  onChange={(e) => {
                    if (activeTab === 'presentations' || activeTab === 'quizzes' || activeTab === 'tutorials') {
                      setAssignToCourse(e.target.value);
                    } else if (activeTab === 'screenshots') {
                      setAssignToTutorial(e.target.value);
                    }
                  }}
                >
                  <option value="">Select a course</option>
                  {course.courses && course.courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleAssignSubmit}>
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="content-management">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3">Content Management</h1>
          <div>
            {selectedItems.length > 0 && (
              <button className="btn btn-outline-primary mr-2" onClick={handleAssign}>
                <i className="fas fa-link mr-1"></i> Assign ({selectedItems.length})
              </button>
            )}
            <button className="btn btn-primary" onClick={handleCreate}>
              <i className="fas fa-plus mr-1"></i> Create New
            </button>
          </div>
        </div>

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => handleTabChange('courses')}
            >
              Courses
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'presentations' ? 'active' : ''}`}
              onClick={() => handleTabChange('presentations')}
            >
              Presentations
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'quizzes' ? 'active' : ''}`}
              onClick={() => handleTabChange('quizzes')}
            >
              Quizzes
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'screenshots' ? 'active' : ''}`}
              onClick={() => handleTabChange('screenshots')}
            >
              Screenshots
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'tutorials' ? 'active' : ''}`}
              onClick={() => handleTabChange('tutorials')}
            >
              Tutorials
            </button>
          </li>
        </ul>

        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="input-group mr-3" style={{ width: '300px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <div className="input-group-append">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                </div>
              </div>
              <div className="btn-group">
                <button 
                  className={`btn btn-sm ${contentView === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleViewChange('list')}
                >
                  <i className="fas fa-list"></i>
                </button>
                <button 
                  className={`btn btn-sm ${contentView === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleViewChange('grid')}
                >
                  <i className="fas fa-th"></i>
                </button>
              </div>
            </div>
            <div>
              <span className="text-muted">
                Showing {filteredContent.length} of {getCurrentContent().length} {activeTab}
              </span>
            </div>
          </div>
          <div className="card-body">
            {contentView === 'list' && renderContentList()}
            {contentView === 'grid' && renderContentGrid()}
            {contentView === 'detail' && renderContentDetail()}
          </div>
        </div>
      </div>

      {renderCreateModal()}
      {renderEditModal()}
      {renderAssignModal()}
    </div>
  );
};

ContentManagement.propTypes = {
  auth: PropTypes.object.isRequired,
  course: PropTypes.object.isRequired,
  presentation: PropTypes.object.isRequired,
  quiz: PropTypes.object.isRequired,
  screenshot: PropTypes.object.isRequired,
  tutorial: PropTypes.object.isRequired,
  getCourses: PropTypes.func.isRequired,
  getCourse: PropTypes.func.isRequired,
  addCourse: PropTypes.func.isRequired,
  updateCourse: PropTypes.func.isRequired,
  deleteCourse: PropTypes.func.isRequired,
  togglePublishCourse: PropTypes.func.isRequired,
  toggleFeatureCourse: PropTypes.func.isRequired,
  clearCourse: PropTypes.func.isRequired,
  getPresentations: PropTypes.func.isRequired,
  getPresentation: PropTypes.func.isRequired,
  addPresentation: PropTypes.func.isRequired,
  updatePresentation: PropTypes.func.isRequired,
  deletePresentation: PropTypes.func.isRequired,
  togglePublishPresentation: PropTypes.func.isRequired,
  toggleFeaturePresentation: PropTypes.func.isRequired,
  clearPresentation: PropTypes.func.isRequired,
  getQuizzes: PropTypes.func.isRequired,
  getQuiz: PropTypes.func.isRequired,
  addQuiz: PropTypes.func.isRequired,
  updateQuiz: PropTypes.func.isRequired,
  deleteQuiz: PropTypes.func.isRequired,
  togglePublishQuiz: PropTypes.func.isRequired,
  toggleFeatureQuiz: PropTypes.func.isRequired,
  clearQuiz: PropTypes.func.isRequired,
  getScreenshots: PropTypes.func.isRequired,
  getScreenshot: PropTypes.func.isRequired,
  addScreenshot: PropTypes.func.isRequired,
  updateScreenshot: PropTypes.func.isRequired,
  deleteScreenshot: PropTypes.func.isRequired,
  togglePublishScreenshot: PropTypes.func.isRequired,
  toggleFeatureScreenshot: PropTypes.func.isRequired,
  clearScreenshot: PropTypes.func.isRequired,
  getTutorials: PropTypes.func.isRequired,
  getTutorial: PropTypes.func.isRequired,
  addTutorial: PropTypes.func.isRequired,
  updateTutorial: PropTypes.func.isRequired,
  deleteTutorial: PropTypes.func.isRequired,
  togglePublishTutorial: PropTypes.func.isRequired,
  toggleFeatureTutorial: PropTypes.func.isRequired,
  clearTutorial: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  course: state.course,
  presentation: state.presentation,
  quiz: state.quiz,
  screenshot: state.screenshot,
  tutorial: state.tutorial
});

export default connect(mapStateToProps, {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  toggleFeatureCourse,
  clearCourse,
  getPresentations,
  getPresentation,
  addPresentation,
  updatePresentation,
  deletePresentation,
  togglePublishPresentation,
  toggleFeaturePresentation,
  clearPresentation,
  getQuizzes,
  getQuiz,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz,
  toggleFeatureQuiz,
  clearQuiz,
  getScreenshots,
  getScreenshot,
  addScreenshot,
  updateScreenshot,
  deleteScreenshot,
  togglePublishScreenshot,
  toggleFeatureScreenshot,
  clearScreenshot,
  getTutorials,
  getTutorial,
  addTutorial,
  updateTutorial,
  deleteTutorial,
  togglePublishTutorial,
  toggleFeatureTutorial,
  clearTutorial,
  setAlert
})(withRouter(ContentManagement));
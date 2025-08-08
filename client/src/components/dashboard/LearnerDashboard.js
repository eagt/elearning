import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  getCourses,
  getPresentations,
  getQuizzes,
  getTutorials
} from '../../actions/content';
import {
  getUserProgress,
  updateUserProgress,
  clearAnalytics
} from '../../actions/analytics';
import { setAlert } from '../../actions/alert';
import Spinner from '../layout/Spinner';

const LearnerDashboard = ({
  auth,
  content,
  analytics,
  getCourses,
  getPresentations,
  getQuizzes,
  getTutorials,
  getUserProgress,
  updateUserProgress,
  clearAnalytics,
  setAlert,
  history
}) => {
  const [activeTab, setActiveTab] = useState('recommended');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);

  useEffect(() => {
    // Load content data
    loadContentData();
    
    // Load user progress
    getUserProgress();

    return () => {
      clearAnalytics();
    };
  }, []);

  useEffect(() => {
    if (content.courses && content.presentations && content.quizzes && content.tutorials) {
      // Process enrolled courses and recommended content
      processContentData();
    }
  }, [content, analytics.userProgress]);

  const loadContentData = () => {
    getCourses({ isPublished: true });
    getPresentations({ isPublished: true });
    getQuizzes({ isPublished: true });
    getTutorials({ isPublished: true });
  };

  const processContentData = () => {
    // Get all published content
    const allCourses = content.courses || [];
    const allPresentations = content.presentations || [];
    const allQuizzes = content.quizzes || [];
    const allTutorials = content.tutorials || [];
    
    // Process user progress
    const userProgressMap = {};
    if (analytics.userProgress) {
      analytics.userProgress.forEach(progress => {
        userProgressMap[progress.contentId] = progress;
      });
    }
    
    // Process enrolled courses (courses with progress)
    const enrolled = allCourses
      .filter(course => userProgressMap[course._id])
      .map(course => ({
        ...course,
        progress: userProgressMap[course._id]
      }))
      .sort((a, b) => new Date(b.progress.lastAccessed) - new Date(a.progress.lastAccessed));
    
    setEnrolledCourses(enrolled);
    
    // Process recommended content (content without progress or not completed)
    const recommended = [
      ...allCourses
        .filter(course => !userProgressMap[course._id] || userProgressMap[course._id].status !== 'completed')
        .map(course => ({ ...course, type: 'course' })),
      ...allPresentations
        .filter(presentation => !userProgressMap[presentation._id] || userProgressMap[presentation._id].status !== 'completed')
        .map(presentation => ({ ...presentation, type: 'presentation' })),
      ...allQuizzes
        .filter(quiz => !userProgressMap[quiz._id] || userProgressMap[quiz._id].status !== 'completed')
        .map(quiz => ({ ...quiz, type: 'quiz' })),
      ...allTutorials
        .filter(tutorial => !userProgressMap[tutorial._id] || userProgressMap[tutorial._id].status !== 'completed')
        .map(tutorial => ({ ...tutorial, type: 'tutorial' }))
    ]
    .sort((a, b) => {
      // Prioritize featured content
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      
      // Then sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, 12); // Limit to 12 recommended items
    
    setRecommendedContent(recommended);
  };

  const handleContentClick = (content, type) => {
    history.push(`/${type}s/${content._id}`);
  };

  const handleEnrollCourse = (courseId) => {
    // Create initial progress record for the course
    updateUserProgress(courseId, {
      contentType: 'course',
      progress: 0,
      timeSpent: 0
    }).then(() => {
      setAlert('Successfully enrolled in course', 'success');
      getUserProgress(); // Refresh progress data
    }).catch(err => {
      setAlert('Error enrolling in course', 'danger');
    });
  };

  const renderRecommended = () => {
    if (content.loading) {
      return <Spinner />;
    }

    const filteredContent = recommendedContent.filter(item => {
      // Apply search filter
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !item.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply type filter
      if (filter !== 'all' && item.type !== filter) {
        return false;
      }
      
      return true;
    });

    return (
      <div className="learner-recommended">
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="input-group-append">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="btn-group float-right" role="group">
              <button
                type="button"
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`btn ${filter === 'course' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('course')}
              >
                Courses
              </button>
              <button
                type="button"
                className={`btn ${filter === 'presentation' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('presentation')}
              >
                Presentations
              </button>
              <button
                type="button"
                className={`btn ${filter === 'quiz' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('quiz')}
              >
                Quizzes
              </button>
              <button
                type="button"
                className={`btn ${filter === 'tutorial' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('tutorial')}
              >
                Tutorials
              </button>
            </div>
          </div>
        </div>

        {filteredContent.length > 0 ? (
          <div className="row">
            {filteredContent.map((item, index) => (
              <div key={index} className="col-md-4 mb-4">
                <div className="card h-100">
                  {item.thumbnail && (
                    <img 
                      src={item.thumbnail} 
                      className="card-img-top" 
                      alt={item.title}
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`badge ${
                        item.type === 'course' ? 'bg-primary' :
                        item.type === 'presentation' ? 'bg-info' :
                        item.type === 'quiz' ? 'bg-success' :
                        'bg-warning'
                      }`}>
                        {item.type}
                      </span>
                      {item.isFeatured && <span className="badge badge-warning">Featured</span>}
                    </div>
                    <h5 className="card-title">{item.title}</h5>
                    <p className="card-text text-muted">{item.shortDescription || item.description.substring(0, 100) + '...'}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {item.estimatedTime ? `${item.estimatedTime} min` : 'Self-paced'}
                      </small>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleContentClick(item, item.type)}
                      >
                        {item.type === 'course' ? 'Enroll' : 'Start'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <h4>No content found</h4>
            <p className="text-muted">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    );
  };

  const renderMyCourses = () => {
    if (content.loading || analytics.loading) {
      return <Spinner />;
    }

    if (enrolledCourses.length === 0) {
      return (
        <div className="text-center py-5">
          <h4>You haven't enrolled in any courses yet</h4>
          <p className="text-muted">Browse our recommended courses to get started.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('recommended')}
          >
            Browse Courses
          </button>
        </div>
      );
    }

    return (
      <div className="learner-courses">
        <div className="row">
          {enrolledCourses.map((course, index) => (
            <div key={index} className="col-md-6 mb-4">
              <div className="card">
                <div className="row no-gutters">
                  {course.thumbnail && (
                    <div className="col-md-4">
                      <img 
                        src={course.thumbnail} 
                        className="card-img h-100" 
                        alt={course.title}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="col-md-8">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title">{course.title}</h5>
                        <span className={`badge ${
                          course.progress.status === 'completed' ? 'bg-success' :
                          course.progress.status === 'in-progress' ? 'bg-warning' :
                          'bg-secondary'
                        }`}>
                          {course.progress.status}
                        </span>
                      </div>
                      <p className="card-text text-muted">{course.shortDescription || course.description.substring(0, 100) + '...'}</p>
                      
                      <div className="progress mb-3" style={{ height: '10px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${course.progress.progress}%` }}
                          aria-valuenow={course.progress.progress} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {course.progress.progress}% complete
                        </small>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleContentClick(course, 'course')}
                        >
                          {course.progress.status === 'completed' ? 'Review' : 'Continue'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInProgress = () => {
    if (content.loading || analytics.loading) {
      return <Spinner />;
    }

    // Get all content that is in progress
    const inProgressContent = [];
    
    if (analytics.userProgress) {
      analytics.userProgress.forEach(progress => {
        if (progress.status === 'in-progress') {
          let contentItem = null;
          
          // Find the content item
          if (progress.contentType === 'course') {
            contentItem = content.courses?.find(c => c._id === progress.contentId);
          } else if (progress.contentType === 'presentation') {
            contentItem = content.presentations?.find(p => p._id === progress.contentId);
          } else if (progress.contentType === 'quiz') {
            contentItem = content.quizzes?.find(q => q._id === progress.contentId);
          } else if (progress.contentType === 'tutorial') {
            contentItem = content.tutorials?.find(t => t._id === progress.contentId);
          }
          
          if (contentItem) {
            inProgressContent.push({
              ...contentItem,
              type: progress.contentType,
              progress
            });
          }
        }
      });
    }
    
    // Sort by last accessed
    inProgressContent.sort((a, b) => new Date(b.progress.lastAccessed) - new Date(a.progress.lastAccessed));

    if (inProgressContent.length === 0) {
      return (
        <div className="text-center py-5">
          <h4>No content in progress</h4>
          <p className="text-muted">Start a course or other content to see it here.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('recommended')}
          >
            Browse Content
          </button>
        </div>
      );
    }

    return (
      <div className="learner-inprogress">
        <div className="row">
          {inProgressContent.map((item, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card h-100">
                {item.thumbnail && (
                  <img 
                    src={item.thumbnail} 
                    className="card-img-top" 
                    alt={item.title}
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`badge ${
                      item.type === 'course' ? 'bg-primary' :
                      item.type === 'presentation' ? 'bg-info' :
                      item.type === 'quiz' ? 'bg-success' :
                      'bg-warning'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <h5 className="card-title">{item.title}</h5>
                  
                  <div className="progress mb-3" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ width: `${item.progress.progress}%` }}
                      aria-valuenow={item.progress.progress} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {item.progress.progress}% complete
                    </small>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleContentClick(item, item.type)}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCompleted = () => {
    if (content.loading || analytics.loading) {
      return <Spinner />;
    }

    // Get all content that is completed
    const completedContent = [];
    
    if (analytics.userProgress) {
      analytics.userProgress.forEach(progress => {
        if (progress.status === 'completed') {
          let contentItem = null;
          
          // Find the content item
          if (progress.contentType === 'course') {
            contentItem = content.courses?.find(c => c._id === progress.contentId);
          } else if (progress.contentType === 'presentation') {
            contentItem = content.presentations?.find(p => p._id === progress.contentId);
          } else if (progress.contentType === 'quiz') {
            contentItem = content.quizzes?.find(q => q._id === progress.contentId);
          } else if (progress.contentType === 'tutorial') {
            contentItem = content.tutorials?.find(t => t._id === progress.contentId);
          }
          
          if (contentItem) {
            completedContent.push({
              ...contentItem,
              type: progress.contentType,
              progress
            });
          }
        }
      });
    }
    
    // Sort by completion date (most recent first)
    completedContent.sort((a, b) => new Date(b.progress.completedAt) - new Date(a.progress.completedAt));

    if (completedContent.length === 0) {
      return (
        <div className="text-center py-5">
          <h4>No completed content yet</h4>
          <p className="text-muted">Complete a course or other content to see it here.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('recommended')}
          >
            Browse Content
          </button>
        </div>
      );
    }

    return (
      <div className="learner-completed">
        <div className="row">
          {completedContent.map((item, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card h-100">
                {item.thumbnail && (
                  <img 
                    src={item.thumbnail} 
                    className="card-img-top" 
                    alt={item.title}
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`badge ${
                      item.type === 'course' ? 'bg-primary' :
                      item.type === 'presentation' ? 'bg-info' :
                      item.type === 'quiz' ? 'bg-success' :
                      'bg-warning'
                    }`}>
                      {item.type}
                    </span>
                    <span className="badge bg-success">Completed</span>
                  </div>
                  <h5 className="card-title">{item.title}</h5>
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">
                      Time spent: {Math.floor(item.progress.timeSpent / 3600)}h {Math.floor((item.progress.timeSpent % 3600) / 60)}m
                    </small>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Completed on {new Date(item.progress.completedAt).toLocaleDateString()}
                    </small>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleContentClick(item, item.type)}
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAchievements = () => {
    // Calculate achievements based on user progress
    const achievements = [];
    
    if (analytics.userProgress) {
      const completedCount = analytics.userProgress.filter(p => p.status === 'completed').length;
      const inProgressCount = analytics.userProgress.filter(p => p.status === 'in-progress').length;
      const totalTimeSpent = analytics.userProgress.reduce((sum, p) => sum + p.timeSpent, 0);
      
      // First content completed
      if (completedCount >= 1) {
        achievements.push({
          title: 'Getting Started',
          description: 'Complete your first piece of content',
          icon: 'fa-star',
          color: 'bg-primary'
        });
      }
      
      // Multiple content completed
      if (completedCount >= 5) {
        achievements.push({
          title: 'Dedicated Learner',
          description: 'Complete 5 pieces of content',
          icon: 'fa-medal',
          color: 'bg-success'
        });
      }
      
      // Many content completed
      if (completedCount >= 10) {
        achievements.push({
          title: 'Knowledge Master',
          description: 'Complete 10 pieces of content',
          icon: 'fa-trophy',
          color: 'bg-warning'
        });
      }
      
      // Time spent learning
      if (totalTimeSpent >= 3600) { // 1 hour
        achievements.push({
          title: 'Time Invested',
          description: 'Spend 1 hour learning',
          icon: 'fa-clock',
          color: 'bg-info'
        });
      }
      
      // Significant time spent learning
      if (totalTimeSpent >= 36000) { // 10 hours
        achievements.push({
          title: 'Committed Learner',
          description: 'Spend 10 hours learning',
          icon: 'fa-hourglass-half',
          color: 'bg-danger'
        });
      }
    }
    
    // Default achievement for new users
    if (achievements.length === 0) {
      achievements.push({
        title: 'Welcome',
        description: 'Start your learning journey',
        icon: 'fa-rocket',
        color: 'bg-secondary'
      });
    }

    return (
      <div className="learner-achievements">
        <div className="row">
          {achievements.map((achievement, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card text-center">
                <div className="card-body">
                  <div className={`mx-auto mb-3 ${achievement.color} rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '80px', height: '80px' }}>
                    <i className={`fas ${achievement.icon} fa-2x text-white`}></i>
                  </div>
                  <h5 className="card-title">{achievement.title}</h5>
                  <p className="card-text text-muted">{achievement.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="card mt-4">
          <div className="card-header">
            <h5 className="mb-0">Learning Statistics</h5>
          </div>
          <div className="card-body">
            {analytics.userProgress ? (
              <div className="row text-center">
                <div className="col-md-3 mb-3">
                  <h3>{analytics.userProgress.filter(p => p.status === 'completed').length}</h3>
                  <p className="text-muted">Completed</p>
                </div>
                <div className="col-md-3 mb-3">
                  <h3>{analytics.userProgress.filter(p => p.status === 'in-progress').length}</h3>
                  <p className="text-muted">In Progress</p>
                </div>
                <div className="col-md-3 mb-3">
                  <h3>
                    {Math.floor(analytics.userProgress.reduce((sum, p) => sum + p.timeSpent, 0) / 3600)}h
                  </h3>
                  <p className="text-muted">Time Spent</p>
                </div>
                <div className="col-md-3 mb-3">
                  <h3>
                    {analytics.userProgress.length > 0 
                      ? Math.round(analytics.userProgress.reduce((sum, p) => sum + p.progress, 0) / analytics.userProgress.length) 
                      : 0}%
                  </h3>
                  <p className="text-muted">Avg. Progress</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted">No learning data available</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="learner-dashboard">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3">Learner Dashboard</h1>
          <div className="d-flex align-items-center">
            <div className="mr-3">
              <span className="badge badge-pill badge-primary">
                {analytics.userProgress ? analytics.userProgress.filter(p => p.status === 'in-progress').length : 0} in progress
              </span>
            </div>
            <div>
              <span className="badge badge-pill badge-success">
                {analytics.userProgress ? analytics.userProgress.filter(p => p.status === 'completed').length : 0} completed
              </span>
            </div>
          </div>
        </div>

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'recommended' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommended')}
            >
              Recommended
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'my-courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-courses')}
            >
              My Courses
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'in-progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('in-progress')}
            >
              In Progress
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              Achievements
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === 'recommended' && renderRecommended()}
          {activeTab === 'my-courses' && renderMyCourses()}
          {activeTab === 'in-progress' && renderInProgress()}
          {activeTab === 'completed' && renderCompleted()}
          {activeTab === 'achievements' && renderAchievements()}
        </div>
      </div>
    </div>
  );
};

LearnerDashboard.propTypes = {
  auth: PropTypes.object.isRequired,
  content: PropTypes.object.isRequired,
  analytics: PropTypes.object.isRequired,
  getCourses: PropTypes.func.isRequired,
  getPresentations: PropTypes.func.isRequired,
  getQuizzes: PropTypes.func.isRequired,
  getTutorials: PropTypes.func.isRequired,
  getUserProgress: PropTypes.func.isRequired,
  updateUserProgress: PropTypes.func.isRequired,
  clearAnalytics: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  content: {
    courses: state.course.courses,
    presentations: state.presentation.presentations,
    quizzes: state.quiz.quizzes,
    tutorials: state.tutorial.tutorials,
    loading: state.course.loading || state.presentation.loading || 
             state.quiz.loading || state.tutorial.loading
  },
  analytics: state.analytics
});

export default connect(mapStateToProps, {
  getCourses,
  getPresentations,
  getQuizzes,
  getTutorials,
  getUserProgress,
  updateUserProgress,
  clearAnalytics,
  setAlert
})(withRouter(LearnerDashboard));
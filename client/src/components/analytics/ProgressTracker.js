import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  getUserProgress,
  getUserProgressContent,
  updateUserProgress,
  recordSlideView,
  recordStepCompletion,
  recordQuizAttempt,
  clearAnalytics
} from '../../actions/analytics';
import { setAlert } from '../../actions/alert';
import Spinner from '../layout/Spinner';

const ProgressTracker = ({
  auth,
  analytics,
  getUserProgress,
  getUserProgressContent,
  updateUserProgress,
  recordSlideView,
  recordStepCompletion,
  recordQuizAttempt,
  clearAnalytics,
  setAlert,
  match,
  location
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeTracking, setTimeTracking] = useState({
    active: false,
    startTime: null,
    contentId: null,
    contentType: null
  });
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    // Load user progress
    getUserProgress();

    return () => {
      clearAnalytics();
      // Stop any active time tracking
      if (timeTracking.active) {
        stopTimeTracking();
      }
    };
  }, [getUserProgress, clearAnalytics]);

  useEffect(() => {
    // Check if we're viewing a specific content
    const contentId = match.params.id;
    const contentType = location.pathname.includes('/courses/') ? 'course' :
                       location.pathname.includes('/presentations/') ? 'presentation' :
                       location.pathname.includes('/quizzes/') ? 'quiz' :
                       location.pathname.includes('/tutorials/') ? 'tutorial' : null;

    if (contentId && contentType) {
      getUserProgressContent(contentId);
      
      // Start time tracking if not already active
      if (!timeTracking.active) {
        startTimeTracking(contentId, contentType);
      }
    } else if (timeTracking.active) {
      // Stop time tracking if we're not viewing content
      stopTimeTracking();
    }
  }, [match.params.id, location.pathname]);

  const startTimeTracking = (contentId, contentType) => {
    setTimeTracking({
      active: true,
      startTime: Date.now(),
      contentId,
      contentType
    });
  };

  const stopTimeTracking = () => {
    if (timeTracking.active && timeTracking.startTime) {
      const timeSpent = Math.round((Date.now() - timeTracking.startTime) / 1000); // in seconds
      
      // Update progress with time spent
      if (timeTracking.contentId) {
        updateUserProgress(timeTracking.contentId, {
          contentType: timeTracking.contentType,
          timeSpent
        }).catch(err => {
          console.error('Error updating progress:', err);
        });
      }
    }
    
    setTimeTracking({
      active: false,
      startTime: null,
      contentId: null,
      contentType: null
    });
  };

  const handleSlideView = (slideId, timeSpent = 0) => {
    if (timeTracking.contentId) {
      recordSlideView(timeTracking.contentId, slideId, timeSpent).catch(err => {
        console.error('Error recording slide view:', err);
      });
    }
  };

  const handleStepCompletion = (stepId, timeSpent = 0) => {
    if (timeTracking.contentId) {
      recordStepCompletion(timeTracking.contentId, stepId, timeSpent).catch(err => {
        console.error('Error recording step completion:', err);
      });
    }
  };

  const handleQuizAnswer = (questionId, answer) => {
    // Update quiz answers
    const newAnswers = [...quizAnswers];
    const existingAnswerIndex = newAnswers.findIndex(a => a.questionId === questionId);
    
    if (existingAnswerIndex !== -1) {
      newAnswers[existingAnswerIndex] = { questionId, answer };
    } else {
      newAnswers.push({ questionId, answer });
    }
    
    setQuizAnswers(newAnswers);
  };

  const handleQuizSubmit = (questions) => {
    if (quizAnswers.length === 0) {
      setAlert('Please answer at least one question', 'warning');
      return;
    }

    // Calculate score
    let correctAnswers = 0;
    const processedAnswers = quizAnswers.map(userAnswer => {
      const question = questions.find(q => q._id === userAnswer.questionId);
      let isCorrect = false;
      
      if (question) {
        switch (question.type) {
          case 'multiple-choice':
            isCorrect = userAnswer.answer === question.correctAnswer;
            break;
          case 'multiple-select':
            const userAnswers = Array.isArray(userAnswer.answer) ? userAnswer.answer : [userAnswer.answer];
            const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
            isCorrect = userAnswers.length === correctAnswers.length && 
                       userAnswers.every(a => correctAnswers.includes(a));
            break;
          case 'fill-blank':
            isCorrect = userAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
            break;
          case 'drag-drop':
            isCorrect = JSON.stringify(userAnswer.answer) === JSON.stringify(question.correctAnswer);
            break;
          default:
            isCorrect = false;
        }
        
        if (isCorrect) {
          correctAnswers++;
        }
      }
      
      return {
        questionId: userAnswer.questionId,
        answer: userAnswer.answer,
        isCorrect
      };
    });
    
    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= (analytics.currentProgress?.passingScore || 70);
    
    // Record quiz attempt
    if (timeTracking.contentId) {
      recordQuizAttempt(timeTracking.contentId, {
        answers: processedAnswers,
        score,
        passed
      }).then(() => {
        setAlert(`Quiz submitted! Your score: ${score}%`, passed ? 'success' : 'info');
        setShowQuizResults(true);
      }).catch(err => {
        console.error('Error recording quiz attempt:', err);
        setAlert('Error submitting quiz', 'danger');
      });
    }
  };

  const renderProgressOverview = () => {
    if (analytics.loading) {
      return <Spinner />;
    }

    if (analytics.userProgress.length === 0) {
      return (
        <div className="text-center py-5">
          <h4>No progress tracked yet</h4>
          <p className="text-muted">Start viewing content to see your progress here.</p>
        </div>
      );
    }

    // Group progress by content type
    const progressByType = {
      course: [],
      presentation: [],
      quiz: [],
      tutorial: []
    };

    analytics.userProgress.forEach(progress => {
      if (progressByType[progress.contentType]) {
        progressByType[progress.contentType].push(progress);
      }
    });

    return (
      <div className="progress-overview">
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">Courses</h5>
                <h2 className="card-text">{progressByType.course.length}</h2>
                <p className="card-text">
                  {progressByType.course.filter(c => c.status === 'completed').length} completed
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">Presentations</h5>
                <h2 className="card-text">{progressByType.presentation.length}</h2>
                <p className="card-text">
                  {progressByType.presentation.filter(p => p.status === 'completed').length} completed
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Quizzes</h5>
                <h2 className="card-text">{progressByType.quiz.length}</h2>
                <p className="card-text">
                  {progressByType.quiz.filter(q => q.status === 'completed').length} completed
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <h5 className="card-title">Tutorials</h5>
                <h2 className="card-text">{progressByType.tutorial.length}</h2>
                <p className="card-text">
                  {progressByType.tutorial.filter(t => t.status === 'completed').length} completed
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Recent Progress</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Content</th>
                    <th>Type</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Last Accessed</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.userProgress
                    .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
                    .slice(0, 10)
                    .map(progress => (
                      <tr key={progress._id}>
                        <td>{progress.contentId?.title || 'Unknown Content'}</td>
                        <td>
                          <span className={`badge ${
                            progress.contentType === 'course' ? 'bg-primary' :
                            progress.contentType === 'presentation' ? 'bg-info' :
                            progress.contentType === 'quiz' ? 'bg-success' :
                            'bg-warning'
                          }`}>
                            {progress.contentType}
                          </span>
                        </td>
                        <td>
                          <div className="progress" style={{ height: '20px' }}>
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{ width: `${progress.progress}%` }}
                              aria-valuenow={progress.progress} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            >
                              {progress.progress}%
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            progress.status === 'completed' ? 'bg-success' :
                            progress.status === 'in-progress' ? 'bg-warning' :
                            'bg-secondary'
                          }`}>
                            {progress.status}
                          </span>
                        </td>
                        <td>{new Date(progress.lastAccessed).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentProgress = () => {
    if (!analytics.currentProgress) {
      return (
        <div className="text-center py-5">
          <h4>No content selected</h4>
          <p className="text-muted">Select a course, presentation, quiz, or tutorial to view your progress.</p>
        </div>
      );
    }

    const progress = analytics.currentProgress;
    
    return (
      <div className="current-progress">
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{progress.contentId?.title || 'Content Progress'}</h5>
            <span className={`badge ${
              progress.status === 'completed' ? 'bg-success' :
              progress.status === 'in-progress' ? 'bg-warning' :
              'bg-secondary'
            }`}>
              {progress.status}
            </span>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6>Progress</h6>
                <div className="progress mb-3" style={{ height: '25px' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ width: `${progress.progress}%` }}
                    aria-valuenow={progress.progress} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {progress.progress}%
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-6">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h5 className="card-title">Time Spent</h5>
                        <p className="card-text">
                          {Math.floor(progress.timeSpent / 3600)}h {Math.floor((progress.timeSpent % 3600) / 60)}m
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h5 className="card-title">Last Accessed</h5>
                        <p className="card-text">
                          {new Date(progress.lastAccessed).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {progress.completedAt && (
                  <div className="alert alert-success">
                    <i className="fas fa-check-circle mr-2"></i>
                    Completed on {new Date(progress.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="col-md-6">
                {progress.contentType === 'presentation' && progress.slidesViewed && progress.slidesViewed.length > 0 && (
                  <div>
                    <h6>Slides Viewed ({progress.slidesViewed.length})</h6>
                    <div className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {progress.slidesViewed.map((slide, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <span>{slide.slideId?.title || `Slide ${index + 1}`}</span>
                          <span className="badge bg-info">
                            {Math.floor(slide.timeSpent / 60)}m {Math.floor(slide.timeSpent % 60)}s
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {progress.contentType === 'tutorial' && progress.stepsCompleted && progress.stepsCompleted.length > 0 && (
                  <div>
                    <h6>Steps Completed ({progress.stepsCompleted.length})</h6>
                    <div className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {progress.stepsCompleted.map((step, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <span>{step.stepId?.title || `Step ${index + 1}`}</span>
                          <span className="badge bg-info">
                            {Math.floor(step.timeSpent / 60)}m {Math.floor(step.timeSpent % 60)}s
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {progress.contentType === 'quiz' && progress.quizAttempts && progress.quizAttempts.length > 0 && (
                  <div>
                    <h6>Quiz Attempts ({progress.quizAttempts.length})</h6>
                    <div className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {progress.quizAttempts.map((attempt, index) => (
                        <div key={index} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Attempt #{index + 1}</span>
                            <span className={`badge ${attempt.passed ? 'bg-success' : 'bg-danger'}`}>
                              {attempt.score}%
                            </span>
                          </div>
                          <small className="text-muted">
                            {new Date(attempt.attemptDate).toLocaleDateString()}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {progress.contentType === 'quiz' && !showQuizResults && (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Take Quiz</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                This would display the quiz questions and allow the user to submit answers.
                In a real implementation, this would be connected to the actual quiz component.
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => handleQuizSubmit([])}
              >
                Submit Quiz
              </button>
            </div>
          </div>
        )}
        
        {progress.contentType === 'quiz' && showQuizResults && (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quiz Results</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-success">
                <h6>Quiz completed successfully!</h6>
                <p>Your progress has been recorded.</p>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowQuizResults(false)}
              >
                Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="progress-tracker">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3">Progress Tracker</h1>
        </div>

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'current' ? 'active' : ''}`}
              onClick={() => setActiveTab('current')}
            >
              Current Content
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === 'overview' && renderProgressOverview()}
          {activeTab === 'current' && renderCurrentProgress()}
        </div>
      </div>
    </div>
  );
};

ProgressTracker.propTypes = {
  auth: PropTypes.object.isRequired,
  analytics: PropTypes.object.isRequired,
  getUserProgress: PropTypes.func.isRequired,
  getUserProgressContent: PropTypes.func.isRequired,
  updateUserProgress: PropTypes.func.isRequired,
  recordSlideView: PropTypes.func.isRequired,
  recordStepCompletion: PropTypes.func.isRequired,
  recordQuizAttempt: PropTypes.func.isRequired,
  clearAnalytics: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  analytics: state.analytics
});

export default connect(mapStateToProps, {
  getUserProgress,
  getUserProgressContent,
  updateUserProgress,
  recordSlideView,
  recordStepCompletion,
  recordQuizAttempt,
  clearAnalytics,
  setAlert
})(withRouter(ProgressTracker));
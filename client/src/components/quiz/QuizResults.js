import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getQuizAttempts, clearQuizAttempt } from '../../actions/quiz';
import Spinner from '../layout/Spinner';

const QuizResults = ({ 
  quiz, 
  quizAttempt, 
  getQuizAttempts, 
  clearQuizAttempt, 
  history,
  auth 
}) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  const loadAttempts = async () => {
    setLoadingAttempts(true);
    try {
      const attemptsData = await getQuizAttempts(quiz._id);
      setAttempts(attemptsData);
    } catch (err) {
      console.error('Error loading attempts:', err);
    }
    setLoadingAttempts(false);
  };

  const handleRetakeQuiz = () => {
    clearQuizAttempt();
    history.push(`/quizzes/${quiz._id}/take`);
  };

  const handleBackToQuiz = () => {
    clearQuizAttempt();
    history.push(`/quizzes/${quiz._id}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= quiz.settings.passPercentage) {
      return 'success';
    } else {
      return 'danger';
    }
  };

  const renderQuestionAnswer = (question, answer) => {
    if (!answer) return null;

    const isCorrect = answer.pointsEarned === question.points;
    
    return (
      <div className={`card mb-3 ${isCorrect ? 'border-success' : 'border-danger'}`}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">{question.question}</h6>
          <span className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`}>
            {isCorrect ? 'Correct' : 'Incorrect'} ({answer.pointsEarned}/{question.points} points)
          </span>
        </div>
        <div className="card-body">
          {question.type === 'multiple-choice' || question.type === 'true-false' ? (
            <div>
              <p><strong>Your Answer:</strong> {
                question.options.find(opt => opt._id === answer.answer)?.text || 'Not answered'
              }</p>
              {quiz.settings.showCorrectAnswers && (
                <p><strong>Correct Answer:</strong> {
                  question.options.find(opt => opt.isCorrect)?.text
                }</p>
              )}
            </div>
          ) : question.type === 'fill-blank' ? (
            <div>
              <p><strong>Your Answer:</strong> {answer.answer || 'Not answered'}</p>
              {quiz.settings.showCorrectAnswers && (
                <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
              )}
            </div>
          ) : question.type === 'drag-drop' || question.type === 'matching' ? (
            <div>
              <p><strong>Your Answer:</strong> {
                Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer || 'Not answered'
              }</p>
              {quiz.settings.showCorrectAnswers && (
                <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
              )}
            </div>
          ) : question.type === 'essay' ? (
            <div>
              <p><strong>Your Answer:</strong></p>
              <div className="bg-light p-3 rounded">
                {answer.answer || 'Not answered'}
              </div>
            </div>
          ) : null}
          
          {quiz.settings.showExplanation && question.explanation && (
            <div className="mt-3">
              <p><strong>Explanation:</strong></p>
              <div className="bg-light p-3 rounded">
                {question.explanation}
              </div>
            </div>
          )}
          
          <div className="mt-2">
            <small className="text-muted">Time spent: {formatTime(answer.timeSpent)}</small>
          </div>
        </div>
      </div>
    );
  };

  if (!quiz || !quizAttempt) {
    return <Spinner />;
  }

  return (
    <div className="quiz-results container">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{quiz.title} - Results</h4>
          <div>
            <button className="btn btn-outline-secondary mr-2" onClick={handleBackToQuiz}>
              <i className="fas fa-arrow-left mr-1"></i> Back to Quiz
            </button>
            {quiz.settings.allowRetakes && 
              (quiz.settings.maxRetakes === 0 || attempts.length < quiz.settings.maxRetakes) && (
              <button className="btn btn-primary" onClick={handleRetakeQuiz}>
                <i className="fas fa-redo mr-1"></i> Retake Quiz
              </button>
            )}
          </div>
        </div>
        
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="result-summary">
                <h5>Summary</h5>
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td>Status:</td>
                      <td>
                        <span className={`badge ${quizAttempt.passed ? 'badge-success' : 'badge-danger'}`}>
                          {quizAttempt.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Score:</td>
                      <td>
                        <span className={`text-${getScoreColor(quizAttempt.percentage)}`}>
                          {quizAttempt.score}/{quizAttempt.maxScore} points ({quizAttempt.percentage}%)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Passing Score:</td>
                      <td>{quiz.settings.passPercentage}%</td>
                    </tr>
                    <tr>
                      <td>Time Taken:</td>
                      <td>{formatTime(Math.floor((quizAttempt.completedAt - quizAttempt.startedAt) / 1000))}</td>
                    </tr>
                    <tr>
                      <td>Completed:</td>
                      <td>{formatDate(quizAttempt.completedAt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="result-chart">
                <h5>Performance</h5>
                <div className="progress mb-3" style={{ height: '30px' }}>
                  <div 
                    className={`progress-bar ${getScoreColor(quizAttempt.percentage) === 'success' ? 'bg-success' : 'bg-danger'}`}
                    role="progressbar" 
                    style={{ width: `${quizAttempt.percentage}%` }}
                    aria-valuenow={quizAttempt.percentage} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                  >
                    {quizAttempt.percentage}%
                  </div>
                </div>
                
                {quiz.settings.showResults && (
                  <div className="mt-4">
                    <button 
                      className="btn btn-outline-primary w-100"
                      onClick={() => setShowAnswers(!showAnswers)}
                    >
                      {showAnswers ? 'Hide Answers' : 'Show Answers'}
                    </button>
                    
                    {auth.user.role === 'creator' && (
                      <button 
                        className="btn btn-outline-secondary w-100 mt-2"
                        onClick={loadAttempts}
                        disabled={loadingAttempts}
                      >
                        {loadingAttempts ? 'Loading...' : 'View All Attempts'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {showAnswers && quiz.settings.showResults && (
            <div className="answers-section">
              <h5>Question Review</h5>
              {quiz.questions.map((question, index) => {
                const answer = quizAttempt.answers.find(a => a.questionId === question._id);
                return renderQuestionAnswer(question, answer);
              })}
            </div>
          )}
          
          {attempts.length > 0 && auth.user.role === 'creator' && (
            <div className="attempts-section mt-4">
              <h5>All Attempts</h5>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Time Taken</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map(attempt => (
                      <tr key={attempt._id}>
                        <td>{attempt.userId.firstName} {attempt.userId.lastName}</td>
                        <td>
                          <span className={`text-${getScoreColor(attempt.percentage)}`}>
                            {attempt.score}/{attempt.maxScore} ({attempt.percentage}%)
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${attempt.passed ? 'badge-success' : 'badge-danger'}`}>
                            {attempt.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td>{formatTime(Math.floor((attempt.completedAt - attempt.startedAt) / 1000))}</td>
                        <td>{formatDate(attempt.completedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-4 d-flex justify-content-between">
            <button className="btn btn-outline-secondary" onClick={handleBackToQuiz}>
              <i className="fas fa-arrow-left mr-1"></i> Back to Quiz
            </button>
            
            {quiz.settings.allowRetakes && 
              (quiz.settings.maxRetakes === 0 || attempts.length < quiz.settings.maxRetakes) && (
              <button className="btn btn-primary" onClick={handleRetakeQuiz}>
                <i className="fas fa-redo mr-1"></i> Retake Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

QuizResults.propTypes = {
  quiz: PropTypes.object.isRequired,
  quizAttempt: PropTypes.object.isRequired,
  getQuizAttempts: PropTypes.func.isRequired,
  clearQuizAttempt: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { getQuizAttempts, clearQuizAttempt })(withRouter(QuizResults));
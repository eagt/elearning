import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  getQuiz,
  startQuizAttempt,
  getQuizAttempt,
  submitAnswer,
  submitQuiz,
  pauseQuiz,
  resumeQuiz,
  clearQuiz,
  clearQuizAttempt
} from '../../actions/quiz';
import { setAlert } from '../../actions/alert';
import Spinner from '../layout/Spinner';
import QuestionDisplay from './QuestionDisplay';
import QuizResults from './QuizResults';

const QuizTaker = ({
  auth,
  quiz: { quiz, quizAttempt, loading },
  getQuiz,
  startQuizAttempt,
  getQuizAttempt,
  submitAnswer,
  submitQuiz,
  pauseQuiz,
  resumeQuiz,
  clearQuiz,
  clearQuizAttempt,
  setAlert,
  match,
  history
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    if (match.params.id) {
      getQuiz(match.params.id);
      
      if (match.params.attemptId) {
        getQuizAttempt(match.params.id, match.params.attemptId);
      }
    }

    return () => {
      clearQuiz();
      clearQuizAttempt();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [getQuiz, getQuizAttempt, match.params.id, match.params.attemptId, clearQuiz, clearQuizAttempt]);

  useEffect(() => {
    if (quizAttempt) {
      // Load existing answers
      const loadedAnswers = {};
      quizAttempt.answers.forEach(answer => {
        loadedAnswers[answer.questionId] = {
          answer: answer.answer,
          timeSpent: answer.timeSpent
        };
      });
      setAnswers(loadedAnswers);
      
      // Set time remaining
      setTimeRemaining(quizAttempt.timeRemaining);
      
      // Start timer if quiz is in progress
      if (quizAttempt.status === 'in-progress') {
        setTimerActive(true);
      }
      
      // Find current question index
      if (quizAttempt.questionOrder && quizAttempt.questionOrder.length > 0) {
        const answeredQuestions = Object.keys(loadedAnswers).length;
        setCurrentQuestionIndex(Math.min(answeredQuestions, quizAttempt.questionOrder.length - 1));
      }
    }
  }, [quizAttempt]);

  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, timeRemaining]);

  const startQuiz = async () => {
    try {
      const attempt = await startQuizAttempt(match.params.id);
      setTimerActive(true);
      setQuestionStartTime(Date.now());
      
      if (attempt.payload.timeRemaining > 0) {
        setTimeRemaining(attempt.payload.timeRemaining);
      }
      
      setAlert('Quiz started successfully', 'success');
    } catch (err) {
      setAlert('Error starting quiz', 'danger');
    }
  };

  const handleAnswerSubmit = async (questionId, answer) => {
    try {
      // Calculate time spent on this question
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      setQuestionStartTime(Date.now());
      
      // Update local answers
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          answer,
          timeSpent
        }
      }));
      
      // Submit answer to server
      await submitAnswer(match.params.id, quizAttempt._id, {
        questionId,
        answer,
        timeSpent
      });
      
      // Move to next question
      if (quizAttempt && quizAttempt.questionOrder) {
        if (currentQuestionIndex < quizAttempt.questionOrder.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          // If this is the last question, submit the quiz
          handleSubmitQuiz();
        }
      }
    } catch (err) {
      setAlert('Error submitting answer', 'danger');
    }
  };

  const handleQuestionNavigation = (index) => {
    // Save time spent on current question
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setQuestionStartTime(Date.now());
    
    // Update local answers with time spent
    if (quizAttempt && quizAttempt.questionOrder && quizAttempt.questionOrder[currentQuestionIndex]) {
      const currentQuestionId = quizAttempt.questionOrder[currentQuestionIndex];
      if (answers[currentQuestionId]) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestionId]: {
            ...prev[currentQuestionId],
            timeSpent: prev[currentQuestionId].timeSpent + timeSpent
          }
        }));
      }
    }
    
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
    try {
      // Stop timer
      setTimerActive(false);
      
      // Submit quiz
      await submitQuiz(match.params.id, quizAttempt._id);
      setAlert('Quiz submitted successfully', 'success');
    } catch (err) {
      setAlert('Error submitting quiz', 'danger');
    }
  };

  const handlePauseQuiz = async () => {
    try {
      // Stop timer
      setTimerActive(false);
      
      // Pause quiz
      await pauseQuiz(match.params.id, quizAttempt._id);
      setAlert('Quiz paused successfully', 'success');
    } catch (err) {
      setAlert('Error pausing quiz', 'danger');
    }
  };

  const handleResumeQuiz = async () => {
    try {
      // Resume quiz
      await resumeQuiz(match.params.id, quizAttempt._id);
      setTimerActive(true);
      setQuestionStartTime(Date.now());
      setAlert('Quiz resumed successfully', 'success');
    } catch (err) {
      setAlert('Error resuming quiz', 'danger');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getCurrentQuestion = () => {
    if (!quiz || !quizAttempt || !quizAttempt.questionOrder) {
      return null;
    }
    
    const questionId = quizAttempt.questionOrder[currentQuestionIndex];
    return quiz.questions.find(q => q._id.toString() === questionId.toString());
  };

  const getQuestionStatus = (index) => {
    if (!quizAttempt || !quizAttempt.questionOrder) {
      return 'not-answered';
    }
    
    const questionId = quizAttempt.questionOrder[index];
    return answers[questionId] ? 'answered' : 'not-answered';
  };

  if (loading) {
    return <Spinner />;
  }

  if (!quiz) {
    return <div className="container">Quiz not found</div>;
  }

  if (quizAttempt && (quizAttempt.status === 'completed' || quizAttempt.status === 'timeout')) {
    return <QuizResults quiz={quiz} quizAttempt={quizAttempt} history={history} />;
  }

  if (quizAttempt && quizAttempt.status === 'paused') {
    return (
      <div className="quiz-paused container">
        <div className="card">
          <div className="card-body text-center">
            <h2>Quiz Paused</h2>
            <p>Your quiz has been paused. You can resume it later.</p>
            <button className="btn btn-primary" onClick={handleResumeQuiz}>
              Resume Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizAttempt) {
    return (
      <div className="quiz-intro container">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title">{quiz.title}</h2>
            <p className="card-text">{quiz.description}</p>
            
            <div className="quiz-details mb-4">
              <p><strong>Estimated Time:</strong> {quiz.estimatedTime} minutes</p>
              <p><strong>Difficulty:</strong> {quiz.difficulty}</p>
              <p><strong>Questions:</strong> {quiz.questions.length}</p>
              
              {quiz.settings.timeLimit > 0 && (
                <p><strong>Time Limit:</strong> {quiz.settings.timeLimit} minutes</p>
              )}
              
              {quiz.settings.passPercentage > 0 && (
                <p><strong>Pass Percentage:</strong> {quiz.settings.passPercentage}%</p>
              )}
              
              {quiz.settings.maxRetakes > 0 && (
                <p><strong>Maximum Retakes:</strong> {quiz.settings.maxRetakes}</p>
              )}
            </div>
            
            <div className="quiz-instructions mb-4">
              <h4>Instructions</h4>
              <ul>
                {quiz.settings.timeLimit > 0 && (
                  <li>You have {quiz.settings.timeLimit} minutes to complete this quiz.</li>
                )}
                {quiz.settings.allowPause && (
                  <li>You can pause the quiz and resume it later.</li>
                )}
                {quiz.settings.shuffleQuestions && (
                  <li>Questions will be presented in a random order.</li>
                )}
                {quiz.settings.shuffleOptions && (
                  <li>Options for multiple choice questions will be presented in a random order.</li>
                )}
                <li>Make sure to answer all questions before submitting.</li>
              </ul>
            </div>
            
            <button className="btn btn-primary btn-lg" onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  
  return (
    <div className="quiz-taker container">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{quiz.title}</h4>
          <div className="d-flex align-items-center">
            {quiz.settings.timeLimit > 0 && (
              <div className={`mr-3 ${timeRemaining < 60 ? 'text-danger' : ''}`}>
                <i className="fas fa-clock mr-1"></i>
                {formatTime(timeRemaining)}
              </div>
            )}
            {quiz.settings.allowPause && (
              <button className="btn btn-outline-secondary btn-sm mr-2" onClick={handlePauseQuiz}>
                <i className="fas fa-pause"></i> Pause
              </button>
            )}
            <button className="btn btn-success btn-sm" onClick={handleSubmitQuiz}>
              <i className="fas fa-check"></i> Submit
            </button>
          </div>
        </div>
        
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <div className="question-navigator">
                <h6>Questions</h6>
                <div className="list-group">
                  {quizAttempt.questionOrder.map((questionId, index) => {
                    const question = quiz.questions.find(q => q._id.toString() === questionId.toString());
                    const status = getQuestionStatus(index);
                    
                    return (
                      <button
                        key={index}
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                          currentQuestionIndex === index ? 'active' : ''
                        } ${status === 'answered' ? 'list-group-item-success' : ''}`}
                        onClick={() => handleQuestionNavigation(index)}
                      >
                        <span>Question {index + 1}</span>
                        {status === 'answered' && (
                          <i className="fas fa-check-circle text-success"></i>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-3">
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ width: `${(Object.keys(answers).length / quiz.questions.length) * 100}%` }}
                      aria-valuenow={Object.keys(answers).length} 
                      aria-valuemin={0} 
                      aria-valuemax={quiz.questions.length}
                    >
                      {Math.round((Object.keys(answers).length / quiz.questions.length) * 100)}%
                    </div>
                  </div>
                  <small className="form-text text-muted">
                    {Object.keys(answers).length} of {quiz.questions.length} questions answered
                  </small>
                </div>
              </div>
            </div>
            
            <div className="col-md-9">
              {currentQuestion ? (
                <QuestionDisplay
                  question={currentQuestion}
                  questionIndex={currentQuestionIndex}
                  totalQuestions={quiz.questions.length}
                  answer={answers[currentQuestion._id]?.answer || ''}
                  onAnswerSubmit={handleAnswerSubmit}
                  quizSettings={quiz.settings}
                  optionOrders={quizAttempt.optionOrders}
                />
              ) : (
                <div>Question not found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

QuizTaker.propTypes = {
  auth: PropTypes.object.isRequired,
  quiz: PropTypes.object.isRequired,
  getQuiz: PropTypes.func.isRequired,
  startQuizAttempt: PropTypes.func.isRequired,
  getQuizAttempt: PropTypes.func.isRequired,
  submitAnswer: PropTypes.func.isRequired,
  submitQuiz: PropTypes.func.isRequired,
  pauseQuiz: PropTypes.func.isRequired,
  resumeQuiz: PropTypes.func.isRequired,
  clearQuiz: PropTypes.func.isRequired,
  clearQuizAttempt: PropTypes.func.isRequired,
  setAlert: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  quiz: state.quiz
});

export default connect(mapStateToProps, {
  getQuiz,
  startQuizAttempt,
  getQuizAttempt,
  submitAnswer,
  submitQuiz,
  pauseQuiz,
  resumeQuiz,
  clearQuiz,
  clearQuizAttempt,
  setAlert
})(withRouter(QuizTaker));
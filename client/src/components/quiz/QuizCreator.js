import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  getQuiz,
  addQuiz,
  updateQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  clearQuiz
} from '../../actions/quiz';
import { setAlert } from '../../actions/alert';
import Spinner from '../layout/Spinner';
import QuestionEditor from './QuestionEditor';
import PreviewQuiz from './PreviewQuiz';

const QuizCreator = ({
  auth,
  quiz: { quiz, loading },
  getQuiz,
  addQuiz,
  updateQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  clearQuiz,
  setAlert,
  match,
  history
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: 'general',
    tags: '',
    thumbnail: null,
    isPublished: false,
    isFeatured: false,
    estimatedTime: 30,
    difficulty: 'beginner',
    prerequisites: '',
    learningObjectives: '',
    targetAudience: '',
    courses: [],
    presentations: []
  });

  const [settings, setSettings] = useState({
    timeLimit: 0,
    allowRetakes: true,
    maxRetakes: 0,
    showResults: true,
    showCorrectAnswers: true,
    showExplanation: true,
    shuffleQuestions: false,
    shuffleOptions: false,
    passPercentage: 70,
    allowPause: true,
    randomizeQuestionOrder: false
  });

  const [activeTab, setActiveTab] = useState('details');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef(null);

  const {
    title,
    description,
    shortDescription,
    category,
    tags,
    thumbnail,
    isPublished,
    isFeatured,
    estimatedTime,
    difficulty,
    prerequisites,
    learningObjectives,
    targetAudience,
    courses,
    presentations
  } = formData;

  useEffect(() => {
    if (match.params.id) {
      getQuiz(match.params.id);
    } else {
      clearQuiz();
    }

    return () => clearQuiz();
  }, [getQuiz, match.params.id, clearQuiz]);

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        shortDescription: quiz.shortDescription || '',
        category: quiz.category || 'general',
        tags: quiz.tags ? quiz.tags.join(', ') : '',
        thumbnail: quiz.thumbnail || null,
        isPublished: quiz.isPublished || false,
        isFeatured: quiz.isFeatured || false,
        estimatedTime: quiz.estimatedTime || 30,
        difficulty: quiz.difficulty || 'beginner',
        prerequisites: quiz.prerequisites ? quiz.prerequisites.join(', ') : '',
        learningObjectives: quiz.learningObjectives ? quiz.learningObjectives.join(', ') : '',
        targetAudience: quiz.targetAudience ? quiz.targetAudience.join(', ') : '',
        courses: quiz.courses ? quiz.courses.map(course => course._id) : [],
        presentations: quiz.presentations ? quiz.presentations.map(presentation => presentation._id) : []
      });

      setSettings({
        timeLimit: quiz.settings?.timeLimit || 0,
        allowRetakes: quiz.settings?.allowRetakes ?? true,
        maxRetakes: quiz.settings?.maxRetakes || 0,
        showResults: quiz.settings?.showResults ?? true,
        showCorrectAnswers: quiz.settings?.showCorrectAnswers ?? true,
        showExplanation: quiz.settings?.showExplanation ?? true,
        shuffleQuestions: quiz.settings?.shuffleQuestions || false,
        shuffleOptions: quiz.settings?.shuffleOptions || false,
        passPercentage: quiz.settings?.passPercentage || 70,
        allowPause: quiz.settings?.allowPause ?? true,
        randomizeQuestionOrder: quiz.settings?.randomizeQuestionOrder || false
      });

      if (quiz.questions && quiz.questions.length > 0) {
        setSelectedQuestion(quiz.questions[0]._id);
      }
    }
  }, [quiz]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCheck = e => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const onSettingsChange = e => {
    setSettings({ ...settings, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  };

  const onFileChange = e => {
    setFormData({ ...formData, thumbnail: e.target.files[0] });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    const quizData = new FormData();
    quizData.append('title', title);
    quizData.append('description', description);
    quizData.append('shortDescription', shortDescription);
    quizData.append('category', category);
    quizData.append('tags', tags);
    quizData.append('isPublished', isPublished);
    quizData.append('isFeatured', isFeatured);
    quizData.append('estimatedTime', estimatedTime);
    quizData.append('difficulty', difficulty);
    quizData.append('prerequisites', prerequisites);
    quizData.append('learningObjectives', learningObjectives);
    quizData.append('targetAudience', targetAudience);
    quizData.append('courses', JSON.stringify(courses));
    quizData.append('presentations', JSON.stringify(presentations));
    quizData.append('settings', JSON.stringify(settings));
    
    if (thumbnail && typeof thumbnail !== 'string') {
      quizData.append('thumbnail', thumbnail);
    }

    try {
      if (match.params.id) {
        await updateQuiz(match.params.id, quizData, history);
        setAlert('Quiz updated successfully', 'success');
      } else {
        await addQuiz(quizData, history);
        setAlert('Quiz created successfully', 'success');
      }
    } catch (err) {
      setAlert('Error saving quiz', 'danger');
    }
  };

  const handleAddQuestion = async questionData => {
    try {
      if (match.params.id) {
        const newQuestion = await addQuestion(match.params.id, questionData);
        setSelectedQuestion(newQuestion.payload.questions[newQuestion.payload.questions.length - 1]._id);
        setAlert('Question added successfully', 'success');
      } else {
        setAlert('Please save the quiz first', 'warning');
      }
    } catch (err) {
      setAlert('Error adding question', 'danger');
    }
  };

  const handleUpdateQuestion = async (questionId, questionData) => {
    try {
      if (match.params.id) {
        await updateQuestion(match.params.id, questionId, questionData);
        setAlert('Question updated successfully', 'success');
      }
    } catch (err) {
      setAlert('Error updating question', 'danger');
    }
  };

  const handleDeleteQuestion = async questionId => {
    try {
      if (match.params.id) {
        await deleteQuestion(match.params.id, questionId);
        if (quiz.questions.length > 1) {
          setSelectedQuestion(quiz.questions[0]._id);
        } else {
          setSelectedQuestion(null);
        }
        setAlert('Question deleted successfully', 'success');
      }
    } catch (err) {
      setAlert('Error deleting question', 'danger');
    }
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  if (loading && match.params.id) {
    return <Spinner />;
  }

  return (
    <div className="quiz-creator">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="display-4">
                {match.params.id ? 'Edit Quiz' : 'Create Quiz'}
              </h1>
              <div>
                <button className="btn btn-outline-secondary mr-2" onClick={togglePreview}>
                  {previewMode ? 'Edit Quiz' : 'Preview Quiz'}
                </button>
                {match.params.id && (
                  <button className="btn btn-success mr-2" onClick={() => history.push(`/quizzes/${match.params.id}/take`)}>
                    Take Quiz
                  </button>
                )}
              </div>
            </div>

            {previewMode && quiz ? (
              <PreviewQuiz quiz={quiz} />
            ) : (
              <div className="row">
                <div className="col-md-3">
                  <div className="nav flex-column nav-pills" role="tablist">
                    <button
                      className={`nav-link ${activeTab === 'details' ? 'active' : ''}`}
                      onClick={() => setActiveTab('details')}
                    >
                      Details
                    </button>
                    <button
                      className={`nav-link ${activeTab === 'questions' ? 'active' : ''}`}
                      onClick={() => setActiveTab('questions')}
                      disabled={!match.params.id}
                    >
                      Questions
                      {quiz && quiz.questions && (
                        <span className="badge badge-primary ml-2">
                          {quiz.questions.length}
                        </span>
                      )}
                    </button>
                    <button
                      className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                      onClick={() => setActiveTab('settings')}
                    >
                      Settings
                    </button>
                  </div>

                  {activeTab === 'questions' && quiz && quiz.questions && quiz.questions.length > 0 && (
                    <div className="mt-3">
                      <h6>Questions</h6>
                      <div className="list-group">
                        {quiz.questions.map((question, index) => (
                          <button
                            key={question._id}
                            className={`list-group-item list-group-item-action ${selectedQuestion === question._id ? 'active' : ''}`}
                            onClick={() => setSelectedQuestion(question._id)}
                          >
                            {question.question.substring(0, 30)}...
                            <span className="badge badge-secondary float-right">
                              {question.type}
                            </span>
                          </button>
                        ))}
                      </div>
                      <button
                        className="btn btn-sm btn-primary mt-2"
                        onClick={() => setSelectedQuestion(null)}
                      >
                        <i className="fas fa-plus mr-1"></i> Add Question
                      </button>
                    </div>
                  )}
                </div>

                <div className="col-md-9">
                  {activeTab === 'details' && (
                    <div className="card">
                      <div className="card-body">
                        <h4 className="card-title mb-4">Quiz Details</h4>
                        
                        <form onSubmit={onSubmit}>
                          <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <input
                              type="text"
                              className="form-control"
                              id="title"
                              name="title"
                              value={title}
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
                              required
                            ></textarea>
                          </div>

                          <div className="form-group">
                            <label htmlFor="shortDescription">Short Description</label>
                            <textarea
                              className="form-control"
                              id="shortDescription"
                              name="shortDescription"
                              value={shortDescription}
                              onChange={onChange}
                              rows="2"
                            ></textarea>
                          </div>

                          <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select
                              className="form-control"
                              id="category"
                              name="category"
                              value={category}
                              onChange={onChange}
                            >
                              <option value="general">General</option>
                              <option value="mathematics">Mathematics</option>
                              <option value="science">Science</option>
                              <option value="history">History</option>
                              <option value="language">Language</option>
                              <option value="technology">Technology</option>
                              <option value="business">Business</option>
                              <option value="health">Health</option>
                              <option value="arts">Arts</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label htmlFor="tags">Tags (comma separated)</label>
                            <input
                              type="text"
                              className="form-control"
                              id="tags"
                              name="tags"
                              value={tags}
                              onChange={onChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>Thumbnail</label>
                            <div className="d-flex align-items-center">
                              {thumbnail && typeof thumbnail === 'string' && (
                                <img
                                  src={thumbnail}
                                  alt="Quiz thumbnail"
                                  className="img-thumbnail mr-3"
                                  style={{ maxWidth: '100px' }}
                                />
                              )}
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={triggerFileInput}
                              >
                                {thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
                              </button>
                              <input
                                type="file"
                                className="d-none"
                                ref={fileInputRef}
                                onChange={onFileChange}
                                accept="image/*"
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group col-md-4">
                              <label htmlFor="estimatedTime">Estimated Time (minutes)</label>
                              <input
                                type="number"
                                className="form-control"
                                id="estimatedTime"
                                name="estimatedTime"
                                value={estimatedTime}
                                onChange={onChange}
                                min="1"
                                required
                              />
                            </div>

                            <div className="form-group col-md-4">
                              <label htmlFor="difficulty">Difficulty</label>
                              <select
                                className="form-control"
                                id="difficulty"
                                name="difficulty"
                                value={difficulty}
                                onChange={onChange}
                              >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                              </select>
                            </div>

                            <div className="form-group col-md-4">
                              <div className="form-check mt-4">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="isPublished"
                                  name="isPublished"
                                  checked={isPublished}
                                  onChange={onCheck}
                                />
                                <label className="form-check-label" htmlFor="isPublished">
                                  Published
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="isFeatured"
                                  name="isFeatured"
                                  checked={isFeatured}
                                  onChange={onCheck}
                                />
                                <label className="form-check-label" htmlFor="isFeatured">
                                  Featured
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="prerequisites">Prerequisites (comma separated)</label>
                            <input
                              type="text"
                              className="form-control"
                              id="prerequisites"
                              name="prerequisites"
                              value={prerequisites}
                              onChange={onChange}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="learningObjectives">Learning Objectives (comma separated)</label>
                            <input
                              type="text"
                              className="form-control"
                              id="learningObjectives"
                              name="learningObjectives"
                              value={learningObjectives}
                              onChange={onChange}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="targetAudience">Target Audience (comma separated)</label>
                            <input
                              type="text"
                              className="form-control"
                              id="targetAudience"
                              name="targetAudience"
                              value={targetAudience}
                              onChange={onChange}
                            />
                          </div>

                          <div className="form-group">
                            <button type="submit" className="btn btn-primary">
                              {match.params.id ? 'Update Quiz' : 'Create Quiz'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {activeTab === 'questions' && quiz && (
                    <QuestionEditor
                      question={selectedQuestion ? 
                        quiz.questions.find(question => question._id === selectedQuestion) : null
                      }
                      quizId={quiz._id}
                      onAdd={handleAddQuestion}
                      onUpdate={handleUpdateQuestion}
                      onDelete={handleDeleteQuestion}
                    />
                  )}

                  {activeTab === 'settings' && (
                    <div className="card">
                      <div className="card-body">
                        <h4 className="card-title mb-4">Quiz Settings</h4>
                        
                        <div className="form-group">
                          <label htmlFor="timeLimit">Time Limit (minutes, 0 for no limit)</label>
                          <input
                            type="number"
                            className="form-control"
                            id="timeLimit"
                            name="timeLimit"
                            value={settings.timeLimit}
                            onChange={onSettingsChange}
                            min="0"
                          />
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="allowRetakes"
                            name="allowRetakes"
                            checked={settings.allowRetakes}
                            onChange={onSettingsChange}
                          />
                          <label className="form-check-label" htmlFor="allowRetakes">
                            Allow Retakes
                          </label>
                        </div>

                        {settings.allowRetakes && (
                          <div className="form-group ml-4">
                            <label htmlFor="maxRetakes">Maximum Retakes (0 for unlimited)</label>
                            <input
                              type="number"
                              className="form-control"
                              id="maxRetakes"
                              name="maxRetakes"
                              value={settings.maxRetakes}
                              onChange={onSettingsChange}
                              min="0"
                            />
                          </div>
                        )}

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="showResults"
                            name="showResults"
                            checked={settings.showResults}
                            onChange={onSettingsChange}
                          />
                          <label className="form-check-label" htmlFor="showResults">
                            Show Results
                          </label>
                        </div>

                        {settings.showResults && (
                          <>
                            <div className="form-check ml-4">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="showCorrectAnswers"
                                name="showCorrectAnswers"
                                checked={settings.showCorrectAnswers}
                                onChange={onSettingsChange}
                              />
                              <label className="form-check-label" htmlFor="showCorrectAnswers">
                                Show Correct Answers
                              </label>
                            </div>

                            <div className="form-check ml-4">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="showExplanation"
                                name="showExplanation"
                                checked={settings.showExplanation}
                                onChange={onSettingsChange}
                              />
                              <label className="form-check-label" htmlFor="showExplanation">
                                Show Explanation
                              </label>
                            </div>
                          </>
                        )}

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="shuffleQuestions"
                            name="shuffleQuestions"
                            checked={settings.shuffleQuestions}
                            onChange={onSettingsChange}
                          />
                          <label className="form-check-label" htmlFor="shuffleQuestions">
                            Shuffle Questions
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="shuffleOptions"
                            name="shuffleOptions"
                            checked={settings.shuffleOptions}
                            onChange={onSettingsChange}
                          />
                          <label className="form-check-label" htmlFor="shuffleOptions">
                            Shuffle Options
                          </label>
                        </div>

                        <div className="form-group">
                          <label htmlFor="passPercentage">Pass Percentage</label>
                          <input
                            type="number"
                            className="form-control"
                            id="passPercentage"
                            name="passPercentage"
                            value={settings.passPercentage}
                            onChange={onSettingsChange}
                            min="0"
                            max="100"
                          />
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="allowPause"
                            name="allowPause"
                            checked={settings.allowPause}
                            onChange={onSettingsChange}
                          />
                          <label className="form-check-label" htmlFor="allowPause">
                            Allow Pause
                          </label>
                        </div>

                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="randomizeQuestionOrder"
                            name="randomizeQuestionOrder"
                            checked={settings.randomizeQuestionOrder}
                            onChange={onSettingsChange}
                          />
                          <label className="form-check-label" htmlFor="randomizeQuestionOrder">
                            Randomize Question Order
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

QuizCreator.propTypes = {
  auth: PropTypes.object.isRequired,
  quiz: PropTypes.object.isRequired,
  getQuiz: PropTypes.func.isRequired,
  addQuiz: PropTypes.func.isRequired,
  updateQuiz: PropTypes.func.isRequired,
  addQuestion: PropTypes.func.isRequired,
  updateQuestion: PropTypes.func.isRequired,
  deleteQuestion: PropTypes.func.isRequired,
  clearQuiz: PropTypes.func.isRequired,
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
  addQuiz,
  updateQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  clearQuiz,
  setAlert
})(withRouter(QuizCreator));
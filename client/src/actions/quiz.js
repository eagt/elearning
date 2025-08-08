import axios from 'axios';
import {
  GET_QUIZZES,
  GET_QUIZ,
  QUIZ_ERROR,
  ADD_QUIZ,
  UPDATE_QUIZ,
  DELETE_QUIZ,
  TOGGLE_PUBLISH_QUIZ,
  TOGGLE_FEATURE_QUIZ,
  ADD_QUESTION,
  UPDATE_QUESTION,
  DELETE_QUESTION,
  START_QUIZ_ATTEMPT,
  GET_QUIZ_ATTEMPT,
  SUBMIT_ANSWER,
  SUBMIT_QUIZ,
  PAUSE_QUIZ,
  RESUME_QUIZ,
  GET_QUIZ_ATTEMPTS,
  GET_QUIZ_RESULTS,
  CLEAR_QUIZ,
  CLEAR_QUIZ_ATTEMPT
} from './types';

// Get quizzes
export const getQuizzes = (params = {}) => async dispatch => {
  try {
    const res = await axios.get('/api/quizzes', { params });

    dispatch({
      type: GET_QUIZZES,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get quiz by ID
export const getQuiz = id => async dispatch => {
  try {
    const res = await axios.get(`/api/quizzes/${id}`);

    dispatch({
      type: GET_QUIZ,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add quiz
export const addQuiz = (formData, history) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const res = await axios.post('/api/quizzes', formData, config);

    dispatch({
      type: ADD_QUIZ,
      payload: res.data
    });

    history.push(`/quizzes/${res.data._id}`);
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update quiz
export const updateQuiz = (id, formData, history) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const res = await axios.put(`/api/quizzes/${id}`, formData, config);

    dispatch({
      type: UPDATE_QUIZ,
      payload: res.data
    });

    history.push(`/quizzes/${res.data._id}`);
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete quiz
export const deleteQuiz = id => async dispatch => {
  if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
    try {
      await axios.delete(`/api/quizzes/${id}`);

      dispatch({
        type: DELETE_QUIZ,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: QUIZ_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
      throw err;
    }
  }
};

// Toggle publish quiz
export const togglePublishQuiz = id => async dispatch => {
  try {
    const res = await axios.put(`/api/quizzes/${id}/publish`);

    dispatch({
      type: TOGGLE_PUBLISH_QUIZ,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Toggle feature quiz
export const toggleFeatureQuiz = id => async dispatch => {
  try {
    const res = await axios.put(`/api/quizzes/${id}/feature`);

    dispatch({
      type: TOGGLE_FEATURE_QUIZ,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add question
export const addQuestion = (quizId, formData) => async dispatch => {
  try {
    const res = await axios.post(`/api/quizzes/${quizId}/questions`, formData);

    dispatch({
      type: ADD_QUESTION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update question
export const updateQuestion = (quizId, questionId, formData) => async dispatch => {
  try {
    const res = await axios.put(`/api/quizzes/${quizId}/questions/${questionId}`, formData);

    dispatch({
      type: UPDATE_QUESTION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete question
export const deleteQuestion = (quizId, questionId) => async dispatch => {
  if (window.confirm('Are you sure you want to delete this question?')) {
    try {
      const res = await axios.delete(`/api/quizzes/${quizId}/questions/${questionId}`);

      dispatch({
        type: DELETE_QUESTION,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: QUIZ_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
      throw err;
    }
  }
};

// Start quiz attempt
export const startQuizAttempt = quizId => async dispatch => {
  try {
    const res = await axios.post(`/api/quizzes/${quizId}/start`);

    dispatch({
      type: START_QUIZ_ATTEMPT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get quiz attempt
export const getQuizAttempt = (quizId, attemptId) => async dispatch => {
  try {
    const res = await axios.get(`/api/quizzes/${quizId}/attempt/${attemptId}`);

    dispatch({
      type: GET_QUIZ_ATTEMPT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Submit answer
export const submitAnswer = (quizId, attemptId, formData) => async dispatch => {
  try {
    const res = await axios.put(`/api/quizzes/${quizId}/attempt/${attemptId}/answer`, formData);

    dispatch({
      type: SUBMIT_ANSWER,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Submit quiz
export const submitQuiz = (quizId, attemptId) => async dispatch => {
  try {
    const res = await axios.put(`/api/quizzes/${quizId}/attempt/${attemptId}/submit`);

    dispatch({
      type: SUBMIT_QUIZ,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Pause quiz
export const pauseQuiz = (quizId, attemptId) => async dispatch => {
  try {
    const res = await axios.put(`/api/quizzes/${quizId}/attempt/${attemptId}/pause`);

    dispatch({
      type: PAUSE_QUIZ,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Resume quiz
export const resumeQuiz = (quizId, attemptId) => async dispatch => {
  try {
    const res = await axios.put(`/api/quizzes/${quizId}/attempt/${attemptId}/resume`);

    dispatch({
      type: RESUME_QUIZ,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get quiz attempts
export const getQuizAttempts = quizId => async dispatch => {
  try {
    const res = await axios.get(`/api/quizzes/${quizId}/attempts`);

    dispatch({
      type: GET_QUIZ_ATTEMPTS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get quiz results
export const getQuizResults = quizId => async dispatch => {
  try {
    const res = await axios.get(`/api/quizzes/${quizId}/results`);

    dispatch({
      type: GET_QUIZ_RESULTS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: QUIZ_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Clear quiz
export const clearQuiz = () => dispatch => {
  dispatch({ type: CLEAR_QUIZ });
};

// Clear quiz attempt
export const clearQuizAttempt = () => dispatch => {
  dispatch({ type: CLEAR_QUIZ_ATTEMPT });
};
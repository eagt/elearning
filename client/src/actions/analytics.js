import axios from 'axios';
import {
  GET_USER_PROGRESS,
  GET_USER_PROGRESS_CONTENT,
  UPDATE_USER_PROGRESS,
  RECORD_SLIDE_VIEW,
  RECORD_STEP_COMPLETION,
  RECORD_QUIZ_ATTEMPT,
  GET_CONTENT_ENGAGEMENT,
  GET_SYSTEM_METRICS,
  GET_USER_STATS,
  GET_CONTENT_STATS,
  ANALYTICS_ERROR,
  CLEAR_ANALYTICS
} from './types';

// Get user progress for all content
export const getUserProgress = (params = {}) => async dispatch => {
  try {
    const res = await axios.get('/api/analytics/user-progress', { params });

    dispatch({
      type: GET_USER_PROGRESS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: ANALYTICS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get user progress for a specific content
export const getUserProgressContent = contentId => async dispatch => {
  try {
    const res = await axios.get(`/api/analytics/user-progress/${contentId}`);

    dispatch({
      type: GET_USER_PROGRESS_CONTENT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: ANALYTICS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Create or update user progress for a content
export const updateUserProgress = (contentId, progressData) => async dispatch => {
  try {
    const res = await axios.post(`/api/analytics/user-progress/${contentId}`, progressData);

    dispatch({
      type: UPDATE_USER_PROGRESS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: ANALYTICS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Record slide view
export const recordSlideView = (contentId, slideId, timeSpent = 0) => async dispatch => {
  try {
    const res = await axios.put(`/api/analytics/user-progress/${contentId}/slide/${slideId}`, { timeSpent });

    dispatch({
      type: RECORD_SLIDE_VIEW,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: ANALYTICS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Record step completion
export const recordStepCompletion = (contentId, stepId, timeSpent = 0) => async dispatch => {
  try {
    const res = await axios.put(`/api/analytics/user-progress/${contentId}/step/${stepId}`, { timeSpent });

    dispatch({
      type: RECORD_STEP_COMPLETION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: ANALYTICS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Record quiz attempt
export const recordQuizAttempt = (contentId, quizData) => async dispatch => {
  try {
    const res = await axios.post(`/api/analytics/user-progress/${contentId}/quiz-attempt`, quizData);

    dispatch({
      type: RECORD_QUIZ_ATTEMPT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: ANALYTICS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get content engagement analytics
export const getContentEngagement = (params = {}) => async dispatch => {
  try {
    const res = await axios.get('/api/analytics/content-engagement', { params });

    dispatch({
      type: GET_CONTENT_ENGAGEMENT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: ANALYTICS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get system metrics
export const getSystemMetrics = (params = {}) => async dispatch => {
  try {
    const res = await axios.get('/api/analytics/system-metrics', { params });

    dispatch({
      type: GET_SYSTEM_METRICS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: ANALYTICS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get user statistics
export const getUserStats = (params = {}) => async dispatch => {
  try {
    const res = await axios.get('/api/analytics/user-stats', { params });

    dispatch({
      type: GET_USER_STATS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: ANALYTICS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get statistics for a specific content
export const getContentStats = (contentType, contentId) => async dispatch => {
  try {
    const res = await axios.get(`/api/analytics/content-stats/${contentType}/${contentId}`);

    dispatch({
      type: GET_CONTENT_STATS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: ANALYTICS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Clear analytics
export const clearAnalytics = () => dispatch => {
  dispatch({ type: CLEAR_ANALYTICS });
};
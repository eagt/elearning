import axios from 'axios';
import {
  GET_TUTORIALS,
  GET_TUTORIAL,
  TUTORIAL_ERROR,
  ADD_TUTORIAL,
  UPDATE_TUTORIAL,
  DELETE_TUTORIAL,
  TOGGLE_PUBLISH_TUTORIAL,
  TOGGLE_FEATURE_TUTORIAL,
  ADD_STEP,
  UPDATE_STEP,
  DELETE_STEP,
  INCREMENT_VIEW_COUNT,
  INCREMENT_COMPLETION_COUNT,
  CLEAR_TUTORIAL
} from './types';

// Get tutorials
export const getTutorials = (params = {}) => async dispatch => {
  try {
    const res = await axios.get('/api/tutorials', { params });

    dispatch({
      type: GET_TUTORIALS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: TUTORIAL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get tutorial by ID
export const getTutorial = id => async dispatch => {
  try {
    const res = await axios.get(`/api/tutorials/${id}`);

    dispatch({
      type: GET_TUTORIAL,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: TUTORIAL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add tutorial
export const addTutorial = (formData, history) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const res = await axios.post('/api/tutorials', formData, config);

    dispatch({
      type: ADD_TUTORIAL,
      payload: res.data
    });

    history.push(`/tutorials/${res.data._id}`);
  } catch (err) {
    dispatch({
      type: TUTORIAL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update tutorial
export const updateTutorial = (id, formData, history) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const res = await axios.put(`/api/tutorials/${id}`, formData, config);

    dispatch({
      type: UPDATE_TUTORIAL,
      payload: res.data
    });

    history.push(`/tutorials/${res.data._id}`);
  } catch (err) {
    dispatch({
      type: TUTORIAL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete tutorial
export const deleteTutorial = id => async dispatch => {
  if (window.confirm('Are you sure you want to delete this tutorial? This action cannot be undone.')) {
    try {
      await axios.delete(`/api/tutorials/${id}`);

      dispatch({
        type: DELETE_TUTORIAL,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: TUTORIAL_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
      throw err;
    }
  }
};

// Toggle publish tutorial
export const togglePublishTutorial = id => async dispatch => {
  try {
    const res = await axios.put(`/api/tutorials/${id}/publish`);

    dispatch({
      type: TOGGLE_PUBLISH_TUTORIAL,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: TUTORIAL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Toggle feature tutorial
export const toggleFeatureTutorial = id => async dispatch => {
  try {
    const res = await axios.put(`/api/tutorials/${id}/feature`);

    dispatch({
      type: TOGGLE_FEATURE_TUTORIAL,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: TUTORIAL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add step
export const addStep = (tutorialId, formData) => async dispatch => {
  try {
    const res = await axios.post(`/api/tutorials/${tutorialId}/steps`, formData);

    dispatch({
      type: ADD_STEP,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: TUTORIAL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update step
export const updateStep = (tutorialId, stepId, formData) => async dispatch => {
  try {
    const res = await axios.put(`/api/tutorials/${tutorialId}/steps/${stepId}`, formData);

    dispatch({
      type: UPDATE_STEP,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: TUTORIAL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete step
export const deleteStep = (tutorialId, stepId) => async dispatch => {
  if (window.confirm('Are you sure you want to delete this step?')) {
    try {
      const res = await axios.delete(`/api/tutorials/${tutorialId}/steps/${stepId}`);

      dispatch({
        type: DELETE_STEP,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: TUTORIAL_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
      throw err;
    }
  }
};

// Increment view count
export const incrementViewCount = id => async dispatch => {
  try {
    const res = await axios.put(`/api/tutorials/${id}/view`);

    dispatch({
      type: INCREMENT_VIEW_COUNT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: TUTORIAL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Increment completion count
export const incrementCompletionCount = id => async dispatch => {
  try {
    const res = await axios.put(`/api/tutorials/${id}/complete`);

    dispatch({
      type: INCREMENT_COMPLETION_COUNT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: TUTORIAL_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Clear tutorial
export const clearTutorial = () => dispatch => {
  dispatch({ type: CLEAR_TUTORIAL });
};
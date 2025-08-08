import axios from 'axios';
import {
  GET_PRESENTATIONS,
  GET_PRESENTATION,
  PRESENTATION_ERROR,
  ADD_PRESENTATION,
  UPDATE_PRESENTATION,
  DELETE_PRESENTATION,
  TOGGLE_PUBLISH_PRESENTATION,
  TOGGLE_FEATURE_PRESENTATION,
  ADD_SLIDE,
  UPDATE_SLIDE,
  DELETE_SLIDE,
  ADD_HOTSPOT,
  UPDATE_HOTSPOT,
  DELETE_HOTSPOT,
  ADD_BRANCHING_SCENARIO,
  UPDATE_BRANCHING_SCENARIO,
  DELETE_BRANCHING_SCENARIO,
  INCREMENT_VIEW_COUNT,
  INCREMENT_COMPLETION_COUNT,
  CLEAR_PRESENTATION
} from './types';

// Get presentations
export const getPresentations = (params = {}) => async dispatch => {
  try {
    const res = await axios.get('/api/presentations', { params });

    dispatch({
      type: GET_PRESENTATIONS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get presentation by ID
export const getPresentation = id => async dispatch => {
  try {
    const res = await axios.get(`/api/presentations/${id}`);

    dispatch({
      type: GET_PRESENTATION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add presentation
export const addPresentation = (formData, history) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const res = await axios.post('/api/presentations', formData, config);

    dispatch({
      type: ADD_PRESENTATION,
      payload: res.data
    });

    history.push(`/presentations/${res.data._id}`);
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update presentation
export const updatePresentation = (id, formData, history) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const res = await axios.put(`/api/presentations/${id}`, formData, config);

    dispatch({
      type: UPDATE_PRESENTATION,
      payload: res.data
    });

    history.push(`/presentations/${res.data._id}`);
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete presentation
export const deletePresentation = id => async dispatch => {
  if (window.confirm('Are you sure you want to delete this presentation? This action cannot be undone.')) {
    try {
      await axios.delete(`/api/presentations/${id}`);

      dispatch({
        type: DELETE_PRESENTATION,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: PRESENTATION_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
      throw err;
    }
  }
};

// Toggle publish presentation
export const togglePublishPresentation = id => async dispatch => {
  try {
    const res = await axios.put(`/api/presentations/${id}/publish`);

    dispatch({
      type: TOGGLE_PUBLISH_PRESENTATION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Toggle feature presentation
export const toggleFeaturePresentation = id => async dispatch => {
  try {
    const res = await axios.put(`/api/presentations/${id}/feature`);

    dispatch({
      type: TOGGLE_FEATURE_PRESENTATION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add slide
export const addSlide = (presentationId, formData) => async dispatch => {
  try {
    const res = await axios.post(`/api/presentations/${presentationId}/slides`, formData);

    dispatch({
      type: ADD_SLIDE,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update slide
export const updateSlide = (presentationId, slideId, formData) => async dispatch => {
  try {
    const res = await axios.put(`/api/presentations/${presentationId}/slides/${slideId}`, formData);

    dispatch({
      type: UPDATE_SLIDE,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete slide
export const deleteSlide = (presentationId, slideId) => async dispatch => {
  if (window.confirm('Are you sure you want to delete this slide?')) {
    try {
      const res = await axios.delete(`/api/presentations/${presentationId}/slides/${slideId}`);

      dispatch({
        type: DELETE_SLIDE,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: PRESENTATION_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
      throw err;
    }
  }
};

// Add hotspot
export const addHotspot = (presentationId, slideId, formData) => async dispatch => {
  try {
    const res = await axios.post(`/api/presentations/${presentationId}/slides/${slideId}/hotspots`, formData);

    dispatch({
      type: ADD_HOTSPOT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update hotspot
export const updateHotspot = (presentationId, slideId, hotspotId, formData) => async dispatch => {
  try {
    const res = await axios.put(`/api/presentations/${presentationId}/slides/${slideId}/hotspots/${hotspotId}`, formData);

    dispatch({
      type: UPDATE_HOTSPOT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete hotspot
export const deleteHotspot = (presentationId, slideId, hotspotId) => async dispatch => {
  if (window.confirm('Are you sure you want to delete this hotspot?')) {
    try {
      const res = await axios.delete(`/api/presentations/${presentationId}/slides/${slideId}/hotspots/${hotspotId}`);

      dispatch({
        type: DELETE_HOTSPOT,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: PRESENTATION_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
      throw err;
    }
  }
};

// Add branching scenario
export const addBranchingScenario = (presentationId, formData) => async dispatch => {
  try {
    const res = await axios.post(`/api/presentations/${presentationId}/branching-scenarios`, formData);

    dispatch({
      type: ADD_BRANCHING_SCENARIO,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update branching scenario
export const updateBranchingScenario = (presentationId, scenarioId, formData) => async dispatch => {
  try {
    const res = await axios.put(`/api/presentations/${presentationId}/branching-scenarios/${scenarioId}`, formData);

    dispatch({
      type: UPDATE_BRANCHING_SCENARIO,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete branching scenario
export const deleteBranchingScenario = (presentationId, scenarioId) => async dispatch => {
  if (window.confirm('Are you sure you want to delete this branching scenario?')) {
    try {
      const res = await axios.delete(`/api/presentations/${presentationId}/branching-scenarios/${scenarioId}`);

      dispatch({
        type: DELETE_BRANCHING_SCENARIO,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: PRESENTATION_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
      throw err;
    }
  }
};

// Increment view count
export const incrementViewCount = id => async dispatch => {
  try {
    const res = await axios.put(`/api/presentations/${id}/view`);

    dispatch({
      type: INCREMENT_VIEW_COUNT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Increment completion count
export const incrementCompletionCount = id => async dispatch => {
  try {
    const res = await axios.put(`/api/presentations/${id}/complete`);

    dispatch({
      type: INCREMENT_COMPLETION_COUNT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: PRESENTATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Clear presentation
export const clearPresentation = () => dispatch => {
  dispatch({ type: CLEAR_PRESENTATION });
};
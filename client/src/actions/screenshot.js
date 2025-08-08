import axios from 'axios';
import {
  GET_SCREENSHOTS,
  GET_SCREENSHOT,
  SCREENSHOT_ERROR,
  ADD_SCREENSHOT,
  UPDATE_SCREENSHOT,
  DELETE_SCREENSHOT,
  TOGGLE_PUBLISH_SCREENSHOT,
  TOGGLE_FEATURE_SCREENSHOT,
  ADD_ANNOTATION,
  UPDATE_ANNOTATION,
  DELETE_ANNOTATION,
  INCREMENT_VIEW_COUNT,
  CLEAR_SCREENSHOT
} from './types';

// Get screenshots
export const getScreenshots = (params = {}) => async dispatch => {
  try {
    const res = await axios.get('/api/screenshots', { params });

    dispatch({
      type: GET_SCREENSHOTS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SCREENSHOT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get screenshot by ID
export const getScreenshot = id => async dispatch => {
  try {
    const res = await axios.get(`/api/screenshots/${id}`);

    dispatch({
      type: GET_SCREENSHOT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SCREENSHOT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add screenshot
export const addScreenshot = (formData, history) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const res = await axios.post('/api/screenshots', formData, config);

    dispatch({
      type: ADD_SCREENSHOT,
      payload: res.data
    });

    history.push(`/screenshots/${res.data._id}`);
  } catch (err) {
    dispatch({
      type: SCREENSHOT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update screenshot
export const updateScreenshot = (id, formData, history) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const res = await axios.put(`/api/screenshots/${id}`, formData, config);

    dispatch({
      type: UPDATE_SCREENSHOT,
      payload: res.data
    });

    history.push(`/screenshots/${res.data._id}`);
  } catch (err) {
    dispatch({
      type: SCREENSHOT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete screenshot
export const deleteScreenshot = id => async dispatch => {
  if (window.confirm('Are you sure you want to delete this screenshot? This action cannot be undone.')) {
    try {
      await axios.delete(`/api/screenshots/${id}`);

      dispatch({
        type: DELETE_SCREENSHOT,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: SCREENSHOT_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
      throw err;
    }
  }
};

// Toggle publish screenshot
export const togglePublishScreenshot = id => async dispatch => {
  try {
    const res = await axios.put(`/api/screenshots/${id}/publish`);

    dispatch({
      type: TOGGLE_PUBLISH_SCREENSHOT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SCREENSHOT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Toggle feature screenshot
export const toggleFeatureScreenshot = id => async dispatch => {
  try {
    const res = await axios.put(`/api/screenshots/${id}/feature`);

    dispatch({
      type: TOGGLE_FEATURE_SCREENSHOT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SCREENSHOT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add annotation
export const addAnnotation = (screenshotId, formData) => async dispatch => {
  try {
    const res = await axios.post(`/api/screenshots/${screenshotId}/annotations`, formData);

    dispatch({
      type: ADD_ANNOTATION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SCREENSHOT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update annotation
export const updateAnnotation = (screenshotId, annotationId, formData) => async dispatch => {
  try {
    const res = await axios.put(`/api/screenshots/${screenshotId}/annotations/${annotationId}`, formData);

    dispatch({
      type: UPDATE_ANNOTATION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SCREENSHOT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete annotation
export const deleteAnnotation = (screenshotId, annotationId) => async dispatch => {
  if (window.confirm('Are you sure you want to delete this annotation?')) {
    try {
      const res = await axios.delete(`/api/screenshots/${screenshotId}/annotations/${annotationId}`);

      dispatch({
        type: DELETE_ANNOTATION,
        payload: res.data
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: SCREENSHOT_ERROR,
        payload: { msg: err.response.statusText, status: err.response.status }
      });
      throw err;
    }
  }
};

// Increment view count
export const incrementViewCount = id => async dispatch => {
  try {
    const res = await axios.put(`/api/screenshots/${id}/view`);

    dispatch({
      type: INCREMENT_VIEW_COUNT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SCREENSHOT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Clear screenshot
export const clearScreenshot = () => dispatch => {
  dispatch({ type: CLEAR_SCREENSHOT });
};

// Capture screenshot using keyboard shortcut
export const captureScreenshot = () => async dispatch => {
  try {
    // This function will be called when the keyboard shortcut is triggered
    // It will open the screenshot capture modal
    
    // In a real implementation, this would use a library like html2canvas or the browser's Screen Capture API
    // For now, we'll just dispatch an action to show the capture modal
    dispatch({
      type: 'SHOW_SCREENSHOT_CAPTURE_MODAL'
    });
  } catch (err) {
    console.error('Error capturing screenshot:', err);
  }
};

// Upload captured screenshot
export const uploadCapturedScreenshot = (formData, history) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const res = await axios.post('/api/screenshots', formData, config);

    dispatch({
      type: ADD_SCREENSHOT,
      payload: res.data
    });

    // Hide the capture modal
    dispatch({
      type: 'HIDE_SCREENSHOT_CAPTURE_MODAL'
    });

    history.push(`/screenshots/${res.data._id}/edit`);
  } catch (err) {
    dispatch({
      type: SCREENSHOT_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};
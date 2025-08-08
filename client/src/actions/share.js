import axios from 'axios';
import {
  GET_SHARES,
  GET_SHARE,
  SHARE_ERROR,
  CREATE_SHARE,
  UPDATE_SHARE,
  DELETE_SHARE,
  TOGGLE_SHARE_STATUS,
  ADD_COMMENT,
  ADD_REPLY,
  RECORD_DOWNLOAD,
  CLEAR_SHARE
} from './types';

// Get shares
export const getShares = () => async dispatch => {
  try {
    const res = await axios.get('/api/shares');

    dispatch({
      type: GET_SHARES,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SHARE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get share by token (for public access)
export const getShareByToken = (token) => async dispatch => {
  try {
    const res = await axios.get(`/api/shares/token/${token}`);

    dispatch({
      type: GET_SHARE,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SHARE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get share by ID
export const getShare = (id) => async dispatch => {
  try {
    const res = await axios.get(`/api/shares/${id}`);

    dispatch({
      type: GET_SHARE,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SHARE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Create share
export const createShare = (formData) => async dispatch => {
  try {
    const res = await axios.post('/api/shares', formData);

    dispatch({
      type: CREATE_SHARE,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SHARE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update share
export const updateShare = (id, formData) => async dispatch => {
  try {
    const res = await axios.put(`/api/shares/${id}`, formData);

    dispatch({
      type: UPDATE_SHARE,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SHARE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete share
export const deleteShare = (id) => async dispatch => {
  try {
    await axios.delete(`/api/shares/${id}`);

    dispatch({
      type: DELETE_SHARE,
      payload: id
    });
  } catch (err) {
    dispatch({
      type: SHARE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Toggle share status
export const toggleShareStatus = (id) => async dispatch => {
  try {
    const res = await axios.put(`/api/shares/${id}/toggle`);

    dispatch({
      type: TOGGLE_SHARE_STATUS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SHARE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add comment
export const addComment = (shareId, text) => async dispatch => {
  try {
    const res = await axios.post(`/api/shares/${shareId}/comments`, { text });

    dispatch({
      type: ADD_COMMENT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SHARE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add reply
export const addReply = (shareId, commentIndex, text) => async dispatch => {
  try {
    const res = await axios.post(`/api/shares/${shareId}/comments/${commentIndex}/replies`, { text });

    dispatch({
      type: ADD_REPLY,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SHARE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Record download
export const recordDownload = (shareId) => async dispatch => {
  try {
    const res = await axios.put(`/api/shares/${shareId}/download`);

    dispatch({
      type: RECORD_DOWNLOAD,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: SHARE_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Clear share
export const clearShare = () => dispatch => {
  dispatch({ type: CLEAR_SHARE });
};
import axios from 'axios';
import {
  GET_COLLABORATIONS,
  GET_COLLABORATION,
  COLLABORATION_ERROR,
  CREATE_COLLABORATION,
  UPDATE_COLLABORATION,
  DELETE_COLLABORATION,
  ADD_MEMBER,
  ACCEPT_INVITATION,
  DECLINE_INVITATION,
  REMOVE_MEMBER,
  ADD_COMMENT,
  ADD_REPLY,
  RESOLVE_COMMENT,
  ADD_TASK,
  UPDATE_TASK,
  CREATE_VERSION,
  CLEAR_COLLABORATION
} from './types';

// Get collaborations
export const getCollaborations = () => async dispatch => {
  try {
    const res = await axios.get('/api/collaborations');

    dispatch({
      type: GET_COLLABORATIONS,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Get collaboration by ID
export const getCollaboration = (id) => async dispatch => {
  try {
    const res = await axios.get(`/api/collaborations/${id}`);

    dispatch({
      type: GET_COLLABORATION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Create collaboration
export const createCollaboration = (formData) => async dispatch => {
  try {
    const res = await axios.post('/api/collaborations', formData);

    dispatch({
      type: CREATE_COLLABORATION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update collaboration
export const updateCollaboration = (id, formData) => async dispatch => {
  try {
    const res = await axios.put(`/api/collaborations/${id}`, formData);

    dispatch({
      type: UPDATE_COLLABORATION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Delete collaboration
export const deleteCollaboration = (id) => async dispatch => {
  try {
    await axios.delete(`/api/collaborations/${id}`);

    dispatch({
      type: DELETE_COLLABORATION,
      payload: id
    });
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add member
export const addMember = (collaborationId, memberData) => async dispatch => {
  try {
    const res = await axios.post(`/api/collaborations/${collaborationId}/members`, memberData);

    dispatch({
      type: ADD_MEMBER,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Accept invitation
export const acceptInvitation = (collaborationId, userId) => async dispatch => {
  try {
    const res = await axios.put(`/api/collaborations/${collaborationId}/accept`, { userId });

    dispatch({
      type: ACCEPT_INVITATION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Decline invitation
export const declineInvitation = (collaborationId, userId) => async dispatch => {
  try {
    const res = await axios.put(`/api/collaborations/${collaborationId}/decline`, { userId });

    dispatch({
      type: DECLINE_INVITATION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Remove member
export const removeMember = (collaborationId, userId) => async dispatch => {
  try {
    const res = await axios.delete(`/api/collaborations/${collaborationId}/members/${userId}`);

    dispatch({
      type: REMOVE_MEMBER,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add comment
export const addComment = (collaborationId, text) => async dispatch => {
  try {
    const res = await axios.post(`/api/collaborations/${collaborationId}/comments`, { text });

    dispatch({
      type: ADD_COMMENT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add reply
export const addReply = (collaborationId, commentIndex, text) => async dispatch => {
  try {
    const res = await axios.post(`/api/collaborations/${collaborationId}/comments/${commentIndex}/replies`, { text });

    dispatch({
      type: ADD_REPLY,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Resolve comment
export const resolveComment = (collaborationId, commentIndex) => async dispatch => {
  try {
    const res = await axios.put(`/api/collaborations/${collaborationId}/comments/${commentIndex}/resolve`);

    dispatch({
      type: RESOLVE_COMMENT,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Add task
export const addTask = (collaborationId, title, description, assignedTo, createdBy, priority, dueDate) => async dispatch => {
  try {
    const res = await axios.post(`/api/collaborations/${collaborationId}/tasks`, {
      title,
      description,
      assignedTo,
      createdBy,
      priority,
      dueDate
    });

    dispatch({
      type: ADD_TASK,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Update task
export const updateTask = (collaborationId, taskIndex, updates) => async dispatch => {
  try {
    const res = await axios.put(`/api/collaborations/${collaborationId}/tasks/${taskIndex}`, updates);

    dispatch({
      type: UPDATE_TASK,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Create version
export const createVersion = (collaborationId, changes, snapshot) => async dispatch => {
  try {
    const res = await axios.post(`/api/collaborations/${collaborationId}/versions`, {
      changes,
      snapshot
    });

    dispatch({
      type: CREATE_VERSION,
      payload: res.data
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: COLLABORATION_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
    throw err;
  }
};

// Clear collaboration
export const clearCollaboration = () => dispatch => {
  dispatch({ type: CLEAR_COLLABORATION });
};
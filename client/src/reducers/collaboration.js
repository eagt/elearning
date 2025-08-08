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
} from '../actions/types';

const initialState = {
  collaborations: [],
  collaboration: null,
  loading: true,
  error: null
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_COLLABORATIONS:
      return {
        ...state,
        collaborations: payload,
        loading: false
      };
    case GET_COLLABORATION:
      return {
        ...state,
        collaboration: payload,
        loading: false
      };
    case CREATE_COLLABORATION:
      return {
        ...state,
        collaborations: [payload, ...state.collaborations],
        loading: false
      };
    case UPDATE_COLLABORATION:
      return {
        ...state,
        collaborations: state.collaborations.map(collab =>
          collab._id === payload._id ? payload : collab
        ),
        collaboration: payload,
        loading: false
      };
    case DELETE_COLLABORATION:
      return {
        ...state,
        collaborations: state.collaborations.filter(collab => collab._id !== payload),
        loading: false
      };
    case ADD_MEMBER:
      return {
        ...state,
        collaboration: payload,
        loading: false
      };
    case ACCEPT_INVITATION:
      return {
        ...state,
        collaborations: state.collaborations.map(collab =>
          collab._id === payload._id ? payload : collab
        ),
        collaboration: payload,
        loading: false
      };
    case DECLINE_INVITATION:
      return {
        ...state,
        collaborations: state.collaborations.filter(collab => collab._id !== payload._id),
        loading: false
      };
    case REMOVE_MEMBER:
      return {
        ...state,
        collaboration: payload,
        loading: false
      };
    case ADD_COMMENT:
      return {
        ...state,
        collaboration: payload,
        loading: false
      };
    case ADD_REPLY:
      return {
        ...state,
        collaboration: payload,
        loading: false
      };
    case RESOLVE_COMMENT:
      return {
        ...state,
        collaboration: payload,
        loading: false
      };
    case ADD_TASK:
      return {
        ...state,
        collaboration: payload,
        loading: false
      };
    case UPDATE_TASK:
      return {
        ...state,
        collaboration: payload,
        loading: false
      };
    case CREATE_VERSION:
      return {
        ...state,
        collaboration: payload,
        loading: false
      };
    case COLLABORATION_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_COLLABORATION:
      return {
        ...state,
        collaboration: null,
        loading: false
      };
    default:
      return state;
  }
}
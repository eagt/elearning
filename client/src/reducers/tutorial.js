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
} from '../actions/types';

const initialState = {
  tutorials: [],
  tutorial: null,
  loading: true,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_TUTORIALS:
      return {
        ...state,
        tutorials: payload.tutorials,
        pagination: payload.pagination,
        loading: false
      };
    case GET_TUTORIAL:
      return {
        ...state,
        tutorial: payload,
        loading: false
      };
    case ADD_TUTORIAL:
      return {
        ...state,
        tutorials: [payload, ...state.tutorials],
        loading: false
      };
    case UPDATE_TUTORIAL:
      return {
        ...state,
        tutorials: state.tutorials.map(tutorial =>
          tutorial._id === payload._id ? payload : tutorial
        ),
        tutorial: payload,
        loading: false
      };
    case DELETE_TUTORIAL:
      return {
        ...state,
        tutorials: state.tutorials.filter(
          tutorial => tutorial._id !== payload
        ),
        loading: false
      };
    case TOGGLE_PUBLISH_TUTORIAL:
      return {
        ...state,
        tutorials: state.tutorials.map(tutorial =>
          tutorial._id === payload._id ? payload : tutorial
        ),
        tutorial: payload,
        loading: false
      };
    case TOGGLE_FEATURE_TUTORIAL:
      return {
        ...state,
        tutorials: state.tutorials.map(tutorial =>
          tutorial._id === payload._id ? payload : tutorial
        ),
        tutorial: payload,
        loading: false
      };
    case ADD_STEP:
      return {
        ...state,
        tutorial: payload,
        loading: false
      };
    case UPDATE_STEP:
      return {
        ...state,
        tutorial: payload,
        loading: false
      };
    case DELETE_STEP:
      return {
        ...state,
        tutorial: payload,
        loading: false
      };
    case INCREMENT_VIEW_COUNT:
      return {
        ...state,
        tutorial: state.tutorial
          ? { ...state.tutorial, viewCount: payload.viewCount }
          : null,
        loading: false
      };
    case INCREMENT_COMPLETION_COUNT:
      return {
        ...state,
        tutorial: state.tutorial
          ? { ...state.tutorial, completionCount: payload.completionCount }
          : null,
        loading: false
      };
    case TUTORIAL_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_TUTORIAL:
      return {
        ...state,
        tutorial: null,
        loading: false
      };
    default:
      return state;
  }
}
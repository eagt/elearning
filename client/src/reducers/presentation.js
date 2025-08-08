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
} from '../actions/types';

const initialState = {
  presentations: [],
  presentation: null,
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
    case GET_PRESENTATIONS:
      return {
        ...state,
        presentations: payload.presentations,
        pagination: payload.pagination,
        loading: false
      };
    case GET_PRESENTATION:
      return {
        ...state,
        presentation: payload,
        loading: false
      };
    case ADD_PRESENTATION:
      return {
        ...state,
        presentations: [payload, ...state.presentations],
        loading: false
      };
    case UPDATE_PRESENTATION:
      return {
        ...state,
        presentations: state.presentations.map(presentation =>
          presentation._id === payload._id ? payload : presentation
        ),
        presentation: payload,
        loading: false
      };
    case DELETE_PRESENTATION:
      return {
        ...state,
        presentations: state.presentations.filter(
          presentation => presentation._id !== payload
        ),
        loading: false
      };
    case TOGGLE_PUBLISH_PRESENTATION:
      return {
        ...state,
        presentations: state.presentations.map(presentation =>
          presentation._id === payload._id ? payload : presentation
        ),
        presentation: payload,
        loading: false
      };
    case TOGGLE_FEATURE_PRESENTATION:
      return {
        ...state,
        presentations: state.presentations.map(presentation =>
          presentation._id === payload._id ? payload : presentation
        ),
        presentation: payload,
        loading: false
      };
    case ADD_SLIDE:
      return {
        ...state,
        presentation: payload,
        loading: false
      };
    case UPDATE_SLIDE:
      return {
        ...state,
        presentation: payload,
        loading: false
      };
    case DELETE_SLIDE:
      return {
        ...state,
        presentation: payload,
        loading: false
      };
    case ADD_HOTSPOT:
      return {
        ...state,
        presentation: payload,
        loading: false
      };
    case UPDATE_HOTSPOT:
      return {
        ...state,
        presentation: payload,
        loading: false
      };
    case DELETE_HOTSPOT:
      return {
        ...state,
        presentation: payload,
        loading: false
      };
    case ADD_BRANCHING_SCENARIO:
      return {
        ...state,
        presentation: payload,
        loading: false
      };
    case UPDATE_BRANCHING_SCENARIO:
      return {
        ...state,
        presentation: payload,
        loading: false
      };
    case DELETE_BRANCHING_SCENARIO:
      return {
        ...state,
        presentation: payload,
        loading: false
      };
    case INCREMENT_VIEW_COUNT:
      return {
        ...state,
        presentation: state.presentation
          ? { ...state.presentation, viewCount: payload.viewCount }
          : null,
        loading: false
      };
    case INCREMENT_COMPLETION_COUNT:
      return {
        ...state,
        presentation: state.presentation
          ? { ...state.presentation, completionCount: payload.completionCount }
          : null,
        loading: false
      };
    case PRESENTATION_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_PRESENTATION:
      return {
        ...state,
        presentation: null,
        loading: false
      };
    default:
      return state;
  }
}
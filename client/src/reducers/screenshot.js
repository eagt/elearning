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
} from '../actions/types';

const initialState = {
  screenshots: [],
  screenshot: null,
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
    case GET_SCREENSHOTS:
      return {
        ...state,
        screenshots: payload.screenshots,
        pagination: payload.pagination,
        loading: false
      };
    case GET_SCREENSHOT:
      return {
        ...state,
        screenshot: payload,
        loading: false
      };
    case ADD_SCREENSHOT:
      return {
        ...state,
        screenshots: [payload, ...state.screenshots],
        loading: false
      };
    case UPDATE_SCREENSHOT:
      return {
        ...state,
        screenshots: state.screenshots.map(screenshot =>
          screenshot._id === payload._id ? payload : screenshot
        ),
        screenshot: payload,
        loading: false
      };
    case DELETE_SCREENSHOT:
      return {
        ...state,
        screenshots: state.screenshots.filter(
          screenshot => screenshot._id !== payload
        ),
        loading: false
      };
    case TOGGLE_PUBLISH_SCREENSHOT:
      return {
        ...state,
        screenshots: state.screenshots.map(screenshot =>
          screenshot._id === payload._id ? payload : screenshot
        ),
        screenshot: payload,
        loading: false
      };
    case TOGGLE_FEATURE_SCREENSHOT:
      return {
        ...state,
        screenshots: state.screenshots.map(screenshot =>
          screenshot._id === payload._id ? payload : screenshot
        ),
        screenshot: payload,
        loading: false
      };
    case ADD_ANNOTATION:
      return {
        ...state,
        screenshot: payload,
        loading: false
      };
    case UPDATE_ANNOTATION:
      return {
        ...state,
        screenshot: payload,
        loading: false
      };
    case DELETE_ANNOTATION:
      return {
        ...state,
        screenshot: payload,
        loading: false
      };
    case INCREMENT_VIEW_COUNT:
      return {
        ...state,
        screenshot: state.screenshot
          ? { ...state.screenshot, viewCount: payload.viewCount }
          : null,
        loading: false
      };
    case SCREENSHOT_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_SCREENSHOT:
      return {
        ...state,
        screenshot: null,
        loading: false
      };
    default:
      return state;
  }
}
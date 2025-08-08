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
} from '../actions/types';

const initialState = {
  userProgress: [],
  currentProgress: null,
  contentEngagement: [],
  systemMetrics: [],
  userStats: null,
  contentStats: null,
  loading: true,
  error: null
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_USER_PROGRESS:
      return {
        ...state,
        userProgress: payload,
        loading: false
      };
    case GET_USER_PROGRESS_CONTENT:
      return {
        ...state,
        currentProgress: payload,
        loading: false
      };
    case UPDATE_USER_PROGRESS:
      return {
        ...state,
        currentProgress: payload,
        userProgress: state.userProgress.map(progress =>
          progress._id === payload._id ? payload : progress
        ),
        loading: false
      };
    case RECORD_SLIDE_VIEW:
      return {
        ...state,
        currentProgress: payload,
        loading: false
      };
    case RECORD_STEP_COMPLETION:
      return {
        ...state,
        currentProgress: payload,
        loading: false
      };
    case RECORD_QUIZ_ATTEMPT:
      return {
        ...state,
        currentProgress: payload,
        loading: false
      };
    case GET_CONTENT_ENGAGEMENT:
      return {
        ...state,
        contentEngagement: payload,
        loading: false
      };
    case GET_SYSTEM_METRICS:
      return {
        ...state,
        systemMetrics: payload,
        loading: false
      };
    case GET_USER_STATS:
      return {
        ...state,
        userStats: payload,
        loading: false
      };
    case GET_CONTENT_STATS:
      return {
        ...state,
        contentStats: payload,
        loading: false
      };
    case ANALYTICS_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_ANALYTICS:
      return {
        ...state,
        currentProgress: null,
        contentStats: null,
        loading: false
      };
    default:
      return state;
  }
}
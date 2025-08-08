import {
  GET_COURSES,
  GET_COURSE,
  COURSE_ERROR,
  CREATE_COURSE,
  UPDATE_COURSE,
  DELETE_COURSE,
  SET_CURRENT_COURSE,
  CLEAR_CURRENT_COURSE,
  CLEAR_COURSES,
  GET_COURSE_PROGRESS,
  UPDATE_COURSE_PROGRESS
} from '../actions/types';

const initialState = {
  courses: [],
  currentCourse: null,
  loading: true,
  error: null,
  progress: null
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_COURSES:
      return {
        ...state,
        courses: payload,
        loading: false
      };
    case GET_COURSE:
    case CREATE_COURSE:
    case UPDATE_COURSE:
      return {
        ...state,
        currentCourse: payload,
        loading: false
      };
    case SET_CURRENT_COURSE:
      return {
        ...state,
        currentCourse: payload,
        loading: false
      };
    case DELETE_COURSE:
      return {
        ...state,
        courses: state.courses.filter(course => course._id !== payload),
        loading: false
      };
    case GET_COURSE_PROGRESS:
      return {
        ...state,
        progress: payload,
        loading: false
      };
    case UPDATE_COURSE_PROGRESS:
      return {
        ...state,
        progress: {
          ...state.progress,
          ...payload
        },
        loading: false
      };
    case COURSE_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_CURRENT_COURSE:
      return {
        ...state,
        currentCourse: null
      };
    case CLEAR_COURSES:
      return {
        ...state,
        courses: [],
        currentCourse: null,
        loading: false
      };
    default:
      return state;
  }
}
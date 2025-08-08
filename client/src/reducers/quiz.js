import {
  GET_QUIZZES,
  GET_QUIZ,
  QUIZ_ERROR,
  ADD_QUIZ,
  UPDATE_QUIZ,
  DELETE_QUIZ,
  TOGGLE_PUBLISH_QUIZ,
  TOGGLE_FEATURE_QUIZ,
  ADD_QUESTION,
  UPDATE_QUESTION,
  DELETE_QUESTION,
  START_QUIZ_ATTEMPT,
  GET_QUIZ_ATTEMPT,
  SUBMIT_ANSWER,
  SUBMIT_QUIZ,
  PAUSE_QUIZ,
  RESUME_QUIZ,
  GET_QUIZ_ATTEMPTS,
  GET_QUIZ_RESULTS,
  CLEAR_QUIZ,
  CLEAR_QUIZ_ATTEMPT
} from '../actions/types';

const initialState = {
  quizzes: [],
  quiz: null,
  quizAttempt: null,
  quizAttempts: [],
  quizResults: [],
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
    case GET_QUIZZES:
      return {
        ...state,
        quizzes: payload.quizzes,
        pagination: payload.pagination,
        loading: false
      };
    case GET_QUIZ:
      return {
        ...state,
        quiz: payload,
        loading: false
      };
    case ADD_QUIZ:
      return {
        ...state,
        quizzes: [payload, ...state.quizzes],
        loading: false
      };
    case UPDATE_QUIZ:
      return {
        ...state,
        quizzes: state.quizzes.map(quiz =>
          quiz._id === payload._id ? payload : quiz
        ),
        quiz: payload,
        loading: false
      };
    case DELETE_QUIZ:
      return {
        ...state,
        quizzes: state.quizzes.filter(quiz => quiz._id !== payload),
        loading: false
      };
    case TOGGLE_PUBLISH_QUIZ:
      return {
        ...state,
        quizzes: state.quizzes.map(quiz =>
          quiz._id === payload._id ? payload : quiz
        ),
        quiz: payload,
        loading: false
      };
    case TOGGLE_FEATURE_QUIZ:
      return {
        ...state,
        quizzes: state.quizzes.map(quiz =>
          quiz._id === payload._id ? payload : quiz
        ),
        quiz: payload,
        loading: false
      };
    case ADD_QUESTION:
      return {
        ...state,
        quiz: payload,
        loading: false
      };
    case UPDATE_QUESTION:
      return {
        ...state,
        quiz: payload,
        loading: false
      };
    case DELETE_QUESTION:
      return {
        ...state,
        quiz: payload,
        loading: false
      };
    case START_QUIZ_ATTEMPT:
      return {
        ...state,
        quizAttempt: payload,
        loading: false
      };
    case GET_QUIZ_ATTEMPT:
      return {
        ...state,
        quizAttempt: payload,
        loading: false
      };
    case SUBMIT_ANSWER:
      return {
        ...state,
        quizAttempt: payload,
        loading: false
      };
    case SUBMIT_QUIZ:
      return {
        ...state,
        quizAttempt: payload,
        loading: false
      };
    case PAUSE_QUIZ:
      return {
        ...state,
        quizAttempt: payload,
        loading: false
      };
    case RESUME_QUIZ:
      return {
        ...state,
        quizAttempt: payload,
        loading: false
      };
    case GET_QUIZ_ATTEMPTS:
      return {
        ...state,
        quizAttempts: payload,
        loading: false
      };
    case GET_QUIZ_RESULTS:
      return {
        ...state,
        quizResults: payload,
        loading: false
      };
    case QUIZ_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_QUIZ:
      return {
        ...state,
        quiz: null,
        loading: false
      };
    case CLEAR_QUIZ_ATTEMPT:
      return {
        ...state,
        quizAttempt: null,
        loading: false
      };
    default:
      return state;
  }
}
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
} from '../actions/types';

const initialState = {
  shares: [],
  share: null,
  loading: true,
  error: null
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_SHARES:
      return {
        ...state,
        shares: payload,
        loading: false
      };
    case GET_SHARE:
      return {
        ...state,
        share: payload,
        loading: false
      };
    case CREATE_SHARE:
      return {
        ...state,
        shares: [payload, ...state.shares],
        loading: false
      };
    case UPDATE_SHARE:
      return {
        ...state,
        shares: state.shares.map(share =>
          share._id === payload._id ? payload : share
        ),
        share: payload,
        loading: false
      };
    case DELETE_SHARE:
      return {
        ...state,
        shares: state.shares.filter(share => share._id !== payload),
        loading: false
      };
    case TOGGLE_SHARE_STATUS:
      return {
        ...state,
        shares: state.shares.map(share =>
          share._id === payload._id ? payload : share
        ),
        share: payload,
        loading: false
      };
    case ADD_COMMENT:
      return {
        ...state,
        share: payload,
        loading: false
      };
    case ADD_REPLY:
      return {
        ...state,
        share: payload,
        loading: false
      };
    case RECORD_DOWNLOAD:
      return {
        ...state,
        share: payload,
        loading: false
      };
    case SHARE_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_SHARE:
      return {
        ...state,
        share: null,
        loading: false
      };
    default:
      return state;
  }
}
import {
  GET_PROFILE,
  PROFILE_ERROR,
  UPDATE_PROFILE,
  CLEAR_PROFILE,
  ACCOUNT_DELETED,
  GET_PROFILES,
  GET_RECOMMENDED_PROFILES
} from '../actions/types';

const initialState = {
  profile: null,
  profiles: [],
  recommendedProfiles: [],
  loading: true,
  error: null
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_PROFILE:
    case UPDATE_PROFILE:
      return {
        ...state,
        profile: payload,
        loading: false
      };
    case GET_PROFILES:
      return {
        ...state,
        profiles: payload,
        loading: false
      };
    case GET_RECOMMENDED_PROFILES:
      return {
        ...state,
        recommendedProfiles: payload,
        loading: false
      };
    case PROFILE_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_PROFILE:
      return {
        ...state,
        profile: null,
        loading: false
      };
    case ACCOUNT_DELETED:
      return {
        ...state,
        profile: null,
        loading: false
      };
    default:
      return state;
  }
}
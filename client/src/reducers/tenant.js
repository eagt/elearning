import {
  GET_TENANTS,
  GET_TENANT,
  TENANT_ERROR,
  CREATE_TENANT,
  UPDATE_TENANT,
  DELETE_TENANT,
  SET_CURRENT_TENANT,
  CLEAR_CURRENT_TENANT,
  CLEAR_TENANTS
} from '../actions/types';

const initialState = {
  tenants: [],
  currentTenant: null,
  loading: true,
  error: null
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_TENANTS:
      return {
        ...state,
        tenants: payload,
        loading: false
      };
    case GET_TENANT:
    case CREATE_TENANT:
    case UPDATE_TENANT:
      return {
        ...state,
        currentTenant: payload,
        loading: false
      };
    case SET_CURRENT_TENANT:
      return {
        ...state,
        currentTenant: payload,
        loading: false
      };
    case DELETE_TENANT:
      return {
        ...state,
        tenants: state.tenants.filter(tenant => tenant._id !== payload),
        loading: false
      };
    case TENANT_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    case CLEAR_CURRENT_TENANT:
      return {
        ...state,
        currentTenant: null
      };
    case CLEAR_TENANTS:
      return {
        ...state,
        tenants: [],
        currentTenant: null,
        loading: false
      };
    default:
      return state;
  }
}
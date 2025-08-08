import auth from '../auth';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  ACCOUNT_DELETED,
  CLEAR_PROFILE
} from '../../actions/types';

describe('Auth Reducer', () => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null
  };

  it('should return the initial state', () => {
    expect(auth(undefined, {})).toEqual(initialState);
  });

  it('should handle REGISTER_SUCCESS', () => {
    const action = {
      type: REGISTER_SUCCESS,
      payload: { token: 'test-token' }
    };
    const expectedState = {
      ...initialState,
      token: 'test-token',
      isAuthenticated: true,
      loading: false
    };
    expect(auth(initialState, action)).toEqual(expectedState);
  });

  it('should handle REGISTER_FAIL', () => {
    const action = {
      type: REGISTER_FAIL
    };
    const expectedState = {
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null
    };
    expect(auth(initialState, action)).toEqual(expectedState);
  });

  it('should handle USER_LOADED', () => {
    const action = {
      type: USER_LOADED,
      payload: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'creator'
      }
    };
    const expectedState = {
      ...initialState,
      isAuthenticated: true,
      loading: false,
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'creator'
      }
    };
    expect(auth(initialState, action)).toEqual(expectedState);
  });

  it('should handle AUTH_ERROR', () => {
    const action = {
      type: AUTH_ERROR
    };
    const expectedState = {
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null
    };
    expect(auth(initialState, action)).toEqual(expectedState);
  });

  it('should handle LOGIN_SUCCESS', () => {
    const action = {
      type: LOGIN_SUCCESS,
      payload: { token: 'test-token' }
    };
    const expectedState = {
      ...initialState,
      token: 'test-token',
      isAuthenticated: true,
      loading: false
    };
    expect(auth(initialState, action)).toEqual(expectedState);
  });

  it('should handle LOGIN_FAIL', () => {
    const action = {
      type: LOGIN_FAIL
    };
    const expectedState = {
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null
    };
    expect(auth(initialState, action)).toEqual(expectedState);
  });

  it('should handle LOGOUT', () => {
    const action = {
      type: LOGOUT
    };
    const expectedState = {
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null
    };
    expect(auth(initialState, action)).toEqual(expectedState);
  });

  it('should handle ACCOUNT_DELETED', () => {
    const action = {
      type: ACCOUNT_DELETED
    };
    const expectedState = {
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null
    };
    expect(auth(initialState, action)).toEqual(expectedState);
  });

  it('should handle CLEAR_PROFILE', () => {
    const action = {
      type: CLEAR_PROFILE
    };
    const expectedState = {
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null
    };
    expect(auth(initialState, action)).toEqual(expectedState);
  });
});
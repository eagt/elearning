import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_PROFILE
} from '../types';
import {
  loadUser,
  register,
  login,
  logout,
  clearErrors
} from '../auth';

// Create a mock store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock axios
const mock = new MockAdapter(axios);

describe('Auth Actions', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null
      }
    });
    mock.reset();
    localStorage.clear();
  });

  describe('loadUser', () => {
    it('should dispatch USER_LOADED when user is loaded successfully', async () => {
      const userData = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'creator'
      };

      mock.onGet('/api/auth').reply(200, userData);

      const expectedActions = [
        { type: USER_LOADED, payload: userData }
      ];

      await store.dispatch(loadUser());
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
    });

    it('should dispatch AUTH_ERROR when loading user fails', async () => {
      mock.onGet('/api/auth').reply(401, { msg: 'Unauthorized' });

      const expectedActions = [
        { type: AUTH_ERROR }
      ];

      await store.dispatch(loadUser());
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
    });
  });

  describe('register', () => {
    it('should dispatch REGISTER_SUCCESS when registration is successful', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator'
      };

      const response = {
        token: 'test-token',
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'creator'
        }
      };

      mock.onPost('/api/users/register').reply(200, response);

      const expectedActions = [
        { type: REGISTER_SUCCESS, payload: response }
      ];

      await store.dispatch(register(userData));
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
      expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('should dispatch REGISTER_FAIL when registration fails', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'creator'
      };

      const errors = {
        msg: 'User already exists'
      };

      mock.onPost('/api/users/register').reply(400, errors);

      const expectedActions = [
        { type: REGISTER_FAIL, payload: errors }
      ];

      await store.dispatch(register(userData));
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('login', () => {
    it('should dispatch LOGIN_SUCCESS when login is successful', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = {
        token: 'test-token',
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'creator'
        }
      };

      mock.onPost('/api/auth').reply(200, response);

      const expectedActions = [
        { type: LOGIN_SUCCESS, payload: response }
      ];

      await store.dispatch(login(loginData));
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
      expect(localStorage.getItem('token')).toBe('test-token');
    });

    it('should dispatch LOGIN_FAIL when login fails', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const errors = {
        msg: 'Invalid credentials'
      };

      mock.onPost('/api/auth').reply(400, errors);

      const expectedActions = [
        { type: LOGIN_FAIL, payload: errors }
      ];

      await store.dispatch(login(loginData));
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('should dispatch LOGOUT and CLEAR_PROFILE when logout is called', () => {
      const expectedActions = [
        { type: LOGOUT },
        { type: CLEAR_PROFILE }
      ];

      store.dispatch(logout());
      const actions = store.getActions();
      expect(actions).toEqual(expectedActions);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('clearErrors', () => {
    it('should return an action with type CLEAR_ERRORS', () => {
      const expectedAction = {
        type: 'CLEAR_ERRORS'
      };

      expect(clearErrors()).toEqual(expectedAction);
    });
  });
});
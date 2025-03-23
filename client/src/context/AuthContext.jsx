import React, { createContext, useReducer, useEffect, useContext } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Create context
export const AuthContext = createContext(initialState);

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
    case 'REGISTER_FAIL':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user
  const loadUser = async () => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);

      try {
        const res = await axios.get('/api/auth/me');
        dispatch({
          type: 'USER_LOADED',
          payload: {
            user: res.data.data,
            token: localStorage.token,
          },
        });
      } catch (err) {
        dispatch({
          type: 'AUTH_ERROR',
          payload: err.response?.data?.message || 'Authentication failed',
        });
      }
    } else {
      dispatch({
        type: 'AUTH_ERROR',
        payload: null,
      });
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { 
        name, 
        email, 
        password 
      });
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: {
          user: res.data.data,
          token: res.data.token,
        },
      });
      
      setAuthToken(res.data.token);
    } catch (err) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.message || 'Registration failed',
      });
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: res.data.data,
          token: res.data.token,
        },
      });
      
      setAuthToken(res.data.token);
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.message || 'Login failed',
      });
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: 'LOGOUT', payload: null });
  };

  // Clear error state
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        register,
        login,
        logout,
        clearError,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the `useAuth` hook
export const useAuth = () => {
  return useContext(AuthContext);
};
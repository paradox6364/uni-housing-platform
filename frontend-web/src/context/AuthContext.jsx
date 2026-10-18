"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('unihousing_token');
      const savedUser = localStorage.getItem('unihousing_user');

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('unihousing_user');
        }
      }

      if (token) {
        try {
          const freshUser = await fetchCurrentUser();
          setUser(freshUser);
          localStorage.setItem('unihousing_user', JSON.stringify(freshUser));
        } catch (err) {
          localStorage.removeItem('unihousing_token');
          localStorage.removeItem('unihousing_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    localStorage.setItem('unihousing_token', data.token);
    localStorage.setItem('unihousing_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const data = await registerUser(formData);
    localStorage.setItem('unihousing_token', data.token);
    localStorage.setItem('unihousing_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('unihousing_token');
    localStorage.removeItem('unihousing_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isStudent: user?.role === 'STUDENT',
        isLandlord: user?.role === 'LANDLORD',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
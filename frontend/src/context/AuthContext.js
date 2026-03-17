// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user exists in registered users
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const existingUser = users.find(u => u.email === email && u.password === password);
        
        if (existingUser) {
          // Login successful
          const userData = {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            createdAt: existingUser.createdAt
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          resolve({ success: true });
        } else {
          // Login failed
          reject({ success: false, message: 'Invalid email or password' });
        }
      }, 1000);
    });
  };

  // Register function - only registers, doesn't auto-login
  const register = async (name, email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
          reject({ success: false, message: 'User already exists' });
          return;
        }

        // Create new user
        const newUser = {
          id: Date.now().toString(),
          name: name,
          email: email,
          password: password, // In real app, hash this
          createdAt: new Date().toISOString()
        };

        // Save to registered users
        users.push(newUser);
        localStorage.setItem('registered_users', JSON.stringify(users));

        // Initialize empty expenses for this user
        const allExpenses = JSON.parse(localStorage.getItem('all_expenses') || '{}');
        allExpenses[newUser.id] = [];
        localStorage.setItem('all_expenses', JSON.stringify(allExpenses));

        // Initialize monthly limit for this user
        const allLimits = JSON.parse(localStorage.getItem('all_limits') || '{}');
        allLimits[newUser.id] = 15000; // Default limit
        localStorage.setItem('all_limits', JSON.stringify(allLimits));

        // Return success without logging in
        resolve({ success: true, message: 'Registration successful! Please login.' });
      }, 1000);
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update monthly limit
  const updateMonthlyLimit = (limit) => {
    if (user) {
      const allLimits = JSON.parse(localStorage.getItem('all_limits') || '{}');
      allLimits[user.id] = limit;
      localStorage.setItem('all_limits', JSON.stringify(allLimits));
      
      const updatedUser = { ...user, monthlyLimit: limit };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateMonthlyLimit
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
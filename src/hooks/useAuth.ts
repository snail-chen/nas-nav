import { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

const AUTH_STORAGE_KEY = 'nas-nav-auth';
const USERS_STORAGE_KEY = 'nas-nav-users';

const DEFAULT_ADMIN: User = {
  username: 'admin',
  password: 'admin', // Default password
  role: 'admin',
  createdAt: Date.now(),
};

export const useAuth = () => {
  // User Storage
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [DEFAULT_ADMIN];
  });

  // Session State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Sync session to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (username: string, password: string, role: UserRole) => {
    if (users.some(u => u.username === username)) {
      return false; // User exists
    }
    const newUser: User = {
      username,
      password,
      role,
      createdAt: Date.now(),
    };
    setUsers(prev => [...prev, newUser]);
    return true;
  };

  const changePassword = (password: string) => {
    if (!currentUser) return false;
    
    const updatedUser = { ...currentUser, password };
    setCurrentUser(updatedUser);
    
    setUsers(prev => prev.map(u => 
      u.username === currentUser.username ? updatedUser : u
    ));
    return true;
  };

  const resetUserPassword = (username: string, newPassword: string) => {
      setUsers(prev => prev.map(u => 
          u.username === username ? { ...u, password: newPassword } : u
      ));
  };

  const deleteUser = (username: string) => {
      if (username === 'admin') return false; // Cannot delete main admin
      setUsers(prev => prev.filter(u => u.username !== username));
      return true;
  };

  return {
    currentUser,
    users,
    login,
    logout,
    addUser,
    changePassword,
    resetUserPassword,
    deleteUser
  };
};

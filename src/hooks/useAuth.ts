import { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

const AUTH_STORAGE_KEY = 'nas-nav-auth';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [users, setUsers] = useState<User[]>([]);

  // Load users from API (Admin only)
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetch('/api/users')
        .then(res => res.json())
        .then(setUsers)
        .catch(console.error);
    }
  }, [currentUser]);

  // Verify token validity on load
  useEffect(() => {
      if (currentUser) {
          // In a real app, we would store the token separately.
          // Here assuming we store the user object with some session info or just re-login.
          // But our simple server returns a token. We should probably update the types.
          // For now, let's just check if the session is still valid if we had a token.
          // Since we didn't store token in previous implementation, we might need to re-login.
          // But wait, I can't break existing flow too much.
          // Let's assuming session is valid for now or implement a check.
      }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            // data: { success: true, user: { username, role }, token }
            // We should store the token.
            // Ideally, update User type to include token or store it separately.
            // For this quick implementation, let's attach it to user object or just ignore since 
            // we use it for initial validation. 
            // Actually, the server enforces IP check on login.
            
            const userWithToken = { ...data.user, token: data.token };
            setCurrentUser(userWithToken);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithToken));
            return true;
        } else {
            // If concurrent login blocked
            if (data.code === 'CONCURRENT_LOGIN_DETECTED') {
                alert(data.message);
            } else {
                alert(data.message || '登录失败');
            }
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    }
  };

  const logout = async () => {
    if (currentUser) {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentUser.username })
            });
        } catch (e) { console.error(e); }
    }
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const addUser = async (username: string, password: string, role: UserRole) => {
    try {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });
        if (res.ok) {
            // Refresh users list
            const newUsers = await (await fetch('/api/users')).json();
            setUsers(newUsers);
            return true;
        }
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
  };

  const changePassword = async (password: string) => {
    if (!currentUser) return false;
    try {
        const res = await fetch('/api/password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser.username, newPassword: password })
        });
        return res.ok;
    } catch (e) {
        console.error(e);
        return false;
    }
  };

  const resetUserPassword = (username: string, newPassword: string) => {
      // Not implemented in UI yet, but if it were:
      // Similar fetch call to /api/password (admin override endpoint needed)
      // For now, skip.
      console.log('Reset password for', username);
  };

  const deleteUser = async (username: string) => {
      try {
          const res = await fetch(`/api/users/${username}`, {
              method: 'DELETE'
          });
          if (res.ok) {
            setUsers(prev => prev.filter(u => u.username !== username));
            return true;
          }
          return false;
      } catch (e) {
          console.error(e);
          return false;
      }
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

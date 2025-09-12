'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import NotesApp from '@/components/NotesApp';

interface User {
  id: string;
  email: string;
  role: string;
  tenant?: {
    id: string;
    slug: string;
    name: string;
    plan: string;
  };
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Loaded user from localStorage:', parsedUser);
        setToken(savedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (loginData: { token: string; user: User }) => {
    setToken(loginData.token);
    setUser(loginData.user);
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('user', JSON.stringify(loginData.user));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!user ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
              Multi-Tenant Notes App
            </h1>
            <LoginForm onLogin={handleLogin} />
          </div>
        </div>
      ) : (
        user && user.tenant ? (
          <NotesApp user={user} token={token!} onLogout={handleLogout} />
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-red-600 mb-4">Session data is incomplete. Please login again.</p>
              <button 
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Login Again
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

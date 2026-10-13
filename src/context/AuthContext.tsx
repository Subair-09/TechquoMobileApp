import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { CURRENT_USER } from '../data/mockData';
import { StorageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<User['preferences']>) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(CURRENT_USER);

  useEffect(() => {
    (async () => {
      const savedUser = await StorageService.getUserProfile();
      if (savedUser) {
        setUser(savedUser);
      } else {
        // default to mock user if no explicit logout
        setUser(CURRENT_USER);
        await StorageService.saveUserProfile(CURRENT_USER);
      }
    })();
  }, []);

  const signIn = async (email: string, _pass: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    const loggedInUser: User = {
      ...CURRENT_USER,
      email,
      name: email.split('@')[0],
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
    };
    setUser(loggedInUser);
    await StorageService.saveUserProfile(loggedInUser);
    return { success: true };
  };

  const signUp = async (name: string, email: string, _pass: string) => {
    if (!name.trim()) return { success: false, error: 'Name is required' };
    if (!email || !email.includes('@')) return { success: false, error: 'Invalid email' };

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      username: name.toLowerCase().replace(/\s+/g, '_'),
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      isPremium: false,
      preferences: {
        notificationsEnabled: true,
        fontSize: 'md',
        offlineReading: true,
        hapticsEnabled: true,
      },
    };
    setUser(newUser);
    await StorageService.saveUserProfile(newUser);
    return { success: true };
  };

  const signOut = async () => {
    setUser(null);
    await StorageService.saveUserProfile(null);
  };

  const updateUserPreferences = async (prefs: Partial<User['preferences']>) => {
    if (!user) return;
    const updated: User = {
      ...user,
      preferences: {
        ...user.preferences,
        ...prefs,
      },
    };
    setUser(updated);
    await StorageService.saveUserProfile(updated);
  };

  const upgradeToPremium = async () => {
    if (!user) return;
    const updated: User = { ...user, isPremium: true };
    setUser(updated);
    await StorageService.saveUserProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        updateUserPreferences,
        upgradeToPremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

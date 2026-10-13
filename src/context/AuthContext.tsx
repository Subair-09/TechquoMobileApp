import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<User['preferences']>) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const [savedUser, savedToken] = await Promise.all([
          StorageService.getUserProfile(),
          StorageService.getAuthToken(),
        ]);

        if (isMounted) {
          if (savedUser && savedToken) {
            setUser(savedUser);
            // Verify and refresh session with live backend in background
            apiService.verifyReaderSession(savedToken).then((verified) => {
              if (verified && isMounted) {
                setUser(verified);
                StorageService.saveUserProfile(verified);
              }
            }).catch(() => {
              // Ignore background verification network errors
            });
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Failed to restore auth session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!pass || pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const res = await apiService.loginReader({ email: cleanEmail, password: pass });
      await Promise.all([
        StorageService.saveAuthToken(res.token),
        StorageService.saveUserProfile(res.user),
      ]);
      setUser(res.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  const signUp = async (name: string, email: string, pass: string) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!pass || pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const res = await apiService.registerReader({
        name: cleanName,
        email: cleanEmail,
        password: pass,
      });

      await Promise.all([
        StorageService.saveAuthToken(res.token),
        StorageService.saveUserProfile(res.user),
      ]);
      setUser(res.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      await StorageService.clearAuthSession();
    } catch (err) {
      console.warn('Error clearing auth session:', err);
    } finally {
      setUser(null);
    }
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
        isLoading,
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

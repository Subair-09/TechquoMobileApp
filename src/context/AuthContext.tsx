import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; requiresOtp?: boolean; email?: string; name?: string; error?: string }>;
  signUp: (name: string, email: string, pass: string) => Promise<{ success: boolean; requiresOtp?: boolean; email?: string; name?: string; error?: string }>;
  signInWithGoogle: (payload: {
    email: string;
    name: string;
    avatar?: string;
    googleId?: string;
    idToken?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  sendVerificationCode: (email: string, name?: string, type?: 'signup' | 'login') => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyEmailCode: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUserPreferences: (prefs: Partial<User['preferences']>) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  updateAvatar: (avatarData: string) => Promise<{ success: boolean; avatar?: string; error?: string }>;
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
          if (savedUser && savedToken && savedUser.isEmailVerified) {
            setUser(savedUser);
            // Verify and refresh session with live backend in background
            apiService.verifyReaderSession(savedToken).then((verified) => {
              if (verified && isMounted) {
                if (verified.isEmailVerified) {
                  setUser(verified);
                  StorageService.saveUserProfile(verified);
                } else {
                  setUser(null);
                  StorageService.clearAuthSession();
                }
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
      if (res.requiresOtp) {
        return {
          success: true,
          requiresOtp: true,
          email: res.email,
          name: res.name,
        };
      }

      await Promise.all([
        StorageService.saveAuthToken(res.token),
        StorageService.saveUserProfile(res.user),
      ]);
      setUser(res.user);
      return { success: true, requiresOtp: false };
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
      await apiService.registerReader({
        name: cleanName,
        email: cleanEmail,
        password: pass,
      });

      return {
        success: true,
        requiresOtp: true,
        email: cleanEmail,
        name: cleanName,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed. Please try again.' };
    }
  };

  const signInWithGoogle = async (payload: {
    email: string;
    name: string;
    avatar?: string;
    googleId?: string;
    idToken?: string;
  }) => {
    try {
      const res = await apiService.loginWithGoogle(payload);
      await Promise.all([
        StorageService.saveAuthToken(res.token),
        StorageService.saveUserProfile(res.user),
      ]);
      setUser(res.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google sign-in failed. Please try again.' };
    }
  };

  const sendVerificationCode = async (
    email: string,
    name?: string,
    type: 'signup' | 'login' = 'signup'
  ) => {
    try {
      const res = await apiService.sendVerificationCode(email, name, type);
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send verification code.' };
    }
  };

  const verifyEmailCode = async (email: string, code: string) => {
    try {
      const res = await apiService.verifyEmailCode(email, code);
      await Promise.all([
        StorageService.saveAuthToken(res.token),
        StorageService.saveUserProfile(res.user),
      ]);
      setUser(res.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid or expired verification code.' };
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

  const updateAvatar = async (avatarData: string) => {
    try {
      const token = await StorageService.getAuthToken();
      if (!token) return { success: false, error: 'Not authenticated' };

      const res = await apiService.uploadReaderAvatar(token, avatarData);
      setUser(res.user);
      await StorageService.saveUserProfile(res.user);
      return { success: true, avatar: res.avatar };
    } catch (err: any) {
      console.error('Failed to update avatar:', err);
      return { success: false, error: err.message || 'Failed to upload photo' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.isEmailVerified !== false,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        sendVerificationCode,
        verifyEmailCode,
        signOut,
        updateUserPreferences,
        upgradeToPremium,
        updateAvatar,
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

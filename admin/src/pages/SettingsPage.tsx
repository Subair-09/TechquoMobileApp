import React, { useState, useEffect } from 'react';
import {
  Settings,
  Lock,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Cloud,
  Smartphone,
} from 'lucide-react';
import { settingsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  // General Settings
  const [siteName, setSiteName] = useState('TechQuo News');
  const [tagline, setTagline] = useState(
    "Africa's Premier Technology, Innovation and Business Publication"
  );
  const [editorialEmail, setEditorialEmail] = useState('editorial@techquo.news');
  const [defaultSeoDescription, setDefaultSeoDescription] = useState(
    'Comprehensive reporting on African tech ecosystem, venture capital, fintech, AI and startup innovation.'
  );

  // Password Settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsApi.getSettings();
        if (res.success && res.data) {
          if (res.data.siteName) setSiteName(res.data.siteName);
          if (res.data.tagline) setTagline(res.data.tagline);
          if (res.data.editorialEmail) setEditorialEmail(res.data.editorialEmail);
          if (res.data.defaultSeoDescription)
            setDefaultSeoDescription(res.data.defaultSeoDescription);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    setGeneralSuccess(null);

    try {
      await settingsApi.updateSettings({
        siteName,
        tagline,
        editorialEmail,
        defaultSeoDescription,
      });
      setGeneralSuccess('Publication settings saved successfully.');
      setTimeout(() => setGeneralSuccess(null), 3500);
    } catch (err: any) {
      console.error('Save failed:', err);
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      await settingsApi.changePassword({
        currentPassword,
        newPassword,
      });
      setPassSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 3500);
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl">
      {/* Top Header */}
      <div className="pb-2 border-b border-neutral-200/80">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
          Configure TechQuo publication metadata, security, and integration keys
        </p>
      </div>

      {/* General Editorial Settings Card */}
      <div className="bg-white rounded-xl border border-neutral-200/90 p-6 shadow-2xs">
        <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 mb-5">
          <Globe className="w-5 h-5 text-neutral-800" />
          <h2 className="text-base font-semibold text-neutral-900">
            Editorial Brand Configuration
          </h2>
        </div>

        {generalSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center space-x-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{generalSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSaveGeneral} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Publication Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Editorial Contact Email
              </label>
              <input
                type="email"
                value={editorialEmail}
                onChange={(e) => setEditorialEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Brand Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Default SEO Meta Description
            </label>
            <textarea
              value={defaultSeoDescription}
              onChange={(e) => setDefaultSeoDescription(e.target.value)}
              rows={3}
              className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSavingGeneral}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingGeneral ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security: Change Password Card */}
      <div className="bg-white rounded-xl border border-neutral-200/90 p-6 shadow-2xs">
        <div className="flex items-center space-x-2 pb-4 border-b border-neutral-100 mb-5">
          <Lock className="w-5 h-5 text-neutral-800" />
          <h2 className="text-base font-semibold text-neutral-900">
            Account Security & Credentials
          </h2>
        </div>

        {passSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center space-x-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center space-x-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isChangingPass}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{isChangingPass ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Integration Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              Cloudinary Media CDN
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Active buffer streaming with responsive thumbnail transforms
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
              Mobile App Endpoint
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Direct REST synchronization with React Native & Expo clients
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  BarChart2,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { authApi } from '../services/api.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your admin email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(email.trim(), password, rememberMe);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Invalid credentials. Please verify your email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const res = await authApi.forgotPassword(forgotEmail);
      setForgotSuccess(res.message);
      setTimeout(() => {
        setIsForgotOpen(false);
        setForgotSuccess(null);
      }, 3000);
    } catch {
      setForgotSuccess('If this account exists, password instructions have been sent.');
    }
  };

  const prefillDefaultAdmin = () => {
    setEmail('admin@techquo.news');
    setPassword('AdminPass123!');
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7] flex flex-col lg:flex-row">
      {/* Left Section: Brand Showcase */}
      <div className="lg:w-1/2 bg-[#050505] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-neutral-900/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Top: TechQuo Logo */}
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-3xl font-bold tracking-tight text-white">
              TechQuo
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block"></span>
          </div>
          <span className="text-[11px] uppercase font-bold tracking-[0.25em] text-neutral-400 block mt-1">
            ADMIN PORTAL
          </span>
        </div>

        {/* Center: Editorial Manifesto & Highlights */}
        <div className="my-12 lg:my-0 relative z-10 max-w-lg">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
            The power to inform Africa's tech future.
          </h1>
          <p className="mt-4 text-neutral-400 text-sm sm:text-base leading-relaxed">
            Manage articles, track performance, and keep the conversation going across Africa's leading tech publication.
          </p>

          {/* Three Feature Highlights */}
          <div className="mt-10 space-y-5">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-white">
                <FileText className="w-5 h-5 text-neutral-300" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Create & Publish</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Share important stories with the world.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-white">
                <BarChart2 className="w-5 h-5 text-neutral-300" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Track Performance</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  See what your audience loves.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0 text-white">
                <ShieldCheck className="w-5 h-5 text-neutral-300" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Manage Content</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Keep your platform organized and secure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 text-xs text-neutral-500">
          © {new Date().getFullYear()} TechQuo News. Editorial Administration.
        </div>
      </div>

      {/* Right Section: Centered Login Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Sign in to your admin account.
            </p>
          </div>

          {/* Quick Credential Helper Pill */}
          <div className="mb-6 p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-neutral-600">Default Super Admin credentials:</span>
            <button
              type="button"
              onClick={prefillDefaultAdmin}
              className="text-neutral-900 font-semibold underline hover:text-blue-600 transition-colors"
            >
              Fill Credentials
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@techquo.news"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-neutral-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-neutral-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0 w-4 h-4"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#050505] hover:bg-neutral-800 text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-sm disabled:opacity-60"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure access notice matching screenshot */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-center space-x-1.5 text-neutral-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span>Secure admin access</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-neutral-200 shadow-2xl">
            <h3 className="text-lg font-bold font-sans text-neutral-900 mb-1">
              Reset Admin Password
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Enter your registered administrator email to receive reset instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@techquo.news"
                  required
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-neutral-900"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

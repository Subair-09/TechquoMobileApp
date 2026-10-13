import React from 'react';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200/80 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Left: Hamburger for mobile + Search */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search articles, authors, categories..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  navigate(`/articles?search=${encodeURIComponent(target.value.trim())}`);
                }
              }
            }}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-neutral-100/70 border border-transparent rounded-lg focus:bg-white focus:border-neutral-300 focus:outline-none transition-all placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Right: Actions & User pill */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Quick New Article Button */}
        <Link
          to="/articles/new"
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#050505] hover:bg-neutral-800 text-white text-xs sm:text-sm font-medium transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center">
            {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-neutral-900 leading-tight">
              {user?.name || 'Administrator'}
            </div>
            <div className="text-[10px] text-neutral-500 capitalize">
              {user?.role?.replace('_', ' ') || 'admin'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

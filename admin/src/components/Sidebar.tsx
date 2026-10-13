import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Users,
  Image,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Articles', path: '/articles', icon: FileText },
    { label: 'Categories', path: '/categories', icon: FolderTree },
    { label: 'Authors', path: '/authors', icon: Users },
    { label: 'Media Library', path: '/media', icon: Image },
    { label: 'Comments', path: '/comments', icon: MessageSquare },
    ...(hasRole(['super_admin'])
      ? [{ label: 'Users & Roles', path: '/users', icon: ShieldCheck }]
      : []),
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#050505] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-neutral-800 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-neutral-800/80">
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                TechQuo
              </span>
              <span className="h-2 w-2 rounded-full bg-blue-600 inline-block"></span>
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-widest text-neutral-400">
              Admin Portal
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-800 text-white font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-white' : 'text-neutral-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="pt-4 mt-4 border-t border-neutral-800/80">
            <a
              href="http://localhost:8081"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
            >
              <div className="flex items-center space-x-3">
                <ExternalLink className="w-4 h-4 text-neutral-400" />
                <span>View Mobile App</span>
              </div>
            </a>
          </div>
        </nav>

        {/* Admin User Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-xs uppercase flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user?.name?.slice(0, 2) || 'TQ'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-mono text-neutral-400 truncate uppercase">
                    {user?.role?.replace('_', ' ') || 'admin'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

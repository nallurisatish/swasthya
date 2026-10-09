import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Globe,
  Sparkles,
  RotateCcw,
  LogOut,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, loadDemoSession } = useAuth();
  const navigate = useNavigate();

  const handleLoadDemo = async () => {
    try {
      await loadDemoSession();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error loading demo', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemoData();
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Error resetting demo', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Swasthya Copilot</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                ABDM Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Your Health Records. Clearly Connected.</p>
          </div>
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Multilingual Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <Globe className="w-4 h-4 text-slate-500 ml-1.5 mr-1" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
              language === 'en'
                ? 'bg-white text-teal-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('te')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
              language === 'te'
                ? 'bg-white text-teal-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            తెలుగు
          </button>
        </div>

        {/* 1-Click Demo Actions */}
        {user ? (
          <div className="flex items-center gap-2">
            {user.is_demo_user ? (
              <button
                onClick={handleResetDemo}
                title="Reset demo data"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Demo</span>
              </button>
            ) : null}

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2 pl-1">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  {user.full_name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-800 leading-none">{user.full_name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{user.profile?.abha_id || 'Mock ABHA'}</div>
                </div>
              </Link>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-lg shadow-sm shadow-teal-700/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 1-Click Demo</span>
            </button>
            <Link
              to="/login"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

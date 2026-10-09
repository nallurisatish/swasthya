import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FolderLock,
  GitCommit,
  LineChart,
  UserCheck,
  Share2,
  Shield,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();

  const links = [
    { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/upload', label: t.nav.upload, icon: UploadCloud },
    { to: '/documents', label: t.nav.documents, icon: FolderLock },
    { to: '/timeline', label: t.nav.timeline, icon: GitCommit },
    { to: '/trends', label: t.nav.trends, icon: LineChart },
    { to: '/profile', label: t.nav.profile, icon: UserCheck },
    { to: '/fhir', label: t.nav.fhir, icon: Share2 },
    { to: '/consent', label: t.nav.consent, icon: Shield },
    { to: '/architecture', label: t.nav.architecture, icon: Layers },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 min-h-[calc(100vh-65px)]">
      <nav className="p-4 space-y-1 flex-1">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Clinical Navigation
        </div>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status Info */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Local Engine Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Evidence-grounded deterministic & multilingual processing.
          </p>
        </div>
      </div>
    </aside>
  );
};

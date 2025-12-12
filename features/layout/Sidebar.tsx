import React from 'react';
import { LayoutDashboard, Users, Activity, Settings, LogOut, ClipboardList } from 'lucide-react';
import { AppView } from '../../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.PATIENTS, label: 'Patients', icon: Users },
    { id: AppView.TASKS, label: 'Tasks & Alerts', icon: ClipboardList },
    { id: AppView.ANALYSIS, label: 'Clinical AI', icon: Activity },
    { id: AppView.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 z-50 shadow-xl">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-medical-500 p-2 rounded-xl shadow-lg shadow-medical-500/20">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">Gemini Clinic</h1>
          <p className="text-xs text-slate-400">Agent v3.0 (Pro)</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentView === item.id
                ? 'bg-medical-600 text-white shadow-md shadow-medical-900/50 translate-x-1'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'animate-pulse-slow' : ''}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white cursor-pointer rounded-xl hover:bg-slate-800 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </div>
        <div className="mt-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-xs text-slate-400">
          <p className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            System Online
          </p>
          <p className="opacity-70">Encrypted • HIPAA</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

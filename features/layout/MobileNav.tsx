import React from 'react';
import { LayoutDashboard, Users, ClipboardList, Activity, Settings } from 'lucide-react';
import { AppView } from '../../types';

interface MobileNavProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Home', icon: LayoutDashboard },
    { id: AppView.PATIENTS, label: 'Patients', icon: Users },
    { id: AppView.TASKS, label: 'Tasks', icon: ClipboardList },
    { id: AppView.ANALYSIS, label: 'Copilot', icon: Activity },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 pb-6 pt-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center px-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${
                isActive 
                  ? 'text-medical-600 bg-medical-50' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
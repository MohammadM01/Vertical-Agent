import React from 'react';
import Sidebar from './Sidebar';
import { MobileNav } from './MobileNav';
import { OfflineBanner } from './OfflineBanner';
import { AppView } from '../../types';
import { Activity, Menu, Mic } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onVoiceIntake?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, onVoiceIntake }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-medical-100 selection:text-medical-900">
      
      {/* Desktop Sidebar */}
      <Sidebar currentView={currentView} onChangeView={onChangeView} />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white p-4 z-40 flex items-center justify-between shadow-md h-16">
         <div className="flex items-center gap-2">
            <div className="bg-medical-500 p-1.5 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">Gemini Clinic</span>
         </div>
         {/* Mobile Profile / Menu placeholder */}
         <button className="p-2 text-slate-300">
            <Menu className="w-6 h-6" />
         </button>
      </div>

      <main className="flex-1 md:ml-64 transition-all duration-300 ease-in-out flex flex-col min-h-screen pb-20 md:pb-0">
        <OfflineBanner />
        <div className="p-4 md:p-8 mt-16 md:mt-0 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav currentView={currentView} onChangeView={onChangeView} />

      {/* Floating Action Button (FAB) for Voice Intake - visible on Mobile mainly */}
      <button 
        onClick={onVoiceIntake}
        className="md:hidden fixed bottom-24 right-4 bg-medical-600 text-white p-4 rounded-full shadow-lg shadow-medical-600/40 hover:bg-medical-700 active:scale-95 transition-all z-50 flex items-center justify-center"
        aria-label="Voice Intake"
      >
        <Mic className="w-6 h-6" />
      </button>
    </div>
  );
};

import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, FileText, Settings, HeartPulse, LogOut } from 'lucide-react';

export default function Layout({ children }) {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label }) => (
        <Link to={to}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive(to)
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}>
                <Icon size={20} className={isActive(to) ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>{label}</span>
            </div>
        </Link>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-20 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-50">
                    <div className="flex items-center gap-2 text-teal-700 font-bold text-xl">
                        <div className="bg-teal-600 p-2 rounded-lg text-white">
                            <HeartPulse size={24} />
                        </div>
                        Gemini Clinic
                    </div>
                    <div className="mt-1 text-xs text-slate-400 uppercase tracking-widest pl-12">
                        Workspace
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/patients" icon={Users} label="Patients" />
                    <NavItem to="/copilot" icon={Activity} label="Clinical Copilot" />
                    <NavItem to="/tasks" icon={FileText} label="Tasks & Billing" />
                </nav>

                <div className="p-4 border-t border-slate-50 space-y-1">
                    <NavItem to="/settings" icon={Settings} label="Settings" />
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 relative">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="md:hidden bg-white p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-30">
                    <HeartPulse className="text-teal-600" />
                    <span className="font-bold text-slate-800">Gemini Clinic</span>
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

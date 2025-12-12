import { Activity, Users, FileText, TrendingUp, AlertCircle, Clock, Calendar } from 'lucide-react';
import { Card, Button } from '../../components/ui/base';

export default function Dashboard() {
    const stats = [
        { label: 'Patients Waiting', value: '12', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Urgent Results', value: '3', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
        { label: 'Pending Prescriptions', value: '7', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Revenue (Est)', value: '$2.4k', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
    ];

    const tasks = [
        { id: 1, title: 'Review Lab Results - Bed 7', time: '10m ago', urgent: true },
        { id: 2, title: 'Discharge Summary - Jane Doe', time: '1h ago', urgent: false },
        { id: 3, title: 'Sign Prescriptions (5)', time: '2h ago', urgent: false },
    ];

    const appointments = [
        { id: 1, time: '09:00 AM', patient: 'Sarah Conner', reason: 'Follow-up' },
        { id: 2, time: '09:30 AM', patient: 'John Smith', reason: 'Consultation' },
        { id: 3, time: '10:00 AM', patient: 'Emily Rose', reason: 'Lab Work' },
    ];

    return (
        <div className="space-y-6">

            {/* Welcome Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Good Morning, Dr. Gemini</h1>
                    <p className="text-slate-500">Here is your daily briefing.</p>
                </div>
                <Button variant="primary" size="md">
                    <Activity size={18} />
                    <span>Start Intake</span>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Urgent Tasks */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                            <AlertCircle size={20} className="text-slate-400" />
                            Priority Tasks
                        </h3>
                        <Button variant="ghost" size="sm">View All</Button>
                    </div>

                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <Card key={task.id} className={`flex items-center justify-between p-4 group hover:border-teal-200 transition-colors ${task.urgent ? 'border-l-4 border-l-red-500' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.urgent ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                                        {task.urgent ? <AlertCircle size={16} /> : <FileText size={16} />}
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${task.urgent ? 'text-slate-800' : 'text-slate-600 group-hover:text-teal-700 transition-colors'}`}>{task.title}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock size={10} /> {task.time}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-teal-600">Action</Button>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Schedule */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-700 text-lg flex items-center gap-2">
                            <Calendar size={20} className="text-slate-400" />
                            Schedule
                        </h3>
                    </div>

                    <Card className="h-full bg-slate-50/50 border-dashed">
                        <div className="space-y-4">
                            {appointments.map(appt => (
                                <div key={appt.id} className="flex gap-4 relative">
                                    {/* Timeline Line */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-teal-400 z-10"></div>
                                        <div className="w-0.5 h-full bg-slate-200 -mt-1"></div>
                                    </div>
                                    <div className="pb-4">
                                        <p className="text-xs font-bold text-teal-600">{appt.time}</p>
                                        <p className="font-semibold text-slate-700">{appt.patient}</p>
                                        <p className="text-xs text-slate-400">{appt.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" className="w-full mt-4 text-xs">View Full Calendar</Button>
                    </Card>
                </div>

            </div>
        </div>
    );
}

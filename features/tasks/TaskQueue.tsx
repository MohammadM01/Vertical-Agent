import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AlertTriangle, FileText, DollarSign, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

const TASKS = [
    {
        id: 'T-1',
        type: 'billing',
        title: 'Claim Denial #4002',
        patient: 'Marcus Thorne',
        desc: 'Missing prior authorization for MRI. AI has drafted an appeal letter.',
        priority: 'high',
        time: '2h ago'
    },
    {
        id: 'T-2',
        type: 'lab',
        title: 'Review Critical Lab',
        patient: 'Sarah Jenkins',
        desc: 'Potassium 6.2 mmol/L. Protocol suggests repeat panel.',
        priority: 'critical',
        time: '15m ago'
    },
    {
        id: 'T-3',
        type: 'compliance',
        title: 'Missing Documentation',
        patient: 'Emily Chen',
        desc: 'Visit from 05/10 is unsigned. Please review and sign.',
        priority: 'medium',
        time: '1d ago'
    }
];

export const TaskQueue: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
             <div className="flex justify-between items-center">
                <div>
                   <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks & Alerts</h1>
                   <p className="text-slate-500 mt-1">3 pending actions require your attention.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" icon={CheckCircle2}>Mark All Read</Button>
                </div>
            </div>

            <div className="space-y-4">
                {TASKS.map(task => (
                    <Card key={task.id} noPadding className="flex flex-col md:flex-row overflow-hidden hover:ring-2 hover:ring-medical-50 transition-all">
                        <div className={`w-full md:w-2 ${
                            task.priority === 'critical' ? 'bg-red-500' : 
                            task.priority === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        
                        <div className="p-5 flex-1 flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {task.type === 'billing' && <Badge variant="warning" size="sm">Billing</Badge>}
                                    {task.type === 'lab' && <Badge variant="danger" size="sm">Clinical</Badge>}
                                    {task.type === 'compliance' && <Badge variant="info" size="sm">Admin</Badge>}
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {task.time}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-900">{task.title}</h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    <span className="font-semibold text-slate-800">{task.patient}:</span> {task.desc}
                                </p>
                            </div>
                            
                            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                <Button variant="ghost" size="sm" className="flex-1 md:flex-none justify-center">Dismiss</Button>
                                <Button variant="primary" size="sm" className="flex-1 md:flex-none justify-center">
                                    Review <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center mt-8">
                 <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">All caught up</p>
            </div>
        </div>
    );
};

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ClipboardCheck, AlertCircle, Clock, ArrowRight, Activity, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const data = [
  { name: '08:00', patients: 12 },
  { name: '10:00', patients: 18 },
  { name: '12:00', patients: 15 },
  { name: '14:00', patients: 24 },
  { name: '16:00', patients: 20 },
];

const StatBlock = ({ title, value, trend, icon: Icon, trendUp }: any) => (
  <div className="flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-slate-400'}`}>
        {trend}
      </div>
    </div>
    <div className="p-3 bg-slate-50 rounded-2xl">
      <Icon className="w-6 h-6 text-slate-400" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Good Morning, Dr. Pym</h1>
          <p className="text-slate-500 mt-2 text-lg">You have <span className="font-semibold text-slate-900">4 critical reviews</span> and <span className="font-semibold text-slate-900">12 appointments</span> today.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" icon={Calendar}>Schedule</Button>
           <Button variant="primary" icon={Activity}>Start Rounds</Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:ring-2 hover:ring-medical-50 transition-all">
           <StatBlock title="Active Patients" value="1,248" trend="+12% vs last month" icon={Users} trendUp />
        </Card>
        <Card className="hover:ring-2 hover:ring-amber-50 transition-all">
           <StatBlock title="Pending Notes" value="8" trend="3 high urgency" icon={ClipboardCheck} />
        </Card>
        <Card className="hover:ring-2 hover:ring-red-50 transition-all border-l-4 border-l-red-500">
           <StatBlock title="Critical Alerts" value="2" trend="Action required" icon={AlertCircle} />
        </Card>
        <Card>
           <StatBlock title="Avg. Wait Time" value="14m" trend="-2m improvement" icon={Clock} trendUp />
        </Card>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Patient Volume Chart */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800 text-lg">Patient Flow</h3>
                 <select className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 outline-none">
                    <option>Today</option>
                    <option>This Week</option>
                 </select>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          padding: '12px'
                      }}
                      itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="patients" 
                      stroke="#0ea5e9" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorPatients)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium mb-1">AI Assistant</p>
                            <h3 className="text-xl font-bold">Documentation Catch-up</h3>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="mt-4 text-indigo-100 text-sm leading-relaxed">
                        I've drafted SOAP notes for 3 patients from the morning rounds. Review them now?
                    </p>
                    <button className="mt-6 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors w-full">
                        Review Drafts
                    </button>
                </Card>
                
                <Card>
                   <h3 className="font-bold text-slate-800 mb-4">Department Status</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">ER Triage</span>
                          <Badge variant="warning">Busy</Badge>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-amber-400 h-2 rounded-full w-[75%]"></div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-slate-600">ICU Capacity</span>
                          <Badge variant="success">Normal</Badge>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full w-[40%]"></div>
                      </div>
                   </div>
                </Card>
            </div>
        </div>

        {/* Right: Urgent Tasks */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="font-bold text-slate-800 text-lg">Priority Feed</h3>
             <button className="text-sm text-medical-600 font-medium hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
             {/* Urgent Item */}
             <Card noPadding className="p-4 border-l-4 border-l-red-500 bg-red-50/50">
                 <div className="flex justify-between items-start mb-2">
                     <Badge variant="danger" size="sm">Critical Lab</Badge>
                     <span className="text-[10px] text-red-400 font-mono">10m ago</span>
                 </div>
                 <h4 className="font-bold text-slate-900 text-sm">Marcus Thorne</h4>
                 <p className="text-sm text-slate-600 mt-1">Potassium 6.2 mmol/L. Repeat electrolyte panel advised.</p>
                 <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white text-xs h-8">Ack</Button>
                    <Button variant="danger" size="sm" className="text-xs h-8">Order Panel</Button>
                 </div>
             </Card>

             {/* Warning Item */}
             <Card noPadding className="p-4 border-l-4 border-l-amber-500 bg-white">
                 <div className="flex justify-between items-start mb-2">
                     <Badge variant="warning" size="sm">Billing</Badge>
                     <span className="text-[10px] text-slate-400 font-mono">2h ago</span>
                 </div>
                 <h4 className="font-bold text-slate-900 text-sm">Claim #4002 Rejected</h4>
                 <p className="text-sm text-slate-600 mt-1">Missing prior authorization for MRI.</p>
                 <Button variant="ghost" size="sm" className="mt-2 text-medical-600 p-0 hover:bg-transparent">Resolve <ArrowRight size={14} /></Button>
             </Card>

             {/* Standard Item */}
             <Card noPadding className="p-4 border-l-4 border-l-blue-500 bg-white">
                 <div className="flex justify-between items-start mb-2">
                     <Badge variant="info" size="sm">Refill Request</Badge>
                     <span className="text-[10px] text-slate-400 font-mono">3h ago</span>
                 </div>
                 <h4 className="font-bold text-slate-900 text-sm">Sarah Jenkins</h4>
                 <p className="text-sm text-slate-600 mt-1">Sumatriptan 50mg. Last visit: 3 months ago.</p>
                 <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white h-8 text-xs">Deny</Button>
                    <Button variant="primary" size="sm" className="h-8 text-xs">Approve</Button>
                 </div>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

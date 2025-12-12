import { Users } from 'lucide-react';

export default function Patients() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Users size={40} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-600">Patient Directory</h2>
            <p>This module is under construction.</p>
        </div>
    );
}

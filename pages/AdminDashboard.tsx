
import React, { useState } from 'react';
import { useApp } from '../store';
import { STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import { GrievanceStatus, GrievancePriority, UserRole } from '../types';
import { 
  BarChart3, 
  Filter, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserPlus,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { grievances, updateGrievance, users } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);

  const stats = [
    { label: 'Total Active', value: grievances.length, icon: <BarChart3 className="text-indigo-400" />, color: 'bg-indigo-900/30' },
    { label: 'Pending Action', value: grievances.filter(g => g.status === GrievanceStatus.PENDING).length, icon: <AlertTriangle className="text-amber-400" />, color: 'bg-amber-900/30' },
    { label: 'In Progress', value: grievances.filter(g => g.status === GrievanceStatus.IN_PROGRESS).length, icon: <Clock className="text-blue-400" />, color: 'bg-blue-900/30' },
    { label: 'Resolved Total', value: grievances.filter(g => g.status === GrievanceStatus.RESOLVED).length, icon: <CheckCircle2 className="text-green-400" />, color: 'bg-green-900/30' },
  ];

  const chartData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 18 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 22 },
    { name: 'Fri', count: 30 },
    { name: 'Sat', count: 10 },
    { name: 'Sun', count: 8 },
  ];

  const filteredGrievances = filterStatus === 'ALL' 
    ? grievances 
    : grievances.filter(g => g.status === filterStatus);

  // Updated: Use the users from the store instead of static MOCK_USERS
  const officers = users.filter(u => u.role === UserRole.OFFICER);

  const handleAssign = (id: string, officerId: string) => {
    updateGrievance(id, { 
      assignedOfficerId: officerId, 
      status: GrievanceStatus.ASSIGNED,
      assignedAt: new Date().toISOString()
    });
    setSelectedGrievanceId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-poppins">Admin Command Center</h1>
          <p className="text-slate-400">Global overview of city-wide grievances.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#161e31] border border-slate-800 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all">
            <Filter size={18} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-700 transition-all">
            Download Report <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-[#161e31] p-6 rounded-3xl border border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color}`}>{stat.icon}</div>
              <span className="text-xs font-bold text-green-400">+5%</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white font-poppins">Grievance Trends</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', color: '#f1f5f9' }}
                />
                <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#4f46e5' : '#1e293b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-white font-poppins mb-6">By Category</h2>
          <div className="space-y-4">
            {[
              { label: 'Waste Management', count: 45, color: 'bg-amber-500' },
              { label: 'Water Supply', count: 22, color: 'bg-blue-500' },
              { label: 'Road Maintenance', count: 18, color: 'bg-indigo-500' },
              { label: 'Electricity', count: 12, color: 'bg-yellow-500' },
            ].map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-300">{cat.label}</span>
                  <span className="text-slate-500">{cat.count}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color}`} style={{ width: `${cat.count}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#161e31] rounded-[2rem] border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white font-poppins">Recent Grievances</h2>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'ASSIGNED', 'RESOLVED'].map(s => (
              <button 
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === s ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-800' : 'text-slate-500 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f172a]/50">
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID & Title</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredGrievances.map((g) => (
                <tr key={g.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-900 rounded-lg shrink-0 flex items-center justify-center">
                        <FileText size={18} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-200 text-sm">{g.id}</p>
                        <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{g.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-1 rounded">
                      {g.category}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[g.status]}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <button 
                      onClick={() => setSelectedGrievanceId(g.id)}
                      className="p-2 hover:bg-indigo-900/40 text-indigo-400 rounded-lg transition-colors"
                    >
                      <UserPlus size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedGrievanceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-[#111827] border border-slate-800 rounded-[2rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white font-poppins mb-6">Assign Officer</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {officers.length > 0 ? (
                officers.map(officer => (
                  <button
                    key={officer.id}
                    onClick={() => handleAssign(selectedGrievanceId, officer.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-800 hover:border-indigo-600 hover:bg-indigo-900/20 transition-all text-left group"
                  >
                    <img src={`https://picsum.photos/seed/${officer.id}/100/100`} className="w-12 h-12 rounded-xl grayscale group-hover:grayscale-0 transition-all" alt="" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-300 text-sm group-hover:text-indigo-400">{officer.name}</p>
                      <p className="text-xs text-slate-500">{officer.department || 'Officer'}</p>
                    </div>
                    <CheckCircle2 size={20} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No officers registered yet.</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setSelectedGrievanceId(null)}
              className="mt-6 w-full py-3 text-slate-500 font-bold hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

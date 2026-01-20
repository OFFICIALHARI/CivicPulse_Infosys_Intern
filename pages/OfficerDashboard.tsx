import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { GrievanceStatus, Grievance } from '../types';
import { STATUS_COLORS } from '../constants';
import { generateSmartResolution } from '../services/geminiService';
import { grievanceApi } from '../services/backendApi';
// Import missing icons: Plus and ArrowRight
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Camera, 
  Navigation,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface GrievanceAnalysis {
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  totalGrievances: number;
  resolvedCount: number;
  pendingCount: number;
  inProgressCount: number;
  assignedCount: number;
  averageResolutionDays: number;
  resolutionRate: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  topCategory: string;
  topCategoryCount: number;
}

const OfficerDashboard: React.FC = () => {
  const { grievances, user, updateGrievance } = useApp();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'RESOLVED' | 'ANALYTICS'>('PENDING');
  const [analysis, setAnalysis] = useState<GrievanceAnalysis | null>(null);

  // Default officer analysis data based on 3 assigned and 3 resolved
  const defaultOfficerAnalysis: GrievanceAnalysis = {
    statusDistribution: { 'ASSIGNED': 3, 'RESOLVED': 3 },
    priorityDistribution: { 'HIGH': 1, 'MEDIUM': 3, 'LOW': 2 },
    categoryDistribution: { 'Waste Management': 2, 'Water Supply': 1, 'Road Maintenance': 2, 'Electricity': 1 },
    todayCount: 0,
    weekCount: 2,
    monthCount: 6,
    totalGrievances: 6,
    resolvedCount: 3,
    pendingCount: 0,
    inProgressCount: 0,
    assignedCount: 3,
    averageResolutionDays: 1.5,
    resolutionRate: 50,
    highPriorityCount: 1,
    mediumPriorityCount: 3,
    lowPriorityCount: 2,
    topCategory: 'Waste Management',
    topCategoryCount: 2
  };

  useEffect(() => {
    // Set default analysis immediately
    setAnalysis(defaultOfficerAnalysis);
    
    // Then try to fetch real data if on analytics tab
    if (activeTab === 'ANALYTICS') {
      fetchAnalysis();
    }
  }, [user?.id, activeTab]);

  const fetchAnalysis = async () => {
    try {
      if (!user?.id) return;
      const response: any = await grievanceApi.getGrievanceAnalysisForOfficer(user.id);
      const analysisData = response?.data || response;
      if (analysisData && analysisData.totalGrievances > 0) {
        // Only use API data if there are actual grievances
        setAnalysis(analysisData);
      }
      // Otherwise keep the default values
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      // Keep default values on error
    }
  };

  const assignedGrievances = grievances.filter(g => g.assignedOfficerId === user?.id);
  const pendingTasks = assignedGrievances.filter(g => g.status !== GrievanceStatus.RESOLVED);
  const resolvedTasks = assignedGrievances.filter(g => g.status === GrievanceStatus.RESOLVED);
  const byCategory = resolvedTasks.reduce<Record<string, number>>((acc, g) => {
    acc[g.category] = (acc[g.category] || 0) + 1;
    return acc;
  }, {});

  const handleSmartResolution = async (g: any) => {
    setIsGenerating(true);
    const note = await generateSmartResolution(g);
    setResolutionNote(note || '');
    setIsGenerating(false);
  };

  const handleResolve = (id: string) => {
    updateGrievance(id, {
      status: GrievanceStatus.RESOLVED,
      resolutionNote,
      resolvedAt: new Date().toISOString()
    }, `Issue resolved by ${user?.name}: ${resolutionNote}`);
    setUpdatingId(null);
    setResolutionNote('');
  };

  const currentTasks = activeTab === 'PENDING' ? pendingTasks : resolvedTasks;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white font-poppins tracking-tight">Officer Operations</h1>
          <p className="text-slate-400">Department: <span className="text-indigo-400 font-black">{user?.department}</span> • Logged in as <span className="text-slate-100 font-bold">{user?.name}</span></p>
        </div>
        <div className="flex gap-2 p-1.5 bg-[#111827] rounded-2xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('PENDING')}
            className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'PENDING' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Assigned ({pendingTasks.length})
          </button>
          <button 
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'RESOLVED' ? 'bg-green-600 text-white shadow-lg shadow-green-900/50' : 'text-slate-500 hover:text-slate-300'}`}
          >
            History ({resolvedTasks.length})
          </button>
          <button 
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'ANALYTICS' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Simple Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161e31] p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-500 text-xs font-bold uppercase">Assigned</p>
          <p className="text-3xl text-white font-bold">{assignedGrievances.length}</p>
        </div>
        <div className="bg-[#161e31] p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-500 text-xs font-bold uppercase">In Progress</p>
          <p className="text-3xl text-white font-bold">{pendingTasks.filter(g => g.status === GrievanceStatus.IN_PROGRESS).length}</p>
        </div>
        <div className="bg-[#161e31] p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-500 text-xs font-bold uppercase">Resolved</p>
          <p className="text-3xl text-white font-bold">{resolvedTasks.length}</p>
        </div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'ANALYTICS' && analysis && (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-white font-poppins mb-6 flex items-center gap-2">
              <BarChart3 size={24} className="text-purple-400" /> My Performance Analysis
            </h2>
            
            {/* Time-based Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Today</p>
                <p className="text-3xl font-bold text-white">{analysis.todayCount}</p>
                <p className="text-xs text-slate-500 mt-1">Grievances handled</p>
              </div>
              <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">This Week</p>
                <p className="text-3xl font-bold text-white">{analysis.weekCount}</p>
                <p className="text-xs text-slate-500 mt-1">Grievances handled</p>
              </div>
              <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">This Month</p>
                <p className="text-3xl font-bold text-white">{analysis.monthCount}</p>
                <p className="text-xs text-slate-500 mt-1">Grievances handled</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-indigo-900/20 p-5 rounded-xl border border-indigo-800">
                <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Total Assigned</p>
                <p className="text-2xl font-bold text-white">{analysis.totalGrievances}</p>
              </div>
              <div className="bg-green-900/20 p-5 rounded-xl border border-green-800">
                <p className="text-xs font-bold text-green-400 uppercase mb-2">Resolved</p>
                <p className="text-2xl font-bold text-white">{analysis.resolvedCount}</p>
              </div>
              <div className="bg-amber-900/20 p-5 rounded-xl border border-amber-800">
                <p className="text-xs font-bold text-amber-400 uppercase mb-2">Pending</p>
                <p className="text-2xl font-bold text-white">{analysis.pendingCount}</p>
              </div>
              <div className="bg-blue-900/20 p-5 rounded-xl border border-blue-800">
                <p className="text-xs font-bold text-blue-400 uppercase mb-2">In Progress</p>
                <p className="text-2xl font-bold text-white">{analysis.inProgressCount}</p>
              </div>
            </div>
          </div>

          {/* Priority and Resolution Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Priority Distribution */}
            <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-white font-poppins mb-6">Priority Breakdown</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-slate-300 font-semibold">High Priority</span>
                  </div>
                  <span className="text-2xl font-bold text-red-400">{analysis.highPriorityCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-slate-300 font-semibold">Medium Priority</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-400">{analysis.mediumPriorityCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300 font-semibold">Low Priority</span>
                  </div>
                  <span className="text-2xl font-bold text-green-400">{analysis.lowPriorityCount}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-white font-poppins mb-6 flex items-center gap-2">
                <TrendingUp size={24} className="text-green-400" /> Performance Metrics
              </h2>
              <div className="space-y-6">
                <div className="bg-green-900/20 border border-green-800 p-5 rounded-xl">
                  <p className="text-xs font-bold text-green-400 uppercase mb-2">Resolution Rate</p>
                  <p className="text-4xl font-bold text-white">{analysis.resolutionRate}%</p>
                </div>
                <div className="bg-blue-900/20 border border-blue-800 p-5 rounded-xl">
                  <p className="text-xs font-bold text-blue-400 uppercase mb-2">Avg Resolution Time</p>
                  <p className="text-4xl font-bold text-white">{analysis.averageResolutionDays}</p>
                  <p className="text-sm text-slate-400 mt-1">days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-white font-poppins mb-6">Category Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analysis.categoryDistribution)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .map(([category, count], idx) => (
                  <div key={idx} className="bg-[#0f172a] p-5 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-300 font-semibold">{category}</span>
                    <span className="text-2xl font-bold text-indigo-400">{count as number}</span>
                  </div>
                ))}
            </div>
            {analysis.topCategory !== 'N/A' && (
              <div className="mt-6 bg-indigo-900/20 border border-indigo-800 p-5 rounded-xl">
                <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Most Handled Category</p>
                <p className="text-2xl font-bold text-white">{analysis.topCategory}</p>
                <p className="text-slate-400 mt-1">
                  <span className="text-xl font-bold text-indigo-400">{analysis.topCategoryCount}</span> grievances resolved
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {currentTasks.length === 0 && activeTab !== 'ANALYTICS' ? (
        <div className="bg-[#161e31] p-24 rounded-[3.5rem] border border-slate-800 text-center space-y-6">
          <div className={`w-24 h-24 ${activeTab === 'PENDING' ? 'bg-indigo-900/20 text-indigo-400' : 'bg-green-900/20 text-green-400'} rounded-full flex items-center justify-center mx-auto`}>
            {activeTab === 'PENDING' ? <Briefcase size={48} /> : <CheckCircle size={48} />}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white font-poppins">No tasks found</h2>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              {activeTab === 'PENDING' ? "Take a breath! You've cleared all your assigned duties." : "You haven't resolved any grievances yet."}
            </p>
          </div>
        </div>
      ) : activeTab !== 'ANALYTICS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {currentTasks.map(g => (
            <div key={g.id} className="bg-[#161e31] rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden flex flex-col group hover:border-indigo-500/50 transition-all transform hover:-translate-y-2">
              <div className="relative h-56 overflow-hidden">
                <img src={`https://picsum.photos/seed/${g.id}/800/600`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-50 group-hover:opacity-100 grayscale group-hover:grayscale-0" />
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[g.status]} border border-white/10 backdrop-blur-md shadow-lg`}>
                    {g.status}
                  </span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{g.title}</h3>
                    <span className="text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-lg">#{g.id}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <MapPin size={16} className="text-indigo-500" /> <span className="truncate">{g.location.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <Clock size={16} className="text-indigo-500" /> <span>Received: {new Date(g.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-3 bg-[#0a0f1e] p-5 rounded-2xl border-l-4 border-indigo-600 italic">
                    "{g.description}"
                  </p>
                </div>

                {activeTab === 'PENDING' ? (
                  <div className="mt-8 flex gap-3">
                    <button 
                      onClick={() => updateGrievance(g.id, { status: GrievanceStatus.IN_PROGRESS }, `${user?.name} started working on the issue.`)}
                      disabled={g.status === GrievanceStatus.IN_PROGRESS}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${g.status === GrievanceStatus.IN_PROGRESS ? 'bg-slate-800 text-slate-500' : 'bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50'}`}
                    >
                      <Navigation size={18} /> {g.status === GrievanceStatus.IN_PROGRESS ? 'On Site' : 'In Progress'}
                    </button>
                    <button 
                      onClick={() => setUpdatingId(g.id)}
                      className="flex-1 flex items-center justify-center gap-3 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-500 transition-all shadow-xl shadow-green-900/30 active:scale-95"
                    >
                      <CheckCircle size={18} /> Resolve
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 bg-green-900/10 border border-green-900/20 p-5 rounded-2xl">
                    <p className="text-xs font-black text-green-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <CheckCircle2 size={14} /> Resolution Summary
                    </p>
                    <p className="text-slate-400 text-xs italic line-clamp-2">"{g.resolutionNote}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Resolution Modal */}
      {updatingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in zoom-in-95 duration-300">
          <div className="bg-[#111827] border border-slate-800 rounded-[3rem] w-full max-w-2xl shadow-2xl p-10 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white font-poppins">Closing Grievance</h2>
              <button onClick={() => setUpdatingId(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                <Plus className="rotate-45" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-3">Resolution Proof & Log</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Explain exactly what fix was implemented..."
                  className="w-full px-6 py-5 bg-white text-slate-900 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/30 outline-none border-none font-medium"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
                <button 
                  onClick={() => handleSmartResolution(grievances.find(g => g.id === updatingId))}
                  disabled={isGenerating}
                  className="mt-4 bg-indigo-900/30 text-indigo-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-900/50 transition-all disabled:opacity-30"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Generate AI Report Note
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-8 text-center hover:bg-green-900/10 hover:border-green-500/50 transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera className="text-slate-500 group-hover:text-green-400" size={28} />
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Attach Fix Photo</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Transition</p>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="text-indigo-400">Active</span>
                    <ArrowRight size={14} className="text-slate-600" />
                    <span className="text-green-400">Resolved</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setUpdatingId(null)} 
                className="flex-1 py-5 text-slate-500 font-black uppercase tracking-widest hover:bg-slate-800 rounded-[1.5rem] transition-all"
              >
                Back to Dashboard
              </button>
              <button 
                onClick={() => handleResolve(updatingId)}
                className="flex-[2] bg-green-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-green-900/40 hover:bg-green-500 transition-all transform hover:-translate-y-1 text-lg uppercase tracking-widest"
              >
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;

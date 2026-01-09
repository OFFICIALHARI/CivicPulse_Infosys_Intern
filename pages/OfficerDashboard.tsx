
import React, { useState } from 'react';
import { useApp } from '../store';
import { GrievanceStatus, Grievance } from '../types';
import { STATUS_COLORS } from '../constants';
import { generateSmartResolution } from '../services/geminiService';
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
  ArrowRight
} from 'lucide-react';

const OfficerDashboard: React.FC = () => {
  const { grievances, user, updateGrievance } = useApp();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'RESOLVED'>('PENDING');

  const assignedGrievances = grievances.filter(g => g.assignedOfficerId === user?.id);
  const pendingTasks = assignedGrievances.filter(g => g.status !== GrievanceStatus.RESOLVED);
  const resolvedTasks = assignedGrievances.filter(g => g.status === GrievanceStatus.RESOLVED);

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
        </div>
      </div>

      {currentTasks.length === 0 ? (
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
      ) : (
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
      )}

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

import React, { useState, useEffect } from 'react';
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
  FileText,
  TrendingUp,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { grievanceApi } from '../services/backendApi';

interface Analytics {
  categoryDistribution: Record<string, number>;
  categoryPercentage: Record<string, number>;
  zoneAnalytics: ZoneAnalytics[];
  slaMetrics: SLAMetrics;
  heatMapData: HeatMapData[];
  totalGrievances: number;
  resolvedCount: number;
  pendingCount: number;
  averageResolutionDays: number;
  statusDistribution: Record<string, number>;
}

interface ZoneAnalytics {
  zoneName: string;
  totalGrievances: number;
  resolvedCount: number;
  pendingCount: number;
  isRedZone: boolean;
  latitude: number;
  longitude: number;
}

interface SLAMetrics {
  totalGrievances: number;
  onTimeCount: number;
  delayedCount: number;
  overdueCount: number;
  onTimePercentage: number;
  delayedPercentage: number;
  overduePercentage: number;
  averageResolutionHours: number;
}

interface HeatMapData {
  zoneId: string;
  zoneName: string;
  latitude: number;
  longitude: number;
  complaintCount: number;
  intensity: number;
  status: string;
}

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

const AdminDashboard: React.FC = () => {
  const { grievances, updateGrievance, users, giveWarning, giveAppreciation } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [grievanceAnalysis, setGrievanceAnalysis] = useState<GrievanceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'feedback'>('overview');

  // Default analytics data
  const defaultAnalytics: Analytics = {
    categoryDistribution: { 'Waste Management': 3, 'Water Supply': 2, 'Road Maintenance': 2, 'Electricity': 1, 'Street Lighting': 1 },
    categoryPercentage: { 'Waste Management': 30, 'Water Supply': 20, 'Road Maintenance': 20, 'Electricity': 10, 'Street Lighting': 10 },
    zoneAnalytics: [
      { zoneName: 'North Zone', totalGrievances: 3, resolvedCount: 2, pendingCount: 1, isRedZone: false, latitude: 12.9716, longitude: 77.5946 },
      { zoneName: 'South Zone', totalGrievances: 3, resolvedCount: 2, pendingCount: 1, isRedZone: false, latitude: 12.9116, longitude: 77.5846 },
      { zoneName: 'East Zone', totalGrievances: 2, resolvedCount: 2, pendingCount: 0, isRedZone: false, latitude: 12.9616, longitude: 77.6246 },
      { zoneName: 'West Zone', totalGrievances: 2, resolvedCount: 1, pendingCount: 1, isRedZone: false, latitude: 12.9516, longitude: 77.5546 },
    ],
    slaMetrics: {
      totalGrievances: 10,
      onTimeCount: 7,
      delayedCount: 2,
      overdueCount: 1,
      onTimePercentage: 70,
      delayedPercentage: 20,
      overduePercentage: 10,
      averageResolutionHours: 48.5
    },
    heatMapData: [],
    totalGrievances: 10,
    resolvedCount: 7,
    pendingCount: 2,
    averageResolutionDays: 2.5,
    statusDistribution: { 'PENDING': 2, 'ASSIGNED': 1, 'IN_PROGRESS': 1, 'RESOLVED': 7 }
  };

  // Default grievance analysis data
  const defaultGrievanceAnalysis: GrievanceAnalysis = {
    statusDistribution: { 'PENDING': 2, 'ASSIGNED': 1, 'IN_PROGRESS': 1, 'RESOLVED': 7 },
    priorityDistribution: { 'HIGH': 2, 'MEDIUM': 5, 'LOW': 3 },
    categoryDistribution: { 'Waste Management': 3, 'Water Supply': 2, 'Road Maintenance': 2, 'Electricity': 1, 'Street Lighting': 1 },
    todayCount: 1,
    weekCount: 3,
    monthCount: 10,
    totalGrievances: 10,
    resolvedCount: 7,
    pendingCount: 2,
    inProgressCount: 1,
    assignedCount: 1,
    averageResolutionDays: 2.5,
    resolutionRate: 70,
    highPriorityCount: 2,
    mediumPriorityCount: 5,
    lowPriorityCount: 3,
    topCategory: 'Waste Management',
    topCategoryCount: 3
  };

  useEffect(() => {
    // Set defaults immediately
    setAnalytics(defaultAnalytics);
    setGrievanceAnalysis(defaultGrievanceAnalysis);
    
    // Then try to fetch real data
    fetchAnalytics();
    fetchGrievanceAnalysis();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response: any = await grievanceApi.getCompleteAnalytics();
      const analyticsData = response?.data || response;
      if (analyticsData && analyticsData.totalGrievances > 0) {
        // Only use API data if there are actual grievances
        setAnalytics(analyticsData);
      }
      // Otherwise keep the default values
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const fetchGrievanceAnalysis = async () => {
    try {
      const response: any = await grievanceApi.getGrievanceAnalysis();
      const analysisData = response?.data || response;
      if (analysisData && analysisData.totalGrievances > 0) {
        // Only use API data if there are actual grievances
        setGrievanceAnalysis(analysisData);
      }
      // Otherwise keep the default values
    } catch (error) {
      console.error('Failed to fetch grievance analysis:', error);
      // Keep default values on error
    }
  };

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

  const officers = users.filter(u => u.role === UserRole.OFFICER);

  const computeOfficerStats = (officerId: string) => {
    const assigned = grievances.filter(g => g.assignedOfficerId === officerId);
    const resolved = assigned.filter(g => g.status === GrievanceStatus.RESOLVED);
    let totalRating = 0;
    let count = 0;
    resolved.forEach(g => {
      (g.feedbacks || []).forEach(f => { totalRating += f.rating; count += 1; });
    });
    const avg = count ? +(totalRating / count).toFixed(2) : 0;
    return { assigned: assigned.length, resolved: resolved.length, avgRating: avg, feedbackCount: count };
  };

  const handleAssign = (id: string, officerId: string) => {
    updateGrievance(id, { 
      assignedOfficerId: officerId, 
      status: GrievanceStatus.ASSIGNED,
      assignedAt: new Date().toISOString()
    });
    setSelectedGrievanceId(null);
  };

  // Prepare category chart data
  const categoryChartData = analytics ? Object.entries(analytics.categoryDistribution).map(([name, value]) => ({
    name,
    value,
    percentage: analytics.categoryPercentage[name] || 0
  })) : [];

  // Prepare SLA chart data
  const slaChartData = analytics?.slaMetrics ? [
    { name: 'On Time', value: analytics.slaMetrics.onTimeCount, fill: '#10b981' },
    { name: 'Delayed', value: analytics.slaMetrics.delayedCount, fill: '#f59e0b' },
    { name: 'Overdue', value: analytics.slaMetrics.overdueCount, fill: '#ef4444' }
  ] : [];

  // Prepare status chart data
  const statusChartData = analytics ? Object.entries(analytics.statusDistribution).map(([name, value]) => ({
    name,
    value
  })) : [];

  const COLORS = ['#4f46e5', '#0ea5e9', '#06b6d4', '#14b8a6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-poppins">Admin Command Center</h1>
          <p className="text-slate-400">Global overview of city-wide grievances with advanced analytics.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2 bg-[#161e31] rounded-xl p-1 border border-slate-800">
            {(['overview', 'analytics', 'feedback'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
                  activeTab === tab 
                    ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-800' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-700 transition-all">
            <ArrowUpRight size={18} /> Report
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Officer Performance */}
          <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white font-poppins">Officer Performance & Feedback</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#0f172a]/50">
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Officer</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Assigned</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Resolved</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Avg Rating</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Feedbacks</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {officers.map(o => {
                    const stats = computeOfficerStats(o.id);
                    return (
                      <tr key={o.id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-3 text-slate-300 font-semibold">{o.name}</td>
                        <td className="px-6 py-3 text-slate-400 text-sm">{o.department || '-'}</td>
                        <td className="px-6 py-3 text-slate-200">{stats.assigned}</td>
                        <td className="px-6 py-3 text-slate-200">{stats.resolved}</td>
                        <td className="px-6 py-3">
                          <span className={`text-sm font-bold ${stats.avgRating >= 4 ? 'text-green-400' : stats.avgRating >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                            ⭐ {stats.avgRating}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-200">{stats.feedbackCount}</td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => giveWarning(o.id)} className="px-3 py-1 rounded-lg bg-amber-900/40 text-amber-300 text-xs font-bold hover:bg-amber-800/40">Warn</button>
                            <button onClick={() => giveAppreciation(o.id)} className="px-3 py-1 rounded-lg bg-emerald-900/40 text-emerald-300 text-xs font-bold hover:bg-emerald-800/40">Appreciate</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

          {/* Recent Grievances */}
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
                  {filteredGrievances.slice(0, 5).map((g) => (
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
        </>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <>
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading analytics...</div>
          ) : analytics ? (
            <>
              {/* SLA Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
                  <h2 className="text-xl font-bold text-white font-poppins mb-6 flex items-center gap-2">
                    <TrendingUp size={24} className="text-blue-400" /> SLA Performance
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={slaChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {slaChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', color: '#f1f5f9' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">On Time</span>
                      <span className="text-green-400 font-bold">{analytics.slaMetrics.onTimePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Delayed</span>
                      <span className="text-amber-400 font-bold">{analytics.slaMetrics.delayedPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Overdue</span>
                      <span className="text-red-400 font-bold">{analytics.slaMetrics.overduePercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
                  <h2 className="text-xl font-bold text-white font-poppins mb-6 flex items-center gap-2">
                    <BarChart3 size={24} className="text-purple-400" /> Category Distribution
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', color: '#f1f5f9' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Status Distribution Bar Chart */}
              <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold text-white font-poppins mb-6 flex items-center gap-2">
                  <Clock size={24} className="text-cyan-400" /> Status Distribution
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', color: '#f1f5f9' }} />
                      <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grievance Analysis Section */}
              {grievanceAnalysis && (
                <>
                  <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
                    <h2 className="text-xl font-bold text-white font-poppins mb-6 flex items-center gap-2">
                      <BarChart3 size={24} className="text-indigo-400" /> Comprehensive Grievance Analysis
                    </h2>
                    
                    {/* Time-based Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Today</p>
                        <p className="text-3xl font-bold text-white">{grievanceAnalysis.todayCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Grievances filed</p>
                      </div>
                      <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">This Week</p>
                        <p className="text-3xl font-bold text-white">{grievanceAnalysis.weekCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Grievances filed</p>
                      </div>
                      <div className="bg-[#0f172a] p-5 rounded-xl border border-slate-800">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">This Month</p>
                        <p className="text-3xl font-bold text-white">{grievanceAnalysis.monthCount}</p>
                        <p className="text-xs text-slate-500 mt-1">Grievances filed</p>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-indigo-900/20 p-5 rounded-xl border border-indigo-800">
                        <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Total</p>
                        <p className="text-2xl font-bold text-white">{grievanceAnalysis.totalGrievances}</p>
                      </div>
                      <div className="bg-green-900/20 p-5 rounded-xl border border-green-800">
                        <p className="text-xs font-bold text-green-400 uppercase mb-2">Resolved</p>
                        <p className="text-2xl font-bold text-white">{grievanceAnalysis.resolvedCount}</p>
                      </div>
                      <div className="bg-amber-900/20 p-5 rounded-xl border border-amber-800">
                        <p className="text-xs font-bold text-amber-400 uppercase mb-2">Pending</p>
                        <p className="text-2xl font-bold text-white">{grievanceAnalysis.pendingCount}</p>
                      </div>
                      <div className="bg-blue-900/20 p-5 rounded-xl border border-blue-800">
                        <p className="text-xs font-bold text-blue-400 uppercase mb-2">In Progress</p>
                        <p className="text-2xl font-bold text-white">{grievanceAnalysis.inProgressCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Priority and Category Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Priority Distribution */}
                    <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
                      <h2 className="text-xl font-bold text-white font-poppins mb-6">Priority Distribution</h2>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-slate-300 font-semibold">High Priority</span>
                          </div>
                          <span className="text-2xl font-bold text-red-400">{grievanceAnalysis.highPriorityCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <span className="text-slate-300 font-semibold">Medium Priority</span>
                          </div>
                          <span className="text-2xl font-bold text-amber-400">{grievanceAnalysis.mediumPriorityCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-slate-300 font-semibold">Low Priority</span>
                          </div>
                          <span className="text-2xl font-bold text-green-400">{grievanceAnalysis.lowPriorityCount}</span>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-800">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Resolution Rate</span>
                          <span className="text-2xl font-bold text-green-400">{grievanceAnalysis.resolutionRate}%</span>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-slate-400">Avg Resolution Time</span>
                          <span className="text-xl font-bold text-blue-400">{grievanceAnalysis.averageResolutionDays} days</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Category */}
                    <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
                      <h2 className="text-xl font-bold text-white font-poppins mb-6">Category Insights</h2>
                      <div className="bg-indigo-900/20 border border-indigo-800 p-6 rounded-2xl mb-6">
                        <p className="text-xs font-bold text-indigo-400 uppercase mb-3">Top Category</p>
                        <p className="text-3xl font-bold text-white mb-2">{grievanceAnalysis.topCategory}</p>
                        <p className="text-slate-400">
                          <span className="text-2xl font-bold text-indigo-400">{grievanceAnalysis.topCategoryCount}</span> grievances
                        </p>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(grievanceAnalysis.categoryDistribution)
                          .sort((a, b) => (b[1] as number) - (a[1] as number))
                          .slice(0, 5)
                          .map(([category, count], idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-[#0f172a] rounded-xl">
                              <span className="text-slate-300 text-sm font-semibold">{category}</span>
                              <span className="text-lg font-bold text-slate-400">{count as number}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Red Zones */}
              <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold text-white font-poppins mb-6 flex items-center gap-2">
                  <AlertCircle size={24} className="text-red-400" /> Red Zone Alerts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.zoneAnalytics.filter(z => z.isRedZone).length > 0 ? (
                    analytics.zoneAnalytics.filter(z => z.isRedZone).map((zone, idx) => (
                      <div key={idx} className="p-4 bg-red-900/20 border border-red-800 rounded-2xl">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-red-400 flex items-center gap-2">
                            <MapPin size={16} /> {zone.zoneName}
                          </h3>
                          <span className="text-xs bg-red-900/40 text-red-300 px-2 py-1 rounded">RED ZONE</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-300">Total: <span className="font-bold text-red-400">{zone.totalGrievances}</span></p>
                          <p className="text-slate-400">Pending: {zone.pendingCount} | Resolved: {zone.resolvedCount}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-slate-500">
                      No red zones detected
                    </div>
                  )}
                </div>
              </div>

              {/* Zone Analytics */}
              <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
                <h2 className="text-xl font-bold text-white font-poppins mb-6 flex items-center gap-2">
                  <MapPin size={24} className="text-green-400" /> Zone-wise Analytics
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#0f172a]/50">
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Zone Name</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Resolved</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Pending</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Avg Days</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {analytics.zoneAnalytics.map((zone, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="px-6 py-4 text-slate-300 font-semibold">{zone.zoneName}</td>
                          <td className="px-6 py-4 text-slate-200">{zone.totalGrievances}</td>
                          <td className="px-6 py-4 text-green-400">{zone.resolvedCount}</td>
                          <td className="px-6 py-4 text-amber-400">{zone.pendingCount}</td>
                          <td className="px-6 py-4 text-slate-300">{zone.resolvedCount > 0 ? (zone.totalGrievances / zone.resolvedCount).toFixed(1) : 'N/A'} days</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${zone.isRedZone ? 'bg-red-900/40 text-red-400' : 'bg-green-900/40 text-green-400'}`}>
                              {zone.isRedZone ? 'RED ZONE' : 'NORMAL'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">No analytics data available</div>
          )}
        </>
      )}

      {/* FEEDBACK TAB */}
      {activeTab === 'feedback' && (
        <div className="bg-[#161e31] p-8 rounded-[2rem] border border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-white font-poppins mb-6">Feedback & Ratings from Citizens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grievances.filter(g => g.feedbacks && g.feedbacks.length > 0).map(g => (
              <div key={g.id} className="p-4 bg-[#0f172a] rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="mb-3">
                  <p className="font-bold text-slate-300 text-sm">{g.title}</p>
                  <p className="text-xs text-slate-500">ID: {g.id}</p>
                </div>
                <div className="space-y-2">
                  {g.feedbacks.map((fb, idx) => (
                    <div key={idx} className="p-2 bg-slate-800/30 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-yellow-400">⭐ {fb.rating}/5</span>
                        <span className="text-[10px] text-slate-500">{new Date(fb.givenAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-300">{fb.comment || 'No comment provided'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {grievances.filter(g => g.feedbacks && g.feedbacks.length > 0).length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No feedback received yet
            </div>
          )}
        </div>
      )}

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

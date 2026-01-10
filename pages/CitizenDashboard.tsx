
import React, { useState } from 'react';
import { useApp } from '../store';
import { GRIEVANCE_CATEGORIES, STATUS_COLORS } from '../constants';
import { autoCategorizeGrievance } from '../services/geminiService';
import { backendApi } from '../services/backendApi';
import { 
  Plus, 
  Send, 
  MapPin, 
  Camera, 
  History, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Sparkles,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Star,
  X
} from 'lucide-react';
import { GrievanceStatus, Grievance } from '../types';

const CitizenDashboard: React.FC = () => {
  const { grievances, user, submitGrievance, addFeedback } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(GRIEVANCE_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [encodedImage, setEncodedImage] = useState<string | null>(null);
  const [locationLat, setLocationLat] = useState<number | string>('');
  const [locationLng, setLocationLng] = useState<number | string>('');
  const [locationAddress, setLocationAddress] = useState('');
  
  // Feedback form states
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const myGrievances = grievances.filter(g => g.submittedBy === user?.id);

  const handleAutoCategorize = async () => {
    if (!description || description.length < 10) return;
    setIsAnalyzing(true);
    const result = await autoCategorizeGrievance(description);
    if (result) {
      if (GRIEVANCE_CATEGORIES.includes(result.category)) {
        setCategory(result.category);
      }
      setTitle(result.suggestedTitle);
    }
    setIsAnalyzing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        setUploadedFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          setEncodedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file smaller than 5MB');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate location
    const lat = locationLat ? parseFloat(String(locationLat)) : 0;
    const lng = locationLng ? parseFloat(String(locationLng)) : 0;
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      if (locationLat || locationLng) {
        alert('Please enter valid coordinates. Latitude: -90 to 90, Longitude: -180 to 180');
        return;
      }
    }

    submitGrievance({
      title,
      description,
      category,
      location: { 
        lat: lat || 0, 
        lng: lng || 0, 
        address: locationAddress || "Location not specified"
      },
      image: encodedImage || undefined
    });
    
    // Reset form
    setIsFormOpen(false);
    setTitle('');
    setDescription('');
    setUploadedFile(null);
    setLocationLat('');
    setLocationLng('');
    setLocationAddress('');
    setEncodedImage(null);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrievance || feedbackRating < 1 || feedbackRating > 5) return;

    setIsSubmittingFeedback(true);
    try {
      // Try backend submission first
      await backendApi.grievances.submitFeedback(
        selectedGrievance.id,
        { rating: feedbackRating, comment: feedbackComment },
        user?.id || ''
      );
    } catch (error) {
      console.warn('Backend feedback submission failed, saving locally instead.');
    } finally {
      // Always store locally to reflect immediately in UI
      addFeedback(selectedGrievance.id, feedbackRating, feedbackComment);
      alert('Feedback submitted successfully!');
      setFeedbackOpen(false);
      setFeedbackRating(5);
      setFeedbackComment('');
      setSelectedGrievance(null);
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white font-poppins tracking-tight">Citizen Portal</h1>
          <p className="text-slate-400">Welcome back, <span className="text-indigo-400 font-bold">{user?.name}</span>. Report issues to improve our city.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus size={24} />
          Report New Issue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: <History />, label: 'Total Submitted', val: myGrievances.length, color: 'text-blue-400', bg: 'bg-blue-900/20' },
          { icon: <Clock />, label: 'Active Issues', val: myGrievances.filter(g => g.status !== GrievanceStatus.RESOLVED).length, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
          { icon: <CheckCircle />, label: 'Resolved', val: myGrievances.filter(g => g.status === GrievanceStatus.RESOLVED).length, color: 'text-green-400', bg: 'bg-green-900/20' },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#161e31] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl flex items-center gap-6 group hover:border-indigo-500/50 transition-colors">
            <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shrink-0`}>
              {item.icon}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{item.label}</p>
              <p className="text-3xl font-black text-white">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white font-poppins">Recent Grievances</h2>
        {myGrievances.length === 0 ? (
          <div className="bg-[#161e31] p-20 rounded-[3rem] border-2 border-dashed border-slate-800 text-center flex flex-col items-center gap-6">
            <div className="p-8 bg-slate-900 rounded-full text-slate-700">
              <ShieldAlert size={64} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">No issues reported yet</h3>
              <p className="text-slate-500 mb-6">Help keep our city clean and functional by reporting grievances</p>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2 mx-auto"
              >
                <Plus size={20} /> Report First Issue
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {myGrievances.map((grievance) => (
              <div 
                key={grievance.id}
                onClick={() => setSelectedGrievance(grievance)}
                className="bg-[#161e31] border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 hover:bg-[#1a2341] transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{grievance.title}</h3>
                    <p className="text-slate-400 text-sm mb-3">{grievance.description.substring(0, 100)}...</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="bg-indigo-900/30 text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold">
                        {grievance.category}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[grievance.status]?.bg} ${STATUS_COLORS[grievance.status]?.text}`}>
                        {grievance.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{new Date(grievance.submittedAt).toLocaleDateString()}</p>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 mx-auto group-hover:animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grievance Details Modal */}
      {selectedGrievance && !feedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-[#161e31]">
              <h2 className="text-2xl font-bold text-white font-poppins">{selectedGrievance.title}</h2>
              <button onClick={() => setSelectedGrievance(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <img src={`https://picsum.photos/seed/${selectedGrievance.id}/800/600`} className="w-full h-64 object-cover rounded-[2rem] shadow-2xl border border-slate-800" alt="" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white leading-tight">{selectedGrievance.title}</h3>
                  <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold">
                    <span className="bg-indigo-900/30 px-3 py-1 rounded-lg">{selectedGrievance.category}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedGrievance.description}</p>
                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <MapPin className="text-indigo-500" />
                    <span className="text-slate-400 text-sm">{selectedGrievance.location.address}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock size={20} className="text-indigo-400" /> Resolution Timeline
                </h4>
                <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {selectedGrievance.timeline.map((entry, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-8 top-1.5 w-6 h-6 bg-[#161e31] border-2 border-slate-800 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="bg-[#161e31] p-5 rounded-2xl border border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-slate-200">{entry.message}</p>
                          <span className="text-[10px] text-slate-500 font-medium uppercase">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-slate-500">Updated by <span className="text-indigo-400 font-bold">{entry.actor}</span> • {new Date(entry.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedGrievance.resolutionNote && (
                <div className="bg-green-900/10 border border-green-900/30 p-8 rounded-[2rem] space-y-4">
                  <h4 className="text-lg font-bold text-green-400 flex items-center gap-2">
                    <CheckCircle size={20} /> Resolution Details
                  </h4>
                  <p className="text-slate-300 italic">"{selectedGrievance.resolutionNote}"</p>
                  <div className="text-xs text-slate-500">Closed on {new Date(selectedGrievance.resolvedAt!).toLocaleDateString()}</div>
                  
                  {selectedGrievance.status === GrievanceStatus.RESOLVED && !selectedGrievance.feedbacks?.length && (
                    <button
                      onClick={() => setFeedbackOpen(true)}
                      className="mt-4 w-full bg-amber-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Star size={18} /> Rate This Resolution
                    </button>
                  )}
                </div>
              )}

              {selectedGrievance.feedbacks && selectedGrievance.feedbacks.length > 0 && (
                <div className="bg-cyan-900/10 border border-cyan-900/30 p-8 rounded-[2rem] space-y-4">
                  <h4 className="text-lg font-bold text-cyan-400">Your Feedback</h4>
                  <div className="space-y-3">
                    {selectedGrievance.feedbacks.map((fb, idx) => (
                      <div key={idx} className="bg-[#161e31] p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(fb.rating)].map((_, i) => (
                            <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-slate-300 text-sm">{fb.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackOpen && selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-[#161e31]">
              <h2 className="text-2xl font-bold text-white font-poppins">Rate Your Experience</h2>
              <button onClick={() => {setFeedbackOpen(false); setSelectedGrievance(null);}} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        size={32}
                        className={feedbackRating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Comments (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Share your feedback about how the issue was resolved..."
                  className="w-full px-6 py-4 bg-white text-slate-900 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/30 outline-none border-none font-medium"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingFeedback}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingFeedback ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Submit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#111827] border border-slate-800 rounded-[3rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-[#161e31]">
              <h2 className="text-2xl font-bold text-white font-poppins">Report Grievance</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Describe the Problem</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Tell us what happened. Be as specific as possible..."
                    className="w-full px-6 py-4 bg-white text-slate-900 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/30 outline-none transition-all border-none font-medium"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleAutoCategorize}
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={handleAutoCategorize}
                      disabled={isAnalyzing || description.length < 10}
                      className="bg-indigo-900/30 text-indigo-400 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-900/50 transition-all disabled:opacity-30 uppercase tracking-tighter"
                    >
                      {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      AI Auto-Categorize
                    </button>
                    {isAnalyzing && <span className="text-xs text-slate-500 animate-pulse">Analyzing issue context...</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g., Broken water pipe"
                      className="w-full px-6 py-4 bg-white text-slate-900 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/30 outline-none border-none font-medium"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Category</label>
                    <select 
                      className="w-full px-6 py-4 bg-white text-slate-900 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/30 outline-none border-none font-medium appearance-none"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {GRIEVANCE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                {/* Location Fields */}
                <div className="bg-blue-900/10 border border-blue-900/30 p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-blue-400 uppercase">Location (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Latitude</label>
                      <input 
                        type="number"
                        step="0.0001"
                        min="-90"
                        max="90"
                        placeholder="-90 to 90"
                        className="w-full px-4 py-3 bg-white text-slate-900 rounded-lg focus:ring-4 focus:ring-blue-500/30 outline-none border-none font-medium text-sm"
                        value={locationLat}
                        onChange={(e) => setLocationLat(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Longitude</label>
                      <input 
                        type="number"
                        step="0.0001"
                        min="-180"
                        max="180"
                        placeholder="-180 to 180"
                        className="w-full px-4 py-3 bg-white text-slate-900 rounded-lg focus:ring-4 focus:ring-blue-500/30 outline-none border-none font-medium text-sm"
                        value={locationLng}
                        onChange={(e) => setLocationLng(e.target.value)}
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Address (optional)"
                    className="w-full px-4 py-3 bg-white text-slate-900 rounded-lg focus:ring-4 focus:ring-blue-500/30 outline-none border-none font-medium text-sm"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="border-2 border-dashed border-slate-800 rounded-[2rem] p-8 text-center hover:bg-indigo-900/10 hover:border-indigo-500/50 transition-all cursor-pointer group">
                    <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Camera className="text-slate-500 group-hover:text-indigo-400" size={28} />
                    </div>
                    <p className="text-sm font-black text-slate-300 uppercase">Attach Proof</p>
                    <p className="text-xs text-slate-600">{uploadedFile ? uploadedFile.name : 'JPG, PNG up to 5MB'}</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-8 text-center hover:bg-indigo-900/10 hover:border-indigo-500/50 transition-all cursor-pointer group">
                    <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <MapPin className="text-slate-500 group-hover:text-indigo-400" size={28} />
                    </div>
                    <p className="text-sm font-black text-slate-300 uppercase">Location</p>
                    <p className="text-xs text-slate-600">{locationLat && locationLng ? 'Location Set' : 'Enter above'}</p>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-900/50 hover:bg-indigo-500 flex items-center justify-center gap-3 group transition-all transform hover:-translate-y-1 active:translate-y-0 text-lg uppercase tracking-widest"
              >
                Launch Grievance
                <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;

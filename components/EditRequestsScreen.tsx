import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { EditRequest, User, Translation, ThemeMode, SystemModule } from '../types';

interface EditRequestsScreenProps {
  requests: EditRequest[];
  modules: SystemModule[];
  users: User[];
  currentUser: User;
  translation: Translation;
  theme: ThemeMode;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onBack: () => void;
}

export const EditRequestsScreen: React.FC<EditRequestsScreenProps> = ({
  requests, modules, users, currentUser, translation, theme, onApprove, onReject, onBack
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const receivedRequests = requests.filter(r => r.responsibleId === currentUser.id);
  const sentRequests = requests.filter(r => r.requesterId === currentUser.id);

  const displayRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  const getStatusBadge = (request: EditRequest) => {
    if (request.status === 'pending') {
      return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Pending</span>;
    }
    if (request.status === 'rejected') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Rejected</span>;
    }
    if (request.status === 'completed') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Completed</span>;
    }
    
    if (request.expiresAt) {
      const expires = new Date(request.expiresAt);
      if (now > expires) {
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Expired</span>;
      }
      
      const diff = expires.getTime() - now.getTime();
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
          <Clock size={12} />
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      );
    }
    
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Approved</span>;
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0a0a0a] text-white'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${isLight ? 'bg-white/80 border-slate-200' : 'bg-black/80 border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Edit2 className="text-amber-500" />
              Edit Requests
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'received' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : (isLight ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-white/10 text-white/60 hover:bg-white/20')}`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'sent' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : (isLight ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : 'bg-white/10 text-white/60 hover:bg-white/20')}`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {displayRequests.map(request => {
            const module = modules.find(m => m.id === request.moduleId);
            const requester = users.find(u => u.id === request.requesterId);
            const responsible = users.find(u => u.id === request.responsibleId);
            
            return (
              <div key={request.id} className={`p-6 rounded-3xl border transition-all ${isLight ? 'bg-white border-slate-200' : 'bg-[#141414] border-white/10'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    {module?.image ? (
                      <img src={module.image} alt={module.name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/20 text-amber-400'}`}>
                        <Edit2 size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{module?.name || 'Unknown Module'}</h3>
                      <p className="text-sm opacity-60">Screen: {request.screenId}</p>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(request)}
                  </div>
                </div>

                <div className={`p-4 rounded-2xl mb-4 ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium opacity-60 uppercase tracking-wider block mb-1">
                        {activeTab === 'received' ? 'Requester' : 'Responsible'}
                      </span>
                      <div className="flex items-center gap-2">
                        {activeTab === 'received' ? (
                          <>
                            {requester?.photo ? (
                              <img src={requester.photo} alt={requester.firstName} className="w-6 h-6 rounded-full object-cover" />
                            ) : <div className="w-6 h-6 rounded-full bg-slate-500" />}
                            <span className="text-sm font-medium">{requester?.firstName} {requester?.lastName}</span>
                          </>
                        ) : (
                          <>
                            {responsible?.photo ? (
                              <img src={responsible.photo} alt={responsible.firstName} className="w-6 h-6 rounded-full object-cover" />
                            ) : <div className="w-6 h-6 rounded-full bg-slate-500" />}
                            <span className="text-sm font-medium">{responsible?.firstName} {responsible?.lastName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium opacity-60 uppercase tracking-wider block mb-1">Date</span>
                      <span className="text-sm font-medium">{new Date(request.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="text-xs font-medium opacity-60 uppercase tracking-wider block mb-1">What to edit?</span>
                    <p className="text-sm font-medium">{request.whatToEdit}</p>
                  </div>
                  
                  <div className="mt-4">
                    <span className="text-xs font-medium opacity-60 uppercase tracking-wider block mb-1">Reason</span>
                    <p className="text-sm opacity-80">{request.reason}</p>
                  </div>
                </div>

                {activeTab === 'received' && request.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => onReject(request.id)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${isLight ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                    >
                      <X size={18} />
                      Reject
                    </button>
                    <button
                      onClick={() => onApprove(request.id)}
                      className="flex-1 py-3 rounded-xl font-medium bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Approve (5 min)
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {displayRequests.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-50">
              <AlertCircle size={48} className="mb-4" />
              <p className="text-lg font-medium">No {activeTab === 'received' ? 'received' : 'sent'} requests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

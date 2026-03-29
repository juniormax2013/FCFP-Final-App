import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { Translation } from '../types';

interface EditRequestModalProps {
  translation: Translation;
  theme: 'light' | 'dark';
  moduleName: string;
  recordName: string;
  onClose: () => void;
  onSubmit: (whatToEdit: string, reason: string) => void;
}

export const EditRequestModal: React.FC<EditRequestModalProps> = ({
  translation, theme, moduleName, recordName, onClose, onSubmit
}) => {
  const isLight = theme === 'light';
  const [whatToEdit, setWhatToEdit] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatToEdit.trim() || !reason.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    onSubmit(whatToEdit, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isLight ? 'bg-white' : 'bg-[#1a1a1a]'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Edit Request
          </h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-white/60'}`}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className={`p-4 rounded-xl text-sm ${isLight ? 'bg-amber-50 text-amber-800' : 'bg-amber-500/10 text-amber-400'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>
                You are requesting permission to edit <strong>{recordName}</strong> in the <strong>{moduleName}</strong> module. 
                The module responsible will review your request.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                What do you want to edit?
              </label>
              <textarea
                value={whatToEdit}
                onChange={e => setWhatToEdit(e.target.value)}
                placeholder="E.g., I need to correct the phone number and address..."
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none h-24 ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/50 border-white/10 text-white placeholder-white/30'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Why do you need to edit it?
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="E.g., There was a mistake when entering the original data..."
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none h-24 ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-black/50 border-white/10 text-white placeholder-white/30'}`}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-white/5 text-white hover:bg-white/10'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Plus, X, User as UserIcon, HeartHandshake, FileText, CheckCircle2, XCircle, Calendar, DollarSign, Image as ImageIcon, Edit3 } from 'lucide-react';
import { User, Translation, Donateur, DonateurPayment, SystemSettings, ModulePermission, Member } from '../types';
import { formatToMMDDYYYY, getLocalYYYYMMDD } from '../lib/utils';

interface DonateurPaymentModalProps {
  donateur: Donateur;
  month: string;
  onClose: () => void;
  onSave: (p: DonateurPayment) => void;
  currentUser: User;
  isLight: boolean;
  existingPayment?: DonateurPayment;
}

const DonateurPaymentModal: React.FC<DonateurPaymentModalProps> = ({ donateur, month, onClose, onSave, currentUser, isLight, existingPayment }) => {
  const [amount, setAmount] = useState(existingPayment ? existingPayment.amount.toString() : '');
  const [date, setDate] = useState(existingPayment ? existingPayment.date : getLocalYYYYMMDD());

  const handleSave = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    const timestamp = new Date().toISOString();
    
    if (existingPayment) {
      onSave({
        ...existingPayment,
        amount: Number(amount),
        date,
        updatedAt: timestamp
      });
    } else {
      onSave({
        id: `DPAY-${Date.now().toString().slice(-6)}`,
        donateurId: donateur.id,
        amount: Number(amount),
        month,
        date,
        registeredBy: currentUser.id,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
  };

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl animate-in zoom-in-95 duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
      <div className={`w-full max-w-sm rounded-[40px] overflow-hidden flex flex-col shadow-2xl border ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        <div className="p-6 sm:p-8 flex justify-between items-center border-b border-white/5">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="text-emerald-500" />
            {existingPayment ? 'Edit Payment' : 'Register Payment'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X size={24}/></button>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-white/60'}`}>Payment for</p>
            <p className="font-bold text-lg">{donateur.name}</p>
            <p className={`text-xs font-black uppercase tracking-widest mt-1 ${isLight ? 'text-rose-500' : 'text-rose-400'}`}>{month}</p>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Amount</label>
            <div className="relative">
              <DollarSign size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-white/40'}`} />
              <input 
                type="number" 
                placeholder="0.00" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-lg font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Date</label>
            <div className="relative">
              <Calendar size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-white/40'}`} />
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 flex gap-4 border-t border-white/5">
           <button onClick={onClose} className="flex-1 py-4 font-bold">Cancel</button>
           <button onClick={handleSave} className="flex-[2] py-4 bg-emerald-600 rounded-3xl font-bold text-white shadow-xl">
             {existingPayment ? 'Update Payment' : 'Save Payment'}
           </button>
        </div>
      </div>
    </div>
  );
};

interface DonateurReportModalProps {
  donateurs: Donateur[];
  payments: DonateurPayment[];
  members: Member[];
  onClose: () => void;
  onAddPayment: (p: DonateurPayment) => void;
  onUpdatePayment: (p: DonateurPayment) => void;
  currentUser: User;
  isLight: boolean;
}

const DonateurReportModal: React.FC<DonateurReportModalProps> = ({ donateurs, payments, members, onClose, onAddPayment, onUpdatePayment, currentUser, isLight }) => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModalDonateur, setPaymentModalDonateur] = useState<Donateur | null>(null);
  const [editingPayment, setEditingPayment] = useState<DonateurPayment | null>(null);

  const reportData = useMemo(() => {
    return donateurs.filter(d => !d.deletedAt).map(donateur => {
      const payment = payments.find(p => p.donateurId === donateur.id && p.month === selectedMonth && !p.deletedAt);
      const member = donateur.memberId ? members.find(m => m.id === donateur.memberId) : null;
      
      return {
        donateur,
        member,
        payment,
        isPaid: !!payment
      };
    }).filter(item => {
      if (statusFilter === 'paid' && !item.isPaid) return false;
      if (statusFilter === 'unpaid' && item.isPaid) return false;
      if (searchTerm) {
        return item.donateur.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [donateurs, payments, members, selectedMonth, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    let totalPaid = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    donateurs.filter(d => !d.deletedAt).forEach(donateur => {
      const payment = payments.find(p => p.donateurId === donateur.id && p.month === selectedMonth && !p.deletedAt);
      if (payment) {
        totalPaid += payment.amount;
        paidCount++;
      } else {
        unpaidCount++;
      }
    });

    return { totalPaid, paidCount, unpaidCount };
  }, [donateurs, payments, selectedMonth]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl animate-in zoom-in-95 duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
      <div className={`w-full max-w-5xl h-[90vh] rounded-[40px] overflow-hidden flex flex-col shadow-2xl border ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        <div className="p-6 sm:p-8 flex justify-between items-center border-b border-white/5">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <FileText className="text-rose-500" size={28} />
            Local Contributions Report
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X size={24}/></button>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-white/5 ${isLight ? 'bg-slate-50/50' : 'bg-white/[0.02]'}`}>
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Total Collected</p>
            <p className="text-2xl font-black text-emerald-500">${stats.totalPaid.toFixed(2)}</p>
          </div>
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Paid Donateurs</p>
            <p className="text-2xl font-black text-emerald-500">{stats.paidCount}</p>
          </div>
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Unpaid Donateurs</p>
            <p className="text-2xl font-black text-red-500">{stats.unpaidCount}</p>
          </div>
        </div>
        
        <div className={`p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Month:</label>
              <input 
                type="month" 
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className={`border rounded-2xl py-2 px-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-rose-500 ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-black/50 border-white/10 text-white'}`}
              />
            </div>
            
            <div className={`flex rounded-2xl p-1 border ${isLight ? 'bg-white border-slate-200' : 'bg-black/50 border-white/10'}`}>
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${statusFilter === 'all' ? (isLight ? 'bg-slate-200 text-slate-900' : 'bg-white/20 text-white') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-white/50 hover:bg-white/10')}`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('paid')}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1 ${statusFilter === 'paid' ? 'bg-emerald-500 text-white' : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-white/50 hover:bg-white/10')}`}
              >
                <CheckCircle2 size={14} /> Paid
              </button>
              <button 
                onClick={() => setStatusFilter('unpaid')}
                className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1 ${statusFilter === 'unpaid' ? 'bg-red-500 text-white' : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-white/50 hover:bg-white/10')}`}
              >
                <XCircle size={14} /> Not Paid
              </button>
            </div>
          </div>

          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-white/40'}`} />
            <input 
              type="text" 
              placeholder="Search donateur..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className={`w-full border rounded-3xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-black/50 border-white/10 text-white'}`} 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.map(({ donateur, member, payment, isPaid }) => (
              <div 
                key={donateur.id} 
                className={`rounded-[24px] p-5 flex flex-col gap-4 border shadow-sm transition-all ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {member?.photo ? (
                      <img src={member.photo} alt={donateur.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/10" referrerPolicy="no-referrer" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-white/50'}`}>
                        {donateur.name.charAt(0)}
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isLight ? 'border-white' : 'border-[#1e2028]'} ${isPaid ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                      {isPaid ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base truncate">{donateur.name}</h4>
                    <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{donateur.phone || donateur.email || 'No contact info'}</p>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-black/30 border-white/5'}`}>
                  {isPaid ? (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>Paid</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">${payment!.amount.toFixed(2)}</span>
                          <button 
                            onClick={() => {
                              setEditingPayment(payment!);
                              setPaymentModalDonateur(donateur);
                            }}
                            className={`p-1 rounded-full transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-white/50'}`}
                            title="Edit Payment"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs opacity-60">
                        <span>{formatToMMDDYYYY(payment!.date)}</span>
                        <span>By: {payment!.registeredBy === currentUser.id ? 'You' : 'Admin'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isLight ? 'text-red-500' : 'text-red-400'}`}>Not Paid</span>
                      {selectedMonth === currentMonth && (
                        <button 
                          onClick={() => setPaymentModalDonateur(donateur)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Register Payment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {reportData.length === 0 && (
              <div className="col-span-full py-12 text-center opacity-50">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No records found for the selected filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {paymentModalDonateur && (
        <DonateurPaymentModal
          donateur={paymentModalDonateur}
          month={selectedMonth}
          existingPayment={editingPayment || undefined}
          onClose={() => {
            setPaymentModalDonateur(null);
            setEditingPayment(null);
          }}
          onSave={(p) => {
            if (editingPayment) {
              onUpdatePayment(p);
            } else {
              onAddPayment(p);
            }
            setPaymentModalDonateur(null);
            setEditingPayment(null);
          }}
          currentUser={currentUser}
          isLight={isLight}
        />
      )}
    </div>
  );
};

interface DonateurFormModalProps {
  initialData?: Donateur;
  members: Member[];
  onClose: () => void;
  onSave: (d: Donateur) => void;
  translation: Translation;
  currentUser: User;
  isLight: boolean;
}

const DonateurFormModal: React.FC<DonateurFormModalProps> = ({ initialData, members, onClose, onSave, translation, currentUser, isLight }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [memberId, setMemberId] = useState(initialData?.memberId || '');
  const [isSearchingMember, setIsSearchingMember] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  const filteredMembers = useMemo(() => {
    if (!memberSearchTerm) return [];
    return members.filter(m => 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(memberSearchTerm.toLowerCase())
    ).slice(0, 5);
  }, [members, memberSearchTerm]);

  const handleSelectMember = (m: Member) => {
    setMemberId(m.id);
    setName(`${m.firstName} ${m.lastName}`);
    setPhone(m.phone || '');
    setEmail(m.email || '');
    setIsSearchingMember(false);
    setMemberSearchTerm('');
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }
    
    const timestamp = new Date().toISOString();
    
    if (initialData) {
      onSave({
        ...initialData,
        name,
        phone,
        email,
        memberId: memberId || undefined,
        updatedAt: timestamp
      });
    } else {
      onSave({
        id: `DON-${Date.now().toString().slice(-6)}`,
        name,
        phone,
        email,
        memberId: memberId || undefined,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl animate-in zoom-in-95 duration-300 ${isLight ? 'bg-slate-900/60' : 'bg-black/90'}`}>
      <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border ${isLight ? 'bg-white border-slate-200' : 'glass-dark border-white/10'}`}>
        <div className="p-6 sm:p-8 flex justify-between items-center border-b border-white/5">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <HeartHandshake className="text-rose-500" />
            {initialData ? 'Edit Donateur' : 'Add Donateur'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 scrollbar-hide">
          
          <div className="space-y-2 relative">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Name</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Donateur name..." 
                value={name} 
                onChange={e => {
                  setName(e.target.value);
                  setMemberId(''); // Clear member link if they type manually
                }} 
                className={`flex-1 border rounded-3xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
              />
              <button 
                onClick={() => setIsSearchingMember(!isSearchingMember)}
                className={`px-4 rounded-3xl border transition-colors ${isSearchingMember ? 'bg-rose-500 text-white border-rose-500' : isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}
                title="Search Member"
              >
                <Search size={20} />
              </button>
            </div>
            
            {isSearchingMember && (
              <div className={`absolute z-10 w-full mt-2 rounded-2xl border shadow-xl overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#1e2028] border-white/10'}`}>
                <div className="p-2 border-b border-white/5">
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Search member by name..." 
                    value={memberSearchTerm}
                    onChange={e => setMemberSearchTerm(e.target.value)}
                    className={`w-full bg-transparent text-sm px-3 py-2 focus:outline-none ${isLight ? 'text-slate-900' : 'text-white'}`}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => handleSelectMember(m)}
                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-rose-500/10 transition-colors ${isLight ? 'text-slate-700' : 'text-slate-300'}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                          {m.firstName[0]}{m.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold">{m.firstName} {m.lastName}</p>
                          <p className="text-[10px] opacity-60">{m.email || 'No email'}</p>
                        </div>
                      </button>
                    ))
                  ) : memberSearchTerm ? (
                    <p className="p-4 text-center text-sm opacity-50">No members found</p>
                  ) : (
                    <p className="p-4 text-center text-sm opacity-50">Type to search...</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Phone</label>
            <input 
              type="tel" 
              placeholder="Phone number..." 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className={`w-full border rounded-3xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
            />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest px-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Email</label>
            <input 
              type="email" 
              placeholder="Email address..." 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className={`w-full border rounded-3xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
            />
          </div>
          
        </div>
        
        <div className="p-6 sm:p-8 flex gap-4 border-t border-white/5">
           <button onClick={onClose} className="flex-1 py-4 font-bold">{translation.cancel}</button>
           <button onClick={handleSave} className="flex-[2] py-4 bg-rose-600 rounded-3xl font-bold text-white shadow-xl">Save</button>
        </div>
      </div>
    </div>
  );
};

interface DonateurScreenProps {
  currentUser: User; 
  translation: Translation; 
  donateurs: Donateur[]; 
  donateurPayments: DonateurPayment[];
  members: Member[];
  settings: SystemSettings; 
  onBack: () => void; 
  onAddDonateur: (d: Donateur) => void; 
  onUpdateDonateur: (d: Donateur) => void; 
  onDeleteDonateur: (id: string) => void;
  onAddDonateurPayment: (p: DonateurPayment) => void;
  onUpdateDonateurPayment: (p: DonateurPayment) => void;
  onDeleteDonateurPayment: (id: string) => void;
  permissions: ModulePermission | undefined;
}

export const DonateurScreen: React.FC<DonateurScreenProps> = ({ 
  currentUser, translation, donateurs, donateurPayments, members, settings, onBack, onAddDonateur, onUpdateDonateur, onDeleteDonateur, onAddDonateurPayment, onUpdateDonateurPayment, onDeleteDonateurPayment, permissions 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingDonateur, setEditingDonateur] = useState<Donateur | null>(null);
  const [viewingDonateur, setViewingDonateur] = useState<Donateur | null>(null);
  const isLight = settings.theme === 'light';

  const filteredDonateurs = useMemo(() => {
    return donateurs.filter(d => 
      !d.deletedAt && 
      (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       (d.email && d.email.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [donateurs, searchTerm]);

  const unpaidMonths = useMemo(() => {
    if (!viewingDonateur) return [];
    
    const start = new Date(viewingDonateur.createdAt);
    const end = new Date();
    const months: string[] = [];
    
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endDate = new Date(end.getFullYear(), end.getMonth(), 1);
    
    while (current <= endDate) {
      const year = current.getFullYear();
      const month = (current.getMonth() + 1).toString().padStart(2, '0');
      const monthStr = `${year}-${month}`;
      months.push(monthStr);
      current.setMonth(current.getMonth() + 1);
    }
    
    const paidMonths = donateurPayments
      .filter(p => p.donateurId === viewingDonateur.id && !p.deletedAt)
      .map(p => p.month);
      
    return months.filter(m => !paidMonths.includes(m)).reverse();
  }, [viewingDonateur, donateurPayments]);

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md border-b border-white/5`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5"><ArrowLeft size={24} /></button>
          <h2 className="text-xl font-bold tracking-tight">Donateurs</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowReportModal(true)} className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all shadow-sm border ${isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}>
            <FileText size={18} /> <span className="hidden sm:inline font-bold text-sm">Report</span>
          </button>
          {permissions?.canCreate && (
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-full transition-all shadow-xl active:scale-95">
              <Plus size={18} /> <span className="hidden sm:inline font-bold text-sm">Add Donateur</span>
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className="relative mb-8 group">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
          <input 
            type="text" 
            placeholder="Search donateurs..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className={`w-full border rounded-3xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'}`} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDonateurs.map((d) => (
            <div 
              key={d.id} 
              onClick={() => setViewingDonateur(d)} 
              className={`rounded-[32px] p-6 flex items-center justify-between group transition-all border shadow-lg cursor-pointer active:scale-[0.99] ${isLight ? 'bg-white border-slate-100 hover:border-rose-200' : 'glass border-white/5 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-500`}>
                  <UserIcon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-base flex items-center gap-2">
                    {d.name}
                    {d.memberId && <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] uppercase font-bold">Member</span>}
                  </h4>
                  <p className="text-[10px] uppercase font-black opacity-40">
                    {d.phone || 'No phone'} • {d.email || 'No email'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredDonateurs.length === 0 && (
            <div className="col-span-full py-12 text-center opacity-50">
              <HeartHandshake size={48} className="mx-auto mb-4 opacity-20" />
              <p>No donateurs found</p>
            </div>
          )}
        </div>
      </div>
      
      {viewingDonateur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md">
           <div className={`w-full max-w-lg rounded-[40px] overflow-hidden flex flex-col border shadow-2xl ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'glass-dark border-white/10 text-white'}`}>
              <div className="p-8 flex items-start justify-between border-b border-white/5">
                <div>
                  <h3 className="text-2xl font-black">{viewingDonateur.name}</h3>
                  {viewingDonateur.memberId && <p className="text-sm text-blue-500 font-medium">Linked to Member</p>}
                </div>
                <button onClick={() => setViewingDonateur(null)}><X size={24}/></button>
              </div>
              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                 <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                   <p className="text-[9px] opacity-40 font-black uppercase">Phone</p>
                   <p className="font-bold">{viewingDonateur.phone || 'N/A'}</p>
                 </div>
                 <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                   <p className="text-[9px] opacity-40 font-black uppercase">Email</p>
                   <p className="font-bold">{viewingDonateur.email || 'N/A'}</p>
                 </div>
                 <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                   <p className="text-[9px] opacity-40 font-black uppercase">Registered Date</p>
                   <p className="font-bold">{formatToMMDDYYYY(viewingDonateur.createdAt)}</p>
                 </div>
                 
                 {unpaidMonths.length > 0 && (
                   <div className={`p-4 rounded-2xl border ${isLight ? 'bg-red-50 border-red-100' : 'bg-red-500/10 border-red-500/20'}`}>
                     <p className={`text-[9px] font-black uppercase mb-2 ${isLight ? 'text-red-500' : 'text-red-400'}`}>Unpaid Months ({unpaidMonths.length})</p>
                     <div className="flex flex-wrap gap-2">
                       {unpaidMonths.map(m => (
                         <span key={m} className={`px-2 py-1 rounded-lg text-xs font-bold ${isLight ? 'bg-red-100 text-red-600' : 'bg-red-500/20 text-red-400'}`}>
                           {m}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
              <div className="p-6 flex gap-4 border-t border-white/5">
                {permissions?.canDelete && (
                  <button 
                    onClick={() => { 
                      onDeleteDonateur(viewingDonateur.id); 
                      setViewingDonateur(null); 
                    }} 
                    className="flex-1 py-4 font-bold text-red-500"
                  >
                    Delete
                  </button>
                )}
                {permissions?.canEdit && (
                  <button 
                    onClick={() => { 
                      setEditingDonateur(viewingDonateur); 
                      setViewingDonateur(null); 
                    }} 
                    className="flex-[2] py-4 bg-rose-600 rounded-2xl font-bold text-white"
                  >
                    Edit
                  </button>
                )}
              </div>
           </div>
        </div>
      )}

      {(showAddModal || editingDonateur) && (
        <DonateurFormModal
          initialData={editingDonateur || undefined}
          members={members}
          onClose={() => { setShowAddModal(false); setEditingDonateur(null); }}
          onSave={(d) => {
            if (editingDonateur) onUpdateDonateur(d);
            else onAddDonateur(d);
            setShowAddModal(false);
            setEditingDonateur(null);
          }}
          translation={translation}
          currentUser={currentUser}
          isLight={isLight}
        />
      )}

      {showReportModal && (
        <DonateurReportModal
          donateurs={donateurs}
          payments={donateurPayments}
          members={members}
          onClose={() => setShowReportModal(false)}
          onAddPayment={onAddDonateurPayment}
          onUpdatePayment={onUpdateDonateurPayment}
          currentUser={currentUser}
          isLight={isLight}
        />
      )}
    </div>
  );
};

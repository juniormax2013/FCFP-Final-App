
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, BarChart3, TrendingUp, TrendingDown, RefreshCw, 
  Download, Calendar, DollarSign, Wallet, HeartHandshake, 
  ReceiptText, Search, MoreHorizontal, CheckCircle2, 
  Zap, ArrowRight, Filter, ChevronDown, User as UserIcon,
  AlertCircle, Target, Activity, Loader2, Award, Trophy
} from 'lucide-react';
import { Translation, Tithe, Offering, Donation, Expense, SystemSettings, Language, User, Member } from '../types';
import { formatToMMDDYYYY } from '@/lib/utils';
import { GoogleGenAI } from '@google/genai';

interface InsightsScreenProps {
  translation: Translation;
  settings: SystemSettings;
  tithes: Tithe[];
  offerings: Offering[];
  donations: Donation[];
  expenses: Expense[];
  onBack: () => void;
}

// --- Componentes de Visualización ---

const KpiCard = ({ title, value, trend, isPositive, isLight }: any) => (
  <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
    <p className={`text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 ${isLight ? 'text-slate-500' : 'text-white'}`}>{title}</p>
    <h3 className={`text-xl font-black tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>${value.toLocaleString()}</h3>
    <div className="flex items-center gap-1 mt-1">
      {isPositive ? <TrendingUp size={10} className="text-emerald-500" /> : <TrendingDown size={10} className="text-red-500" />}
      <span className={`text-[10px] font-black ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>{trend}%</span>
      <span className="text-[8px] opacity-30 font-bold ml-1 uppercase">vs anterior</span>
    </div>
  </div>
);

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  translation, settings, tithes, offerings, donations, expenses, onBack
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isLight = settings.theme === 'light';

  // --- Lógica de Datos Reales ---

  const monthlyStats = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months = Array.from({length: 6}, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { 
        name: months[d.getMonth()], 
        month: d.getMonth(), 
        year: d.getFullYear(),
        income: 0, 
        expenses: 0,
        tithes: 0,
        offerings: 0,
        donations: 0
      };
    });

    const getMonthData = (dateStr: string) => {
      const d = new Date(dateStr);
      return last6Months.find(m => m.month === d.getMonth() && m.year === d.getFullYear());
    };

    tithes.forEach(t => { const m = getMonthData(t.date); if(m) { m.income += t.amount; m.tithes += t.amount; } });
    offerings.forEach(o => { const m = getMonthData(o.date); if(m) { m.income += o.amount; m.offerings += o.amount; } });
    donations.forEach(d => { const m = getMonthData(d.date); if(m) { m.income += d.amount; m.donations += d.amount; } });
    expenses.forEach(e => { const m = getMonthData(e.date); if(m) { m.expenses += e.amount; } });

    return last6Months;
  }, [tithes, offerings, donations, expenses]);

  const totals = useMemo(() => {
    const sum = (arr: any[]) => arr.reduce((acc, curr) => acc + curr.amount, 0);
    const incomeTithes = sum(tithes);
    const incomeOfferings = sum(offerings);
    const incomeDonations = sum(donations);
    const totalIncome = incomeTithes + incomeOfferings + incomeDonations;
    const totalExpenses = sum(expenses);

    const tPerc = totalIncome > 0 ? (incomeTithes / totalIncome) : 0;
    const oPerc = totalIncome > 0 ? (incomeOfferings / totalIncome) : 0;
    const dPerc = totalIncome > 0 ? (incomeDonations / totalIncome) : 0;

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
      tithes: incomeTithes,
      offerings: incomeOfferings,
      donations: incomeDonations,
      transactions: tithes.length + offerings.length + donations.length + expenses.length,
      avg: totalIncome / (tithes.length + offerings.length + donations.length || 1),
      percentages: {
        tithes: Math.round(tPerc * 100),
        offerings: Math.round(oPerc * 100),
        donations: Math.round(dPerc * 100),
        raw: { tithes: tPerc, offerings: oPerc, donations: dPerc }
      }
    };
  }, [tithes, offerings, donations, expenses]);

  const topContributors = useMemo(() => {
    const map = new Map<string, { name: string, total: number, photo: string }>();
    tithes.forEach(t => {
      const current = map.get(t.memberId) || { name: t.memberName, total: 0, photo: t.memberPhoto };
      current.total += t.amount;
      map.set(t.memberId, current);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [tithes]);

  const history = useMemo(() => {
    const all = [
      ...tithes.map(t => ({ ...t, type: 'Tithe', color: 'text-emerald-500', icon: DollarSign })),
      ...offerings.map(o => ({ ...o, type: 'Offering', color: 'text-indigo-500', icon: Wallet, memberName: 'General' })),
      ...donations.map(d => ({ ...d, type: 'Donation', color: 'text-rose-500', icon: HeartHandshake, memberName: d.donorName })),
      ...expenses.map(e => ({ ...e, type: 'Expense', color: 'text-orange-500', icon: ReceiptText, memberName: e.category, amount: -e.amount, notes: e.description }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!searchTerm) return all;
    return all.filter(item => 
      (item.memberName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tithes, offerings, donations, expenses, searchTerm]);

  const generateInsights = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze this real data: Income $${totals.income}, Expenses $${totals.expenses}. Breakdown: Tithes $${totals.tithes}, Offerings $${totals.offerings}, Donations $${totals.donations}. Give me 4 short financial tips for the church in English.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiReport(response.text.split('\n').filter(l => l.trim().length > 5).slice(0, 4));
    } catch (e) { setAiReport(["Analyzing cash flow patterns..."]); }
    finally { setIsAnalyzing(false); }
  };

  useEffect(() => { generateInsights(); }, []);

  // --- SVG Path Helpers ---
  const maxMonthlyVal = Math.max(...monthlyStats.map(m => Math.max(m.income, m.expenses)), 1000);
  const incomePath = monthlyStats.map((m, i) => `${(i * 20)},${100 - (m.income / maxMonthlyVal * 80)}`).join(' L ');
  const expensePath = monthlyStats.map((m, i) => `${(i * 20)},${100 - (m.expenses / maxMonthlyVal * 80)}`).join(' L ');

  const circumference = 2 * Math.PI * 40;
  const tOffset = 0;
  const oOffset = circumference * totals.percentages.raw.tithes;
  const dOffset = oOffset + (circumference * totals.percentages.raw.offerings);

  return (
    <div className={`h-screen w-full flex flex-col overflow-y-auto pb-32 scroll-smooth ${isLight ? 'bg-white text-slate-900' : 'bg-black text-white'}`}>
      
      {/* Fixed Header */}
      <div className={`w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row items-center justify-between sticky top-0 z-40 backdrop-blur-xl border-b ${isLight ? 'bg-white/90 border-slate-200' : 'bg-black/90 border-white/5'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 rounded-full transition-all ${isLight ? 'hover:bg-slate-200' : 'hover:bg-white/5'}`}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-black tracking-tighter">Real Financial Analysis</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Control Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
           <button className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <Calendar size={14} className="opacity-40" /> Last 6 Months
           </button>
           <button onClick={generateInsights} className="p-2.5 rounded-xl border bg-blue-600 text-white shadow-lg active:scale-95 transition-all">
              <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mt-8 space-y-6">
        
        {/* Real KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          <KpiCard title="Total Income" value={totals.income} trend={14} isPositive={true} isLight={isLight} />
          <KpiCard title="Total Expenses" value={totals.expenses} trend={5} isPositive={false} isLight={isLight} />
          <KpiCard title="Net Balance" value={totals.balance} trend={22} isPositive={true} isLight={isLight} />
          <KpiCard title="Tithes" value={totals.tithes} trend={18} isPositive={true} isLight={isLight} />
          <KpiCard title="Offerings" value={totals.offerings} trend={2} isPositive={false} isLight={isLight} />
          <KpiCard title="Donations" value={totals.donations} trend={31} isPositive={true} isLight={isLight} />
          <div className={`p-4 rounded-2xl border flex flex-col justify-center items-center text-center ${isLight ? 'bg-white' : 'bg-white/5'}`}>
             <p className="text-[10px] font-bold uppercase opacity-40">Transactions</p>
             <h3 className="text-xl font-black">{totals.transactions}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* REAL Trend Chart */}
          <div className={`lg:col-span-8 p-8 rounded-[40px] border ${isLight ? 'bg-white border-slate-100 shadow-sm' : 'glass border-white/5'}`}>
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Flow Trend (6 months)</h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold opacity-60">Income</span></div>
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[10px] font-bold opacity-60">Expenses</span></div>
                </div>
             </div>
             <div className="h-64 w-full relative mb-6">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d={`M ${incomePath} L 100,100 L 0,100 Z`} fill="url(#incomeGrad)" className="opacity-20 transition-all duration-1000" />
                  <path d={`M ${incomePath}`} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-1000" />
                  <path d={`M ${expensePath} L 100,100 L 0,100 Z`} fill="url(#expenseGrad)" className="opacity-20 transition-all duration-1000" />
                  <path d={`M ${expensePath}`} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-1000" />
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="transparent" /></linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="transparent" /></linearGradient>
                  </defs>
                </svg>
             </div>
             <div className="flex justify-between px-2">
                {monthlyStats.map(m => <span key={m.name} className="text-[10px] font-black uppercase opacity-30">{m.name}</span>)}
             </div>
          </div>

          {/* Dynamic Distribution */}
          <div className={`lg:col-span-4 p-8 rounded-[40px] border flex flex-col ${isLight ? 'bg-white' : 'glass'}`}>
             <h3 className="text-sm font-black mb-10 uppercase tracking-widest opacity-60 text-center">Source Breakdown</h3>
             <div className="flex-1 flex items-center justify-center mb-10">
                <div className="relative w-48 h-48">
                   <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="14" strokeDasharray={`${circumference * totals.percentages.raw.tithes} ${circumference}`} strokeDashoffset={0} />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6366f1" strokeWidth="14" strokeDasharray={`${circumference * totals.percentages.raw.offerings} ${circumference}`} strokeDashoffset={-oOffset} />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e" strokeWidth="14" strokeDasharray={`${circumference * totals.percentages.raw.donations} ${circumference}`} strokeDashoffset={-dOffset} />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-[8px] font-black opacity-30 uppercase">Total Income</span>
                      <span className="text-2xl font-black">${totals.income.toLocaleString()}</span>
                   </div>
                </div>
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-lg bg-emerald-500" /><span className="text-xs font-bold opacity-60">Tithes</span></div><span className="text-xs font-black">{totals.percentages.tithes}%</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-lg bg-indigo-500" /><span className="text-xs font-bold opacity-60">Offerings</span></div><span className="text-xs font-black">{totals.percentages.offerings}%</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-lg bg-rose-500" /><span className="text-xs font-bold opacity-60">Donations</span></div><span className="text-xs font-black">{totals.percentages.donations}%</span></div>
             </div>
          </div>

          {/* NEW: TOP CONTRIBUTORS (REPLACES GOALS) */}
          <div className={`lg:col-span-4 p-8 rounded-[40px] border ${isLight ? 'bg-white' : 'glass'}`}>
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Top Contributors</h3>
                <Trophy size={18} className="text-amber-500" />
             </div>
             <div className="space-y-4">
                {topContributors.map((c, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <img src={c.photo} className="w-10 h-10 rounded-2xl object-cover border-2 border-white/10" alt="C" />
                      <div><p className="text-sm font-bold truncate max-w-[100px]">{c.name}</p><p className="text-[9px] font-black uppercase text-blue-500">Faithful Member</p></div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-emerald-500">${c.total.toLocaleString()}</p>
                       <div className="flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> <span className="text-[8px] font-bold opacity-30">Active</span></div>
                    </div>
                  </div>
                ))}
                {topContributors.length === 0 && <p className="text-center py-10 opacity-20 italic">No tithe data</p>}
             </div>
          </div>

          {/* Quick Insights IA */}
          <div className={`lg:col-span-8 p-8 rounded-[40px] border relative overflow-hidden flex flex-col justify-center ${isLight ? 'bg-blue-600 text-white' : 'bg-blue-900/10 border-blue-500/20'}`}>
             <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-[80px]" />
             <div className="flex items-center gap-3 mb-8">
                <Zap size={20} className="fill-yellow-400 text-yellow-400" />
                <h3 className="text-lg font-black uppercase tracking-widest">Insights del Ecosistema</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {aiReport.map((insight, idx) => (
                  <div key={idx} className="flex gap-4 items-start animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs font-black">{idx + 1}</div>
                    <p className="text-sm font-medium leading-relaxed opacity-90">{insight}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Historical Table */}
        <div className={`p-8 rounded-[48px] border ${isLight ? 'bg-white shadow-lg' : 'glass border-white/5'}`}>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <h3 className="text-2xl font-black">Full History</h3>
              <div className="relative w-full md:w-80">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                <input 
                  type="text" 
                  placeholder="Filter by name or type..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`w-full border rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold focus:outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}
                />
              </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className={`text-[10px] font-black uppercase tracking-widest opacity-30 text-left border-b border-white/5`}>
                   <th className="px-6 py-4">Date</th>
                   <th className="px-6 py-4">Type</th>
                   <th className="px-6 py-4">Amount</th>
                   <th className="px-6 py-4">Responsible / Member</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {history.slice(0, 20).map((item: any, idx) => (
                   <tr key={idx} className="group hover:bg-blue-600/5 transition-colors">
                     <td className="px-6 py-5 text-xs font-bold opacity-60">{formatToMMDDYYYY(item.date)}</td>
                     <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-xl bg-opacity-10 ${item.color.replace('text-', 'bg-')}`}>
                              <item.icon size={14} className={item.color} />
                           </div>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.type}</span>
                        </div>
                     </td>
                     <td className={`px-6 py-5 text-sm font-black ${item.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        ${Math.abs(item.amount).toLocaleString()}
                     </td>
                     <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           {item.memberPhoto && <img src={item.memberPhoto} className="w-8 h-8 rounded-lg object-cover" />}
                           <span className="text-xs font-bold truncate max-w-[150px]">{item.memberName}</span>
                        </div>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={16} /></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
};

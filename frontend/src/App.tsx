import React, { useState, useEffect } from 'react';
import { Search, Loader2, Filter, Bell, Database, MapPin, Briefcase, Zap, ArrowUpDown, Calendar as CalendarIcon, XCircle } from 'lucide-react';
import { fetchLeads, getDbLeads, getFollowups } from './api';
import type { Lead } from './api';
import LeadCard from './components/LeadCard';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

function App() {
  const [business, setBusiness] = useState('');
  const [location, setLocation] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'search' | 'crm' | 'followups'>('crm');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showHotOnly, setShowHotOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'newest' | 'followup'>('score');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');

  const loadDbLeads = async () => {
    setLoading(true);
    try {
      const data = await getDbLeads();
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowups = async () => {
    setLoading(true);
    try {
      const data = await getFollowups();
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'crm') {
      loadDbLeads();
    } else if (tab === 'followups') {
      loadFollowups();
    }
  }, [tab]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTab('search');
    try {
      const data = await fetchLeads(business, location);
      setLeads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
  };

  const filteredLeads = [...leads]
    .filter(lead => {
      // Status Filter
      if (filterStatus !== 'All' && lead.status !== filterStatus) return false;
      
      // Hot Filter
      if (showHotOnly && lead.score < 8) return false;

      // Date Range Filter
      if (dateStart || dateEnd) {
        const leadDate = new Date(lead.created_at);
        const start = dateStart ? startOfDay(new Date(dateStart)) : new Date(0);
        const end = dateEnd ? endOfDay(new Date(dateEnd)) : new Date(8640000000000000);
        
        if (!isWithinInterval(leadDate, { start, end })) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortBy === 'followup') {
        if (!a.next_followup) return 1;
        if (!b.next_followup) return -1;
        return new Date(a.next_followup).getTime() - new Date(b.next_followup).getTime();
      }
      return 0;
    });

  const hotLeads = filteredLeads.filter(l => l.score >= 8);
  const todaysFollowups = filteredLeads.filter(l => l.next_followup && new Date(l.next_followup) <= new Date());
  const otherLeads = filteredLeads.filter(l => !hotLeads.includes(l) && !todaysFollowups.includes(l));

  const clearDateFilter = () => {
    setDateStart('');
    setDateEnd('');
  };

  const renderLeadSection = (title: string, icon: React.ReactNode, leadList: Lead[]) => {
    if (leadList.length === 0) return null;
    return (
      <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="flex items-center gap-3 mb-6 md:mb-8 text-xl md:text-2xl font-extrabold tracking-tight text-white/90">
          {icon} {title}
          <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 rounded-full text-[10px] md:text-xs font-bold">
            {leadList.length}
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {leadList.map(lead => (
            <LeadCard key={lead.id} lead={lead} onUpdate={handleLeadUpdate} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 md:py-10 lg:py-16">
      {/* Premium Navigation Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 mb-10 md:mb-16 pb-6 md:pb-8 border-b border-white/5">
        <div className="flex items-center gap-3 md:gap-4 group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-transform group-hover:scale-110">
            <Zap className="text-white w-5 h-5 md:w-6 md:h-6" fill="white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">LeadGen<span className="text-indigo-500">AI</span></h1>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 mt-0.5">Automated Intelligence</p>
          </div>
        </div>

        <nav className="flex items-center bg-slate-900/50 p-1 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setTab('crm')} 
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all whitespace-nowrap ${tab === 'crm' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setTab('followups')} 
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all whitespace-nowrap ${tab === 'followups' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Follow-ups
          </button>
        </nav>
      </header>

      {/* Hero Command Search Bar */}
      <section className="mb-10 md:mb-12">
        <form onSubmit={handleSearch} className="glass-panel p-1.5 md:p-2 rounded-[24px] md:rounded-[28px] overflow-hidden flex flex-col lg:flex-row gap-2 shadow-2xl">
          <div className="flex-1 flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="w-full flex items-center px-4 md:px-6 py-3 md:py-4">
              <Briefcase className="text-slate-500 shrink-0 w-4.5 h-4.5 md:w-5 md:h-5" />
              <input 
                type="text" 
                placeholder="Business Type" 
                className="w-full bg-transparent border-none text-white px-3 md:px-4 focus:outline-none placeholder:text-slate-600 font-medium text-sm md:text-base" 
                value={business}
                onChange={e => setBusiness(e.target.value)}
                required
              />
            </div>
            <div className="w-full flex items-center px-4 md:px-6 py-3 md:py-4">
              <MapPin className="text-slate-500 shrink-0 w-4.5 h-4.5 md:w-5 md:h-5" />
              <input 
                type="text" 
                placeholder="City or Location" 
                className="w-full bg-transparent border-none text-white px-3 md:px-4 focus:outline-none placeholder:text-slate-600 font-medium text-sm md:text-base" 
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 md:px-10 py-4 md:py-5 rounded-[18px] md:rounded-[22px] font-black text-xs md:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-4.5 h-4.5 md:w-5 md:h-5" /> : <Search className="w-4.5 h-4.5 md:w-5 md:h-5" />}
            <span>Find Leads</span>
          </button>
        </form>
      </section>

      {/* Refined Filters Toolbar */}
      <div className="flex flex-col gap-4 mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 bg-slate-900/30 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white/5">
          <div className="flex flex-wrap items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 md:gap-3 border-r border-white/10 pr-4 md:pr-6">
              <Filter className="text-indigo-400 w-3.5 h-3.5 md:w-4 md:h-4" />
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-transparent text-xs md:text-sm font-bold text-slate-300 focus:outline-none cursor-pointer hover:text-white"
              >
                <option value="All">All Leads</option>
                {['New', 'Contacted', 'Interested', 'Follow-up', 'Closed'].map(s => (
                  <option key={s} value={s} className="bg-slate-900">{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <ArrowUpDown className="text-indigo-400 w-3.5 h-3.5 md:w-4 md:h-4" />
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value as 'score' | 'newest' | 'followup')}
                className="bg-transparent text-xs md:text-sm font-bold text-slate-300 focus:outline-none cursor-pointer hover:text-white"
              >
                <option value="score" className="bg-slate-900">Score</option>
                <option value="newest" className="bg-slate-900">Recent</option>
                <option value="followup" className="bg-slate-900">Follow-up</option>
              </select>
            </div>

            <button 
              onClick={() => setShowHotOnly(!showHotOnly)}
              className={`px-4 md:px-5 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border ${
                showHotOnly 
                ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              🔥 Hot Only
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-wrap items-center gap-2 bg-slate-800/40 p-1.5 rounded-xl border border-white/5">
              <CalendarIcon size={14} className="text-slate-500 ml-1.5" />
              <input 
                type="date" 
                value={dateStart}
                onChange={e => setDateStart(e.target.value)}
                className="bg-transparent text-[10px] md:text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
              />
              <span className="text-slate-600">-</span>
              <input 
                type="date" 
                value={dateEnd}
                onChange={e => setDateEnd(e.target.value)}
                className="bg-transparent text-[10px] md:text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
              />
              {(dateStart || dateEnd) && (
                <button onClick={clearDateFilter} className="text-slate-500 hover:text-white ml-1">
                  <XCircle size={14} />
                </button>
              )}
            </div>
            <div className="hidden xl:block text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] whitespace-nowrap">
              {filteredLeads.length} leads matching
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 md:py-40 gap-6 md:gap-8">
            <div className="relative">
              <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-indigo-600/20 border-t-indigo-500 rounded-full animate-spin" />
              <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
            </div>
            <p className="text-slate-400 font-bold tracking-widest text-[9px] md:text-[10px] uppercase text-center">Indexing real-time lead data...</p>
          </div>
        ) : filteredLeads.length > 0 ? (
          <>
            {tab === 'crm' ? (
              <>
                {renderLeadSection('Hot Prospects', <span className="text-2xl md:text-3xl">🔥</span>, hotLeads)}
                {renderLeadSection('Follow-ups Today', <Bell className="text-yellow-500 w-5 h-5 md:w-6 md:h-6" />, todaysFollowups)}
                {renderLeadSection('Lead Repository', <Database className="text-indigo-400 w-5 h-5 md:w-6 md:h-6" />, otherLeads)}
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-32">
                {filteredLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onUpdate={handleLeadUpdate} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-[32px] md:rounded-[40px] py-24 md:py-32 text-center px-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-800 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
              <Search className="text-slate-600 w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-xl md:text-2xl font-black mb-2 text-white/90">No Leads Found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">Try adjusting your search, filters, or date range to see results.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

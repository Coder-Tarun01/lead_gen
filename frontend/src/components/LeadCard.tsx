import React, { useState } from 'react';
import { Phone, MessageCircle, Star, Clock, ChevronDown, Plus, X, MapPin } from 'lucide-react';
import { updateLead } from '../api';
import type { Lead } from '../api';

interface LeadCardProps {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
}

const statusOptions = ["New", "Contacted", "Interested", "Follow-up", "Closed", "Not Interested"];

const LeadCard: React.FC<LeadCardProps> = ({ lead, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');
  const [nextFollowup, setNextFollowup] = useState(lead.next_followup ? lead.next_followup.split('T')[0] : '');

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updated = await updateLead(lead.id, { status: newStatus });
      onUpdate(updated);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const updated = await updateLead(lead.id, { 
        notes, 
        next_followup: nextFollowup ? new Date(nextFollowup).toISOString() : undefined 
      });
      onUpdate(updated);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update notes", error);
    }
  };

  const isFollowupDue = lead.next_followup && new Date(lead.next_followup) <= new Date();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Closed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Follow-up': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Interested': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Contacted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-800/50 text-slate-400 border-white/5';
    }
  };

  return (
    <div className={`glass-card p-5 md:p-6 flex flex-col h-full rounded-[28px] md:rounded-[32px] group relative ${isFollowupDue ? 'ring-2 ring-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'hover:border-indigo-500/30 hover:shadow-indigo-500/10'}`}>
      {/* Top Header - Title and Badges */}
      <div className="flex justify-between items-start mb-4 md:mb-6 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-white tracking-tight leading-7 truncate group-hover:text-indigo-400 transition-colors">
            {lead.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
              <Star className="text-amber-500 w-2.5 h-2.5 md:w-3 md:h-3" fill="#eab308" />
              <span className="text-[10px] md:text-xs font-bold text-white">{lead.rating || '0.0'}</span>
            </div>
            <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-slate-500">
               {lead.reviews || 0} reviews
            </span>
          </div>
        </div>
        
        {lead.score >= 5 && (
          <div className={`shrink-0 px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black tracking-widest uppercase border ${lead.score >= 8 ? 'bg-rose-500 text-white border-rose-400 shadow-[0_5px_15px_rgba(244,63,94,0.4)]' : 'bg-orange-500 text-white border-orange-400 shadow-[0_5px_15px_rgba(249,115,22,0.4)]'}`}>
            {lead.score >= 8 ? 'Hot' : 'Warm'}
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="space-y-4 md:space-y-5 flex-1 pb-4 md:pb-6 mb-4 md:mb-6 border-b border-white/5">
        <div className="flex gap-2 md:gap-3 items-start opacity-70 group-hover:opacity-100 transition-opacity">
           <MapPin className="text-slate-500 shrink-0 mt-0.5 w-3.5 h-3.5 md:w-4 md:h-4" />
           <p className="text-xs md:text-[13px] text-slate-300 leading-relaxed font-medium line-clamp-2">
             {lead.address || 'Address not listed'}
           </p>
        </div>

        {lead.phone && (
          <div className="flex items-center gap-3 bg-white/5 p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
               <Phone className="text-indigo-400 w-3 h-3 md:w-3.5 md:h-3.5" />
            </div>
            <span className="text-[12px] md:text-sm font-bold tracking-wider text-indigo-100">{lead.phone}</span>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="space-y-4">
        {/* Status Dropdown Refined */}
        <div className="flex items-center justify-between">
          <div className={`relative flex items-center gap-2 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors ${getStatusColor(lead.status)}`}>
            <select 
              value={lead.status} 
              onChange={(e) => handleStatusChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
              {statusOptions.map(opt => <option key={opt} value={opt} className="bg-slate-900 text-white">{opt}</option>)}
            </select>
            <span className="whitespace-nowrap">{lead.status}</span>
            <ChevronDown className="opacity-50 w-2.5 h-2.5 md:w-3 md:h-3" />
          </div>

          {isFollowupDue && (
            <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest">
               <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-amber-500 rounded-full animate-ping" />
               <span className="whitespace-nowrap">Due Now</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {lead.phone && (
            <>
              <a href={`tel:${lead.phone}`} className="w-full bg-white text-slate-900 h-9 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold transition-all hover:bg-slate-100 active:scale-95 shadow-md no-underline">
                <Phone className="w-3 h-3 md:w-3.5 md:h-3.5" fill="currentColor" />
                <span>Call</span>
              </a>
              <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] text-white h-9 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold transition-all hover:bg-[#22c35e] active:scale-95 shadow-md no-underline">
                <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>WhatsApp</span>
              </a>
            </>
          )}
        </div>

        {/* Logging / Notes Section */}
        <div className="mt-2 md:mt-4">
          {!isEditing ? (
            <div className="space-y-2 md:space-y-3">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-[10px] md:text-[11px] font-black text-indigo-400/80 hover:text-indigo-400 uppercase tracking-widest transition-colors bg-transparent border-none p-0 cursor-pointer"
              >
                <div className="w-6 h-6 md:w-7 md:h-7 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </div>
                {lead.notes ? 'Update Report' : 'Quick Update'}
              </button>
              {lead.notes && (
                <div className="p-3 md:p-4 bg-white/[0.03] rounded-xl md:rounded-2xl border border-white/5 transition-colors">
                  <p className="text-[11px] md:text-[12px] text-slate-400 italic leading-relaxed line-clamp-2">
                    "{lead.notes}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 md:p-4 bg-slate-900 border border-indigo-500/30 rounded-2xl md:rounded-3xl animate-in zoom-in-95 duration-200">
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-transparent border-none text-xs md:text-sm text-white placeholder:text-slate-600 focus:outline-none min-h-[80px] md:min-h-[100px] leading-relaxed"
                placeholder="Log activity..."
                autoFocus
              />
              <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Clock className="text-slate-500 w-3 h-3 md:w-3.5 md:h-3.5" />
                  <input 
                    type="date" 
                    value={nextFollowup} 
                    onChange={(e) => setNextFollowup(e.target.value)}
                    className="bg-transparent text-[10px] font-bold text-slate-400 focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="flex gap-1.5 md:gap-2">
                  <button onClick={() => setIsEditing(false)} className="p-1.5 md:p-2 text-slate-500 hover:bg-white/5 rounded-lg transition-colors bg-transparent border-none cursor-pointer">
                    <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                  <button onClick={handleSaveNotes} className="px-4 py-1.5 md:px-5 md:py-2 bg-indigo-600 text-white rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all hover:bg-indigo-500 uppercase tracking-widest shadow-lg">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadCard;

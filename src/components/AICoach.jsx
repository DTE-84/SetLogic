import React from 'react';
import { Bot, ShoppingBag, Utensils, ArrowRight, Sparkles } from 'lucide-react';

const AICoach = () => {
  return (
    <div className="ai-coach-planning-node grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {/* Meal Coach */}
      <div className="coach-card p-8 rounded-2xl bg-surface-elevated border border-white/5 relative overflow-hidden group flex flex-col h-full">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Algorithmic Meal Coach</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Real-time Recalibration</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,217,255,0.1)]">
            <Bot size={24} />
          </div>
        </div>

        <div className="space-y-4 mb-8 flex-1">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-[12px] font-medium text-muted-foreground italic leading-relaxed">
            "Based on your 7-day vault history, increasing protein by 15g at lunch will optimize your muscle mass trajectory."
          </div>
        </div>

        <button className="flex justify-between items-center w-full py-4 px-5 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-white/[0.06] transition-all group/btn">
          <span>Nova AI Analysis</span>
          <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Inventory Planner */}
      <div className="coach-card p-8 rounded-2xl bg-surface-elevated border border-white/5 relative overflow-hidden group flex flex-col h-full">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />

        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Inventory Planner</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Pantry Manifest Engine</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 flex-1 content-start">
           {['Steak', 'Broccoli', 'Eggs', 'Rice'].map(item => (
             <span key={item} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
               {item}
             </span>
           ))}
           <span className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-500 uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:bg-purple-500/20 transition-colors">
             <Sparkles size={12} />
             Add New
           </span>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <Utensils size={14} className="text-purple-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Suggested: Beef Stir Fry</span>
           </div>
           <ArrowRight size={14} className="text-purple-500/50" />
        </div>
      </div>
    </div>
  );
};

export default AICoach;

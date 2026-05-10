import React from 'react';
import { Bot, ShoppingBag, Utensils, ArrowRight, Sparkles } from 'lucide-react';

const AICoach = () => {
  return (
    <div className="ai-coach-planning-node grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Meal Coach */}
      <div className="coach-card p-8 rounded-[32px] bg-surface-elevated border border-white/5 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Algorithmic Meal Coach</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Real-time Recalibration</p>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] font-medium text-muted-foreground italic leading-relaxed">
            "Based on your 7-day vault history, increasing protein by 15g at lunch will optimize your muscle mass trajectory."
          </div>
        </div>

        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-4 transition-all">
          <span>Nova AI Analysis</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Inventory Planner */}
      <div className="coach-card p-8 rounded-[32px] bg-surface-elevated border border-white/5 relative overflow-hidden group">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Inventory Planner</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Pantry Manifest Engine</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
           {['Steak', 'Broccoli', 'Eggs', 'Rice'].map(item => (
             <span key={item} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
               {item}
             </span>
           ))}
           <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-500 uppercase tracking-widest flex items-center gap-1">
             <Sparkles size={10} />
             Add New
           </span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10">
           <div className="flex items-center gap-3">
              <Utensils size={14} className="text-purple-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Suggested: Beef Stir Fry</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;

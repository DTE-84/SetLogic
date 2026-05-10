import React from 'react';
import { Brain, Star, Info } from 'lucide-react';

const NutritionalMatrix = ({ meals = [] }) => {
  // Mock nutritional extraction from meal names or simple logic
  // In a real app, this would come from a DB with full micronutrient data
  const calculateScore = () => {
    let vitamins = 0;
    let minerals = 0;
    let fiber = 0;
    let sugars = 0;

    meals.forEach(meal => {
      const name = meal.name.toLowerCase();
      if (name.includes('broccoli') || name.includes('spinach') || name.includes('kale')) {
        vitamins += 25;
        fiber += 15;
      }
      if (name.includes('steak') || name.includes('chicken') || name.includes('egg')) {
        minerals += 20;
      }
      if (name.includes('sugar') || name.includes('soda') || name.includes('candy')) {
        sugars += 30;
      }
      if (name.includes('apple') || name.includes('berry') || name.includes('fruit')) {
        vitamins += 15;
        fiber += 10;
      }
    });

    const total = Math.min(vitamins + minerals + fiber - sugars + 50, 100);
    return {
      score: Math.max(total, 0),
      vitamins: Math.min(vitamins, 100),
      minerals: Math.min(minerals, 100),
      fiber: Math.min(fiber, 100),
      sugars: Math.min(sugars, 100)
    };
  };

  const matrix = calculateScore();

  return (
    <div className="nutritional-matrix-card p-8 rounded-[32px] bg-surface-elevated border border-white/5">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-black tracking-tighter uppercase">Nutritional Scoring Matrix</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Advanced Biometric Feed Analysis</p>
        </div>
        <div className="intelligence-badge flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Brain size={14} className="text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase">Intelligence Score: {matrix.score}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="matrix-row">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
            <span>Vitamins & Micros</span>
            <span>{matrix.vitamins}%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${matrix.vitamins}%` }} />
          </div>
        </div>

        <div className="matrix-row">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
            <span>Essential Minerals</span>
            <span>{matrix.minerals}%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${matrix.minerals}%` }} />
          </div>
        </div>

        <div className="matrix-row">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
            <span>Dietary Fiber</span>
            <span>{matrix.fiber}%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-success transition-all duration-1000" style={{ width: `${matrix.fiber}%` }} />
          </div>
        </div>

        <div className="matrix-row">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
            <span>Refined Sugars</span>
            <span className={matrix.sugars > 50 ? 'text-error' : 'text-muted-foreground'}>{matrix.sugars}%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-error transition-all duration-1000" style={{ width: `${matrix.sugars}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
        <Info size={14} className="text-muted-foreground" />
        <p className="text-[9px] font-medium text-muted-foreground italic leading-relaxed">
          Nova AI analyzes your vault history to aggregate micro-density and glycemic load into a unified quality score.
        </p>
      </div>
    </div>
  );
};

export default NutritionalMatrix;

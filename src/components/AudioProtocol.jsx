import React, { useState } from 'react';
import { Mic, Loader2, Volume2, CheckCircle2, Zap } from 'lucide-react';

const AudioProtocol = ({ onProcessed }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    
    // Simulate voice capture
    setTimeout(() => {
      setTranscript('10oz steak and broccoli');
      setIsListening(false);
      processTranscript('10oz steak and broccoli');
    }, 3000);
  };

  const processTranscript = (text) => {
    setProcessing(true);
    
    // Simulate AI extraction
    setTimeout(() => {
      const extracted = {
        name: 'Steak & Broccoli (Audio Entry)',
        calories: 650,
        protein: 62,
        carbs: 12,
        fat: 38,
        servings: 1,
        timestamp: new Date()
      };
      
      setProcessing(false);
      if (onProcessed) onProcessed(extracted);
    }, 2000);
  };

  return (
    <div className="audio-protocol-node p-8 rounded-[32px] bg-surface-elevated border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Mic size={48} className="text-primary" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isListening ? 'bg-error animate-pulse' : 'bg-primary/10'}`}>
             <Mic size={18} className={isListening ? 'text-white' : 'text-primary'} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Live Listen Interface</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Audio Protocol Node v2.0</p>
          </div>
        </div>

        {isListening ? (
          <div className="h-24 flex flex-col items-center justify-center text-center">
             <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1 bg-primary rounded-full animate-bounce" style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
             </div>
             <p className="text-[10px] font-black uppercase text-primary animate-pulse">Capturing Audio Feed...</p>
          </div>
        ) : processing ? (
          <div className="h-24 flex flex-col items-center justify-center">
             <Loader2 size={24} className="animate-spin text-primary mb-3" />
             <p className="text-[10px] font-black uppercase text-muted-foreground">Nova Processing Transcript...</p>
             <p className="text-xs font-medium text-white italic mt-1">"{transcript}"</p>
          </div>
        ) : (
          <div className="h-24 flex flex-col justify-center">
             <button 
               onClick={startListening}
               className="w-full py-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] transition-all flex items-center justify-center gap-3 group/btn"
             >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                   <Volume2 size={16} className="text-primary" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white">Initialize Voice Log</span>
             </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Surgical Extraction Active</span>
           </div>
           <div className="flex items-center gap-2 text-success">
              <CheckCircle2 size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Protocol Sync: Ready</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AudioProtocol;

import React from 'react';
import { Brain, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import type { GeminiResponse } from '@/lib/gemini';
import { motion } from 'framer-motion';

interface FeedbackDisplayProps {
  response: GeminiResponse | null;
  isProcessing: boolean;
  error: string | null;
}

export function FeedbackDisplay({ response, isProcessing, error }: FeedbackDisplayProps) {
  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-500 space-y-4 border border-neutral-800 bg-neutral-900/50 border-dashed">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-sm uppercase tracking-widest animate-pulse">Analyzing your rambling...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-red-500 space-y-4 border border-red-900/30 bg-red-950/10">
        <AlertTriangle className="w-12 h-12" />
        <p className="font-bold text-center">{error}</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-600 space-y-4 border border-neutral-800 bg-neutral-900/20">
        <Brain className="w-12 h-12 opacity-20" />
        <p className="font-mono text-xs uppercase tracking-widest opacity-50 text-center max-w-[200px]">
          Waiting for input...<br/>Upload images & Explain what you know
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
    >
      {/* Score Card */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CheckCircle2 className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1 block">Score</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-6xl font-display font-bold ${response.score > 70 ? 'text-primary' : 'text-red-500'}`}>
              {response.score}
            </span>
            <span className="text-neutral-500 font-display text-xl">/100</span>
          </div>
          <p className="text-neutral-400 mt-2 text-sm italic border-l-2 border-primary pl-3 py-1">
            "{response.summary}"
          </p>
        </div>
      </div>

      {/* Missed Topics */}
      {response.missed_topics.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-neutral-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" /> You Missed This
          </h4>
          {response.missed_topics.map((topic, i) => (
            <div key={i} className="bg-neutral-900/50 border border-neutral-800 p-4 hover:bg-neutral-900 transition-colors">
              <span className="text-red-400 font-bold block mb-1 text-sm uppercase">{topic.topic}</span>
              <p className="text-neutral-400 text-sm leading-relaxed">{topic.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Feedback */}
      <div>
        <h4 className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
          <FileText className="w-3 h-3" /> The Breakdown
        </h4>
        <div className="bg-neutral-900 p-5 border border-neutral-800 text-neutral-300 text-sm leading-7">
          {response.detailed_feedback}
        </div>
      </div>
    </motion.div>
  );
}

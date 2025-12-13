import React, { useMemo } from 'react';
import { Brain, AlertTriangle, CheckCircle2, FileText, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import type { GeminiResponse } from '@/lib/gemini';
import { motion } from 'framer-motion';

interface FeedbackDisplayProps {
  response: GeminiResponse | null;
  isProcessing: boolean;
  error: string | null;
  onExpandFullscreen?: () => void;
}

export function FeedbackDisplay({ response, isProcessing, error, onExpandFullscreen }: FeedbackDisplayProps) {

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 space-y-8 relative bg-black/80 backdrop-blur-sm">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 z-0" />

        {/* Bigger animated dots */}
        <div className="flex items-center gap-4 relative z-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -16, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.4, delay: i * 0.2, repeat: Infinity }}
              className="w-4 h-12 bg-gradient-to-t from-primary to-primary/60 rounded-full"
            />
          ))}
        </div>

        <p className="text-neutral-400 text-sm animate-pulse relative z-10">Analyzing your brilliance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-black text-red-400 space-y-6">
        <AlertTriangle className="w-16 h-16 stroke-1" />
        <p className="text-xl font-medium text-center max-w-md leading-relaxed">{error}</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 space-y-8 bg-black">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="relative bg-neutral-900 border border-yellow-400/30 rounded-full p-6">
            <Lightbulb className="w-12 h-12 text-yellow-400" />
          </div>
        </motion.div>

        <div className="flex justify-center gap-1 pt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-yellow-400 rounded-full"
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-neutral-400 text-sm"
        >
          Record and analyze to begin
        </motion.p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 h-full overflow-y-auto pr-4 pb-8 custom-scrollbar"
    >
      {/* Expand Button - Only show in side panel, not in fullscreen */}
      {onExpandFullscreen && (
        <div className="flex justify-end">
          <button
            onClick={onExpandFullscreen}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white"
            title="Expand to fullscreen"
            data-testid="button-expand-feedback"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6v12h12v-4m4-8v8m0 0V6m0 8H6" />
            </svg>
          </button>
        </div>
      )}

      {/* Score Section - Interactive */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-black border-2 border-yellow-400 rounded-[2rem] p-8 relative overflow-hidden cursor-default"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col items-center text-center gap-2">
          <span className="text-yellow-400 text-sm font-bold uppercase tracking-widest">Score</span>
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="text-[8rem] leading-none font-bold tracking-tighter text-yellow-400 relative"
          >
            {response.score}
            <span className="text-2xl text-neutral-500 absolute top-8 -right-8 font-normal">/100</span>
          </motion.div>
          <p className="text-xl text-neutral-300 mt-4 font-medium max-w-lg leading-relaxed">
            "{response.summary}"
          </p>
        </div>
      </motion.div>

      {/* Feedback & Missed Topics */}
      <div className="grid gap-6">
        <motion.div 
          whileHover={{ x: 4 }}
          className="minimal-card p-8 cursor-default hover:bg-neutral-900/40 transition-colors"
        >
          <h4 className="text-neutral-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" /> The Breakdown
          </h4>
          <p className="text-lg text-neutral-300 leading-8 font-light">
            {response.detailed_feedback}
          </p>
        </motion.div>

        {response.missed_topics.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="minimal-card p-8 bg-red-500/5 border-red-500/10 hover:bg-red-500/10 transition-colors"
          >
            <h4 className="text-red-400 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Missed Concepts
            </h4>
            <div className="space-y-4">
              {response.missed_topics.map((topic, i) => (
                <motion.div 
                  key={i} 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 8, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                  className="bg-neutral-900/50 rounded-xl p-5 border border-red-500/10 cursor-default transition-all"
                >
                  <span className="text-white font-bold block mb-2 text-lg">{topic.topic}</span>
                  <p className="text-neutral-400 text-base leading-relaxed">{topic.explanation}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {response.missed_topics.length === 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center"
          >
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-300 font-medium text-lg">Perfect execution! No missed concepts.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

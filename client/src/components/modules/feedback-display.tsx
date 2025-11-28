import React from 'react';
import { Brain, AlertTriangle, CheckCircle2, FileText, Sparkles, ArrowRight } from 'lucide-react';
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
      <div className="h-full flex flex-col items-center justify-center p-12">
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
              className="w-2 h-8 bg-gradient-to-t from-primary to-primary/50 rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-red-500 space-y-6">
        <AlertTriangle className="w-16 h-16 stroke-1" />
        <p className="text-xl font-medium text-center max-w-md leading-relaxed">{error}</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 rounded-full border-2 border-transparent border-t-primary border-r-primary mb-6"
        />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 h-full overflow-y-auto pr-4 pb-8 custom-scrollbar"
    >
      {/* Score Section - BIGGER */}
      <div className="bg-neutral-900/50 rounded-[2rem] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col items-center text-center gap-2">
          <span className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Score</span>
          <div className="text-[8rem] leading-none font-bold tracking-tighter text-white relative">
            {response.score}
            <span className="text-2xl text-neutral-600 absolute top-8 -right-8 font-normal">/100</span>
          </div>
          <p className="text-xl text-neutral-300 mt-4 font-medium max-w-lg leading-relaxed">
            "{response.summary}"
          </p>
        </div>
      </div>

      {/* Feedback & Missed Topics */}
      <div className="grid gap-6">
        <div className="minimal-card p-8">
          <h4 className="text-neutral-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" /> The Breakdown
          </h4>
          <p className="text-lg text-neutral-300 leading-8 font-light">
            {response.detailed_feedback}
          </p>
        </div>

        {response.missed_topics.length > 0 && (
          <div className="minimal-card p-8 bg-red-500/5 border-red-500/10">
            <h4 className="text-red-400 text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Missed Concepts
            </h4>
            <div className="space-y-4">
              {response.missed_topics.map((topic, i) => (
                <div key={i} className="bg-neutral-900/50 rounded-xl p-5 border border-red-500/10">
                  <span className="text-white font-bold block mb-2 text-lg">{topic.topic}</span>
                  <p className="text-neutral-400 text-base leading-relaxed">{topic.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

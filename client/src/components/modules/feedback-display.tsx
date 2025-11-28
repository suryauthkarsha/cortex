import React, { useMemo } from 'react';
import { Brain, AlertTriangle, CheckCircle2, FileText, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import type { GeminiResponse } from '@/lib/gemini';
import { motion } from 'framer-motion';

interface FeedbackDisplayProps {
  response: GeminiResponse | null;
  isProcessing: boolean;
  error: string | null;
}

const MOTIVATIONAL_QUOTES = [
  "What would your future self think if he saw you right now, making excuses?",
  "You made a promise to yourself. Are you keeping it, or are you lying?",
  "The grind doesn't stop. Your competition isn't studying—are you?",
  "Comfort is the death of greatness. Push through the pain.",
  "You want it? Then act like you want it. Stop talking, start suffering.",
  "Every day you don't improve is a day someone else is beating you.",
  "Arrogance is a luxury you can't afford. Dominate through relentless effort.",
  "You're not tired. You're just mentally weak. Break through it.",
  "The world doesn't care about your excuses. It cares about results.",
  "Stay hard. The moment you get comfortable is the moment you start losing.",
  "Callus your mind. Embrace the struggle. That's where champions are made.",
  "Your potential is a lie if you're not willing to bleed for it.",
  "Forget motivation. Build discipline and never stop grinding.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "You're gonna die. Make sure you earned it on the way."
];

export function FeedbackDisplay({ response, isProcessing, error }: FeedbackDisplayProps) {
  const randomQuote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }, []);

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 space-y-8 relative">
        {/* Dark quote background */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Dark overlay behind quote */}
          <div className="absolute w-96 h-48 bg-neutral-950/60 rounded-2xl blur-2xl -z-10" />
          <p className="text-xl font-light text-neutral-600 text-center max-w-md italic px-8 py-6 relative z-0">
            "{randomQuote}"
          </p>
        </div>

        {/* Progress bar foreground */}
        <motion.div
          className="w-64 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Progress bar background */}
          <div className="bg-neutral-800/50 border border-white/10 rounded-full h-2 overflow-hidden">
            {/* Animated progress fill */}
            <motion.div
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
            />
          </div>

          {/* Percentage text */}
          <motion.div
            className="text-center mt-4"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span
              className="text-2xl font-bold text-primary"
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              100%
            </motion.span>
          </motion.div>
        </motion.div>

        <p className="text-neutral-400 text-sm animate-pulse relative z-10">Analyzing your brilliance...</p>
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
      <div className="h-full flex flex-col items-center justify-center p-12 space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative bg-neutral-900/40 border border-primary/20 rounded-full p-6">
            <Lightbulb className="w-12 h-12 text-primary/60" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-3 max-w-md opacity-100"
        >
          <p className="text-2xl font-light text-white leading-relaxed italic">
            "{randomQuote}"
          </p>
          <div className="flex justify-center gap-1 pt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-primary rounded-full"
              />
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-neutral-500 text-sm"
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
      {/* Score Section - Interactive */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-neutral-900/50 rounded-[2rem] p-8 relative overflow-hidden cursor-default hover:border-primary/30 border border-transparent transition-colors"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col items-center text-center gap-2">
          <span className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Score</span>
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="text-[8rem] leading-none font-bold tracking-tighter text-white relative"
          >
            {response.score}
            <span className="text-2xl text-neutral-600 absolute top-8 -right-8 font-normal">/100</span>
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

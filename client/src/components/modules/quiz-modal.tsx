import React from 'react';
import { X, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { QuizQuestion } from '@/lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizQuestion[] | null;
  currentQuestion: number;
  quizScore: number;
  selectedOption: number | null;
  quizCompleted: boolean;
  handleQuizAnswer: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion?: () => void; // Added optional previous handler
}

export function QuizModal({
  isOpen,
  onClose,
  quiz,
  currentQuestion,
  quizScore,
  selectedOption,
  quizCompleted,
  handleQuizAnswer,
  nextQuestion,
  prevQuestion
}: QuizModalProps) {
  if (!isOpen || !quiz) return null;

  const question = quiz[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel w-full max-w-3xl relative rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
             <h3 className="text-2xl font-bold text-white tracking-tight">Knowledge Check</h3>
             <p className="text-neutral-400 text-sm">Test your understanding</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
          {!quizCompleted ? (
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${((currentQuestion) / quiz.length) * 100}%` }}
                  />
                </div>
                <span className="text-primary font-mono text-lg font-bold whitespace-nowrap">
                  Q {currentQuestion + 1} <span className="text-neutral-500">/ {quiz.length}</span>
                </span>
              </div>
              
              <h4 className="text-2xl text-white mb-8 font-medium leading-relaxed">
                {question.question}
              </h4>

              <div className="space-y-3 mb-8">
                {question.options.map((option, idx) => {
                  let btnClass = "glass-button border-white/10 text-neutral-300 hover:bg-white/10";
                  
                  if (selectedOption !== null) {
                    if (idx === question.correctAnswer) {
                      btnClass = "bg-green-500/20 border-green-500/50 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                    } else if (idx === selectedOption) {
                      btnClass = "bg-red-500/20 border-red-500/50 text-red-200";
                    } else {
                      btnClass = "opacity-40 border-transparent";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left p-5 rounded-xl transition-all flex justify-between items-center group relative overflow-hidden ${btnClass}`}
                    >
                      <span className="text-lg relative z-10">{option}</span>
                      {selectedOption !== null && idx === question.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-green-400 relative z-10" />
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {selectedOption !== null && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/5 rounded-xl p-5 border border-white/10 mb-6 overflow-hidden"
                  >
                    <p className="text-md text-neutral-200">
                      <span className="text-primary font-bold uppercase text-xs block mb-2 tracking-widest">Explanation</span>
                      {question.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-32 h-32 mx-auto mb-6 relative flex items-center justify-center">
                 <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                 <CheckCircle2 className="w-24 h-24 text-primary relative z-10" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">Quiz Complete</h2>
              <p className="text-neutral-400 text-lg mb-8">You scored {quizScore} out of {quiz.length}</p>
              
              <div className="w-full bg-white/10 h-4 mb-8 rounded-full overflow-hidden max-w-md mx-auto">
                <div 
                  className="bg-primary h-full transition-all duration-1000 ease-out shadow-[0_0_20px_theme('colors.primary.DEFAULT')]"
                  style={{ width: `${(quizScore / quiz.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-between items-center">
          {!quizCompleted ? (
            <>
              <button 
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="text-neutral-400 hover:text-white disabled:opacity-30 flex items-center gap-2 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              {selectedOption !== null && (
                <button 
                  onClick={nextQuestion}
                  className="bg-primary hover:bg-primary/90 text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                >
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
             <button 
                onClick={onClose}
                className="w-full bg-white text-black hover:bg-neutral-200 font-bold py-4 rounded-xl uppercase tracking-wider transition-colors"
              >
                Close Results
              </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

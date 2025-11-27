import React from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
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
  nextQuestion
}: QuizModalProps) {
  if (!isOpen || !quiz) return null;

  const question = quiz[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-neutral-900 border border-primary/30 w-full max-w-2xl relative shadow-[0_0_50px_rgba(242,192,24,0.1)]"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-neutral-500 hover:text-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="p-8">
          {!quizCompleted ? (
            <>
              <div className="flex justify-between items-end mb-6 border-b border-neutral-800 pb-4">
                <h3 className="text-3xl font-display font-bold text-white tracking-tight uppercase">Street Smarts Check</h3>
                <span className="text-primary font-mono text-xl">Q.{currentQuestion + 1}/{quiz.length}</span>
              </div>
              
              <p className="text-xl text-neutral-200 mb-8 font-medium leading-relaxed">
                {question.question}
              </p>

              <div className="space-y-3 mb-8">
                {question.options.map((option, idx) => {
                  let btnClass = "border-neutral-700 hover:border-primary/50 hover:bg-neutral-800 text-neutral-300";
                  if (selectedOption !== null) {
                    if (idx === question.correctAnswer) btnClass = "bg-green-500/20 border-green-500 text-green-400";
                    else if (idx === selectedOption) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                    else btnClass = "border-neutral-800 opacity-50";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(idx)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left p-5 border rounded-none transition-all flex justify-between items-center group ${btnClass}`}
                    >
                      <span className="text-lg">{option}</span>
                      {selectedOption !== null && idx === question.correctAnswer && <CheckCircle2 className="w-5 h-5" />}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedOption !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-800 p-5 border-l-4 border-primary mb-6"
                  >
                    <p className="text-md text-neutral-300">
                      <span className="text-primary font-bold uppercase text-xs block mb-2 tracking-widest">Look...</span>
                      {question.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedOption !== null && (
                <button 
                  onClick={nextQuestion}
                  className="w-full bg-primary hover:bg-yellow-400 text-black font-bold text-lg py-4 uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  Next Question
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-5xl font-display font-bold text-primary mb-4 uppercase">Quiz Done</h2>
              <p className="text-2xl text-white mb-8">You got {quizScore} out of {quiz.length} right.</p>
              <div className="w-full bg-neutral-800 h-4 mb-8 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-1000 ease-out"
                  style={{ width: `${(quizScore / quiz.length) * 100}%` }}
                />
              </div>
              <p className="text-neutral-400 mb-8">
                {quizScore === quiz.length ? "You're a genius. Get outta here." : 
                 quizScore > quiz.length / 2 ? "Not bad, but you ain't perfect." : 
                 "You kiddin' me? Hit the books."}
              </p>
              <button 
                onClick={onClose}
                className="bg-white hover:bg-neutral-200 text-black font-bold py-3 px-8 uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

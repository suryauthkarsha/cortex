import React, { useState } from 'react';
import { useSpeech } from '@/hooks/use-speech';
import { useMedia } from '@/hooks/use-media';
import { analyzeExplanation, generateQuiz, type QuizQuestion, type GeminiResponse } from '@/lib/gemini';
import { QuizModal } from '@/components/modules/quiz-modal';
import { FeedbackDisplay } from '@/components/modules/feedback-display';
import { Mic, Square, Play, Volume2, VolumeX, Brain, Sparkles, Camera, Upload, X, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  // Hooks
  const { 
    isListening, 
    isSpeaking, 
    transcript, 
    toggleListening, 
    speakText, 
    stopSpeaking,
    error: speechError 
  } = useSpeech();

  const {
    images,
    useCamera,
    setUseCamera,
    videoRef,
    handleFileUpload,
    removeImage,
    error: mediaError
  } = useMedia();

  // App State
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSelfieMode, setIsSelfieMode] = useState(false);

  // Quiz State
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);

  // Actions
  const handleAnalyze = async () => {
    if (images.length === 0 || transcript.length < 10) {
      setError("I need images and some explanation first.");
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const result = await analyzeExplanation(transcript, images);
      setAiResponse(result);
      speakText(`Here's the deal. You scored ${result.score}. ${result.summary}`);
    } catch (err: any) {
      setError("Analysis failed. " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInteraction = () => {
    if (isListening) {
      // Stop listening
      toggleListening();
      // Optional: Could auto-trigger analysis here, but user might want to review or re-record.
      // For "One Big Button" feel, let's make a secondary small button appear for "Analyze" 
      // or make the main button transform.
    } else {
      // Start listening
      toggleListening();
      setAiResponse(null); // Reset previous analysis
    }
  };

  const handleGenerateQuiz = async () => {
    if (images.length === 0) {
      setError("Upload materials first.");
      return;
    }
    setIsQuizLoading(true);
    setError(null);
    try {
      const result = await generateQuiz(images);
      setQuiz(result);
      setCurrentQuestion(0);
      setQuizScore(0);
      setQuizCompleted(false);
      setSelectedOption(null);
      setShowQuizModal(true);
    } catch (err: any) {
      setError("Quiz generation failed. " + err.message);
    } finally {
      setIsQuizLoading(false);
    }
  };

  // Quiz Handlers
  const handleQuizAnswer = (index: number) => {
    if (selectedOption !== null || !quiz) return;
    setSelectedOption(index);
    if (index === quiz[currentQuestion].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (!quiz) return;
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedOption(null); // Reset selection when going back? Or keep state? Simple reset for now.
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden selection:bg-primary/30">
      
      {/* Ambient Background Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">Study<span className="text-primary">Sync</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          {isSpeaking && (
            <button onClick={stopSpeaking} className="glass-button rounded-full p-3 text-primary animate-pulse">
              <VolumeX className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 container mx-auto px-4 py-4 flex flex-col lg:flex-row gap-6 overflow-hidden h-[calc(100vh-100px)]">
        
        {/* LEFT COLUMN: Interaction Area */}
        <div className="lg:w-1/2 flex flex-col gap-6 h-full">
          
          {/* Main "Stage" - Camera or Visualizer */}
          <div className="flex-1 glass-panel rounded-3xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
             {/* Camera Feed */}
             {isSelfieMode && (
               <div className="absolute inset-0 z-0">
                 <video 
                   ref={videoRef} 
                   autoPlay 
                   playsInline 
                   muted
                   className="w-full h-full object-cover opacity-80"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
               </div>
             )}

             {!isSelfieMode && images.length > 0 && (
                <div className="absolute inset-0 p-8 grid place-items-center opacity-30">
                   <img src={images[images.length - 1]} className="max-h-full max-w-full object-contain rounded-lg" alt="Study material" />
                </div>
             )}

             {/* Center Interaction */}
             <div className="relative z-20 flex flex-col items-center gap-8">
                {/* Voice Button */}
                <div className="relative group">
                  {isListening && (
                    <div className="absolute inset-0 bg-red-500/50 rounded-full blur-2xl animate-pulse" />
                  )}
                  <button
                    onClick={handleVoiceInteraction}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                      isListening 
                        ? 'bg-red-500 border-red-400 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.4)]' 
                        : 'glass-panel border-white/20 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                    }`}
                  >
                    {isListening ? (
                      <Square className="w-12 h-12 fill-white text-white" />
                    ) : (
                      <Mic className="w-12 h-12 text-white" />
                    )}
                  </button>
                </div>

                {/* Status Text (Replaces Transcript) */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">
                    {isListening ? "Listening..." : "Tap to Explain"}
                  </h2>
                  <p className="text-neutral-400 text-sm max-w-xs mx-auto">
                    {isListening 
                      ? "Explain the concept in your own words. I'm listening." 
                      : "Record your explanation and I'll grade your understanding."}
                  </p>
                </div>

                {/* Analyze Action (Appears when not listening but has transcript) */}
                <AnimatePresence>
                  {!isListening && transcript.length > 5 && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={handleAnalyze}
                      disabled={isProcessing}
                      className="bg-primary text-black px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    >
                      {isProcessing ? <Sparkles className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                      Analyze Explanation
                    </motion.button>
                  )}
                </AnimatePresence>
             </div>

             {/* Bottom Controls */}
             <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-20">
                <button 
                  onClick={() => {
                    const newState = !isSelfieMode;
                    setIsSelfieMode(newState);
                    setUseCamera(newState);
                  }}
                  className={`p-4 rounded-full border transition-all ${isSelfieMode ? 'bg-white text-black border-white' : 'glass-button text-neutral-400 border-white/10'}`}
                  title="Toggle Camera"
                >
                  {isSelfieMode ? <Video className="w-5 h-5" /> : <Video className="w-5 h-5 opacity-50" />}
                </button>

                <label className="p-4 rounded-full glass-button border-white/10 text-neutral-400 hover:text-white cursor-pointer transition-all">
                  <Upload className="w-5 h-5" />
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
             </div>
          </div>

          {/* Mini Image Strip */}
          {images.length > 0 && (
            <div className="h-24 flex gap-3 overflow-x-auto pb-2 px-2 snap-x">
              {images.map((img, idx) => (
                <div key={idx} className="h-full aspect-square rounded-xl overflow-hidden border border-white/10 relative group shrink-0 snap-center">
                  <img src={img} alt="Mini" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Feedback & Quiz */}
        <div className="lg:w-1/2 h-full">
           <div className="h-full glass-panel rounded-3xl p-6 flex flex-col overflow-hidden relative">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Feedback
                </h3>
                <button 
                  onClick={handleGenerateQuiz}
                  disabled={isQuizLoading || images.length === 0}
                  className="text-xs border border-white/20 text-neutral-300 px-4 py-2 rounded-full hover:bg-white/10 hover:text-white transition-colors font-bold flex items-center gap-2 disabled:opacity-30"
                >
                   {isQuizLoading ? "Generating..." : "Take Pop Quiz"}
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                <FeedbackDisplay 
                  response={aiResponse}
                  isProcessing={isProcessing}
                  error={error}
                />
              </div>
           </div>
        </div>
      </main>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuizModal && (
          <QuizModal 
            isOpen={showQuizModal}
            onClose={() => setShowQuizModal(false)}
            quiz={quiz}
            currentQuestion={currentQuestion}
            quizScore={quizScore}
            selectedOption={selectedOption}
            quizCompleted={quizCompleted}
            handleQuizAnswer={handleQuizAnswer}
            nextQuestion={nextQuestion}
            prevQuestion={prevQuestion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

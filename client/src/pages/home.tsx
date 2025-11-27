import React, { useState } from 'react';
import { useSpeech } from '@/hooks/use-speech';
import { useMedia } from '@/hooks/use-media';
import { analyzeExplanation, generateQuiz, type QuizQuestion, type GeminiResponse } from '@/lib/gemini';
import { QuizModal } from '@/components/modules/quiz-modal';
import { FeedbackDisplay } from '@/components/modules/feedback-display';
import { Mic, Square, Play, Volume2, VolumeX, Brain, Sparkles, Camera, Upload, X, Video, Image as ImageIcon } from 'lucide-react';
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
    if (transcript.length < 10) {
      setError("I need you to explain something first. Start talking.");
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const result = await analyzeExplanation(transcript, images);
      setAiResponse(result);
      speakText(`Alright, here's the score. You got ${result.score}. ${result.summary}`);
    } catch (err: any) {
      setError("Analysis failed. " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInteraction = () => {
    if (isListening) {
      toggleListening();
    } else {
      toggleListening();
      setAiResponse(null); 
    }
  };

  const handleGenerateQuiz = async () => {
    if (images.length === 0) {
      setError("Upload some study material first so I can quiz ya.");
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
      setSelectedOption(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden selection:bg-primary/30 font-sans">
      
      {/* Header */}
      <header className="relative z-10 px-6 py-6 flex justify-between items-center border-b border-white/5 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center skew-x-[-10deg]">
            <Brain className="w-6 h-6 text-black skew-x-[10deg]" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tighter uppercase">
            Study<span className="text-primary">Sync</span> <span className="text-xs text-neutral-500 ml-2 tracking-widest font-sans">NYC EDITION</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {isSpeaking && (
            <button onClick={stopSpeaking} className="bg-neutral-800 rounded-sm p-3 text-primary animate-pulse border border-primary/50">
              <VolumeX className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 flex-1 container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 overflow-hidden h-[calc(100vh-100px)]">
        
        {/* LEFT COLUMN: Uploads & Tools */}
        <div className="lg:w-1/4 flex flex-col gap-4 h-full">
           <div className="glass-panel p-5 flex-1 flex flex-col rounded-sm border-l-4 border-primary">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> Study Materials
              </h3>
              
              {/* Upload Area */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2 custom-scrollbar">
                {images.length === 0 ? (
                  <div className="h-full border-2 border-dashed border-neutral-800 rounded-sm flex flex-col items-center justify-center text-neutral-600 gap-2 p-4 text-center">
                    <Upload className="w-8 h-8 opacity-50" />
                    <p className="text-xs uppercase tracking-wide">Drop images here<br/>or click upload</p>
                  </div>
                ) : (
                  images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video bg-neutral-900 border border-neutral-800 group">
                      <img src={img} alt={`Material ${idx}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <label className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors border border-neutral-700">
                <Upload className="w-4 h-4" />
                Upload Files
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
           </div>
           
           {/* Quiz Trigger */}
           <button 
              onClick={handleGenerateQuiz}
              disabled={isQuizLoading || images.length === 0}
              className="py-6 bg-neutral-900 border border-neutral-800 hover:border-primary/50 text-neutral-300 hover:text-primary transition-all font-display font-bold uppercase text-xl tracking-wide flex items-center justify-center gap-3 disabled:opacity-50 group"
            >
              <Sparkles className="w-5 h-5 group-hover:animate-spin" />
              {isQuizLoading ? "Generating..." : "Pop Quiz"}
           </button>
        </div>

        {/* MIDDLE COLUMN: Interaction Stage */}
        <div className="lg:w-1/2 flex flex-col gap-6 h-full">
          
          <div className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
             {/* Camera Feed Background */}
             {isSelfieMode && (
               <div className="absolute inset-0 z-0">
                 <video 
                   ref={videoRef} 
                   autoPlay 
                   playsInline 
                   muted
                   className="w-full h-full object-cover opacity-60 grayscale contrast-125" 
                 />
                 {/* Scanlines effect */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
               </div>
             )}

             {/* Center Interaction */}
             <div className="relative z-20 flex flex-col items-center gap-8 w-full max-w-md mx-auto px-6">
                
                {/* Main Voice Button */}
                <div className="relative group">
                  {isListening && (
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                  )}
                  <button
                    onClick={handleVoiceInteraction}
                    className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                      isListening 
                        ? 'bg-red-600 border-red-500 scale-110 shadow-[0_0_30px_rgba(220,38,38,0.5)]' 
                        : 'bg-black border-neutral-700 hover:border-primary hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.2)]'
                    }`}
                  >
                    {isListening ? (
                      <Square className="w-16 h-16 fill-white text-white" />
                    ) : (
                      <Mic className="w-16 h-16 text-white" />
                    )}
                  </button>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wide">
                    {isListening ? "Listening..." : "Tap to Explain"}
                  </h2>
                  <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest">
                    {isListening 
                      ? "Go ahead, break it down for me." 
                      : "Hit the button and teach me what you know."}
                  </p>
                </div>

                {/* Camera Toggle */}
                <button 
                  onClick={() => {
                    const newState = !isSelfieMode;
                    setIsSelfieMode(newState);
                    setUseCamera(newState);
                  }}
                  className={`absolute top-[-60px] right-[-20px] lg:static lg:mt-4 p-3 rounded-full border transition-all ${isSelfieMode ? 'bg-primary text-black border-primary' : 'bg-black text-neutral-500 border-neutral-800 hover:border-neutral-600'}`}
                  title="Toggle Camera"
                >
                  {isSelfieMode ? <Video className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
             </div>
          </div>
          
          {/* Analyze Button - Separate Section Below */}
          <div className="h-20 flex items-center justify-center">
             <AnimatePresence>
                {!isListening && transcript.length > 5 && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={handleAnalyze}
                    disabled={isProcessing}
                    className="w-full bg-primary hover:bg-yellow-400 text-black font-display font-bold text-2xl uppercase tracking-wider py-4 rounded-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all"
                  >
                    {isProcessing ? <Sparkles className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
                    Analyze Explanation
                  </motion.button>
                )}
              </AnimatePresence>
          </div>

        </div>

        {/* RIGHT COLUMN: Feedback */}
        <div className="lg:w-1/4 h-full">
           <div className="h-full glass-panel p-1 flex flex-col rounded-sm border-r-4 border-primary overflow-hidden">
              <div className="bg-neutral-900 p-4 border-b border-neutral-800">
                 <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-primary" /> Tutor Feedback
                 </h3>
              </div>
              <div className="flex-1 overflow-hidden p-4">
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

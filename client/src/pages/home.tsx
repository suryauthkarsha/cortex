import React, { useState } from 'react';
import { useSpeech } from '@/hooks/use-speech';
import { useMedia } from '@/hooks/use-media';
import { useAudioVisualizer } from '@/hooks/use-audio-visualizer';
import { analyzeExplanation, generateQuiz, askTutor, type QuizQuestion, type GeminiResponse } from '@/lib/gemini';
import { QuizModal } from '@/components/modules/quiz-modal';
import { FeedbackDisplay } from '@/components/modules/feedback-display';
import { RealtimeClock } from '@/components/modules/realtime-clock';
import { PomodoroTimer } from '@/components/modules/pomodoro-timer';
import { Mic, Square, Play, VolumeX, Sparkles, Upload, X, Video, Image as ImageIcon, MessageCircle, GraduationCap, StopCircle, Brain, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'check' | 'tutor';
type ViewState = 'idle' | 'analyzing' | 'results';

export default function Home() {
  // Hooks
  const { 
    isListening, 
    isSpeaking, 
    transcript, 
    setTranscript,
    toggleListening, 
    speakText, 
    stopSpeaking,
  } = useSpeech();

  const {
    images,
    useCamera,
    setUseCamera,
    videoRef,
    handleFileUpload,
    removeImage,
  } = useMedia();

  const visualizerBars = useAudioVisualizer(isListening);

  // App State
  const [mode, setMode] = useState<Mode>('check');
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<GeminiResponse | null>(null);
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
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
    if (transcript.length < 5) {
      setError("Say something first.");
      return;
    }
    setViewState('analyzing');
    setIsProcessing(true);
    setError(null);

    try {
      const result = await analyzeExplanation(transcript, images);
      setAiResponse(result);
      speakText(`Score: ${result.score}. ${result.summary}`);
      setViewState('results');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze. Please try again.');
      setViewState('idle'); // Reset on error
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTutorChat = async (currentTranscript: string) => {
    if (!currentTranscript.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    try {
       const response = await askTutor(currentTranscript, images);
       setTutorResponse(response);
       speakText(response);
       setTranscript('');
    } catch (err: any) {
      setError(err.message || 'Tutor is busy. Try again.');
      setTutorResponse(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInteraction = () => {
    if (isListening) {
      const currentText = transcript;
      toggleListening();
      
      if (mode === 'tutor' && currentText.trim().length > 0) {
        // Immediately send to tutor when mic is turned off
        setError(null);
        handleTutorChat(currentText);
      }
    } else {
      toggleListening();
      if (mode === 'check') {
        setAiResponse(null); 
      }
    }
  };

  const handleGenerateQuiz = async () => {
    if (images.length === 0) {
      setError("Upload material first.");
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
      setError(err.message || 'Quiz generation failed. Try again.');
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

  const resetView = () => {
    setViewState('idle');
    setAiResponse(null);
    setTranscript('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans selection:bg-white/20">
      
      {/* Header & Nav */}
      <header className="relative z-20 px-8 py-6">
        <div className="flex justify-between items-center gap-8">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">Study<span className="opacity-50">Sync</span></span>
          </div>

          {/* Center: Mode Switcher */}
          <div className="flex bg-neutral-900/50 rounded-full p-1 border border-white/5 backdrop-blur-xl">
            <button 
              onClick={() => { setMode('check'); resetView(); }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'check' ? 'bg-white text-black shadow-lg' : 'text-neutral-400 hover:text-white'}`}
            >
              Check Me
            </button>
            <button 
              onClick={() => { setMode('tutor'); resetView(); }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'tutor' ? 'bg-primary text-black shadow-[0_0_20px_theme("colors.primary.DEFAULT")]' : 'text-neutral-400 hover:text-white'}`}
            >
              Gen Z Tutor
            </button>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-4">
            {isSpeaking && (
              <button onClick={stopSpeaking} className="bg-neutral-800 rounded-full p-3 text-white hover:bg-neutral-700 transition-colors">
                <VolumeX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 container mx-auto px-6 py-4 flex flex-col lg:flex-row gap-8 h-[calc(100vh-100px)]">
        
        {/* LEFT COLUMN: Tools (Collapsible/Minimal) - Hidden in Results Mode */}
        {viewState !== 'results' && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="hidden lg:flex flex-col gap-4 w-20 items-center py-8 bg-neutral-900/30 rounded-full border border-white/5 h-fit self-center backdrop-blur-xl"
          >
             <label className="p-4 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer transition-all relative group">
                <Upload className="w-6 h-6" />
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                <span className="absolute left-14 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none">
                  Upload Material
                </span>
             </label>
             
             <button 
               onClick={() => {
                  const newState = !isSelfieMode;
                  setIsSelfieMode(newState);
                  setUseCamera(newState);
               }}
               className={`p-4 rounded-full transition-all relative group ${isSelfieMode ? 'bg-white text-black' : 'hover:bg-white/10 text-neutral-400 hover:text-white'}`}
             >
                <Video className="w-6 h-6" />
                <span className="absolute left-14 bg-black px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none">
                  Toggle Camera
                </span>
             </button>

             <div className="w-8 h-[1px] bg-white/10 my-2" />

             {images.map((img, idx) => (
               <div key={idx} className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 relative group">
                 <img src={img} alt="" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                 <button onClick={() => removeImage(idx)} className="absolute inset-0 bg-red-500/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <X className="w-4 h-4 text-white" />
                 </button>
               </div>
             ))}
          </motion.div>
        )}

        {/* MIDDLE: Stage - Shrinks/Disappears in Results Mode */}
        {viewState !== 'results' && (
          <div className="flex-1 flex flex-col gap-8 justify-center relative">
             
             {/* Central Visualizer */}
             <div className="relative flex-1 flex flex-col items-center justify-center min-h-[400px]">
                
                {/* Background Layer */}
                <div className="absolute inset-0 rounded-[3rem] overflow-hidden bg-neutral-900/20 border border-white/5">
                   {isSelfieMode && (
                     <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-50" />
                   )}
                   {!isSelfieMode && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                   )}
                </div>

                {/* Voice Button with Visualizer */}
                <div className="relative z-20 flex flex-col items-center gap-8">
                   <div className="relative">
                      {isListening && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
                          {visualizerBars.map((height, idx) => (
                            <motion.div
                              key={idx}
                              className="w-1 bg-gradient-to-t from-red-500 to-red-300 rounded-full"
                              initial={{ height: 4 }}
                              animate={{ height: Math.max(4, (height / 100) * 60) }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          ))}
                        </div>
                      )}
                      <motion.button
                        onClick={handleVoiceInteraction}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 relative ${
                          isListening 
                            ? 'bg-red-500 shadow-[0_0_100px_rgba(239,68,68,0.4)]' 
                            : mode === 'tutor' 
                               ? 'bg-primary text-black shadow-[0_0_60px_rgba(255,215,0,0.2)]' 
                               : 'bg-white text-black shadow-[0_0_60px_rgba(255,255,255,0.1)]'
                        }`}
                      >
                         {isListening ? (
                           <StopCircle className="w-20 h-20 fill-current text-white animate-pulse" />
                         ) : (
                           <Mic className="w-20 h-20" />
                         )}
                      </motion.button>
                   </div>

                   <div className="text-center space-y-2 relative z-20">
                     <h2 className="text-4xl font-bold text-white tracking-tight">
                       {isListening ? "Listening..." : mode === 'tutor' ? "Ask Gen Z Tutor" : "Explain Concept"}
                     </h2>
                     <p className="text-neutral-500 text-lg font-medium">
                       {isListening 
                         ? "I'm all ears." 
                         : mode === 'tutor' 
                           ? "Ask me anything, no cap." 
                           : "Tap to record your explanation."}
                     </p>
                   </div>
                </div>

                {/* Analyze Button (Check Mode) */}
                {!isListening && transcript.length > 5 && mode === 'check' && viewState === 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mt-12 z-30"
                  >
                    <button 
                       onClick={handleAnalyze}
                       disabled={isProcessing}
                       className="bg-white text-black px-10 py-4 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-xl flex items-center gap-3"
                    >
                      {isProcessing ? <Sparkles className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
                      Analyze Now
                    </button>
                  </motion.div>
                )}
             </div>
          </div>
        )}

        {/* RIGHT: Big Feedback Panel OR Expanded Results */}
        <motion.div 
          layout
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            width: viewState === 'results' ? '100%' : undefined, // Expand to full width
            flex: viewState === 'results' ? 1 : undefined
          }}
          className={`h-full flex flex-col transition-all duration-500 ${viewState === 'results' ? 'w-full max-w-4xl mx-auto' : 'lg:w-[400px] xl:w-[500px]'}`}
        >
           {/* Header with Back Button */}
           {mode === 'check' && (
             <div className="flex justify-between items-center mb-6 px-2">
               <div className="flex items-center gap-4">
                  {viewState === 'results' && (
                    <button 
                      onClick={resetView}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                  )}
                  <h3 className="text-lg font-bold text-white">Results</h3>
               </div>
               <button 
                  onClick={handleGenerateQuiz}
                  disabled={isQuizLoading || images.length === 0}
                  className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-30"
               >
                  <GraduationCap className="w-4 h-4" />
                  {isQuizLoading ? "Making Quiz..." : "Pop Quiz"}
               </button>
             </div>
           )}
           
           {/* Main Content Area */}
           <div className="flex-1 bg-neutral-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm flex flex-col relative">
             {mode === 'check' ? (
               <>
                 {/* Loading Overlay */}
                 {viewState === 'analyzing' && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                      <div className="w-16 h-16 border-t-2 border-r-2 border-white rounded-full animate-spin mb-4" />
                      <p className="text-white font-bold animate-pulse">Analyzing your vibes...</p>
                   </div>
                 )}
                 
                 <div className="flex-1 overflow-hidden">
                    <FeedbackDisplay 
                      response={aiResponse}
                      isProcessing={isProcessing && viewState !== 'analyzing'}
                      error={error}
                    />
                 </div>
               </>
             ) : (
               /* Tutor Mode - Chat History */
               <div className="flex-1 p-8 flex flex-col gap-6">
                  <div className="flex-1">
                    {tutorResponse || error ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`p-6 rounded-2xl border ${error && !tutorResponse ? 'bg-red-900/30 border-red-500/30' : 'bg-neutral-800/50 border-white/10'}`}
                      >
                        {tutorResponse && (
                          <>
                            <span className="text-primary text-xs font-bold uppercase tracking-widest mb-3 block">Tutor says:</span>
                            <p className="text-lg text-white leading-relaxed">{tutorResponse}</p>
                          </>
                        )}
                        {error && !tutorResponse && (
                          <p className="text-base text-red-200">{error}</p>
                        )}
                      </motion.div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-center items-center text-center text-neutral-600">
                        <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
                        <p>Your chat history appears here.</p>
                      </div>
                    )}
                  </div>

                  {/* Ask Button */}
                  {!isListening && transcript.length > 0 && !tutorResponse && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleTutorChat(transcript)}
                      disabled={isProcessing}
                      className="w-full bg-primary text-black px-6 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
                    >
                      {isProcessing ? <Sparkles className="w-5 h-5 inline-block animate-spin mr-2" /> : '✨ Ask'}
                    </motion.button>
                  )}
               </div>
             )}

             {/* Pomodoro Timer - Bottom of Results Panel */}
             {(mode === 'check' || mode === 'tutor') && (
               <div className="border-t border-white/5 pt-4 mt-4">
                 <PomodoroTimer />
               </div>
             )}
           </div>
        </motion.div>
        
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

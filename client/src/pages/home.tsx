import React, { useState } from 'react';
import { useSpeech } from '@/hooks/use-speech';
import { useMedia } from '@/hooks/use-media';
import { useAudioVisualizer } from '@/hooks/use-audio-visualizer';
import { analyzeExplanation, generateQuiz, askTutor, generateInfographic, type QuizQuestion, type GeminiResponse, type InfographicData } from '@/lib/gemini';
import { QuizModal } from '@/components/modules/quiz-modal';
import { FeedbackDisplay } from '@/components/modules/feedback-display';
import { RealtimeClock } from '@/components/modules/realtime-clock';
import { PomodoroTimerHeader } from '@/components/modules/pomodoro-timer-header';
import { Mic, Square, Play, VolumeX, Sparkles, Upload, X, Video, Image as ImageIcon, MessageCircle, GraduationCap, StopCircle, Brain, ArrowLeft, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'check' | 'tutor';
type ViewState = 'idle' | 'analyzing' | 'results' | 'infographic';

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
  
  // Infographic State
  const [infographic, setInfographic] = useState<InfographicData | null>(null);
  const [isInfographicLoading, setIsInfographicLoading] = useState(false);

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
        setViewState('idle');
      }
    }
  };

  const handleGenerateInfographic = async () => {
    if (images.length === 0) {
      setError("Upload study material first.");
      return;
    }
    setIsInfographicLoading(true);
    setError(null);
    setViewState('analyzing');
    try {
      const content = aiResponse?.detailed_feedback || "Generate comprehensive study notes from the uploaded material.";
      const result = await generateInfographic(
        "Study Notes",
        content,
        images
      );
      setInfographic(result);
      setViewState('infographic');
    } catch (err: any) {
      setError(err.message || 'Failed to generate infographic.');
      setViewState('idle');
    } finally {
      setIsInfographicLoading(false);
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
    setInfographic(null);
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
            <span className="text-xl font-bold tracking-tight" style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              background: 'linear-gradient(180deg, #FFFFFF 5%, #4a4a4a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
            }}>Cortex</span>
          </div>

          {/* Center: Mode Switcher */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold transition-colors ${mode === 'check' ? 'text-white' : 'text-neutral-500'}`}>Check Me</span>
            <div className="container-toggle">
              <label className="switch">
                <input 
                  className="togglesw" 
                  type="checkbox" 
                  checked={mode === 'tutor'}
                  onChange={(e) => { 
                    setMode(e.target.checked ? 'tutor' : 'check');
                    resetView();
                  }}
                />
                <div className="indicator left"></div>
                <div className="indicator right"></div>
                <div className="button"></div>
              </label>
            </div>
            <span className={`text-xs font-semibold transition-colors ${mode === 'tutor' ? 'text-primary' : 'text-neutral-500'}`}>Gen Z</span>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-4">
            <PomodoroTimerHeader />
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
        {viewState !== 'results' && viewState !== 'infographic' && (
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
        {viewState !== 'results' && viewState !== 'infographic' && (
          <div className="flex-1 flex flex-col gap-8 justify-center relative">
             
             {/* Central Visualizer */}
             <div className="relative flex-1 flex flex-col items-center justify-center min-h-[400px]">
                
                {/* Camera Feed - Glass overlay behind mic */}
                {isSelfieMode && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-[3rem] overflow-hidden backdrop-blur-sm z-10"
                  >
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </motion.div>
                )}

                {/* Background Layer */}
                <div className="absolute inset-0 rounded-[3rem] overflow-hidden bg-neutral-900/20 border border-white/5">
                   {!isSelfieMode && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                   )}
                </div>

                {/* Voice Button with Visualizer */}
                <div className="relative z-20 flex flex-col items-center gap-8 pt-12">
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
                        className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 relative backdrop-blur-md border border-white/30 ${
                          isListening 
                            ? 'bg-red-500/70 shadow-[0_0_80px_rgba(239,68,68,0.6),0_0_40px_rgba(239,68,68,0.4)]' 
                            : 'bg-primary/40 text-black shadow-[0_0_80px_rgba(255,215,0,0.6),0_0_40px_rgba(255,215,0,0.4)]'
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
                     {transcript && (
                       <p className="text-sm text-yellow-400 mt-4 italic">
                         Recording captured • Click below to {mode === 'check' ? 'analyze' : 'ask'}
                       </p>
                     )}
                   </div>

                   {/* Analyze/Ask Buttons */}
                   {transcript && transcript.trim().length > 0 && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="relative z-30 flex gap-4"
                     >
                       {mode === 'check' && (
                         <button 
                           onClick={handleAnalyze}
                           disabled={isProcessing}
                           className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                           data-testid="button-analyze"
                         >
                           {isProcessing ? <Sparkles className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                           Analyze Now
                         </button>
                       )}
                       
                       {mode === 'tutor' && (
                         <button 
                           onClick={() => handleTutorChat(transcript)}
                           disabled={isProcessing}
                           className="bg-primary text-black px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                           data-testid="button-ask-tutor"
                         >
                           {isProcessing ? <Sparkles className="w-5 h-5 animate-spin" /> : '✨ Ask'}
                         </button>
                       )}
                     </motion.div>
                   )}
                </div>
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
            width: (viewState === 'results' || viewState === 'infographic') ? '100%' : undefined,
            flex: (viewState === 'results' || viewState === 'infographic') ? 1 : undefined
          }}
          className={`h-full flex flex-col transition-all duration-500 ${(viewState === 'results' || viewState === 'infographic') ? 'w-full max-w-5xl mx-auto' : 'lg:w-[500px] xl:w-[650px]'}`}
        >
          {/* Camera Preview Box */}
          {isSelfieMode && viewState !== 'results' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/30 h-32 flex-shrink-0"
            >
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex items-center gap-2 text-xs text-red-400 font-semibold bg-black/60 px-2 py-1 rounded">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </div>
            </motion.div>
          )}
           {/* Header with Back Button */}
           {mode === 'check' && (viewState === 'results' || viewState === 'infographic') && (
             <div className="flex items-center gap-4 mb-6 px-2">
                <button 
                  onClick={resetView}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h3 className="text-lg font-bold text-white">{viewState === 'infographic' ? 'Study Notes' : 'Results'}</h3>
             </div>
           )}
           
           {/* Buttons Row - Always Visible at Bottom - Hidden in infographic view */}
           {mode === 'check' && viewState !== 'infographic' && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex gap-4 px-2 pb-4"
             >
               <button 
                 onClick={handleGenerateInfographic}
                 disabled={isInfographicLoading || images.length === 0}
                 className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-2xl hover:shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed relative"
                 data-testid="button-generate-notes"
               >
                 <motion.div
                   animate={!isInfographicLoading && images.length > 0 ? { rotate: [0, 360] } : {}}
                   transition={{ duration: 3, repeat: Infinity }}
                   className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 blur-lg"
                   style={{ zIndex: -1 }}
                 />
                 <Sparkles className="w-5 h-5 animate-pulse" />
                 {isInfographicLoading ? "Generating..." : "Generate Notes"}
               </button>
               <button 
                 onClick={handleGenerateQuiz}
                 disabled={isQuizLoading || images.length === 0}
                 className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-black hover:bg-black/80 text-yellow-400 rounded-full font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-yellow-400"
                 data-testid="button-quiz"
               >
                 <GraduationCap className="w-5 h-5" />
                 {isQuizLoading ? "Making Quiz..." : "Pop Quiz"}
               </button>
             </motion.div>
           )}

           {/* Main Content Area - Infographic/Notes */}
           <div className="flex-1 bg-gradient-to-br from-slate-100 via-slate-50 to-white border border-slate-200 rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-xl">
             {infographic && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex-1 overflow-y-auto space-y-6 p-8 custom-scrollbar"
               >
                 {/* Header */}
                 <div className="flex items-center justify-between mb-4">
                   <button 
                     onClick={() => setInfographic(null)}
                     className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-700"
                   >
                     <ArrowLeft className="w-6 h-6" />
                   </button>
                   <h3 className="text-xl font-bold text-slate-900">Study Notes</h3>
                   <div className="w-6"></div>
                 </div>

                 {/* Main Title */}
                 <div className="mb-8">
                   <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                     {infographic.title}
                   </h2>
                   <p className="text-lg text-slate-600">{infographic.subtitle}</p>
                 </div>

                 {/* Mindmap-style Concepts */}
                 <div className="space-y-6">
                   {infographic.concepts.map((concept, index) => (
                     <motion.div
                       key={index}
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.1 + index * 0.1 }}
                       className="relative"
                     >
                       {/* Connector Line */}
                       {index > 0 && (
                         <div className="absolute left-8 -top-4 w-1 h-4 bg-gradient-to-b from-slate-300 to-transparent"></div>
                       )}
                       
                       <div className="flex gap-6 items-start">
                         {/* Circle Icon */}
                         <div className="flex-shrink-0 relative">
                           <div
                             className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white"
                             style={{ backgroundColor: concept.color }}
                           >
                             {index + 1}
                           </div>
                           {index < infographic.concepts.length - 1 && (
                             <div className="absolute left-8 top-16 w-1 h-8 bg-gradient-to-b from-slate-300 to-slate-200"></div>
                           )}
                         </div>
                         
                         {/* Content Card - Dark */}
                         <div className="flex-1 bg-neutral-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all shadow-lg">
                           <h3 className="text-xl font-bold text-white mb-2">{concept.title}</h3>
                           <p className="text-base text-neutral-300 leading-relaxed">{concept.description}</p>
                         </div>
                       </div>
                     </motion.div>
                   ))}
                 </div>

                 {/* Key Takeaways */}
                 {infographic.keyStats.length > 0 && (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.4 }}
                     className="mt-10 pt-8 border-t border-slate-300"
                   >
                     <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                       <Sparkles className="w-6 h-6" style={{ color: '#FBBF24' }} />
                       Key Takeaways
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {infographic.keyStats.map((stat, index) => (
                         <motion.div
                           key={index}
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: 0.45 + index * 0.1 }}
                           className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-300 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-all"
                         >
                           <p className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</p>
                           <p className="text-sm font-semibold text-slate-700">{stat.label}</p>
                         </motion.div>
                       ))}
                     </div>
                   </motion.div>
                 )}

                 {/* Summary */}
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.55 }}
                   className="mt-10 bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-300 rounded-2xl p-8 backdrop-blur-sm"
                 >
                   <h4 className="text-lg font-bold text-slate-900 mb-3">Summary</h4>
                   <p className="text-base text-slate-800 leading-relaxed font-medium">{infographic.summary}</p>
                 </motion.div>
               </motion.div>
             )}
             {!infographic && mode === 'check' ? (
               <>
                 {/* Loading Overlay */}
                 {viewState === 'analyzing' && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                      <div className="loader-wrapper">
                        <span className="loader-letter">A</span>
                        <span className="loader-letter">n</span>
                        <span className="loader-letter">a</span>
                        <span className="loader-letter">l</span>
                        <span className="loader-letter">y</span>
                        <span className="loader-letter">s</span>
                        <span className="loader-letter">i</span>
                        <span className="loader-letter">n</span>
                        <span className="loader-letter">g</span>
                        <div className="loader"></div>
                      </div>
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
               <div className="flex-1 flex flex-col gap-6 justify-between">
                  {/* Response Area */}
                  <div className="flex-1 min-h-64 flex items-center justify-center">
                    {tutorResponse || error ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`w-full p-8 rounded-2xl border ${error && !tutorResponse ? 'bg-red-900/30 border-red-500/30' : 'bg-neutral-800/50 border-white/10'}`}
                      >
                        {tutorResponse && (
                          <>
                            <span className="text-primary text-xs font-bold uppercase tracking-widest mb-4 block">✨ Tutor says:</span>
                            <p className="text-lg text-white leading-relaxed">{tutorResponse}</p>
                          </>
                        )}
                        {error && !tutorResponse && (
                          <p className="text-base text-red-200">{error}</p>
                        )}
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center text-center text-neutral-600">
                        <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-lg">Ask me anything!</p>
                      </div>
                    )}
                  </div>

                  {/* Ask Button */}
                  {!isListening && transcript && transcript.trim().length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleTutorChat(transcript)}
                      disabled={isProcessing}
                      className="w-full bg-black text-yellow-400 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 border border-yellow-400"
                      data-testid="button-ask-tutor"
                    >
                      {isProcessing ? <Sparkles className="w-5 h-5 animate-spin" /> : '✨ Ask Tutor'}
                    </motion.button>
                  )}
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

import React, { useState } from 'react';
import { useSpeech } from '@/hooks/use-speech';
import { useMedia } from '@/hooks/use-media';
import { useAudioVisualizer } from '@/hooks/use-audio-visualizer';
import { analyzeExplanation, generateQuiz, askTutor, generateInfographic, type QuizQuestion, type GeminiResponse, type InfographicData } from '@/lib/gemini';
import { QuizModal } from '@/components/modules/quiz-modal';
import { FeedbackDisplay } from '@/components/modules/feedback-display';
import { RealtimeClock } from '@/components/modules/realtime-clock';
import { PomodoroTimerHeader } from '@/components/modules/pomodoro-timer-header';
import { Mic, Square, Play, VolumeX, Sparkles, Upload, X, Video, Image as ImageIcon, MessageCircle, GraduationCap, StopCircle, Brain, ArrowLeft, Download, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { JellyMic } from '@/components/modules/jelly-mic';
import { JellyPhysicsLoader } from '@/components/modules/jelly-physics-loader';

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
    isFullscreenCamera,
    setIsFullscreenCamera,
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
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Upload Progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Download as PDF with structured text - optimized
  const downloadNotesAsPDF = async () => {
    if (!infographic) return;
    
    setIsDownloading(true);
    
    try {
      // Use setTimeout to make it non-blocking
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const lineHeight = 5;

      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text(infographic.title, margin, yPosition);
      yPosition += 12;

      // Subtitle (skip text wrapping for speed)
      if (infographic.subtitle) {
        pdf.setFontSize(11);
        pdf.setTextColor(80, 80, 80);
        pdf.text(infographic.subtitle, margin, yPosition);
        yPosition += 8;
      }

      // Concepts
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('CONCEPTS', margin, yPosition);
      yPosition += 8;

      infographic.concepts.forEach((concept) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${concept.title}`, margin + 3, yPosition);
        yPosition += 5;

        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        pdf.text(concept.description, margin + 5, yPosition);
        yPosition += 6;
      });

      // Key Takeaways
      if (infographic.keyStats && infographic.keyStats.length > 0) {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }

        yPosition += 4;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('KEY TAKEAWAYS', margin, yPosition);
        yPosition += 8;

        infographic.keyStats.forEach((stat) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFontSize(9);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${stat.value} - ${stat.label}`, margin + 3, yPosition);
          yPosition += 5;
        });
      }

      // Summary
      if (infographic.summary) {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }

        yPosition += 4;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('SUMMARY', margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        pdf.text(infographic.summary, margin, yPosition);
      }

      pdf.save(`${infographic.title.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

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
          <div className="flex items-center gap-4">
            <span className={`text-xs font-semibold transition-colors ${mode === 'check' ? 'text-white' : 'text-neutral-500'}`}>Check Me</span>
            <label className="jelly-switch">
              <input 
                type="checkbox"
                checked={mode === 'tutor'}
                onChange={(e) => { 
                  const checkbox = e.target as HTMLInputElement;
                  checkbox.classList.add('interacted');
                  setMode(checkbox.checked ? 'tutor' : 'check');
                  resetView();
                }}
              />
              <span className="track"></span>
              <span className="knob"></span>
            </label>
            <span className={`text-xs font-semibold transition-colors ${mode === 'tutor' ? 'text-yellow-400' : 'text-neutral-500'}`}>Gen Z</span>
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

      <main className="relative z-10 flex-1 container mx-auto px-6 py-2 flex flex-col gap-8 h-[calc(100vh-100px)]">
        
        {/* TOP: Upload Toolbar */}
        {viewState !== 'results' && viewState !== 'infographic' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center gap-4 px-5 py-3 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-xl w-fit mx-auto transition-all hover:border-white/10 max-w-sm -mt-2"
          >
             <label className="p-2.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white cursor-pointer transition-all relative group">
                <Upload className="w-5 h-5" />
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => {
                    setIsUploading(true);
                    setUploadProgress(0);
                    
                    // Simulate progress
                    const interval = setInterval(() => {
                      setUploadProgress(prev => {
                        if (prev >= 90) {
                          clearInterval(interval);
                          return prev;
                        }
                        return prev + Math.random() * 30;
                      });
                    }, 100);
                    
                    handleFileUpload(e);
                    
                    // Complete after actual upload
                    setTimeout(() => {
                      setUploadProgress(100);
                      setTimeout(() => {
                        setIsUploading(false);
                        setUploadProgress(0);
                      }, 500);
                    }, 800);
                  }}
                  className="hidden" 
                />
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none">
                  Upload
                </span>
             </label>
             
             <button 
               onClick={() => {
                  const newState = !isSelfieMode;
                  setIsSelfieMode(newState);
                  setUseCamera(newState);
                  if (newState) {
                    setIsFullscreenCamera(true);
                  }
               }}
               className={`p-2.5 rounded-lg transition-all relative group ${isSelfieMode ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-neutral-400 hover:text-white'}`}
             >
                <Video className="w-5 h-5" />
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 pointer-events-none">
                  Camera
                </span>
             </button>

             {images.length > 0 && <div className="w-[1px] h-6 bg-white/5" />}

             {images.map((img, idx) => (
               <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 relative group flex-shrink-0">
                 <img src={img} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                 <button onClick={() => removeImage(idx)} className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <X className="w-3.5 h-3.5 text-white" />
                 </button>
               </div>
             ))}
          </motion.div>
        )}

        {/* MAIN LAYOUT: Left (Mic) and Right (Results) */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* MIDDLE: Stage - Stays Visible */}
          <div className={`flex-1 flex flex-col gap-8 justify-center relative transition-all duration-500 ${(viewState === 'results' || viewState === 'infographic') ? 'opacity-50 pointer-events-none' : ''}`}>
             
             {/* Central Visualizer */}
             <div className="relative flex-1 flex flex-col items-center justify-center min-h-[400px]">
                
                {/* Camera Feed - Glass overlay behind mic */}
                {isSelfieMode && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-[4rem] overflow-hidden backdrop-blur-sm z-10"
                  >
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </motion.div>
                )}

                {/* Background Layer */}
                <div className="absolute inset-0 rounded-[4rem] overflow-hidden bg-neutral-900/20 border border-white/5">
                   {!isSelfieMode && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                   )}
                </div>

                {/* Voice Button with Visualizer */}
                <div className="relative z-20 flex flex-col items-center gap-8 pt-12">
                   <div className="relative">
                      {/* Upload Progress Bar */}
                      {isUploading && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-1 bg-neutral-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                          />
                        </div>
                      )}
                      
                      {isListening && (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none" style={{ top: '-60px' }}>
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
                      <JellyMic 
                        isActive={isListening}
                        onClick={handleVoiceInteraction}
                        data-testid="button-mic-toggle"
                      />
                   </div>

                   {viewState !== 'analyzing' && (
                     <div className="text-center space-y-2 relative z-20 mt-4">
                       <h2 className="text-3xl font-bold text-white tracking-tight letter-spacing-[0.5px]">
                         {isListening ? "Listening..." : mode === 'tutor' ? "Ask Gen Z Tutor" : "Explain Concept"}
                       </h2>
                       <p className="text-neutral-400 text-sm font-light">
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
                   )}

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
                           className="bg-white text-black px-8 py-3 rounded-full font-semibold text-base hover:scale-103 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-white/20"
                           data-testid="button-analyze"
                         >
                           {isProcessing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                           Analyze
                         </button>
                       )}
                       
                       {mode === 'tutor' && (
                         <button 
                           onClick={() => handleTutorChat(transcript)}
                           disabled={isProcessing}
                           className="bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold text-base hover:scale-103 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-yellow-300/30"
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

          {/* RIGHT: Feedback Panel - Always on Side */}
          <motion.div 
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: 1, 
              x: 0
            }}
            className="h-full flex flex-col transition-all duration-500 lg:w-[500px] xl:w-[650px]"
          >
          {/* Camera Preview Box */}
          {isSelfieMode && viewState !== 'results' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 rounded-3xl overflow-hidden border border-white/10 bg-neutral-900/30 h-32 flex-shrink-0 cursor-pointer"
              onClick={() => setIsFullscreenCamera(true)}
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
               className="flex gap-3 px-2 pb-4"
             >
               <button 
                 onClick={handleGenerateInfographic}
                 disabled={isInfographicLoading || images.length === 0}
                 className="jelly-btn jelly-btn-yellow flex-1 px-6 py-3.5 text-base"
                 data-testid="button-generate-notes"
               >
                 <motion.div
                   animate={!isInfographicLoading && images.length > 0 ? { rotate: [0, 360] } : {}}
                   transition={{ duration: 2.5, repeat: Infinity }}
                 >
                   <Sparkles className="w-5 h-5" />
                 </motion.div>
                 <span>
                   {isInfographicLoading ? "Creating..." : "Generate Notes"}
                 </span>
               </button>
               <button 
                 onClick={handleGenerateQuiz}
                 disabled={isQuizLoading || images.length === 0}
                 className="jelly-btn jelly-btn-dark flex-1 px-6 py-3.5 text-base"
                 data-testid="button-quiz"
               >
                 <motion.div
                   animate={isQuizLoading ? { rotate: 360 } : {}}
                   transition={{ duration: 2, repeat: Infinity }}
                 >
                   <GraduationCap className="w-5 h-5" />
                 </motion.div>
                 <span>
                   {isQuizLoading ? "Creating..." : "Pop Quiz"}
                 </span>
               </button>
             </motion.div>
           )}

           {/* Main Content Area - Infographic/Notes */}
           <div className="flex-1 bg-black border-0 border-x border-b border-white/10 rounded-[3.5rem] overflow-hidden flex flex-col relative shadow-xl">
             {infographic && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex-1 overflow-y-auto space-y-6 p-8 custom-scrollbar"
               >
                 {/* Header */}
                 <div className="flex items-center justify-between mb-4">
                   <button 
                     onClick={() => {
                       setInfographic(null);
                       setViewState('idle');
                     }}
                     className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                   >
                     <ArrowLeft className="w-6 h-6" />
                   </button>
                   <h3 className="text-xl font-bold text-neutral-300">Study Notes</h3>
                   <div className="flex gap-2">
                     <button
                       onClick={downloadNotesAsPDF}
                       disabled={isDownloading}
                       className="p-2 hover:bg-white/10 rounded-full transition-colors text-white disabled:opacity-50"
                       title="Download as PDF"
                     >
                       {isDownloading ? (
                         <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                           <Download className="w-5 h-5" />
                         </motion.div>
                       ) : (
                         <Download className="w-5 h-5" />
                       )}
                     </button>
                   </div>
                 </div>

                 {/* Main Content for Download */}
                 <div id="infographic-content-inline">
                   {/* Main Title */}
                   <div className="mb-8">
                     <h2 className="text-5xl font-bold text-white mb-2">
                       {infographic.title}
                     </h2>
                     <p className="text-lg text-neutral-300">{infographic.subtitle}</p>
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
                         <div className="flex-1 bg-neutral-800/60 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-yellow-400/30 transition-all shadow-lg">
                           <h3 className="text-xl font-bold text-yellow-300 mb-2">{concept.title}</h3>
                           <p className="text-base text-neutral-200 leading-relaxed">{concept.description}</p>
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
                     className="mt-14 pt-6"
                   >
                     <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
                       <Sparkles className="w-6 h-6" />
                       Key Takeaways
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {infographic.keyStats.map((stat, index) => (
                         <motion.div
                           key={index}
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: 0.45 + index * 0.1 }}
                           className="bg-neutral-800/60 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/50 rounded-3xl p-8 text-center shadow-lg transition-all group h-full flex flex-col justify-center min-h-[180px]"
                         >
                           <p className="text-2xl font-bold text-yellow-400 mb-3 group-hover:text-yellow-300 transition-colors line-clamp-2">{stat.value}</p>
                           <p className="text-xs font-semibold text-neutral-300 line-clamp-3">{stat.label}</p>
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
                     className="mt-10 bg-neutral-800/60 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-8 hover:border-yellow-400/40 transition-all"
                   >
                     <h4 className="text-lg font-bold text-yellow-400 mb-3">Summary</h4>
                     <p className="text-base text-neutral-200 leading-relaxed font-medium">{infographic.summary}</p>
                   </motion.div>
                 </div>
               </motion.div>
             )}
             {!infographic && mode === 'check' ? (
               <>
                 {/* Loading Overlay */}
                 {viewState === 'analyzing' && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20">
                      <JellyPhysicsLoader />
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
               <div className="flex-1 flex flex-col gap-6 justify-between relative">
                  {/* Loading Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-20 rounded-2xl">
                      <JellyPhysicsLoader />
                    </div>
                  )}

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

      {/* Fullscreen Camera Modal */}
      {isFullscreenCamera && isSelfieMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-50"
        >
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover" 
          />
          
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreenCamera(false)}
            className="absolute top-6 right-6 p-3 bg-black/60 hover:bg-black/80 rounded-full transition-colors z-50 border border-white/20"
            data-testid="button-close-camera"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Mic Button - Always Accessible */}
          {isListening && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50">
              <div className="flex items-center justify-center gap-2">
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
              <div className="text-white text-sm font-medium">Listening...</div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

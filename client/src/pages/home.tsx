import React, { useState } from 'react';
import { useSpeech } from '@/hooks/use-speech';
import { useMedia } from '@/hooks/use-media';
import { analyzeExplanation, generateQuiz, type QuizQuestion, type GeminiResponse } from '@/lib/gemini';
import { QuizModal } from '@/components/modules/quiz-modal';
import { MediaControls } from '@/components/modules/media-controls';
import { FeedbackDisplay } from '@/components/modules/feedback-display';
import { Mic, Square, Play, Volume2, VolumeX, Brain, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import generatedBg from '@assets/generated_images/dark_gritty_concrete_texture_for_background.png';

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
    capturePhoto,
    error: mediaError
  } = useMedia();

  // App State
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError("Yo, I need images and an explanation before I can work here.");
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const result = await analyzeExplanation(transcript, images);
      setAiResponse(result);
      speakText(`Alright, listen up. You scored ${result.score}. ${result.summary}`);
    } catch (err: any) {
      setError("Analysis failed. " + err.message);
    } finally {
      setIsProcessing(false);
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

  return (
    <div 
      className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: `url(${generatedBg})`,
        backgroundBlendMode: 'overlay',
        backgroundSize: 'cover'
      }}
    >
      {/* Overlay for darkening */}
      <div className="absolute inset-0 bg-black/80 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tighter uppercase leading-none">
              Study<span className="text-primary">Companion</span>
            </h1>
            <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase mt-1">New York Edition v1.0</p>
          </div>
          <div className="flex items-center gap-4">
            {isSpeaking && (
              <button onClick={stopSpeaking} className="text-primary animate-pulse hover:text-white">
                <VolumeX className="w-6 h-6" />
              </button>
            )}
            {!isSpeaking && (
              <div className="text-neutral-600">
                <Volume2 className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="lg:col-span-5 space-y-6 flex flex-col h-full">
          {/* Media Section */}
          <section className="bg-neutral-900/80 border border-white/10 p-6 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4" /> Input Materials
            </h2>
            <MediaControls 
              images={images}
              useCamera={useCamera}
              videoRef={videoRef}
              setUseCamera={setUseCamera}
              capturePhoto={capturePhoto}
              handleFileUpload={handleFileUpload}
              removeImage={removeImage}
            />
          </section>

          {/* Transcript Section */}
          <section className="bg-neutral-900/80 border border-white/10 p-6 backdrop-blur-sm flex-1 flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Your Explanation</h2>
               {isListening && <span className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase animate-pulse"><span className="w-2 h-2 bg-red-500 rounded-full"/> Recording</span>}
            </div>
            
            <div className="flex-1 bg-black/50 border border-neutral-800 p-4 font-mono text-sm text-neutral-300 overflow-y-auto mb-4 relative group">
              {transcript || <span className="text-neutral-600 italic">Start speaking to explain the concept...</span>}
              <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={toggleListening}
                className={`flex-1 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isListening 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
                }`}
              >
                {isListening ? <><Square className="fill-current w-4 h-4" /> Stop</> : <><Mic className="w-4 h-4" /> Speak</>}
              </button>
              
              <button 
                onClick={handleAnalyze}
                disabled={isProcessing || transcript.length < 5}
                className="flex-1 bg-primary text-black font-bold uppercase tracking-wider hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="fill-current w-4 h-4" />}
                Analyze
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2 font-bold text-center">{error}</p>}
            {(speechError || mediaError) && <p className="text-red-500 text-xs mt-2 font-bold text-center">{speechError || mediaError}</p>}
          </section>
        </div>

        {/* RIGHT COLUMN: Feedback */}
        <div className="lg:col-span-7 h-full flex flex-col gap-6">
           <section className="bg-neutral-900/80 border border-white/10 p-6 backdrop-blur-sm h-[600px] lg:h-auto lg:flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
                <h2 className="text-xl font-display font-bold text-white uppercase tracking-wide">
                  Tutor Feedback
                </h2>
                <button 
                  onClick={handleGenerateQuiz}
                  disabled={isQuizLoading || images.length === 0}
                  className="text-xs border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-black transition-colors uppercase font-bold tracking-wider flex items-center gap-2 disabled:opacity-50"
                >
                   {isQuizLoading ? "Generating..." : "Pop Quiz"}
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <FeedbackDisplay 
                  response={aiResponse}
                  isProcessing={isProcessing}
                  error={error}
                />
              </div>
           </section>
        </div>
      </main>

      {/* Quiz Modal */}
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
      />
    </div>
  );
}

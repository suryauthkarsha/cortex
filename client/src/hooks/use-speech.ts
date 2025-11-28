import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError("Microphone access denied.");
        }
      };
      
      recognitionRef.current.onend = () => {
        // Optional: Auto-restart if we want it always on, but for now manual toggle is safer
        if (isListening) {
           // recognitionRef.current.start(); 
           setIsListening(false);
        }
      };
    } else {
      setError("Browser doesn't support Speech Recognition. Try Chrome.");
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Stop error:", e);
      }
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Start error:", e);
        // If already started, just mark as listening
        setIsListening(true);
        return;
      }
      setIsListening(true);
    }
  }, [isListening]);

  const addPausesToText = (text: string): string => {
    // Add natural pauses for energetic friend vibe
    return text
      .replace(/([.!?])\s+/g, '$1 ... ')
      .replace(/,\s+/g, ', ... ')
      .replace(/\b(and|but|like|so|because|actually)\b/gi, '... $1 ...')
      .trim();
  };

  const speakText = useCallback((text: string) => {
    if (!text) return;

    // Always cancel any ongoing speech
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    try {
      const textWithPauses = addPausesToText(text);
      const utterance = new SpeechSynthesisUtterance(textWithPauses);
      const voices = synthRef.current.getVoices();
      
      // Prefer American English female voice for energetic friend vibe
      const americanVoice = voices.find(v => 
        v.lang?.startsWith('en-US') && v.name?.toLowerCase().includes('female')
      ) || voices.find(v => v.lang?.startsWith('en-US')) || voices[0];
      
      if (americanVoice) utterance.voice = americanVoice;
      
      utterance.pitch = 1.1; // Slightly higher for energetic tone
      utterance.rate = 0.9; // Clear, deliberate speech
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event: any) => {
        console.warn("TTS error:", event.error);
        setIsSpeaking(false);
      };
      
      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
     if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    setTranscript,
    toggleListening,
    speakText,
    stopSpeaking,
    error
  };
}

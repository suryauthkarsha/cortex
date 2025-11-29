import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);
  const listeningRef = useRef(false);

  // Initialize speech recognition once
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError("Browser doesn't support Speech Recognition. Try Chrome.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setError(null);
    };

    recognition.onresult = (event: any) => {
      console.log("Got result", event.resultIndex, event.results.length);
      
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          console.log("Final:", transcript);
        }
      }
      
      if (finalTranscript.trim()) {
        setTranscript(prev => {
          const updated = (prev + ' ' + finalTranscript).trim();
          console.log("Updated transcript:", updated);
          return updated;
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      
      if (event.error === 'no-speech') {
        console.log("No speech detected, waiting...");
        // Keep listening, don't abort
      } else if (event.error === 'audio-capture') {
        setError("Microphone not available");
        setIsListening(false);
      } else if (event.error === 'not-allowed') {
        setError("Microphone permission denied");
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      // If user wants to keep listening, restart
      if (listeningRef.current) {
        console.log("Restarting recognition...");
        try {
          recognition.start();
        } catch (e) {
          console.warn("Failed to restart:", e);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch (e) {}
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      console.log("Stopping listening");
      listeningRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Stop error:", e);
      }
      setIsListening(false);
    } else {
      console.log("Starting listening");
      listeningRef.current = true;
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Start error:", e);
        setError("Could not start listening");
      }
    }
  }, [isListening]);

  const speakText = useCallback((text: string) => {
    if (!text) return;

    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();
      
      // Find a natural, human-sounding voice
      let selectedVoice = null;
      
      // Try to find Google voices (usually sound best)
      selectedVoice = voices.find(v => v.name?.includes('Google US English'));
      
      // Try for natural/premium quality voices
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang?.includes('en-US') && 
          (v.name?.includes('Natural') || v.name?.includes('Premium') || v.name?.includes('Neural') || v.name?.includes('Samantha') || v.name?.includes('Victoria'))
        );
      }
      
      // Try any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang?.includes('en-US'));
      }
      
      // Fallback to first available voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log("Using voice:", selectedVoice.name);
      }
      
      // Settings for natural human-like speech
      utterance.pitch = 1.0;      // Normal pitch
      utterance.rate = 0.9;       // Slightly slower for clarity
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
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

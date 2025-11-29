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

    setIsSpeaking(true);

    // Use backend TTS endpoint
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        
        // Decode base64 audio and play
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.play().catch(e => {
          console.error("Playback error:", e);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        });
      })
      .catch(e => {
        console.warn("TTS error:", e);
        setIsSpeaking(false);
      });
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

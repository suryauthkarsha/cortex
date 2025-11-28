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
    // Add natural pauses and phrase breaks for more human-like speech
    return text
      .replace(/([.!?])\s+/g, '$1 ') // Sentence ends
      .replace(/,\s+/g, ', ') // Comma pauses
      .replace(/—/g, ', ') // Em-dashes as pauses
      .replace(/;\s+/g, '; ') // Semicolon pauses
      .replace(/\.\.\./g, '..') // Ellipsis
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
      
      // Use best available voice - prefer premium voices
      let selectedVoice = null;
      
      // Try Google Premium US English voices first (highest quality)
      selectedVoice = voices.find(v => v.name?.includes('Google US English'));
      
      // Try any Google voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.name?.includes('Google'));
      }
      
      // Try high-quality system voices (Microsoft, Apple, etc.)
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang?.startsWith('en-US') && 
          (v.name?.includes('Natural') || v.name?.includes('Premium') || v.name?.includes('Neural') || v.name?.includes('Samantha'))
        );
      }

      // Try higher quality female voices
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang?.startsWith('en-US') && 
          (v.name?.includes('Victoria') || v.name?.includes('Karen') || v.name?.includes('Moira') || v.name?.includes('Zira'))
        );
      }
      
      // Fall back to any US English voice marked as default
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang?.startsWith('en-US') && v.default
        );
      }

      // Final fallback to any US voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang?.startsWith('en-US')) || voices[0];
      }
      
      if (selectedVoice) utterance.voice = selectedVoice;
      
      // More human-like parameters
      utterance.pitch = 0.95; // Slightly lower for more natural tone
      utterance.rate = 0.85; // Slower, more deliberate speech
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

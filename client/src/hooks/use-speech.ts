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
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => (prev + ' ' + finalTranscript).trim());
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        
        // Auto-retry on recoverable errors
        if (event.error === 'audio-capture' || event.error === 'network' || event.error === 'no-speech') {
          console.log("Retrying speech recognition...");
          try {
            if (isListening) {
              setTimeout(() => {
                recognitionRef.current?.start();
              }, 500);
            }
          } catch (e) {
            console.warn("Retry failed:", e);
          }
        } else if (event.error === 'not-allowed') {
          setError("Microphone access denied. Please allow microphone access.");
          setIsListening(false);
        }
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          setIsListening(false);
        }
      };
    } else {
      setError("Browser doesn't support Speech Recognition. Try Chrome.");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        // Use abort instead of stop for smoother stopping
        recognitionRef.current.abort();
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

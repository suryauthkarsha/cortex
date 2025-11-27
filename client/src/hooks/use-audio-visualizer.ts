import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioVisualizer(isListening: boolean) {
  const [bars, setBars] = useState<number[]>(Array(40).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isListening) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setBars(Array(40).fill(0));
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        dataArrayRef.current = dataArray;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const numBars = 40;
        const barWidth = Math.floor(bufferLength / numBars);

        const animate = () => {
          animationRef.current = requestAnimationFrame(animate);

          analyser.getByteFrequencyData(dataArray);

          const newBars = [];
          for (let i = 0; i < numBars; i++) {
            const start = i * barWidth;
            const end = start + barWidth;
            const sum = dataArray.slice(start, end).reduce((a, b) => a + b, 0);
            const average = sum / barWidth;
            newBars.push((average / 255) * 100);
          }
          setBars(newBars);
        };

        animate();
      } catch (err) {
        console.warn("Audio visualizer init failed:", err);
      }
    };

    initAudio();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isListening]);

  return bars;
}

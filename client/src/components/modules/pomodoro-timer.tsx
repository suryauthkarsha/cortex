import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

export function PomodoroTimer() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempWorkMinutes, setTempWorkMinutes] = useState(25);
  const [tempBreakMinutes, setTempBreakMinutes] = useState(5);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Switch sessions
          const newIsBreak = !isBreak;
          setIsBreak(newIsBreak);
          return (newIsBreak ? breakMinutes : workMinutes) * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isBreak, workMinutes, breakMinutes]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleStart = () => setIsRunning(!isRunning);
  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
  };

  const handleSaveSettings = () => {
    setWorkMinutes(tempWorkMinutes);
    setBreakMinutes(tempBreakMinutes);
    setTimeLeft(tempWorkMinutes * 60);
    setIsBreak(false);
    setIsRunning(false);
    setShowSettings(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Timer Display */}
      <div className="text-center">
        <div className={`text-5xl font-light font-mono tracking-widest transition-colors ${
          isBreak ? 'text-green-400' : 'text-primary'
        }`}>
          {String(minutes).padStart(2, '0')} {String(seconds).padStart(2, '0')}
        </div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-2">
          {isBreak ? 'Break' : 'Focus'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleStart}
          className="bg-white text-black p-2 rounded-full hover:shadow-lg transition-shadow"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleReset}
          className="bg-neutral-800 text-white p-2 rounded-full hover:bg-neutral-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(!showSettings)}
          className="bg-neutral-800 text-white p-2 rounded-full hover:bg-neutral-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-neutral-800/50 border border-white/10 backdrop-blur-md rounded-lg p-2 z-50"
          >
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-[8px] uppercase tracking-widest text-neutral-500 block mb-0.5">
                  Focus
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempWorkMinutes}
                  onChange={(e) => setTempWorkMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded px-1.5 py-0.5 text-white text-center text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex-1">
                <label className="text-[8px] uppercase tracking-widest text-neutral-500 block mb-0.5">
                  Break
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={tempBreakMinutes}
                  onChange={(e) => setTempBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded px-1.5 py-0.5 text-white text-center text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveSettings}
                className="bg-primary text-black font-bold px-2 py-0.5 rounded text-xs whitespace-nowrap"
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

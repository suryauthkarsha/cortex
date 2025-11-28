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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-800/50 border border-white/10 rounded-lg p-3 space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase tracking-widest text-neutral-400 block mb-1">
                  Focus
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempWorkMinutes}
                  onChange={(e) => setTempWorkMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded px-2 py-1 text-white text-center text-xs focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase tracking-widest text-neutral-400 block mb-1">
                  Break
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={tempBreakMinutes}
                  onChange={(e) => setTempBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded px-2 py-1 text-white text-center text-xs focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveSettings}
              className="w-full bg-primary text-black font-bold py-1 rounded text-xs"
            >
              Save
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

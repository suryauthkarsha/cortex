import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

export function PomodoroTimerHeader() {
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
    <div className="relative">
      {/* Timer Display - Sleek Header Version */}
      <div className="flex items-center gap-3 bg-neutral-900/40 border border-white/10 rounded-full px-4 py-2 backdrop-blur-xl">
        {/* Time Display */}
        <div className={`font-mono text-lg font-bold tracking-wider transition-colors ${
          isBreak ? 'text-green-400' : 'text-primary'
        }`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Status Dot */}
        <div className={`w-2 h-2 rounded-full transition-colors ${
          isRunning ? (isBreak ? 'bg-green-400' : 'bg-primary') : 'bg-neutral-600'
        }`} />

        {/* Controls */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleStart}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReset}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            <Settings className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Settings Panel - Positioned from center */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full right-0 mt-2 bg-neutral-800/50 border border-white/10 backdrop-blur-md rounded-lg p-2 z-50 w-56"
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="text-[7px] uppercase tracking-widest text-neutral-400 block mb-0.5">
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

              <div>
                <label className="text-[7px] uppercase tracking-widest text-neutral-400 block mb-0.5">
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
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveSettings}
              className="w-full bg-primary text-black font-bold py-1 rounded text-[10px] transition-all"
            >
              Save
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

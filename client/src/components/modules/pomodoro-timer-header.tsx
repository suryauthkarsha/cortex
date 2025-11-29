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
      <div className="flex items-center gap-4 bg-neutral-900/40 border border-white/10 rounded-full px-4 py-2 backdrop-blur-xl">
        {/* Hamster Wheel - Only show when timer is running */}
        {isRunning && (
          <div className="wheel-and-hamster" style={{ '--dur': '1s' } as React.CSSProperties}>
            <div className="wheel"></div>
            <div className="hamster">
              <div className="hamster__body">
                <div className="hamster__head">
                  <div className="hamster__ear"></div>
                  <div className="hamster__eye"></div>
                  <div className="hamster__nose"></div>
                </div>
                <div className="hamster__limb hamster__limb--fr"></div>
                <div className="hamster__limb hamster__limb--fl"></div>
                <div className="hamster__limb hamster__limb--br"></div>
                <div className="hamster__limb hamster__limb--bl"></div>
                <div className="hamster__tail"></div>
              </div>
            </div>
            <div className="spoke"></div>
          </div>
        )}

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
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
            className="absolute top-full right-0 mt-1 bg-neutral-800/60 border border-white/10 backdrop-blur-md rounded px-2 py-1.5 z-50 w-32"
          >
            <div className="grid grid-cols-2 gap-1 mb-1">
              <div>
                <label className="text-[6px] uppercase tracking-widest text-neutral-500 block mb-0.25">
                  Focus
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempWorkMinutes}
                  onChange={(e) => setTempWorkMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded px-1 py-0.25 text-white text-center text-[10px] focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[6px] uppercase tracking-widest text-neutral-500 block mb-0.25">
                  Break
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={tempBreakMinutes}
                  onChange={(e) => setTempBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-neutral-900/50 border border-white/10 rounded px-1 py-0.25 text-white text-center text-[10px] focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveSettings}
              className="w-full bg-primary text-black font-bold py-0.5 rounded text-[9px] transition-all"
            >
              Save
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

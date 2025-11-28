import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function RealtimeClock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-1"
    >
      <div className="text-5xl font-bold text-white tracking-tight font-mono">
        {time || '00:00:00'}
      </div>
      <p className="text-xs uppercase tracking-widest text-neutral-400">Study Time</p>
    </motion.div>
  );
}

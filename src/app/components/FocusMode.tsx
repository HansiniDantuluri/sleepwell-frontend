import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Play, Pause, SkipForward, Shield, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFocusTimer } from '../../hooks/useFocusTimer';

export function FocusMode() {
  const navigate = useNavigate();
  const { secondsLeft, isRunning, isComplete, xpEarned, progress, start, pause, resume, stop } = useFocusTimer();
  const [started, setStarted] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [focusXP, setFocusXP] = useState(0);
  const notificationSent = useRef(false);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const focusMeterProgress = Math.min(100, Math.round(progress * 100));

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Update XP as timer progresses
  useEffect(() => {
    setFocusXP(Math.round(progress * 100));
  }, [progress]);

  // Handle session complete
  useEffect(() => {
    if (isComplete && !notificationSent.current) {
      notificationSent.current = true;
      setSessionCount(prev => prev + 1);

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎉 Focus session complete!', {
          body: `Great work! You earned ${xpEarned} XP. Time for a break.`,
          icon: '/favicon.ico'
        });
      }
    }
  }, [isComplete, xpEarned]);

  // Warn user if they try to leave during a session
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRunning]);

  const handleStartPause = async () => {
    if (!started) {
      setStarted(true);
      notificationSent.current = false;
      await start('Math Homework', 25);
    } else if (isRunning) {
      pause();
    } else {
      resume();
    }
  };

  const handleSkip = async () => {
    if (started) {
      await stop(false);
    }
    setStarted(false);
    notificationSent.current = false;
    setFocusXP(0);
  };

  const handleNavigateBack = () => {
    if (isRunning) {
      const confirm = window.confirm('Are you sure? Your focus session will be lost!');
      if (!confirm) return;
      stop(false);
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 text-white relative overflow-hidden">
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="bg-gray-900/50 border-b border-gray-800/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={handleNavigateBack} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
          <motion.div
            className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Session {sessionCount}</span>
          </motion.div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8 flex flex-col items-center justify-center min-h-[80vh] relative z-10">

        {/* Session Complete Banner */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-5 mb-6 text-center"
            >
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-white mb-1">Session Complete!</div>
              <div className="text-yellow-400 text-sm">+{xpEarned} XP earned!</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Task */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-sm text-gray-400 mb-2 flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            {isRunning ? 'FOCUSING' : started ? 'PAUSED' : 'READY'}
          </div>
          <h2 className="text-3xl text-white">Math Homework</h2>
        </motion.div>

        {/* Timer Circle */}
        <div className="relative mb-8">
          <motion.div
            className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <svg className="w-64 h-64 transform -rotate-90 relative z-10">
            <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-800" />
            <motion.circle
              cx="128" cy="128" r="120"
              stroke="url(#gradient)" strokeWidth="8" fill="none" strokeLinecap="round"
              initial={{ strokeDasharray: "753.98", strokeDashoffset: "753.98" }}
              animate={{ strokeDashoffset: `${753.98 - (753.98 * progress)}` }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="text-6xl tabular-nums mb-2"
                animate={{ scale: isRunning && secondsLeft % 60 === 0 ? [1, 1.05, 1] : 1 }}
              >
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </motion.div>
              <div className="text-gray-400">Focus Time</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mb-8">
          <motion.button
            onClick={handleStartPause}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full flex items-center justify-center transition-all shadow-lg shadow-blue-500/50"
          >
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.div key="pause" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }}>
                  <Pause className="w-8 h-8" />
                </motion.div>
              ) : (
                <motion.div key="play" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }}>
                  <Play className="w-8 h-8 ml-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={handleSkip}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Focus XP Bar */}
        <motion.div className="w-full max-w-sm mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Focus XP</span>
            </div>
            <span className="text-sm text-yellow-400">{focusXP}/100</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500"
              animate={{ width: `${focusMeterProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            {focusXP < 25 && "Keep going!"}
            {focusXP >= 25 && focusXP < 50 && "Building momentum 💪"}
            {focusXP >= 50 && focusXP < 75 && "You're in the zone! 🔥"}
            {focusXP >= 75 && "Crushing it! ⭐"}
          </div>
        </motion.div>

        {/* Growing Plant */}
        <motion.div className="mb-6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
          <motion.div
            animate={{ scale: isRunning ? [1, 1.1, 1] : 1, rotate: isRunning ? [0, 2, -2, 0] : 0 }}
            transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
            className="text-6xl"
          >
            {progress < 0.25 && "🌱"}
            {progress >= 0.25 && progress < 0.5 && "🌿"}
            {progress >= 0.5 && progress < 0.75 && "🍀"}
            {progress >= 0.75 && "🌳"}
          </motion.div>
        </motion.div>

        {/* App Blocking Status */}
        <motion.div
          className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-5 flex items-center gap-4 max-w-sm w-full border border-green-500/20 shadow-lg mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center relative">
            <motion.div
              className="absolute inset-0 bg-green-500/20 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Shield className="w-6 h-6 text-green-400 relative z-10" />
          </div>
          <div className="flex-1">
            <div className="text-white mb-1 flex items-center gap-2">
              Focus Mode Active
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-sm text-gray-400">
              {isRunning ? 'Stay focused — you got this! 💪' : 'Start timer to begin session'}
            </div>
          </div>
        </motion.div>

        {/* Progress Info */}
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="text-sm text-gray-400 mb-2">Session progress</div>
          <div className="text-2xl text-white">{Math.round(progress * 100)}%</div>
        </motion.div>
      </div>
    </div>
  );
}
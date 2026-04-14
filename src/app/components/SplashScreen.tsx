import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';

export function SplashScreen() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete
    const timer = setTimeout(() => {
      if (user) {
        navigate('/dashboard'); // Already logged in
      } else {
        navigate('/login'); // Not logged in
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-950 flex items-center justify-center p-6 relative overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <motion.div key={i} className="absolute w-1 h-1 bg-white rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }} />
      ))}
      <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity }} />

      <div className="text-center relative z-10">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }} className="mb-8 flex justify-center items-center gap-3">
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="relative">
            <Sun className="w-20 h-20 text-yellow-300" />
            <motion.div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
          </motion.div>
          <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="relative">
            <Moon className="w-20 h-20 text-blue-200" />
            <motion.div className="absolute inset-0 bg-blue-200/30 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
          </motion.div>
        </motion.div>

        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }} className="text-6xl mb-4 text-white">
          SleepWell
        </motion.h1>

        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }} className="text-xl text-blue-200">
          Plan your day. Protect your sleep.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="mt-12 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-2 h-2 bg-blue-300 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="mt-4 text-blue-300/60 text-sm">
          {loading ? 'Checking your account...' : user ? 'Welcome back!' : 'Getting things ready...'}
        </motion.p>
      </div>
    </div>
  );
}
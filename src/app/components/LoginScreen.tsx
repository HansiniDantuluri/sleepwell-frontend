import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!isLogin && !name) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const { register } = await import('../../hooks/useAuth').then(m => ({ register: m.useAuth }));
        // For register, go to onboarding instead
        navigate('/onboarding');
        return;
      }
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-950 flex items-center justify-center p-6 relative overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div key={i} className="absolute w-1 h-1 bg-white rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }} />
      ))}
      <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="flex justify-center items-center gap-3 mb-8">
          <Sun className="w-10 h-10 text-yellow-300" />
          <h1 className="text-3xl text-white">SleepWell</h1>
          <Moon className="w-10 h-10 text-blue-200" />
        </motion.div>

        {/* Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl">

          {/* Toggle */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-6">
            <button onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 rounded-xl text-sm transition-all ${isLogin ? 'bg-white text-purple-900 shadow-sm' : 'text-white/70 hover:text-white'}`}>
              Log In
            </button>
            <button onClick={() => { setIsLogin(false); setError(''); navigate('/onboarding'); }}
              className={`flex-1 py-2 rounded-xl text-sm transition-all ${!isLogin ? 'bg-white text-purple-900 shadow-sm' : 'text-white/70 hover:text-white'}`}>
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/60" />
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/60" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-purple-400/60" />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-red-300 text-sm text-center mt-3">{error}</motion.p>
          )}

          <motion.button onClick={handleSubmit} disabled={loading}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl hover:from-purple-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg">
            {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Get Started'}
          </motion.button>

          {isLogin && (
            <p className="text-center text-white/50 text-sm mt-4">
              New here?{' '}
              <button onClick={() => navigate('/onboarding')} className="text-purple-300 hover:text-purple-200 transition-colors">
                Create an account
              </button>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
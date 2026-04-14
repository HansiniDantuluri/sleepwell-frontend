import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, TrendingUp, Moon, Flame, Calendar, Award, Star, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';

export function ProgressScreen() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.progress.stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Build chart data from real sleep logs or fall back to defaults
  const sleepData = stats?.sleep_logs?.length > 0
    ? stats.sleep_logs.slice(0, 7).reverse().map((log: any, i: number) => ({
        id: `s${i}`,
        day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: log.sleep_hours || 0
      }))
    : [
        { id: 's1', day: 'Mon', hours: 7.5 },
        { id: 's2', day: 'Tue', hours: 8 },
        { id: 's3', day: 'Wed', hours: 7 },
        { id: 's4', day: 'Thu', hours: 8.5 },
        { id: 's5', day: 'Fri', hours: 8 },
        { id: 's6', day: 'Sat', hours: 9 },
        { id: 's7', day: 'Sun', hours: 8 },
      ];

  const adherenceData = stats?.sleep_logs?.length > 0
    ? stats.sleep_logs.slice(0, 7).reverse().map((log: any, i: number) => ({
        id: `a${i}`,
        day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
        percent: Math.round((log.schedule_adherence || 0) * 100)
      }))
    : [
        { id: 'a1', day: 'Mon', percent: 85 },
        { id: 'a2', day: 'Tue', percent: 92 },
        { id: 'a3', day: 'Wed', percent: 78 },
        { id: 'a4', day: 'Thu', percent: 95 },
        { id: 'a5', day: 'Fri', percent: 88 },
        { id: 'a6', day: 'Sat', percent: 90 },
        { id: 'a7', day: 'Sun', percent: 87 },
      ];

  const streakDays = stats?.streak_days || 0;
  const avgSleep = stats?.avg_sleep_hours || 8;
  const avgAdherence = Math.round((stats?.avg_adherence || 0.87) * 100);
  const totalSessions = stats?.total_focus_sessions || 0;
  const totalXP = stats?.total_xp || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 rounded-full transition-all">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl text-gray-900">Progress</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">Loading your progress...</div>
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

          {/* Streak Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            <motion.div
              className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="flex items-center gap-4 relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="w-12 h-12" />
              </motion.div>
              <div className="flex-1">
                <div className="text-4xl mb-1">{streakDays} {streakDays === 1 ? 'Day' : 'Days'}</div>
                <div className="text-sm opacity-90">
                  {streakDays === 0 ? 'Start your streak today! 🌱' : 'Current streak! Keep it going 🔥'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Improvement Insight */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-green-900 mb-1">Your stats this week</div>
                <div className="text-sm text-green-700">
                  Average sleep: <span className="font-semibold">{avgSleep}h</span> •
                  Schedule adherence: <span className="font-semibold">{avgAdherence}%</span> •
                  Focus sessions: <span className="font-semibold">{totalSessions}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={TrendingUp}
              label="Schedule Adherence"
              value={`${avgAdherence}%`}
              subtitle="This week"
              color="text-blue-600"
              bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
              delay={0.2}
            />
            <StatCard
              icon={Moon}
              label="Avg Sleep"
              value={`${avgSleep}h`}
              subtitle="Per night"
              color="text-purple-600"
              bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
              delay={0.25}
            />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={`${streakDays}`}
              subtitle="Days"
              color="text-orange-600"
              bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
              delay={0.3}
            />
            <StatCard
              icon={Zap}
              label="Total XP"
              value={`${totalXP}`}
              subtitle={`${totalSessions} sessions`}
              color="text-yellow-600"
              bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
              delay={0.35}
            />
          </div>

          {/* Sleep Hours Chart */}
          <motion.div
            className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-600" />
              Sleep Hours
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} domain={[0, 10]} />
                <Line type="monotone" dataKey="hours" stroke="url(#sleepGradient)" strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }} />
                <defs>
                  <linearGradient id="sleepGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Target: 8 hours</span>
            </div>
          </motion.div>

          {/* Schedule Adherence Chart */}
          <motion.div
            className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Schedule Adherence
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={adherenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} domain={[0, 100]} />
                <Line type="monotone" dataKey="percent" stroke="url(#adherenceGradient)" strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }} />
                <defs>
                  <linearGradient id="adherenceGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Weekly average: {avgAdherence}%</span>
            </div>
          </motion.div>

          {/* Weekly Summary */}
          <motion.div
            className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg mb-4 text-gray-900">This Week's Summary</h3>
            <div className="space-y-3">
              <SummaryItem label="Schedule adherence" value={`${avgAdherence}%`} percentage={avgAdherence}
                color="bg-gradient-to-r from-green-400 to-emerald-500" />
              <SummaryItem label="Sleep goal achieved" value={`${avgSleep}h avg`} percentage={Math.min(100, (avgSleep / 8) * 100)}
                color="bg-gradient-to-r from-purple-400 to-purple-500" />
              <SummaryItem label="Focus sessions" value={`${totalSessions} sessions`} percentage={Math.min(100, totalSessions * 5)}
                color="bg-gradient-to-r from-blue-400 to-blue-500" />
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-yellow-300 shadow-xl relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300/30 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Award className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg text-gray-900">Achievements</h3>
            </div>
            <div className="space-y-4 relative z-10">
              {streakDays >= 7 && (
                <AchievementCard emoji="🏆" title={`${streakDays}-Day Streak!`} subtitle="Consistent sleep schedule" delay={0.8} />
              )}
              {totalSessions >= 10 && (
                <AchievementCard emoji="⭐" title="Focus Master" subtitle={`Completed ${totalSessions} focus sessions`} delay={0.9} />
              )}
              {avgSleep >= 8 && (
                <AchievementCard emoji="🌙" title="Sleep Champion" subtitle="Averaging 8+ hours of sleep" delay={1.0} />
              )}
              {streakDays === 0 && totalSessions === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <div className="text-4xl mb-2">🌱</div>
                  <div>Complete focus sessions and log sleep to earn achievements!</div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Log Sleep Button */}
          <motion.button
            onClick={async () => {
              const today = new Date().toISOString().split('T')[0];
              const hours = prompt('How many hours did you sleep last night?');
              if (hours) {
                await api.progress.logSleep({
                  date: today,
                  sleep_hours: parseFloat(hours),
                  schedule_adherence: 0.85
                });
                const updated = await api.progress.stats();
                setStats(updated);
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-2xl shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2">
              <Moon className="w-5 h-5" />
              Log Last Night's Sleep
            </div>
          </motion.button>

        </div>
      )}
    </div>
  );
}

function AchievementCard({ emoji, title, subtitle, delay }: { emoji: string; title: string; subtitle: string; delay: number }) {
  return (
    <motion.div
      className="flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-yellow-200"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div className="text-4xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        {emoji}
      </motion.div>
      <div className="flex-1">
        <div className="text-gray-900 font-medium">{title}</div>
        <div className="text-sm text-gray-600">{subtitle}</div>
      </div>
      <Star className="w-5 h-5 text-yellow-500" />
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, subtitle, color, bgColor, delay = 0 }: {
  icon: any; label: string; value: string; subtitle: string; color: string; bgColor: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={`${bgColor} rounded-3xl p-5 border-2 border-transparent hover:border-gray-200 transition-all shadow-md hover:shadow-lg`}
    >
      <Icon className={`w-6 h-6 ${color} mb-3`} />
      <motion.div className="text-3xl mb-1 text-gray-900" initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", delay: delay + 0.2 }}>
        {value}
      </motion.div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </motion.div>
  );
}

function SummaryItem({ label, value, percentage, color }: {
  label: string; value: string; percentage: number; color: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm text-gray-900 font-medium">{value}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div className={`h-full ${color} shadow-sm`} initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }} />
      </div>
    </div>
  );
}
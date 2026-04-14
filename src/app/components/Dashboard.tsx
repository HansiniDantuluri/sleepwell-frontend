import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Moon, Play, Wind, TrendingUp, Settings, Menu, CheckCircle, AlertCircle, Clock, Zap, Battery, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { api, type ScheduleBlock } from '../../lib/api';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showScheduleUpdate, setShowScheduleUpdate] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [aiNotes, setAiNotes] = useState('');
  const [confidence, setConfidence] = useState(87);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [noScheduleYet, setNoScheduleYet] = useState(false);

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const today = currentTime.toISOString().split('T')[0];

  // Load today's schedule
  useEffect(() => {
    const loadSchedule = async () => {
      setLoadingSchedule(true);
      try {
        const result = await api.schedule.getByDate(today);
        if (result && result.blocks && result.blocks.length > 0) {
          setSchedule(result.blocks);
          setAiNotes(result.ai_notes || '');
          setConfidence(result.confidence || 87);
          setShowScheduleUpdate(true);
        } else {
          setNoScheduleYet(true);
        }
      } catch {
        setNoScheduleYet(true);
      } finally {
        setLoadingSchedule(false);
      }
    };
    loadSchedule();
  }, [today]);

  // Get bedtime from user profile
  const bedtimeStr = user?.bedtime_target || '22:30';
  const [bedHour, bedMin] = bedtimeStr.split(':').map(Number);

  const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

  // Find current block from real schedule
  const getCurrentBlock = () => {
    return schedule.find(block => {
      return currentTimeStr >= block.start_time && currentTimeStr < block.end_time;
    });
  };

  const currentBlock = getCurrentBlock();
  const currentBlockIndex = schedule.findIndex(b => b === currentBlock);
  const nextBlock = schedule[currentBlockIndex + 1];

  // Time left in current block
  const getTimeLeft = () => {
    if (!currentBlock) return null;
    const [endHour, endMin] = currentBlock.end_time.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0);
    const timeLeft = endTime.getTime() - currentTime.getTime();
    return Math.floor(timeLeft / (1000 * 60));
  };

  const minutesLeft = getTimeLeft();
  const isRunningLate = minutesLeft !== null && minutesLeft < 15 && currentBlock?.block_type !== 'break';

  // Sleep countdown using real bedtime
  const sleepTime = new Date();
  sleepTime.setHours(bedHour, bedMin, 0);
  if (sleepTime < currentTime) sleepTime.setDate(sleepTime.getDate() + 1);
  const timeUntilSleep = Math.max(0, sleepTime.getTime() - currentTime.getTime());
  const hoursUntilSleep = Math.floor(timeUntilSleep / (1000 * 60 * 60));
  const minutesUntilSleep = Math.floor((timeUntilSleep % (1000 * 60 * 60)) / (1000 * 60));
  const isSleepSecured = hoursUntilSleep >= 0;

  const greeting =
    currentHour < 12 ? 'Good morning' :
    currentHour < 18 ? 'Good afternoon' :
    'Good evening';

  const getHeaderMessage = () => {
    if (noScheduleYet) return "Plan your day to get started! 📋";
    if (isSleepSecured && !isRunningLate) return "You're on track today 🔥";
    if (!isSleepSecured) return "Let's protect your sleep tonight 🌙";
    if (isRunningLate) return "Let's catch up on schedule 💪";
    return "You're doing great! ⭐";
  };

  const getSleepStatus = () => {
    if (hoursUntilSleep > 4) return 'safe';
    if (hoursUntilSleep > 2) return 'warning';
    return 'danger';
  };

  const sleepStatus = getSleepStatus();

  const getBlockColor = (block: ScheduleBlock) => {
    if (block.block_type === 'sleep') return 'bg-purple-200 border-purple-400 text-purple-900';
    if (block.block_type === 'wind_down') return 'bg-purple-100 border-purple-300 text-purple-900';
    if (block.block_type === 'break' || block.block_type === 'meal') return 'bg-green-100 border-green-300 text-green-900';
    switch (block.color) {
      case 'red': return 'bg-red-100 border-red-300 text-red-900';
      case 'yellow': return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'blue': return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'green': return 'bg-green-100 border-green-300 text-green-900';
      case 'purple': return 'bg-purple-100 border-purple-300 text-purple-900';
      default: return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="bg-gradient-to-r from-white via-white to-blue-50/50 border-b border-gray-200/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl text-gray-900">SleepWell</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate('/progress')} className="p-2 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 rounded-full transition-all">
              <TrendingUp className="w-6 h-6 text-gray-600" />
            </button>
            <button onClick={() => navigate('/settings')} className="p-2 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 rounded-full transition-all">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 pb-24">
        <div className="py-6">
          <h2 className="text-3xl mb-2 text-gray-900">{greeting}, {user?.name || 'there'} 👋</h2>

          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="text-gray-600 mb-6 flex items-center gap-2">
            {getHeaderMessage()}
          </motion.div>

          {/* Schedule update notification */}
          <AnimatePresence>
            {showScheduleUpdate && aiNotes && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-sm"
              >
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5, repeat: 2 }}>
                  <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="text-blue-900 mb-1">AI Schedule Ready ✨</div>
                  <div className="text-sm text-blue-700">{aiNotes}</div>
                </div>
                <button onClick={() => setShowScheduleUpdate(false)} className="text-blue-400 hover:text-blue-600 text-sm flex-shrink-0">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No schedule yet — prompt to plan */}
          {noScheduleYet && !loadingSchedule && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-4 text-center"
            >
              <div className="text-4xl mb-3">📋</div>
              <div className="text-gray-900 mb-2">No schedule for today yet</div>
              <div className="text-sm text-gray-600 mb-4">Plan your day and the AI will build a sleep-safe schedule for you!</div>
              <motion.button
                onClick={() => navigate('/plan')}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors">
                Plan My Day →
              </motion.button>
            </motion.div>
          )}

          {/* Loading */}
          {loadingSchedule && (
            <div className="flex items-center gap-3 text-gray-500 text-sm mb-4">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading your schedule...
            </div>
          )}

          {/* Current task card — only show if real schedule exists */}
          {currentBlock && currentBlock.block_type !== 'break' && currentBlock.block_type !== 'sleep' && currentBlock.block_type !== 'wind_down' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl p-6 mb-4 text-white shadow-xl relative overflow-hidden"
            >
              <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex-1">
                  <div className="text-sm opacity-90 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    HAPPENING NOW
                  </div>
                  <h3 className="text-2xl mb-2">{currentBlock.title}</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-sm opacity-90">{currentBlock.start_time} - {currentBlock.end_time}</div>
                    {minutesLeft !== null && (
                      <motion.div
                        className={`text-sm px-3 py-1 rounded-full ${isRunningLate ? 'bg-red-500/30' : 'bg-white/20'}`}
                        animate={{ scale: isRunningLate ? [1, 1.05, 1] : 1 }}
                        transition={{ duration: 1, repeat: isRunningLate ? Infinity : 0 }}
                      >
                        {minutesLeft} min left
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {isRunningLate && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-300/30 rounded-xl p-3 mb-4 flex items-center gap-2 relative z-10">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">You're running a bit behind — let's catch up</span>
                </motion.div>
              )}

              <motion.button onClick={() => navigate('/focus')}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full bg-white text-blue-600 py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 relative z-10">
                <Play className="w-5 h-5" />
                Start Focus Mode
              </motion.button>

              {nextBlock && (
                <div className="mt-4 pt-4 border-t border-white/20 relative z-10">
                  <div className="text-sm opacity-75 mb-1">Up next:</div>
                  <div className="flex items-center justify-between">
                    <span>{nextBlock.title}</span>
                    <span className="text-sm opacity-75">{nextBlock.start_time}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Sleep protection ring */}
          <div className={`rounded-3xl p-6 shadow-lg relative overflow-hidden ${
            sleepStatus === 'safe'
              ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200'
              : sleepStatus === 'warning'
              ? 'bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 border-2 border-orange-200'
              : 'bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 border-2 border-red-200'
          }`}>
            <motion.div
              className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl ${
                sleepStatus === 'safe' ? 'bg-green-300/30' :
                sleepStatus === 'warning' ? 'bg-orange-300/30' : 'bg-red-300/30'
              }`}
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none"
                    className={sleepStatus === 'safe' ? 'text-green-200' : sleepStatus === 'warning' ? 'text-orange-200' : 'text-red-200'} />
                  <motion.circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"
                    className={sleepStatus === 'safe' ? 'text-green-500' : sleepStatus === 'warning' ? 'text-orange-500' : 'text-red-500'}
                    initial={{ strokeDasharray: "251.2", strokeDashoffset: "251.2" }}
                    animate={{ strokeDashoffset: `${251.2 - (251.2 * Math.min(100, (hoursUntilSleep / 8) * 100)) / 100}` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Moon className={`w-8 h-8 ${sleepStatus === 'safe' ? 'text-green-600' : sleepStatus === 'warning' ? 'text-orange-600' : 'text-red-600'}`} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isSleepSecured ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-orange-600" />}
                  <span className={`font-medium ${sleepStatus === 'safe' ? 'text-green-900' : sleepStatus === 'warning' ? 'text-orange-900' : 'text-red-900'}`}>
                    {sleepStatus === 'safe' ? 'Sleep protected' : sleepStatus === 'warning' ? 'Sleep needs attention' : 'Sleep at risk'}
                  </span>
                </div>
                <div className="text-3xl mb-1 text-gray-900">{hoursUntilSleep}h {minutesUntilSleep}m</div>
                <div className="text-sm text-gray-600">until {bedtimeStr} bedtime</div>
              </div>
            </div>
          </div>

          {/* Energy bar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 mt-4 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <Battery className="w-5 h-5 text-amber-500" />
              <span className="text-gray-900">Energy Level Today</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Morning</span><span>Afternoon</span><span>Evening</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                <motion.div className="bg-gradient-to-r from-green-400 to-green-500" initial={{ width: 0 }} animate={{ width: "35%" }} transition={{ duration: 0.8, delay: 0.3 }} />
                <motion.div className="bg-gradient-to-r from-yellow-400 to-amber-500" initial={{ width: 0 }} animate={{ width: "40%" }} transition={{ duration: 0.8, delay: 0.5 }} />
                <motion.div className="bg-gradient-to-r from-blue-400 to-purple-500" initial={{ width: 0 }} animate={{ width: "25%" }} transition={{ duration: 0.8, delay: 0.7 }} />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span>High</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full"></div><span>Medium</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-500 rounded-full"></div><span>Low</span></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Schedule timeline */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-900">Today's Schedule</h3>
            {!noScheduleYet && (
              <button onClick={() => navigate('/plan')} className="text-sm text-blue-600 hover:text-blue-700">
                + Update
              </button>
            )}
          </div>

          {schedule.length > 0 ? (
            <div className="space-y-2">
              {schedule.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`p-4 rounded-2xl border-2 ${getBlockColor(block)} shadow-sm relative ${
                    block.block_type === 'sleep' ? 'overflow-hidden' : ''
                  } ${currentBlock?.id === block.id ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg' : ''}`}
                >
                  {block.block_type === 'sleep' && (
                    <>
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-300/20 to-blue-300/20"
                        animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 3, repeat: Infinity }} />
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-purple-900 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">🔒 Locked</div>
                      </div>
                    </>
                  )}
                  {block.is_auto_adjusted && block.block_type !== 'sleep' && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Auto-adjusted
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex-1">
                      <div className="text-sm opacity-70 mb-1 flex items-center gap-2">
                        {block.start_time} - {block.end_time}
                        {currentBlock?.id === block.id && (
                          <motion.span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full"
                            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            NOW
                          </motion.span>
                        )}
                      </div>
                      <div className="font-medium">{block.title}</div>
                    </div>
                    {block.block_type !== 'sleep' && block.block_type !== 'break' && block.block_type !== 'wind_down' && (
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        className="w-6 h-6 border-2 border-current rounded-full hover:bg-white/50 transition-colors" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : !loadingSchedule && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">🌙</div>
              <p>No schedule yet — tap Plan Day to create one!</p>
            </div>
          )}
        </div>

        {/* AI Confidence */}
        {schedule.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-5 mb-6 shadow-md relative overflow-hidden">
            <motion.div className="absolute -top-5 -right-5 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="text-purple-900">AI Confidence</span>
              </div>
              <motion.span className="text-2xl text-purple-900" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.5 }}>
                {confidence}%
              </motion.span>
            </div>
            <div className="text-sm text-purple-700 relative z-10">Your schedule is realistic and achievable</div>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200/50 p-6 max-w-lg mx-auto shadow-2xl">
        <div className="grid grid-cols-3 gap-3">
          <motion.button onClick={() => navigate('/plan')} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-3 rounded-2xl hover:shadow-lg transition-all flex flex-col items-center gap-2">
            <Menu className="w-6 h-6" />
            <span className="text-xs">Plan Day</span>
          </motion.button>
          <motion.button onClick={() => navigate('/focus')} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-3 rounded-2xl hover:shadow-lg transition-all flex flex-col items-center gap-2">
            <Play className="w-6 h-6" />
            <span className="text-xs">Focus</span>
          </motion.button>
          <motion.button onClick={() => navigate('/wind-down')} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white px-4 py-3 rounded-2xl hover:shadow-lg transition-all flex flex-col items-center gap-2">
            <Wind className="w-6 h-6" />
            <span className="text-xs">Wind Down</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
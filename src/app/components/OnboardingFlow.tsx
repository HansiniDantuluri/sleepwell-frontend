import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Target, Moon, Calendar, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';

const steps = [
  { id: 'goals', title: 'What are your goals?', icon: Target },
  { id: 'sleep', title: 'Tell us about your sleep', icon: Moon },
  { id: 'schedule', title: 'Your daily schedule', icon: Calendar },
  { id: 'struggles', title: 'What challenges you most?', icon: Zap },
  { id: 'energy', title: 'Your energy pattern', icon: Clock },
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [goals, setGoals] = useState<string[]>([]);
  const [struggles, setStruggles] = useState<string[]>([]);
  const [energyType, setEnergyType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!email || !password || !name) {
        setError('Please fill in your name, email and password!');
        return;
      }
      setLoading(true);
      setError('');
      try {
        await register(email, password, name);
        navigate('/dashboard');
      } catch (e: any) {
        setError(e.message || 'Something went wrong. Try again!');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSkip = () => navigate('/dashboard');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-white border-b border-gray-100">
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-8 mt-8">
              {(() => {
                const Icon = steps[currentStep].icon;
                return <Icon className="w-16 h-16 text-blue-500 mx-auto" />;
              })()}
            </div>

            <h2 className="text-2xl mb-8 text-center text-gray-900">
              {steps[currentStep].title}
            </h2>

            <div className="flex-1">
              {currentStep === 0 && <GoalsStep selected={goals} setSelected={setGoals} />}
              {currentStep === 1 && <SleepStep bedtime={bedtime} setBedtime={setBedtime} wakeTime={wakeTime} setWakeTime={setWakeTime} />}
              {currentStep === 2 && <ScheduleStep />}
              {currentStep === 3 && <StrugglesStep selected={struggles} setSelected={setStruggles} />}
              {currentStep === 4 && (
                <EnergyAndAccountStep
                  energyType={energyType} setEnergyType={setEnergyType}
                  email={email} setEmail={setEmail}
                  password={password} setPassword={setPassword}
                  name={name} setName={setName}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

        <div className="mt-8 flex justify-between items-center gap-4">
          <button onClick={handleSkip} className="text-gray-500 hover:text-gray-700 px-4 py-2">
            Skip
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Setting up...' : currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalsStep({ selected, setSelected }: { selected: string[]; setSelected: (g: string[]) => void }) {
  const goals = [
    { id: 'sleep', label: 'Better sleep', icon: '😴' },
    { id: 'stress', label: 'Reduce stress', icon: '🧘' },
    { id: 'time', label: 'Manage time', icon: '⏰' },
  ];
  const toggle = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter(g => g !== id) : [...selected, id]);
  return (
    <div className="space-y-3">
      {goals.map(goal => (
        <button key={goal.id} onClick={() => toggle(goal.id)}
          className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
            selected.includes(goal.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}>
          <span className="text-3xl">{goal.icon}</span>
          <span className="text-gray-900">{goal.label}</span>
        </button>
      ))}
    </div>
  );
}

function SleepStep({ bedtime, setBedtime, wakeTime, setWakeTime }: {
  bedtime: string; setBedtime: (v: string) => void;
  wakeTime: string; setWakeTime: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-600 mb-2">Ideal sleep time</label>
        <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-2">Wake up time</label>
        <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>
  );
}

function ScheduleStep() {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-gray-600 mb-2">School start time</label>
        <input type="time" defaultValue="08:00"
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-2">School end time</label>
        <input type="time" defaultValue="15:00"
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-2">Extracurricular activities</label>
        <textarea placeholder="e.g., Basketball practice 4-6pm, Piano lessons Wednesday..."
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={4} />
      </div>
    </div>
  );
}

function StrugglesStep({ selected, setSelected }: { selected: string[]; setSelected: (s: string[]) => void }) {
  const struggles = [
    { id: 'phone', label: 'Phone addiction', icon: '📱' },
    { id: 'procrastination', label: 'Procrastination', icon: '⏳' },
    { id: 'workload', label: 'Heavy workload', icon: '📚' },
    { id: 'stress', label: 'Exam stress', icon: '😰' },
  ];
  const toggle = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  return (
    <div className="space-y-3">
      {struggles.map(s => (
        <button key={s.id} onClick={() => toggle(s.id)}
          className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
            selected.includes(s.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
          }`}>
          <span className="text-3xl">{s.icon}</span>
          <span className="text-gray-900">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

function EnergyAndAccountStep({
  energyType, setEnergyType, email, setEmail, password, setPassword, name, setName
}: {
  energyType: string; setEnergyType: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  name: string; setName: (v: string) => void;
}) {
  const types = [
    { id: 'morning', label: 'Morning person', time: '🌅 Peak: 7am - 11am' },
    { id: 'afternoon', label: 'Afternoon person', time: '☀️ Peak: 12pm - 4pm' },
    { id: 'night', label: 'Night person', time: '🌙 Peak: 7pm - 11pm' },
  ];
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {types.map(type => (
          <button key={type.id} onClick={() => setEnergyType(type.id)}
            className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
              energyType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
            <div className="text-gray-900 mb-1">{type.label}</div>
            <div className="text-sm text-gray-500">{type.time}</div>
          </button>
        ))}
      </div>
      <div className="border-t pt-4 space-y-3">
        <p className="text-sm text-gray-500 text-center">Create your account to save progress</p>
        <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>
  );
}
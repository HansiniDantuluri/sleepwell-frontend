import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Sparkles, GripVertical, Check, AlertCircle, Mic, MicOff, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { useSpeechInput } from '../../hooks/useSpeechInput';

type Step = 'input' | 'preferences' | 'generating' | 'schedule' | 'edit';

interface Task {
  id: string;
  name: string;
  type: string;
  deadline: string;
  estimatedTime: string;
  priority: string;
}

interface ScheduleBlock {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  block_type: string;
  color: string;
  is_locked: boolean;
  is_auto_adjusted: boolean;
}

export function PlanMyDay() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [freeText, setFreeText] = useState('');
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleBlock[]>([]);
  const [aiNotes, setAiNotes] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleGenerate = async () => {
    setStep('generating');
    setError('');
    try {
      const taskDescriptions = tasks.map(t =>
        `${t.name} (${t.type}, ${t.estimatedTime}, ${t.priority} priority${t.deadline ? `, deadline: ${t.deadline}` : ''})`
      ).join(', ');

      const combinedText = [taskDescriptions, freeText].filter(Boolean).join(', ');

      const result = await api.schedule.generate({
        date: today,
        free_text_tasks: combinedText || undefined,
      });

      setGeneratedSchedule(result.blocks);
      setAiNotes(result.ai_notes || '');
      setConfidence(result.confidence || 85);
      setStep('schedule');
    } catch (e: any) {
      setError(e.message || 'Failed to generate schedule. Try again!');
      setStep('preferences');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
          <motion.button
            onClick={() => step === 'input' ? navigate('/dashboard') : setStep('input')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 rounded-full transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </motion.button>
          <h1 className="text-xl text-gray-900">Plan My Day</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm">
            {error}
          </div>
        )}
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <TaskInputStep
              tasks={tasks}
              setTasks={setTasks}
              freeText={freeText}
              setFreeText={setFreeText}
              onNext={() => setStep('preferences')}
            />
          )}
          {step === 'preferences' && (
            <PreferencesStep onNext={handleGenerate} />
          )}
          {step === 'generating' && <GeneratingStep />}
          {step === 'schedule' && (
            <ScheduleStep
              blocks={generatedSchedule}
              aiNotes={aiNotes}
              confidence={confidence}
              onEdit={() => setStep('edit')}
              onConfirm={() => navigate('/dashboard')}
            />
          )}
          {step === 'edit' && (
            <EditScheduleStep
              blocks={generatedSchedule}
              onSave={(updated) => {
                setGeneratedSchedule(updated);
                navigate('/dashboard');
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TaskInputStep({ tasks, setTasks, freeText, setFreeText, onNext }: {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  freeText: string;
  setFreeText: (t: string) => void;
  onNext: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '', type: 'homework', deadline: '', estimatedTime: '', priority: 'normal',
  });
  const { state, transcript, startRecording, stopRecording, reset } = useSpeechInput();

  useEffect(() => {
    if (state === 'done' && transcript) {
      setFreeText((prev: string) => prev ? `${prev}, ${transcript}` : transcript);
      reset();
    }
  }, [state, transcript]);

  const handleMicClick = () => {
    if (state === 'recording') {
      stopRecording();
    } else {
      reset();
      startRecording();
    }
  };

  const addTask = () => {
    if (newTask.name && newTask.estimatedTime) {
      setTasks([...tasks, { ...newTask, id: Date.now().toString() }]);
      setNewTask({ name: '', type: 'homework', deadline: '', estimatedTime: '', priority: 'normal' });
      setShowForm(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
      <h2 className="text-2xl mb-2 text-gray-900">What do you need to do today?</h2>
      <p className="text-gray-500 text-sm mb-6">Type, speak, or add tasks manually</p>

      <div className="bg-white rounded-3xl border-2 border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <motion.button
            onClick={handleMicClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-full transition-all ${
              state === 'recording'
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            {state === 'recording' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>
          <span className="text-sm text-gray-500">
            {state === 'recording' ? '🔴 Recording... tap to stop' :
             state === 'processing' ? '⏳ Processing...' :
             'Tap mic to speak your tasks'}
          </span>
          {state === 'processing' && <Loader className="w-4 h-4 text-blue-500 animate-spin" />}
        </div>
        <textarea
          placeholder="e.g. finish math homework by 6pm, study for biology test 2 hours, gym 1 hour..."
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
          rows={3}
        />
        <p className="text-xs text-gray-400 mt-2">The AI understands natural language — deadlines, durations, priorities</p>
      </div>

      <div className="space-y-3 mb-4">
        {tasks.map(task => (
          <div key={task.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-gray-900 mb-1">{task.name}</div>
                <div className="text-sm text-gray-500">{task.type} • {task.estimatedTime} • {task.priority} priority</div>
              </div>
              <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-gray-400 hover:text-red-500 text-sm">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-200 mb-6 space-y-4">
          <input type="text" placeholder="Task name" value={newTask.name}
            onChange={e => setNewTask({ ...newTask, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={newTask.type} onChange={e => setNewTask({ ...newTask, type: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="homework">Homework</option>
            <option value="exam">Exam Prep</option>
            <option value="assignment">Assignment</option>
            <option value="health">Exercise/Health</option>
            <option value="personal">Personal</option>
          </select>
          <input type="text" placeholder="Estimated time (e.g., 2h, 45min)" value={newTask.estimatedTime}
            onChange={e => setNewTask({ ...newTask, estimatedTime: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="time" placeholder="Deadline (optional)" value={newTask.deadline}
            onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="flexible">Flexible</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
          <div className="flex gap-2">
            <button onClick={addTask} className="flex-1 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors">Add Task</button>
            <button onClick={() => setShowForm(false)} className="px-6 bg-white text-gray-600 py-3 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
          <Plus className="w-5 h-5" />
          Add Task Manually
        </button>
      )}

      <button
        onClick={onNext}
        disabled={tasks.length === 0 && !freeText.trim()}
        className="w-full bg-blue-500 text-white py-4 rounded-2xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue →
      </button>
    </motion.div>
  );
}

function PreferencesStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
      <h2 className="text-2xl mb-6 text-gray-900">Almost ready!</h2>
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm text-gray-600 mb-3">Sleep goal time</label>
          <input type="time" defaultValue="22:30"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-3">Current energy level</label>
          <div className="flex gap-2">
            {['😴 Low', '😐 Medium', '⚡ High'].map((level, index) => (
              <button key={level}
                className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                  index === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={onNext}
        className="w-full bg-blue-500 text-white py-4 rounded-2xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5" />
        Generate My AI Schedule
      </button>
    </motion.div>
  );
}

function GeneratingStep() {
  const messages = [
    "Analyzing your tasks...",
    "Protecting your sleep time...",
    "Optimizing for your energy...",
    "Almost done..."
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mb-6">
        <Sparkles className="w-16 h-16 text-blue-500" />
      </motion.div>
      <h2 className="text-2xl mb-3 text-gray-900 text-center">Building your schedule...</h2>
      <motion.p key={msgIndex} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
        className="text-gray-600 text-center">{messages[msgIndex]}</motion.p>
    </motion.div>
  );
}

function getBlockColor(color: string, blockType: string) {
  if (blockType === 'sleep') return 'bg-purple-200 border-purple-400 text-purple-900';
  if (blockType === 'wind_down') return 'bg-purple-100 border-purple-300 text-purple-900';
  if (blockType === 'break' || blockType === 'meal') return 'bg-green-100 border-green-300 text-green-900';
  switch (color) {
    case 'red': return 'bg-red-100 border-red-300 text-red-900';
    case 'yellow': return 'bg-yellow-100 border-yellow-300 text-yellow-900';
    case 'blue': return 'bg-blue-100 border-blue-300 text-blue-900';
    case 'green': return 'bg-green-100 border-green-300 text-green-900';
    case 'purple': return 'bg-purple-100 border-purple-300 text-purple-900';
    default: return 'bg-gray-100 border-gray-300 text-gray-900';
  }
}

function ScheduleStep({ blocks, aiNotes, confidence, onEdit, onConfirm }: {
  blocks: ScheduleBlock[];
  aiNotes: string;
  confidence: number;
  onEdit: () => void;
  onConfirm: () => void;
}) {
  const hasOverflow = aiNotes?.toLowerCase().includes("couldn't fit") || aiNotes?.toLowerCase().includes("overflow");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
      {hasOverflow ? (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-orange-900 mb-1">Reality Check</div>
              <div className="text-sm text-orange-700">Some tasks couldn't fit before your sleep time</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <div className="text-green-900 mb-1">Schedule optimized! 🎉</div>
            <div className="text-sm text-green-700">Your sleep is protected</div>
          </div>
        </div>
      )}

      {aiNotes && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-900">AI says ({confidence}% confidence)</span>
          </div>
          <p className="text-sm text-blue-700">{aiNotes}</p>
        </div>
      )}

      <h2 className="text-2xl mb-4 text-gray-900">Your schedule for today</h2>

      <div className="space-y-2 mb-6">
        {blocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`p-4 rounded-2xl border-2 ${getBlockColor(block.color, block.block_type)} relative`}
          >
            {block.is_locked && (
              <div className="absolute top-2 right-2">
                <div className="bg-purple-900 text-white text-xs px-2 py-1 rounded-full">🔒 Locked</div>
              </div>
            )}
            {block.is_auto_adjusted && !block.is_locked && (
              <div className="absolute top-2 right-2">
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-adjusted
                </div>
              </div>
            )}
            <div className="text-sm opacity-70 mb-1">{block.start_time} - {block.end_time}</div>
            <div className="font-medium">{block.title}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onEdit} className="flex-1 bg-white text-gray-700 py-4 rounded-2xl border-2 border-gray-300 hover:bg-gray-50 transition-colors">
          Edit Schedule
        </button>
        <button onClick={onConfirm} className="flex-1 bg-blue-500 text-white py-4 rounded-2xl hover:bg-blue-600 transition-colors">
          Confirm & Start
        </button>
      </div>
    </motion.div>
  );
}

function EditScheduleStep({ blocks, onSave }: {
  blocks: ScheduleBlock[];
  onSave: (updated: ScheduleBlock[]) => void;
}) {
  const [reordered, setReordered] = useState<ScheduleBlock[]>(blocks);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    if (reordered[index].is_locked) return;

    const updated = [...reordered];
    const dragged = updated.splice(dragIndex, 1)[0];
    updated.splice(index, 0, dragged);
    setReordered(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
      <h2 className="text-2xl mb-2 text-gray-900">Edit your schedule</h2>
      <p className="text-gray-600 mb-1 text-sm">Drag tasks to reorder them</p>
      <p className="text-xs text-gray-400 mb-6">🔒 Locked blocks cannot be moved</p>

      <div className="space-y-2 mb-6">
        {reordered.map((block, index) => (
          <div
            key={block.id}
            draggable={!block.is_locked}
            onDragStart={() => handleDragStart(index)}
            onDragOver={e => handleDragOver(e, index)}
            onDrop={e => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`p-4 rounded-2xl border-2 ${getBlockColor(block.color, block.block_type)} flex items-center gap-3 transition-all select-none ${
              block.is_locked ? 'opacity-70 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:shadow-md'
            } ${dragIndex === index ? 'opacity-40 scale-95' : ''} ${
              dragOverIndex === index && dragIndex !== index && !block.is_locked ? 'border-blue-500 shadow-lg' : ''
            }`}
          >
            {!block.is_locked && <GripVertical className="w-5 h-5 opacity-40 flex-shrink-0" />}
            {block.is_locked && <span className="text-sm flex-shrink-0">🔒</span>}
            <div className="flex-1">
              <div className="text-sm opacity-70 mb-1">{block.start_time} - {block.end_time}</div>
              <div className="font-medium">{block.title}</div>
            </div>
            {!block.is_locked && <div className="text-xs opacity-30">drag</div>}
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave(reordered)}
        className="w-full bg-blue-500 text-white py-4 rounded-2xl hover:bg-blue-600 transition-colors"
      >
        Save & Go to Dashboard
      </button>
    </motion.div>
  );
}
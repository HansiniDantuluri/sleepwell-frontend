import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Music, Wind, BookOpen, Play, Pause, SkipBack, SkipForward, Volume2, ExternalLink, ChevronRight, Sparkles, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Mode = 'music' | 'breathing' | 'story';

const TRACKS = [
  { name: 'Ocean Waves', emoji: '🌊', url: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3' },
  { name: 'Heavy Rain', emoji: '🌧️', url: 'https://www.soundjay.com/nature/sounds/rain-01.mp3' },
  { name: 'Light Rain', emoji: '🌦️', url: 'https://www.soundjay.com/nature/sounds/rain-02.mp3' },
  { name: 'Forest Ambience', emoji: '🌿', url: 'https://www.soundjay.com/nature/sounds/forest-1.mp3' },
  { name: 'White Noise', emoji: '🌬️', url: 'https://www.soundjay.com/misc/sounds/white-noise-1.mp3' },
  { name: 'Thunderstorm', emoji: '⛈️', url: 'https://www.soundjay.com/nature/sounds/thunder-1.mp3' },
  { name: 'River Stream', emoji: '🏞️', url: 'https://www.soundjay.com/nature/sounds/stream-1.mp3' },
  { name: 'Crickets Night', emoji: '🦗', url: 'https://www.soundjay.com/nature/sounds/crickets-1.mp3' },
  { name: 'Fireplace', emoji: '🔥', url: 'https://www.soundjay.com/nature/sounds/fire-1.mp3' },
  { name: 'Wind Chimes', emoji: '🎐', url: 'https://www.soundjay.com/nature/sounds/wind-chime-1.mp3' },
  { name: 'Deep Space', emoji: '🌌', url: 'https://www.soundjay.com/misc/sounds/white-noise-1.mp3' },
  { name: 'Cafe Ambience', emoji: '☕', url: 'https://www.soundjay.com/misc/sounds/typing-1.mp3' },
];

const BREATHING_EXERCISES = [
  {
    id: 'box',
    name: 'Box Breathing',
    emoji: '📦',
    description: 'Used by Navy SEALs to stay calm under pressure',
    benefit: 'Reduces stress and improves focus instantly',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Breathe in through your nose' },
      { name: 'hold', duration: 4, instruction: 'Hold your breath' },
      { name: 'exhale', duration: 4, instruction: 'Breathe out through your mouth' },
      { name: 'hold', duration: 4, instruction: 'Hold empty' },
    ],
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    emoji: '😴',
    description: 'Called the "natural tranquilizer" — proven to help you fall asleep faster',
    benefit: 'Clinically proven to reduce anxiety and aid sleep',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Breathe in quietly through your nose' },
      { name: 'hold', duration: 7, instruction: 'Hold your breath completely' },
      { name: 'exhale', duration: 8, instruction: 'Exhale completely through your mouth' },
    ],
  },
  {
    id: 'diaphragm',
    name: 'Deep Belly Breathing',
    emoji: '🫁',
    description: 'Activates your body\'s relaxation response',
    benefit: 'Lowers heart rate and blood pressure within minutes',
    phases: [
      { name: 'inhale', duration: 5, instruction: 'Breathe deep into your belly, not your chest' },
      { name: 'hold', duration: 2, instruction: 'Feel your belly fully expanded' },
      { name: 'exhale', duration: 6, instruction: 'Let your belly fall slowly' },
      { name: 'hold', duration: 1, instruction: 'Pause before next breath' },
    ],
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    emoji: '💙',
    description: '5 breaths per minute — syncs your heart and brain',
    benefit: 'Maximizes heart rate variability, deepest relaxation state',
    phases: [
      { name: 'inhale', duration: 6, instruction: 'Slow, steady breath in through your nose' },
      { name: 'exhale', duration: 6, instruction: 'Slow, steady breath out through your mouth' },
    ],
  },
  {
    id: 'military',
    name: 'Military Sleep Method',
    emoji: '🪖',
    description: 'Used by the US Army to fall asleep in 2 minutes anywhere',
    benefit: '96% success rate after 6 weeks of practice',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Relax your face — jaw, eyes, forehead completely' },
      { name: 'exhale', duration: 4, instruction: 'Drop your shoulders and let your hands go limp' },
      { name: 'inhale', duration: 4, instruction: 'Breathe in, relax your chest and legs' },
      { name: 'exhale', duration: 8, instruction: 'Clear your mind — imagine floating in a warm room' },
    ],
  },
  {
    id: 'alternating',
    name: 'Alternate Nostril',
    emoji: '🌀',
    description: 'Ancient yoga technique for mental clarity',
    benefit: 'Balances both sides of the brain, calms overthinking',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Block right nostril, inhale through left' },
      { name: 'hold', duration: 2, instruction: 'Block both nostrils' },
      { name: 'exhale', duration: 4, instruction: 'Block left nostril, exhale through right' },
      { name: 'inhale', duration: 4, instruction: 'Inhale through right nostril' },
      { name: 'hold', duration: 2, instruction: 'Block both nostrils' },
      { name: 'exhale', duration: 4, instruction: 'Block right nostril, exhale through left' },
    ],
  },
  {
    id: 'pursed',
    name: 'Pursed Lip Breathing',
    emoji: '💨',
    description: 'Used by doctors to slow breathing rate quickly',
    benefit: 'Instantly slows breathing, releases trapped air from lungs',
    phases: [
      { name: 'inhale', duration: 2, instruction: 'Breathe in slowly through your nose' },
      { name: 'exhale', duration: 4, instruction: 'Purse your lips like blowing out a candle, breathe out slowly' },
    ],
  },
  {
    id: 'humming',
    name: 'Humming Bee Breath',
    emoji: '🐝',
    description: 'Yoga technique — the vibration calms the nervous system',
    benefit: 'Proven to reduce heart rate and blood pressure in 5 minutes',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Breathe in deeply through your nose' },
      { name: 'hold', duration: 1, instruction: 'Close your eyes and lips gently' },
      { name: 'exhale', duration: 6, instruction: 'Exhale making a soft humming "mmm" sound — feel the vibration' },
    ],
  },
  {
    id: 'triangle',
    name: 'Triangle Breathing',
    emoji: '🔺',
    description: 'Simple 3-part breath — perfect for beginners',
    benefit: 'Activates the parasympathetic nervous system in under 2 minutes',
    phases: [
      { name: 'inhale', duration: 4, instruction: 'Breathe in through your nose' },
      { name: 'hold', duration: 4, instruction: 'Hold at the top' },
      { name: 'exhale', duration: 4, instruction: 'Breathe out completely' },
    ],
  },
  {
    id: 'sighing',
    name: 'Physiological Sigh',
    emoji: '😮‍💨',
    description: 'Stanford study: the fastest way to reduce stress in real time',
    benefit: 'Scientifically shown to reduce anxiety faster than any other technique',
    phases: [
      { name: 'inhale', duration: 2, instruction: 'Breathe in through your nose until lungs are full' },
      { name: 'inhale', duration: 1, instruction: 'Take one more quick sniff to fully inflate lungs' },
      { name: 'exhale', duration: 8, instruction: 'Long, slow exhale through your mouth — completely empty' },
    ],
  },
  {
    id: 'progressive',
    name: 'Progressive Relaxation Breath',
    emoji: '🌊',
    description: 'Combines breathing with muscle relaxation — used in CBT-I therapy',
    benefit: 'Reduces physical tension and mental anxiety simultaneously',
    phases: [
      { name: 'inhale', duration: 5, instruction: 'Breathe in and tense your feet and legs tightly' },
      { name: 'hold', duration: 2, instruction: 'Hold the tension and your breath' },
      { name: 'exhale', duration: 7, instruction: 'Release everything — breath AND all muscle tension at once' },
      { name: 'hold', duration: 2, instruction: 'Notice the wave of relaxation moving up your body' },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean Breath (Ujjayi)',
    emoji: '🌊',
    description: 'Creates an internal ocean sound that drowns out racing thoughts',
    benefit: 'Used in yoga nidra — induces hypnagogic sleep-like state',
    phases: [
      { name: 'inhale', duration: 5, instruction: 'Breathe in through your nose, slightly constrict the back of your throat' },
      { name: 'exhale', duration: 6, instruction: 'Breathe out making a soft "haaa" sound in your throat — like ocean waves' },
    ],
  },
];

const STORIES = [
  {
    title: "The Upside Down Test",
    genre: "Stranger Things inspired",
    emoji: "🔦",
    readTime: "4 min",
    scienceBadge: "📖 Narrative transport theory — stories pull your mind away from stress",
    text: `The night before the biggest test of the year, you find a walkie-talkie under your bed.

It crackles to life at exactly 11:43 PM.

"Hey. You awake?" The voice is familiar — it's you. But different. Older somehow, and weirdly calm.

"The test tomorrow," your future self says. "I remember it. You're going to think you failed. You won't."

You want to ask a hundred questions but the static is getting louder.

"Just sleep," the voice says. "Seriously. The version of you who slept eight hours did better than the version who stayed up. I know because I was both."

The walkie-talkie goes quiet.

Outside your window, the lights on your street flicker once — then settle back to normal.

You put the walkie-talkie on your nightstand. Somehow, impossibly, you feel okay.

The Upside Down version of your test anxiety dissolves into the dark.

You close your eyes. The lights stay on tonight.`,
    youtubeLink: 'https://www.youtube.com/results?search_query=stranger+things+ambient+music+sleep',
    youtubeLabel: 'Stranger Things sleep ambience'
  },
  {
    title: "The Hogwarts Common Room at 2AM",
    genre: "Harry Potter inspired",
    emoji: "🪄",
    readTime: "3 min",
    scienceBadge: "🧠 Familiar fictional worlds reduce cortisol — proven stress relief",
    text: `The Gryffindor common room is empty at 2 AM.

The fire burns low — orange and gold, casting soft shadows on the worn armchairs. Outside the tower windows, the grounds of Hogwarts are silver and still. Somewhere in the distance, the lake glitters.

You're here because you couldn't sleep. But now that you're here, surrounded by the quiet magic of this place, you understand something: even Hermione slept. Even Harry, before the hardest battles, had to rest first.

The portrait of the Fat Lady snores softly from the entrance.

A first-year cat pads in from somewhere, curls up on the hearthrug without explanation, and is asleep within seconds.

You watch the fire. It doesn't ask anything of you. It just burns, warm and unhurried.

Your body feels heavy in the best way. The kind of heavy that means you're finally, finally letting go.

Tomorrow has enough magic of its own.

Right now, there is only the fire. The warmth. The silence.

And sleep, coming for you like a gentle spell you didn't know you needed.`,
    youtubeLink: 'https://www.youtube.com/results?search_query=hogwarts+common+room+ambience+sleep',
    youtubeLabel: 'Hogwarts common room ambience'
  },
  {
    title: "After the Blip",
    genre: "Marvel inspired",
    emoji: "✨",
    readTime: "4 min",
    scienceBadge: "💤 Perspective-shifting narratives reduce pre-sleep rumination",
    text: `Five years passed for some people. Five seconds for others.

Peter Parker understood something the rest of the world was still figuring out: time is strange, and you can't get back what you missed. But you can show up for what's here.

Tonight, he's sitting on a rooftop in Queens. Not as Spider-Man. Just as Peter. Jacket. Headphones. A thermos of hot chocolate that's gone lukewarm.

The city hums below. Millions of people trying to get back to normal — whatever that means.

He thinks about everything on his plate. The assignments. The things he said. The things he didn't. The future that feels impossible to plan for.

And then he thinks about what May always says: "You can't web-sling into tomorrow. You can only swing from where you are."

He finishes the lukewarm chocolate.

The city keeps humming.

Somewhere in an apartment below, a light goes out. Then another. Then another. The city is going to sleep.

And Peter Parker, for the first time in weeks, decides to let himself do the same.

He closes his eyes. The city will still be there in the morning.

So will everything else. All of it can wait until you're rested.`,
    youtubeLink: 'https://www.youtube.com/results?search_query=marvel+ambient+sleep+music',
    youtubeLabel: 'Marvel sleep ambience'
  },
  {
    title: "The Midnight Library",
    genre: "Magical Realism",
    emoji: "📚",
    readTime: "3 min",
    scienceBadge: "🔬 Stories about alternate possibilities reduce decision anxiety",
    text: `There's a library that only appears between 11:59 PM and 12:01 AM.

The shelves stretch infinitely. Each book glows faintly, warm as a nightlight.

Every book is a version of your life — paths not yet taken, choices made differently. You pull one from the shelf. Inside, a version of you chose to stress less, to sleep earlier, to trust that things would work out.

That version of you looks peaceful.

You put the book back.

You don't need to read every possibility tonight. You just need to rest for this one.

The library begins to dissolve. Midnight passes like a held breath finally released.

You feel lighter.

Tomorrow is just another page in a story that isn't finished yet. And the best stories always have a chapter where the hero finally rests.

Close your eyes. Let the words carry you.`,
    youtubeLink: 'https://www.youtube.com/results?search_query=magical+library+ambience+sleep',
    youtubeLabel: 'Magical library ambience'
  },
  {
    title: "Last Stop: The Dream Station",
    genre: "Adventure",
    emoji: "🚂",
    readTime: "4 min",
    scienceBadge: "🚂 Visualization journeys are clinically used in CBT-I sleep therapy",
    text: `The train appears at the edge of town every night at exactly 11 PM.

No timetable. No destination listed. Just warm windows and the soft sound of wheels on rails.

You board it.

The seats are deep blue velvet, like the sky just after sunset. Other passengers sit quietly — some reading, some watching the blur of landscape outside. Nobody talks, but it feels like everyone understands the same unspoken thing.

Outside: forests, oceans, mountain ranges, and sleeping cities all pass at impossible speeds. You realize the train isn't going anywhere specific. That's the point. Sometimes moving is enough.

The rhythm of the wheels slows to match your heartbeat.

Slow. Steady. Reliable.

Your bag of worries slides off your shoulder. You didn't notice yourself putting it down, but it's on the overhead rack now, out of reach, out of mind.

The window fogs slightly from your breath.

You write your name in the fog with one finger. Then watch it slowly disappear.

The train rocks gently.

Last stop: sleep. You've arrived.`,
    youtubeLink: 'https://www.youtube.com/results?search_query=train+rain+ambience+sleep',
    youtubeLabel: 'Train ambience for sleep'
  },
  {
    title: "The Astronaut's Rest",
    genre: "Sci-Fi",
    emoji: "🚀",
    readTime: "4 min",
    scienceBadge: "🌍 Overview effect: seeing problems as small reduces anxiety measurably",
    text: `You're 400 kilometers above Earth.

The International Space Station hums. Through the cupola window, you see the entire Pacific Ocean — blue and silver in the sunlight below.

Every 90 minutes, a sunrise. Sixteen per day. Each one different. Each one impossible.

In space, the body floats. No pressure on your spine. No weight on your joints. Astronauts come back changed — not just from what they saw, but from what they felt.

Small. But not in a bad way.

The way that means: the universe is larger than any deadline. Your city is a cluster of lights smaller than your thumbnail. The exam, the argument, the thing you're dreading — you can barely make it out from here.

A colleague is asleep in the next module, strapped gently into a sleeping bag to keep from drifting. In space, even sleep has to be intentional.

You zip yourself in.

The Earth turns below you, blue and patient.

Gravity will return tomorrow. Everything will return tomorrow.

But tonight, you float. Weightless. Quiet. Free.`,
    youtubeLink: 'https://www.youtube.com/results?search_query=space+station+ambience+sleep',
    youtubeLabel: 'Space station ambience'
  },
  {
    title: "The Island of Unfinished Thoughts",
    genre: "Fantasy",
    emoji: "🏝️",
    readTime: "3 min",
    scienceBadge: "📝 Externalizing worries to an imaginary place reduces bedtime anxiety (2019 study)",
    text: `Somewhere in the ocean of your mind, there's an island where all your unfinished thoughts go to wait.

The essay you haven't finished — it's sitting under a palm tree, perfectly content. The conversation you're nervous about — it's building sandcastles by the shore. Tomorrow's schedule is already asleep in a hammock.

Nothing here is urgent. Everything is just... waiting. Patiently. Without judgment.

You visit tonight.

You tell your thoughts: "I'll come back for you tomorrow. Tonight I'm setting you down."

And they wave goodbye, smiling. They know you'll return refreshed. Sharper. More ready.

A boat takes you back across the water.

The island gets smaller behind you. The thoughts on it get smaller too — not gone, just distant, manageable.

You reach the shore of sleep.

Step off the boat.

The island will still be there when you need it. But right now, the only thing that matters is this: your breathing. The warmth. The dark behind your eyelids.

Let the water carry the weight.

You're free for tonight.`,
    youtubeLink: 'https://www.youtube.com/results?search_query=tropical+island+ambience+sleep',
    youtubeLabel: 'Island ambience for sleep'
  },
  {
    title: "The Rain Journal",
    genre: "Slice of Life",
    emoji: "🌧️",
    readTime: "3 min",
    scienceBadge: "🌧️ Pink noise (rain) increases slow-wave sleep by 23% — Stanford study",
    text: `It's raining outside your window.

Not the kind of rain that ruins plans. The kind that makes staying in feel like the best decision you ever made.

You have a journal open. But you're not writing. You're just listening.

Each raindrop hits the glass at a slightly different pitch. Together they make something that isn't quite music but isn't quite noise either. Just sound — honest, unplanned, perfect.

You think about today. Not to analyze it. Just to let it exist. It happened. You got through it. Even the hard parts brought you here, to this room, to this rain.

On the page, without planning to, you write three words:

"I was here."

You close the journal.

Outside, the rain keeps its own rhythm — slower now, like it's also winding down.

Your breathing matches it.

Slower. Softer.

Until the rain and your breath are almost the same thing.

Almost indistinguishable from sleep.`,
    youtubeLink: 'https://www.youtube.com/results?search_query=rain+on+window+sleep+sounds',
    youtubeLabel: 'Rain on window sounds'
  },
];

export function WindDownMode() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => { return () => setIsPlaying(false); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-950 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 bg-white rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }} />
        ))}
      </div>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div key={i} className="absolute w-96 h-96 rounded-full blur-3xl"
            style={{
              background: i % 2 === 0 ? 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
              left: `${i * 30}%`, top: `${i * 25}%`,
            }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 15 + i * 3, repeat: Infinity, repeatType: "reverse" }} />
        ))}
      </div>

      <div className="relative z-10 border-b border-white/10 backdrop-blur-sm bg-black/10">
        <div className="max-w-lg mx-auto px-6 py-4">
          <button onClick={() => { setIsPlaying(false); navigate('/dashboard'); }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-white/80" />
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-6 py-10">
        {!selectedMode ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <motion.h1 className="text-5xl mb-3 text-white text-center"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
              Wind Down
            </motion.h1>
            <motion.p className="text-blue-200 text-center mb-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              Prepare your mind and body for sleep
            </motion.p>
            <div className="space-y-4">
              <ModeCard icon={Music} title="Calming Music" description="Real relaxation sounds to calm your mind"
                gradient="from-pink-500/20 via-purple-500/20 to-purple-600/20" onClick={() => setSelectedMode('music')} delay={0.1} />
              <ModeCard icon={Wind} title="Breathing Exercises" description="Science-backed techniques including the military method"
                gradient="from-blue-500/20 via-cyan-500/20 to-blue-600/20" onClick={() => setSelectedMode('breathing')} delay={0.2} />
              <ModeCard icon={BookOpen} title="Bedtime Stories" description="Your favourite bedtime stories + AI story generator — Stranger Things, Marvel & more"
                gradient="from-indigo-500/20 via-purple-500/20 to-indigo-600/20" onClick={() => setSelectedMode('story')} delay={0.3} />
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => { setIsPlaying(false); setSelectedMode(null); }}
              className="text-blue-200 hover:text-white mb-8 flex items-center gap-2 transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to options
            </button>
            {selectedMode === 'music' && <MusicPlayer isPlaying={isPlaying} setIsPlaying={setIsPlaying} />}
            {selectedMode === 'breathing' && <BreathingExercises />}
            {selectedMode === 'story' && <StoryPlayer />}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ModeCard({ icon: Icon, title, description, gradient, onClick, delay = 0 }: {
  icon: any; title: string; description: string; gradient: string; onClick: () => void; delay?: number;
}) {
  return (
    <motion.button onClick={onClick}
      className={`w-full p-6 rounded-3xl bg-gradient-to-r ${gradient} backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all text-left shadow-xl`}
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl mb-1 text-white">{title}</h3>
          <p className="text-sm text-blue-200">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/50" />
      </div>
    </motion.button>
  );
}

function MusicPlayer({ isPlaying, setIsPlaying }: { isPlaying: boolean; setIsPlaying: (v: boolean) => void }) {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(70);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.loop = true;
    audioRef.current.volume = volume / 100;
    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    const wasPlaying = isPlaying;
    audioRef.current.pause();
    audioRef.current.src = TRACKS[currentTrack].url;
    audioRef.current.load();
    setAudioError(false);
    audioRef.current.onerror = () => setAudioError(true);
    if (wasPlaying) audioRef.current.play().catch(() => setAudioError(true));
  }, [currentTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      if (!audioRef.current.src) audioRef.current.src = TRACKS[currentTrack].url;
      audioRef.current.play().catch(() => setAudioError(true));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  return (
    <div className="text-center">
      <motion.div
        className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl relative overflow-hidden"
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ duration: 20, repeat: isPlaying ? Infinity : 0, ease: "linear" }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute inset-0 border border-white/5 rounded-full" style={{ margin: `${i * 10}px` }} />
        ))}
        <span className="text-5xl relative z-10">{TRACKS[currentTrack].emoji}</span>
      </motion.div>
      <h2 className="text-2xl mb-1 text-white">{TRACKS[currentTrack].name}</h2>
      <p className="text-blue-200 mb-4 text-sm">Relaxation Sounds</p>
      {audioError && (
        <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-3 mb-4 text-orange-200 text-sm">
          Audio couldn't load. Try Spotify below!
        </div>
      )}
      <motion.a href="https://open.spotify.com/search/sleep%20relaxation%20lofi"
        target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-green-300 px-4 py-2 rounded-full text-sm mb-6 transition-all"
        whileHover={{ scale: 1.05 }}>
        🎵 Open Spotify sleep playlist <ExternalLink className="w-3 h-3" />
      </motion.a>
      <div className="max-w-sm mx-auto mb-6">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <Volume2 className="w-5 h-5 text-white/80" />
          <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(Number(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, rgba(147,51,234,0.6) ${volume}%, rgba(255,255,255,0.2) ${volume}%)` }} />
          <span className="text-sm text-white/80 w-8">{volume}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 mb-6">
        <motion.button onClick={() => setCurrentTrack(Math.max(0, currentTrack - 1))}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20">
          <SkipBack className="w-5 h-5 text-white" />
        </motion.button>
        <motion.button onClick={() => { setAudioError(false); setIsPlaying(!isPlaying); }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
          {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
        </motion.button>
        <motion.button onClick={() => setCurrentTrack(Math.min(TRACKS.length - 1, currentTrack + 1))}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20">
          <SkipForward className="w-5 h-5 text-white" />
        </motion.button>
      </div>
      <div className="space-y-2">
        {TRACKS.map((track, index) => (
          <motion.button key={track.name} onClick={() => setCurrentTrack(index)} whileHover={{ x: 4 }}
            className={`w-full p-4 rounded-2xl transition-all text-left backdrop-blur-sm border ${
              currentTrack === index ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-blue-200 hover:bg-white/10 border-white/10'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span>{track.emoji}</span><span>{track.name}</span></div>
              {currentTrack === index && isPlaying && (
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div key={i} className="w-1 h-4 bg-white rounded-full"
                      animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function BreathingExercises() {
  const [selected, setSelected] = useState<typeof BREATHING_EXERCISES[0] | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!isActive || !selected) return;
    const phase = selected.phases[phaseIndex];
    setCount(phase.duration);
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          setPhaseIndex(pi => {
            const next = (pi + 1) % selected.phases.length;
            if (next === 0) setCycles(c => c + 1);
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, phaseIndex, selected]);

  if (!selected) {
    return (
      <div>
        <h2 className="text-2xl mb-2 text-white">Breathing Exercises</h2>
        <p className="text-blue-200 text-sm mb-6">All scientifically proven to help sleep</p>
        <div className="space-y-3">
          {BREATHING_EXERCISES.map((ex, i) => (
            <motion.button key={ex.id} onClick={() => { setSelected(ex); setPhaseIndex(0); setCycles(0); setIsActive(false); }}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
              className="w-full p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 text-left transition-all">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{ex.emoji}</span>
                <div className="flex-1">
                  <div className="text-white mb-1">{ex.name}</div>
                  <div className="text-xs text-blue-200 mb-1">{ex.description}</div>
                  <div className="text-xs text-green-300 bg-green-500/10 px-2 py-0.5 rounded-full inline-block">✨ {ex.benefit}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/50" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const phase = selected.phases[phaseIndex];
  const phaseColors: Record<string, string> = {
    inhale: 'from-blue-400/40 via-cyan-400/40 to-teal-400/40',
    hold: 'from-purple-400/40 via-indigo-400/40 to-blue-400/40',
    exhale: 'from-teal-400/40 via-green-400/40 to-cyan-400/40',
  };
  const phaseEmoji: Record<string, string> = { inhale: '🌬️', hold: '⏸️', exhale: '💨' };

  return (
    <div className="text-center">
      <button onClick={() => { setSelected(null); setIsActive(false); }}
        className="text-blue-300 hover:text-white text-sm mb-6 flex items-center gap-1 mx-auto transition-colors">
        <ArrowLeft className="w-4 h-4" /> All exercises
      </button>
      <div className="text-3xl mb-1">{selected.emoji}</div>
      <h2 className="text-2xl mb-1 text-white">{selected.name}</h2>
      <p className="text-blue-200 text-sm mb-2">{selected.description}</p>
      <div className="text-xs text-green-300 bg-green-500/10 px-3 py-1 rounded-full inline-block mb-4">✨ {selected.benefit}</div>
      {cycles > 0 && <div className="text-yellow-300 text-sm mb-4">🔄 {cycles} cycle{cycles > 1 ? 's' : ''} completed</div>}
      <div className="relative w-64 h-64 mx-auto mb-6">
        <motion.div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl"
          animate={{ scale: phase.name === 'inhale' ? [0.8, 1.2] : phase.name === 'exhale' ? [1.2, 0.8] : 1 }}
          transition={{ duration: phase.duration, ease: "easeInOut" }} />
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${phaseColors[phase.name] || phaseColors.hold} rounded-full backdrop-blur-sm border-2 border-white/30 shadow-2xl`}
          animate={{ scale: isActive ? (phase.name === 'inhale' ? [0.6, 1] : phase.name === 'exhale' ? [1, 0.6] : 0.85) : 0.7 }}
          transition={{ duration: phase.duration, ease: "easeInOut" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div className="text-4xl mb-2" key={phaseIndex} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              {phaseEmoji[phase.name] || '⏸️'}
            </motion.div>
            <motion.div className="text-xl text-white capitalize mb-1" key={`p-${phaseIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {phase.name}
            </motion.div>
            {isActive && (
              <motion.div className="text-5xl text-white font-bold" key={count} initial={{ scale: 1.3 }} animate={{ scale: 1 }}>
                {count}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <motion.div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-5 text-blue-100 text-sm border border-white/20"
        key={`i-${phaseIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {isActive ? phase.instruction : 'Press start when you\'re ready'}
      </motion.div>
      <motion.button onClick={() => setIsActive(!isActive)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className={`px-8 py-3 rounded-full text-white transition-all mb-4 ${
          isActive ? 'bg-red-500/30 border border-red-400/30' : 'bg-white/20 border border-white/30 hover:bg-white/30'
        }`}>
        {isActive ? '⏹ Stop' : '▶ Start Breathing'}
      </motion.button>
      <div className="space-y-1">
        {selected.phases.map((p, i) => (
          <div key={i} className={`flex items-center justify-between text-sm px-4 py-2 rounded-xl ${
            isActive && phaseIndex === i ? 'bg-white/20 text-white' : 'text-blue-300'
          }`}>
            <span className="capitalize">{p.name}</span>
            <span>{p.duration}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoryPlayer() {
  const [selected, setSelected] = useState<typeof STORIES[0] | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  if (showAIGenerator) {
    return <AIStoryGenerator onBack={() => setShowAIGenerator(false)} />;
  }

  if (!selected) {
    return (
      <div>
        <h2 className="text-2xl mb-2 text-white">Bedtime Stories</h2>
        <p className="text-blue-200 text-sm mb-4">All stories use techniques proven to reduce pre-sleep anxiety</p>

        {/* AI Generator Button */}
        <motion.button onClick={() => setShowAIGenerator(true)}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full p-5 rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30 border-2 border-purple-400/40 hover:border-purple-400/60 text-left transition-all mb-4"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-300" />
            </div>
            <div className="flex-1">
              <div className="text-white mb-1 flex items-center gap-2">
                AI Story Generator
                <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full">New ✨</span>
              </div>
              <div className="text-sm text-blue-200">Tell the AI what kind of story you want</div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/50" />
          </div>
        </motion.button>

        <div className="space-y-3">
          {STORIES.map((story, i) => (
            <motion.button key={story.title} onClick={() => setSelected(story)}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
              className="w-full p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 text-left transition-all">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{story.emoji}</span>
                <div className="flex-1">
                  <div className="text-white mb-1">{story.title}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full">{story.genre}</span>
                    <span className="text-xs text-blue-300">📖 {story.readTime}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/50" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setSelected(null)} className="text-blue-300 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All stories
      </button>
      <div className="text-center mb-5">
        <span className="text-5xl">{selected.emoji}</span>
        <h2 className="text-2xl text-white mt-3 mb-1">{selected.title}</h2>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xs bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded-full">{selected.genre}</span>
          <span className="text-xs text-blue-300">📖 {selected.readTime}</span>
        </div>
        <div className="text-xs text-green-300 bg-green-500/10 px-3 py-1.5 rounded-xl inline-block">
          🔬 {selected.scienceBadge}
        </div>
      </div>
      <motion.div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-5 shadow-xl"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-blue-100 leading-relaxed text-sm whitespace-pre-line">{selected.text}</p>
      </motion.div>
      <motion.a href={selected.youtubeLink} target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center justify-between p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-2xl text-red-200 transition-all mb-3"
        whileHover={{ scale: 1.02 }}>
        <div className="flex items-center gap-3">
          <span className="text-xl">▶️</span>
          <div>
            <div className="text-sm text-white">{selected.youtubeLabel}</div>
            <div className="text-xs text-red-300">Opens YouTube</div>
          </div>
        </div>
        <ExternalLink className="w-4 h-4" />
      </motion.a>
      <motion.a href="https://www.youtube.com/results?search_query=guided+sleep+meditation+teens+students"
        target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-blue-200 transition-all"
        whileHover={{ scale: 1.02 }}>
        <div className="flex items-center gap-3">
          <span className="text-xl">🎧</span>
          <div>
            <div className="text-sm text-white">More sleep content for students</div>
            <div className="text-xs text-blue-300">Guided meditations on YouTube</div>
          </div>
        </div>
        <ExternalLink className="w-4 h-4" />
      </motion.a>
    </div>
  );
}

function AIStoryGenerator({ onBack }: { onBack: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SUGGESTIONS = [
    "A cozy mystery set in a bookshop at night 🔍",
    "Stranger Things vibes but everything turns out okay 🔦",
    "An adventure in a world where dreams are real 💫",
    "A Marvel hero takes a day off and just rests ⭐",
    "I'm stressed about exams, help me feel calm 📚",
    "Something set in space with no danger, just wonder 🚀",
    "A rainy day story where nothing bad happens 🌧️",
    "Friends on a road trip to nowhere in particular 🚗",
  ];

  const generateStory = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setGeneratedStory('');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a bedtime story writer for teenagers aged 14-18 (grades 9-12). 
Write calming, sleep-inducing stories that:
- Use narrative transport theory: pull the reader into another world so their brain stops ruminating
- End with the character settling down to rest or sleep
- Are warm, safe, and gently exciting — never scary or stressful
- Use slow, gentle pacing with sensory details (warmth, softness, quiet sounds)
- Are 250-350 words
- Do NOT use chapter breaks or headers
- Write in second person ("you") when possible to be immersive
- Reference teen-relevant contexts naturally (exams, friendships, growing up) but resolve them peacefully
Respond with ONLY the story text, no title, no introduction.`,
          messages: [{ role: 'user', content: `Write a bedtime story based on this request: "${prompt}"` }]
        })
      });

      const data = await response.json();
      if (data.error) {
        setError('AI is unavailable right now. Try again later or read one of our stories!');
      } else {
        setGeneratedStory(data.content[0].text);
      }
    } catch {
      setError('Could not connect to AI. Check your connection and try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="text-blue-300 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to stories
      </button>

      <div className="text-center mb-6">
        <div className="text-4xl mb-2">✨</div>
        <h2 className="text-2xl text-white mb-1">AI Story Generator</h2>
        <p className="text-blue-200 text-sm">Tell the AI what kind of story will help you sleep tonight</p>
      </div>

      {!generatedStory ? (
        <>
          <div className="mb-4">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. A cozy Stranger Things story where everything is fine and Eleven is just relaxing..."
              className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-blue-300/50 focus:outline-none focus:border-purple-400/50 resize-none text-sm"
              rows={3}
            />
          </div>

          <p className="text-blue-300 text-xs mb-3">💡 Try one of these:</p>
          <div className="grid grid-cols-1 gap-2 mb-5">
            {SUGGESTIONS.map(s => (
              <motion.button key={s} onClick={() => setPrompt(s.replace(/[🔍🔦💫⭐📚🚀🌧️🚗]/g, '').trim())}
                whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                className="text-left p-3 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl text-blue-200 text-xs transition-all">
                {s}
              </motion.button>
            ))}
          </div>

          {error && (
            <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-3 mb-4 text-orange-200 text-sm">
              {error}
            </div>
          )}

          <motion.button
            onClick={generateStory}
            disabled={loading || !prompt.trim()}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                Writing your story...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate My Story
              </>
            )}
          </motion.button>
        </>
      ) : (
        <>
          <motion.div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 mb-5 shadow-xl"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-blue-100 leading-relaxed text-sm whitespace-pre-line">{generatedStory}</p>
          </motion.div>
          <div className="flex gap-3">
            <motion.button onClick={() => { setGeneratedStory(''); setPrompt(''); }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-2xl text-sm">
              ✏️ Try different prompt
            </motion.button>
            <motion.button onClick={generateStory}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 bg-purple-500/30 border border-purple-400/30 text-purple-200 rounded-2xl text-sm">
              🔄 Regenerate
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}
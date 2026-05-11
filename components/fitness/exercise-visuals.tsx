'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, ChevronRight } from 'lucide-react';

// ── Exercise Animation Data ───────────────────────────────────
// SVG-based minimal motion previews — no external video needed.
// Each exercise has keyframe positions for a 2-frame loop animation.

export interface ExerciseVisual {
  id: string;
  name: string;
  muscleGroup: string;
  phases: string[]; // Voice cue text per phase
  svgFrames: [string, string]; // Two SVG paths for the motion loop
  tips: string[];
  breathingCue: string; // e.g. "Exhale on push, inhale on return"
  tempo: string; // e.g. "2-1-2" seconds
}

// Minimal stick-figure SVG frames for common exercises
const EXERCISE_VISUALS: Record<string, ExerciseVisual> = {
  'bench-press': {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroup: 'Chest',
    phases: ['Lower the bar with control to your chest', 'Press explosively back to start'],
    svgFrames: [
      // Frame 1: bar at chest
      `<g>
        <rect x="40" y="55" width="80" height="6" rx="3" fill="#14b8a6" opacity="0.8"/>
        <circle cx="80" cy="35" r="10" fill="#334155"/>
        <line x1="80" y1="45" x2="80" y2="70" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="55" x2="55" y2="62" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="55" x2="105" y2="62" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <rect x="10" y="72" width="140" height="5" rx="2" fill="#94a3b8" opacity="0.4"/>
      </g>`,
      // Frame 2: bar pressed up
      `<g>
        <rect x="40" y="38" width="80" height="6" rx="3" fill="#14b8a6" opacity="0.8"/>
        <circle cx="80" cy="35" r="10" fill="#334155"/>
        <line x1="80" y1="45" x2="80" y2="70" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="48" x2="55" y2="44" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="48" x2="105" y2="44" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <rect x="10" y="72" width="140" height="5" rx="2" fill="#94a3b8" opacity="0.4"/>
      </g>`,
    ],
    tips: ['Keep shoulder blades retracted', 'Feet flat on floor', 'Bar path slightly diagonal'],
    breathingCue: 'Inhale on descent, exhale on press',
    tempo: '3-1-2',
  },
  'squat': {
    id: 'squat',
    name: 'Back Squat',
    muscleGroup: 'Legs',
    phases: ['Descend with control, knees tracking toes', 'Drive through heels to stand'],
    svgFrames: [
      // Frame 1: standing
      `<g>
        <circle cx="80" cy="22" r="10" fill="#334155"/>
        <line x1="80" y1="32" x2="80" y2="62" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="40" x2="58" y2="52" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="40" x2="102" y2="52" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="62" x2="65" y2="88" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="62" x2="95" y2="88" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="65" y1="88" x2="60" y2="92" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <line x1="95" y1="88" x2="100" y2="92" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
      </g>`,
      // Frame 2: squat position
      `<g>
        <circle cx="80" cy="45" r="10" fill="#334155"/>
        <line x1="80" y1="55" x2="80" y2="72" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="60" x2="55" y2="52" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="60" x2="105" y2="52" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="72" x2="60" y2="88" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="72" x2="100" y2="88" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="60" y1="88" x2="55" y2="92" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <line x1="100" y1="88" x2="105" y2="92" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
      </g>`,
    ],
    tips: ['Keep chest up and core tight', 'Depth: hip crease below knee', 'Knees out, not caving in'],
    breathingCue: 'Inhale at top, exhale on drive up',
    tempo: '3-1-2',
  },
  'deadlift': {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'Back',
    phases: ['Hinge at hips, maintain neutral spine', 'Drive hips forward and stand tall'],
    svgFrames: [
      `<g>
        <circle cx="80" cy="50" r="10" fill="#334155"/>
        <line x1="80" y1="60" x2="75" y2="82" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="65" x2="55" y2="58" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="65" x2="100" y2="72" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="75" y1="82" x2="68" y2="92" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="75" y1="82" x2="82" y2="92" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <rect x="50" y="90" width="60" height="5" rx="2" fill="#14b8a6" opacity="0.6"/>
      </g>`,
      `<g>
        <circle cx="80" cy="22" r="10" fill="#334155"/>
        <line x1="80" y1="32" x2="80" y2="65" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="42" x2="58" y2="55" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="42" x2="102" y2="55" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="65" x2="68" y2="90" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="65" x2="92" y2="90" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <rect x="50" y="88" width="60" height="5" rx="2" fill="#14b8a6" opacity="0.6"/>
      </g>`,
    ],
    tips: ['Bar stays close to body throughout', 'Neutral spine — no rounding', 'Lock hips at the top'],
    breathingCue: 'Big breath before pull, exhale at lockout',
    tempo: '2-1-3',
  },
  'pull-up': {
    id: 'pull-up',
    name: 'Pull-Up',
    muscleGroup: 'Back',
    phases: ['Dead hang, engage lats and scapulae', 'Pull chin above bar, squeeze at top'],
    svgFrames: [
      `<g>
        <rect x="30" y="8" width="100" height="6" rx="3" fill="#94a3b8" opacity="0.6"/>
        <circle cx="80" cy="35" r="10" fill="#334155"/>
        <line x1="80" y1="45" x2="80" y2="75" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="55" x2="60" y2="45" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="55" x2="100" y2="45" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="60" y1="45" x2="55" y2="14" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <line x1="100" y1="45" x2="105" y2="14" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <line x1="80" y1="75" x2="70" y2="95" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="75" x2="90" y2="95" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
      </g>`,
      `<g>
        <rect x="30" y="8" width="100" height="6" rx="3" fill="#94a3b8" opacity="0.6"/>
        <circle cx="80" cy="22" r="10" fill="#334155"/>
        <line x1="80" y1="32" x2="80" y2="58" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="40" x2="60" y2="30" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="40" x2="100" y2="30" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="60" y1="30" x2="55" y2="14" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <line x1="100" y1="30" x2="105" y2="14" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <line x1="80" y1="58" x2="68" y2="78" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="58" x2="92" y2="78" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
      </g>`,
    ],
    tips: ['No kipping — full ROM', 'Depress and retract scapulae first', 'Lead with chest, not chin'],
    breathingCue: 'Exhale on pull, inhale on descent',
    tempo: '2-1-3',
  },
  'push-up': {
    id: 'push-up',
    name: 'Push-Up',
    muscleGroup: 'Chest',
    phases: ['Lower chest to floor, elbows at 45°', 'Push the floor away, fully extend'],
    svgFrames: [
      `<g>
        <circle cx="80" cy="52" r="9" fill="#334155"/>
        <line x1="80" y1="61" x2="80" y2="75" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="65" x2="55" y2="72" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="65" x2="105" y2="72" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="55" y1="72" x2="48" y2="82" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <line x1="105" y1="72" x2="112" y2="82" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <line x1="80" y1="75" x2="50" y2="82" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="75" x2="110" y2="82" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <rect x="30" y="82" width="100" height="3" rx="1" fill="#94a3b8" opacity="0.3"/>
      </g>`,
      `<g>
        <circle cx="80" cy="38" r="9" fill="#334155"/>
        <line x1="80" y1="47" x2="80" y2="62" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="52" x2="52" y2="68" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="52" x2="108" y2="68" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="52" y1="68" x2="45" y2="82" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <line x1="108" y1="68" x2="115" y2="82" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        <line x1="80" y1="62" x2="50" y2="82" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="80" y1="62" x2="110" y2="82" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <rect x="30" y="82" width="100" height="3" rx="1" fill="#94a3b8" opacity="0.3"/>
      </g>`,
    ],
    tips: ['Body in straight line, no sagging', 'Hands slightly wider than shoulders', 'Full range of motion'],
    breathingCue: 'Inhale on descent, exhale on push',
    tempo: '2-0-1',
  },
  'plank': {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'Core',
    phases: ['Maintain rigid straight line', 'Breathe steadily, brace core'],
    svgFrames: [
      `<g>
        <circle cx="50" cy="42" r="9" fill="#334155"/>
        <line x1="50" y1="51" x2="100" y2="62" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
        <line x1="100" y1="62" x2="120" y2="68" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="55" x2="42" y2="72" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="55" x2="58" y2="72" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="42" y1="72" x2="40" y2="76" stroke="#334155" stroke-width="3"/>
        <line x1="58" y1="72" x2="56" y2="76" stroke="#334155" stroke-width="3"/>
        <rect x="30" y="74" width="110" height="3" rx="1" fill="#94a3b8" opacity="0.3"/>
      </g>`,
      `<g>
        <circle cx="50" cy="40" r="9" fill="#334155"/>
        <line x1="50" y1="49" x2="100" y2="58" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
        <line x1="100" y1="58" x2="120" y2="64" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="53" x2="42" y2="70" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="53" x2="58" y2="70" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <line x1="42" y1="70" x2="40" y2="74" stroke="#334155" stroke-width="3"/>
        <line x1="58" y1="70" x2="56" y2="74" stroke="#334155" stroke-width="3"/>
        <rect x="30" y="72" width="110" height="3" rx="1" fill="#94a3b8" opacity="0.3"/>
      </g>`,
    ],
    tips: ['Hips level — not raised or dropped', 'Squeeze glutes and abs simultaneously', 'Eyes down to maintain neutral neck'],
    breathingCue: 'Slow diaphragmatic breathing throughout',
    tempo: 'Hold for target duration',
  },
};

export function getExerciseVisual(name: string): ExerciseVisual | null {
  const key = name.toLowerCase().replace(/\s+/g, '-');
  return EXERCISE_VISUALS[key] ?? null;
}

// ── Animated Exercise Preview Component ───────────────────────
interface ExerciseAnimationProps {
  visual: ExerciseVisual;
  className?: string;
}

export function ExerciseAnimation({ visual, className = '' }: ExerciseAnimationProps) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnimation = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setFrame((f) => (f === 0 ? 1 : 0));
    }, 900);
  }, []);

  useEffect(() => {
    if (playing) {
      startAnimation();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, startAnimation]);

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${className}`}>
      {/* Animation viewport */}
      <div className="relative bg-muted/30 flex items-center justify-center" style={{ height: 140 }}>
        <svg
          viewBox="0 0 160 100"
          width="220"
          height="140"
          style={{ transition: 'opacity 0.18s ease' }}
          aria-label={`${visual.name} movement demonstration`}
          dangerouslySetInnerHTML={{ __html: visual.svgFrames[frame] }}
        />

        {/* Phase label */}
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <span className="text-[11px] text-muted-foreground bg-background/80 px-2.5 py-1 rounded-full">
            {visual.phases[frame]}
          </span>
        </div>

        {/* Play/pause control */}
        <button
          onClick={() => setPlaying(!playing)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Exercise info */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">{visual.name}</p>
          <span className="text-[10px] text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-full font-medium">{visual.muscleGroup}</span>
        </div>

        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <span className="text-teal-500 mt-0.5 flex-shrink-0">↺</span>
          Tempo: {visual.tempo}
        </div>

        <div className="text-xs text-blue-500/80 bg-blue-500/5 border border-blue-500/10 rounded-lg px-2.5 py-1.5 leading-relaxed">
          {visual.breathingCue}
        </div>

        <div className="space-y-1">
          {visual.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <ChevronRight className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Voice Guidance Hook ───────────────────────────────────────
export interface VoiceOptions {
  rate?: number;   // 0.5 – 2.0
  pitch?: number;  // 0.0 – 2.0
  volume?: number; // 0.0 – 1.0
}

export function useWorkoutVoice() {
  const [enabled, setEnabled] = useState(false);
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, options: VoiceOptions = {}) => {
    if (!supported || !enabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.rate   = options.rate   ?? 0.92;
    u.pitch  = options.pitch  ?? 1.0;
    u.volume = options.volume ?? 0.85;

    // Prefer a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
    ) ?? voices.find((v) => v.lang.startsWith('en'));
    if (preferred) u.voice = preferred;

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, [supported, enabled]);

  const cancel = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  // Pre-built workout cues
  const cues = {
    startSet: (exerciseName: string, setNum: number) =>
      speak(`Set ${setNum}. ${exerciseName}. Begin.`),
    restReminder: (seconds: number) =>
      speak(`${seconds} seconds remaining.`, { rate: 0.85 }),
    setComplete: (reps: number) =>
      speak(`${reps} reps done. Rest.`, { pitch: 1.1 }),
    workoutComplete: () =>
      speak('Workout complete. Well done.', { rate: 0.88, pitch: 1.05 }),
    formCue: (cue: string) =>
      speak(cue, { rate: 0.88 }),
    breathingCue: (cue: string) =>
      speak(cue, { rate: 0.82, pitch: 0.95 }),
    countdown: (n: number) =>
      speak(String(n), { rate: 1.1, pitch: 1.1 }),
  };

  return { enabled, setEnabled, speak, cancel, cues, supported };
}

// ── Rest Timer with Voice ─────────────────────────────────────
interface RestTimerProps {
  seconds: number;
  onComplete: () => void;
  voice: ReturnType<typeof useWorkoutVoice>;
}

export function RestTimer({ seconds, onComplete, voice }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (remaining <= 0) {
      setDone(true);
      voice.speak('Rest complete. Next set.');
      onComplete();
      return;
    }

    // Voice countdown at 10, 5, 3, 2, 1
    if ([10, 5, 3, 2, 1].includes(remaining)) {
      voice.cues.countdown(remaining);
    }

    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = ((seconds - remaining) / seconds) * circumference;

  if (done) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
          <circle
            cx="32" cy="32" r={radius}
            fill="none" stroke="#14b8a6" strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold font-mono text-foreground">{remaining}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Rest — next set in {remaining}s</p>
      <button onClick={onComplete} className="text-xs text-teal-500 hover:text-teal-600 font-medium transition-colors">
        Skip rest
      </button>
    </div>
  );
}

// ── Voice Toggle Button ───────────────────────────────────────
export function VoiceToggle({ voice }: { voice: ReturnType<typeof useWorkoutVoice> }) {
  if (!voice.supported) return null;

  return (
    <button
      onClick={() => {
        const next = !voice.enabled;
        voice.setEnabled(next);
        if (next) voice.speak('Voice guidance enabled');
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
        voice.enabled
          ? 'bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400'
          : 'border-border text-muted-foreground hover:text-foreground'
      }`}
      title={voice.enabled ? 'Disable voice guidance' : 'Enable voice guidance'}
    >
      {voice.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      <span className="hidden sm:inline">{voice.enabled ? 'Voice on' : 'Voice off'}</span>
    </button>
  );
}

// ── Exercise Card with Animation ──────────────────────────────
interface ExerciseCardWithPreviewProps {
  exerciseName: string;
  muscleGroup: string;
  equipment: string;
  onClick?: () => void;
  className?: string;
}

export function ExerciseCardWithPreview({
  exerciseName,
  muscleGroup,
  equipment,
  onClick,
  className = '',
}: ExerciseCardWithPreviewProps) {
  const visual = getExerciseVisual(exerciseName);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className={className}>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all text-left"
      >
        {/* Thumbnail animation */}
        {visual ? (
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <svg
              viewBox="0 0 160 100"
              width="38"
              height="24"
              dangerouslySetInnerHTML={{ __html: visual.svgFrames[0] }}
              aria-hidden
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
              <path d="M6 5v14M18 5v14M4 9h4M16 9h4M4 15h4M16 15h4" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{exerciseName}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {muscleGroup.replace(/_/g, ' ')} · {equipment.replace(/_/g, ' ')}
          </p>
        </div>

        {visual && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowPreview(!showPreview); }}
            className="text-xs text-teal-500 hover:text-teal-600 px-2 py-1 rounded-lg hover:bg-teal-500/10 transition-all flex-shrink-0"
          >
            {showPreview ? 'Hide' : 'Preview'}
          </button>
        )}
      </button>

      {visual && showPreview && (
        <div className="mt-2 mx-3 mb-2">
          <ExerciseAnimation visual={visual} />
        </div>
      )}
    </div>
  );
}

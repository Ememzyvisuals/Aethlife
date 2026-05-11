'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Trash2,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  CheckCircle2,
  Dumbbell,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Exercise } from '@/types';

const setSchema = z.object({
  reps: z.number().min(0).optional(),
  weight_kg: z.number().min(0).optional(),
  duration_seconds: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const exerciseEntrySchema = z.object({
  exercise_id: z.string().uuid(),
  exercise_name: z.string(),
  sets: z.array(setSchema).min(1),
});

const workoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100),
  notes: z.string().optional(),
  duration_minutes: z.number().min(1).max(600).optional(),
  exercises: z.array(exerciseEntrySchema).min(1, 'Add at least one exercise'),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Legs',
  glutes: 'Glutes',
  core: 'Core',
  cardio: 'Cardio',
  full_body: 'Full Body',
  other: 'Other',
};

export default function NewWorkoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: `Workout ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`,
      exercises: [],
    },
  });

  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control,
    name: 'exercises',
  });

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Load exercises
  useEffect(() => {
    async function loadExercises() {
      const { data } = await supabase
        .from('exercises')
        .select('*')
        .or('user_id.is.null,user_id.eq.' + (await supabase.auth.getUser()).data.user?.id)
        .order('name');
      if (data) setExercises(data);
    }
    loadExercises();
  }, []);

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'all' || ex.muscle_group === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  function addExercise(exercise: Exercise) {
    appendExercise({
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: [{ reps: undefined, weight_kg: undefined }],
    });
    setShowExercisePicker(false);
    setExpandedExercise(exerciseFields.length);
  }

  async function onSubmit(data: WorkoutFormData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const durationMinutes = data.duration_minutes ?? Math.ceil(elapsed / 60);

    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: data.name,
        notes: data.notes || null,
        duration_minutes: durationMinutes,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (workoutError || !workout) {
      toast.error('Failed to save workout. Please try again.');
      return;
    }

    const logs = data.exercises.flatMap((ex) =>
      ex.sets.map((set, idx) => ({
        workout_id: workout.id,
        exercise_id: ex.exercise_id,
        set_number: idx + 1,
        reps: set.reps ?? null,
        weight_kg: set.weight_kg ?? null,
        duration_seconds: set.duration_seconds ?? null,
        notes: set.notes || null,
      }))
    );

    if (logs.length > 0) {
      const { error: logsError } = await supabase.from('workout_logs').insert(logs);
      if (logsError) {
        toast.error('Workout saved but logs failed. Please check.');
      }
    }

    toast.success('Workout logged!', { description: `${data.exercises.length} exercises · ${durationMinutes}m` });
    router.push('/fitness');
  }

  const watchedExercises = watch('exercises');

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Log Workout</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-sm text-teal-500 font-mono font-medium">{formatElapsed(elapsed)}</span>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-border hover:bg-muted transition-all text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Workout name */}
        <div className="aethlife-card space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Workout Name</label>
            <input
              {...register('name')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-medium"
              placeholder="e.g. Push Day, Leg Day..."
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Duration (min)</label>
              <input
                type="number"
                {...register('duration_minutes', { valueAsNumber: true })}
                placeholder={String(Math.ceil(elapsed / 60) || 45)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes (optional)</label>
              <input
                {...register('notes')}
                placeholder="How did it feel?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Exercise list */}
        {exerciseFields.map((field, exerciseIndex) => (
          <ExerciseCard
            key={field.id}
            exerciseIndex={exerciseIndex}
            exerciseName={watchedExercises[exerciseIndex]?.exercise_name ?? ''}
            control={control}
            register={register}
            isExpanded={expandedExercise === exerciseIndex}
            onToggle={() => setExpandedExercise(expandedExercise === exerciseIndex ? null : exerciseIndex)}
            onRemove={() => removeExercise(exerciseIndex)}
            errors={errors}
          />
        ))}

        {errors.exercises && typeof errors.exercises === 'object' && 'message' in errors.exercises && (
          <p className="text-xs text-destructive">{errors.exercises.message as string}</p>
        )}

        {/* Add exercise button */}
        <button
          type="button"
          onClick={() => setShowExercisePicker(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border hover:border-teal-500/50 text-muted-foreground hover:text-teal-500 py-4 rounded-xl transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Exercise
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || exerciseFields.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Finish Workout
            </>
          )}
        </button>
      </form>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Add Exercise</h3>
              <button onClick={() => setShowExercisePicker(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['all', ...Object.keys(MUSCLE_GROUP_LABELS)].map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedMuscle(group)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      selectedMuscle === group
                        ? 'bg-teal-500 text-white'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {group === 'all' ? 'All' : MUSCLE_GROUP_LABELS[group]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredExercises.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No exercises found</p>
              ) : (
                filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => addExercise(exercise)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {MUSCLE_GROUP_LABELS[exercise.muscle_group]} · {exercise.equipment.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseCard({
  exerciseIndex,
  exerciseName,
  control,
  register,
  isExpanded,
  onToggle,
  onRemove,
  errors,
}: {
  exerciseIndex: number;
  exerciseName: string;
  control: any;
  register: any;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  errors: any;
}) {
  const { fields: setFields, append: appendSet, remove: removeSet } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  return (
    <div className="aethlife-card">
      <div className="flex items-center justify-between mb-0">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="text-sm font-semibold text-foreground">{exerciseName}</span>
          <span className="text-xs text-muted-foreground ml-1">({setFields.length} sets)</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
          )}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all ml-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Set headers */}
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
            <span className="col-span-2">Set</span>
            <span className="col-span-4">Weight (kg)</span>
            <span className="col-span-4">Reps</span>
            <span className="col-span-2" />
          </div>

          {setFields.map((setField, setIndex) => (
            <div key={setField.id} className="grid grid-cols-12 gap-2 items-center">
              <span className="col-span-2 text-xs font-semibold text-muted-foreground text-center">
                {setIndex + 1}
              </span>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                {...register(`exercises.${exerciseIndex}.sets.${setIndex}.weight_kg`, { valueAsNumber: true })}
                className="col-span-4 px-2.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              />
              <input
                type="number"
                min="0"
                placeholder="0"
                {...register(`exercises.${exerciseIndex}.sets.${setIndex}.reps`, { valueAsNumber: true })}
                className="col-span-4 px-2.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setFields.length > 1 && removeSet(setIndex)}
                className="col-span-2 flex justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                disabled={setFields.length === 1}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => appendSet({ reps: undefined, weight_kg: undefined })}
            className="flex items-center gap-1.5 text-xs text-teal-500 hover:text-teal-600 font-medium transition-colors px-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add set
          </button>
        </div>
      )}
    </div>
  );
}

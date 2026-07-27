import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { Exercise, WorkoutSet } from '../lib/db'
import { Timer, Search, Plus, X, Trophy, Dumbbell, Play } from 'lucide-react'

const SEED_EXERCISES: Exercise[] = [
  { id: 'ex-bench',      name: 'Press de banca',             muscleGroup: 'Pecho' },
  { id: 'ex-incline',    name: 'Press inclinado',             muscleGroup: 'Pecho' },
  { id: 'ex-incline-db', name: 'Press inclinado mancuernas', muscleGroup: 'Pecho' },
  { id: 'ex-fly',        name: 'Apertura en máquina',         muscleGroup: 'Pecho' },
  { id: 'ex-squat',      name: 'Sentadilla',                  muscleGroup: 'Piernas' },
  { id: 'ex-deadlift',   name: 'Peso muerto',                 muscleGroup: 'Espalda' },
  { id: 'ex-ohp',        name: 'Press militar',               muscleGroup: 'Hombros' },
  { id: 'ex-ohp-db',     name: 'Press militar mancuernas',   muscleGroup: 'Hombros' },
  { id: 'ex-lateral',    name: 'Elevación lateral',           muscleGroup: 'Hombros' },
  { id: 'ex-front',      name: 'Elevación frontal',           muscleGroup: 'Hombros' },
  { id: 'ex-row',        name: 'Remo con barra',              muscleGroup: 'Espalda' },
  { id: 'ex-pullup',     name: 'Dominadas',                   muscleGroup: 'Espalda' },
  { id: 'ex-curl',       name: 'Curl de bíceps',              muscleGroup: 'Bíceps' },
  { id: 'ex-dips',       name: 'Fondos en paralelas',         muscleGroup: 'Tríceps' },
  { id: 'ex-pushdown',   name: 'Jalón de tríceps',            muscleGroup: 'Tríceps' },
  { id: 'ex-lunge',      name: 'Zancadas',                    muscleGroup: 'Piernas' },
  { id: 'ex-calf',       name: 'Elevación de talones',        muscleGroup: 'Piernas' },
  { id: 'ex-plank',      name: 'Plancha',                     muscleGroup: 'Core' },
]

const SEED_TEMPLATE_ID = 'tpl-chest-shoulders-tri'

const FILTER_GROUPS = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core']
const ARM_GROUPS = new Set(['Bíceps', 'Tríceps'])

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

type SetInput = { weight: string; reps: string }

export default function Entrenar() {
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [exerciseOrder, setExerciseOrder] = useState<string[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')
  const [pickerGroup, setPickerGroup] = useState('Todos')
  const [inputs, setInputs] = useState<Record<string, SetInput>>({})
  const [userName] = useState(() => localStorage.getItem('vyntra-name') ?? '')

  const allExercises = useLiveQuery(() => db.exercises.toArray(), [])
  const templates = useLiveQuery(() => db.templates.toArray(), [])
  const lastWorkout = useLiveQuery(
    () => db.workouts.orderBy('startedAt').reverse().filter(w => !!w.endedAt).first(),
    [],
  )
  const workoutSets = useLiveQuery(
    (): Promise<WorkoutSet[]> =>
      activeWorkoutId
        ? db.sets.where('workoutId').equals(activeWorkoutId).sortBy('order')
        : Promise.resolve([]),
    [activeWorkoutId],
  )

  useEffect(() => {
    db.exercises.bulkPut(SEED_EXERCISES)
    db.templates.get(SEED_TEMPLATE_ID).then(t => {
      if (!t) {
        db.templates.add({
          id: SEED_TEMPLATE_ID,
          name: 'Pecho · Hombros · Tríceps',
          exerciseIds: ['ex-dips', 'ex-ohp-db', 'ex-incline-db', 'ex-fly', 'ex-lateral', 'ex-front', 'ex-pushdown'],
        })
      }
    })
  }, [])

  useEffect(() => {
    if (!startedAt) { setElapsed(0); return }
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000)
    return () => clearInterval(id)
  }, [startedAt])

  async function startWorkout(exIds: string[] = []) {
    const id = crypto.randomUUID()
    const now = Date.now()
    await db.workouts.add({ id, startedAt: now, synced: false })
    setActiveWorkoutId(id)
    setStartedAt(now)
    setElapsed(0)
    setExerciseOrder(exIds)
    setInputs({})
  }

  async function repeatLastWorkout() {
    if (!lastWorkout) return
    const sets = await db.sets.where('workoutId').equals(lastWorkout.id).sortBy('order')
    const seen = new Set<string>()
    const exIds: string[] = []
    for (const s of sets) {
      if (!seen.has(s.exerciseId)) { seen.add(s.exerciseId); exIds.push(s.exerciseId) }
    }
    await startWorkout(exIds)
  }

  async function finishWorkout() {
    if (!activeWorkoutId) return
    await db.workouts.update(activeWorkoutId, { endedAt: Date.now() })
    setActiveWorkoutId(null)
    setStartedAt(null)
    setElapsed(0)
    setExerciseOrder([])
    setInputs({})
  }

  function openPicker() {
    setPickerQuery('')
    setPickerGroup('Todos')
    setShowPicker(true)
  }

  function pickExercise(exId: string) {
    setExerciseOrder(prev => (prev.includes(exId) ? prev : [...prev, exId]))
    setShowPicker(false)
  }

  async function logSet(exId: string) {
    if (!activeWorkoutId) return
    const inp = inputs[exId] ?? { weight: '', reps: '' }
    const weight = parseFloat(inp.weight)
    const reps = parseInt(inp.reps, 10)
    if (!inp.weight.trim() || !inp.reps.trim() || isNaN(weight) || weight < 0 || isNaN(reps) || reps <= 0) return

    const allSetsForExercise = await db.sets.where('exerciseId').equals(exId).toArray()
    const maxWeight = allSetsForExercise.reduce((m, s) => Math.max(m, s.weightKg), 0)
    const isPR = weight > maxWeight

    const currentExSets = (workoutSets ?? []).filter(s => s.exerciseId === exId)
    await db.sets.add({
      id: crypto.randomUUID(),
      workoutId: activeWorkoutId,
      exerciseId: exId,
      weightKg: weight,
      reps,
      isPR,
      order: currentExSets.length,
    })

    setInputs(prev => ({ ...prev, [exId]: { weight: '', reps: '' } }))
  }

  async function deleteSet(id: string) {
    await db.sets.delete(id)
  }

  const exerciseMap = new Map((allExercises ?? []).map(e => [e.id, e]))

  const setsByEx = (workoutSets ?? []).reduce<Record<string, WorkoutSet[]>>((acc, s) => {
    ;(acc[s.exerciseId] ??= []).push(s)
    return acc
  }, {})

  const filteredExercises = (allExercises ?? []).filter(e => {
    const matchesGroup =
      pickerGroup === 'Todos' ||
      (pickerGroup === 'Brazos' ? ARM_GROUPS.has(e.muscleGroup) : e.muscleGroup === pickerGroup)
    const matchesQuery =
      e.name.toLowerCase().includes(pickerQuery.toLowerCase()) ||
      e.muscleGroup.toLowerCase().includes(pickerQuery.toLowerCase())
    return matchesGroup && matchesQuery
  })

  if (!activeWorkoutId) {
    return (
      <div className="px-5 pt-8">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-charcoal-soft" />
          <div>
            <p className="font-display text-lg text-ink-light">
              {userName ? `Bienvenido, ${userName}` : 'Bienvenido de vuelta'}
            </p>
            <p className="text-sm text-gold-light">Cinta Blanca · Semana 1</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl bg-charcoal-soft px-4 py-3">
          <Search size={18} className="text-ink" />
          <input
            placeholder="Buscar ejercicio o rutina"
            className="flex-1 bg-transparent text-sm text-ink-light outline-none placeholder:text-ink"
          />
          <Timer size={20} className="text-gold" />
        </div>

        <button
          onClick={() => startWorkout()}
          className="mt-6 w-full rounded-xl bg-gold py-4 text-center font-display text-base
                     tracking-wide text-charcoal active:bg-gold-dark"
        >
          Iniciar entrenamiento vacío
        </button>

        <button
          onClick={repeatLastWorkout}
          disabled={!lastWorkout}
          className="mt-3 w-full rounded-xl border border-charcoal-soft py-3 text-sm text-ink-light
                     disabled:opacity-40 active:bg-charcoal-soft"
        >
          Rehacer última rutina
        </button>

        <h2 className="mt-8 font-display text-sm uppercase tracking-widest text-ink">
          Mis plantillas
        </h2>

        {(templates ?? []).length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-charcoal-soft p-6 text-center text-sm text-ink">
            Todavía no guardaste ninguna rutina.
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {(templates ?? []).map(tpl => (
              <button
                key={tpl.id}
                onClick={() => startWorkout(tpl.exerciseIds)}
                className="flex w-full items-center justify-between rounded-xl bg-charcoal-soft px-4 py-3 active:bg-charcoal"
              >
                <div className="text-left">
                  <p className="font-display text-sm text-ink-light">{tpl.name}</p>
                  <p className="mt-0.5 text-xs text-ink">
                    {tpl.exerciseIds.length} ejercicios
                  </p>
                </div>
                <Play size={18} className="flex-shrink-0 text-gold" />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-charcoal-soft bg-charcoal px-5 py-4">
        <div className="flex items-center gap-2">
          <Timer size={16} className="text-gold" />
          <span className="font-display text-lg tracking-wide text-gold-light">
            {formatElapsed(elapsed)}
          </span>
        </div>
        <button
          onClick={finishWorkout}
          className="rounded-xl bg-gold px-5 py-2 font-display text-sm tracking-wide text-charcoal active:bg-gold-dark"
        >
          Finalizar
        </button>
      </div>

      <div className="space-y-4 px-5 py-4">
        {exerciseOrder.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <Dumbbell size={48} className="text-charcoal-soft" />
            <p className="text-sm text-ink">Agregá tu primer ejercicio para comenzar</p>
          </div>
        )}

        {exerciseOrder.map(exId => {
          const ex = exerciseMap.get(exId)
          if (!ex) return null
          const sets = setsByEx[exId] ?? []
          const inp = inputs[exId] ?? { weight: '', reps: '' }

          return (
            <div key={exId} className="rounded-xl bg-charcoal-soft p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-display text-base text-ink-light">{ex.name}</p>
                  <p className="text-xs text-ink">{ex.muscleGroup}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-ink">
                  {sets.length} {sets.length === 1 ? 'serie' : 'series'}
                </span>
              </div>

              {sets.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  <div className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] gap-2 px-1 text-xs text-ink">
                    <span>#</span>
                    <span>Peso (kg)</span>
                    <span>Reps</span>
                    <span />
                  </div>
                  {sets.map((s, i) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] items-center gap-2"
                    >
                      <span className="text-xs text-ink">{i + 1}</span>
                      <div className="flex min-w-0 items-center gap-1 rounded-lg bg-charcoal px-3 py-1.5">
                        <span className="text-sm text-ink-light">{s.weightKg}</span>
                        {s.isPR && (
                          <Trophy size={11} className="ml-auto flex-shrink-0 text-gold" />
                        )}
                      </div>
                      <div className="min-w-0 rounded-lg bg-charcoal px-3 py-1.5">
                        <span className="text-sm text-ink-light">{s.reps}</span>
                      </div>
                      <button
                        onClick={() => deleteSet(s.id)}
                        className="flex items-center justify-center"
                      >
                        <X size={14} className="text-ink" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="kg"
                  value={inp.weight}
                  onChange={e =>
                    setInputs(prev => ({ ...prev, [exId]: { ...inp, weight: e.target.value } }))
                  }
                  className="min-w-0 rounded-lg bg-charcoal px-3 py-2 text-sm text-ink-light outline-none placeholder:text-ink"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="reps"
                  value={inp.reps}
                  onChange={e =>
                    setInputs(prev => ({ ...prev, [exId]: { ...inp, reps: e.target.value } }))
                  }
                  className="min-w-0 rounded-lg bg-charcoal px-3 py-2 text-sm text-ink-light outline-none placeholder:text-ink"
                />
                <button
                  onClick={() => logSet(exId)}
                  className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-gold px-4 py-2 font-display text-xs tracking-wide text-charcoal active:bg-gold-dark"
                >
                  <Plus size={14} />
                  Serie
                </button>
              </div>
            </div>
          )
        })}

        <div className="flex justify-center py-2">
          <button
            onClick={openPicker}
            className="flex items-center gap-2 rounded-full border border-charcoal-soft px-6 py-3 text-sm text-ink-light active:bg-charcoal-soft"
          >
            <Plus size={16} className="text-gold" />
            Agregar ejercicio
          </button>
        </div>
      </div>

      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-charcoal"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <h2 className="font-display text-lg text-ink-light">Elegir ejercicio</h2>
            <button onClick={() => setShowPicker(false)} className="p-1">
              <X size={22} className="text-ink" />
            </button>
          </div>

          <div className="mx-5 flex items-center gap-2 rounded-xl bg-charcoal-soft px-4 py-3">
            <Search size={18} className="text-ink" />
            <input
              autoFocus
              placeholder="Buscar"
              value={pickerQuery}
              onChange={e => setPickerQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-ink-light outline-none placeholder:text-ink"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
            {FILTER_GROUPS.map(g => (
              <button
                key={g}
                onClick={() => setPickerGroup(g)}
                className={[
                  'whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors',
                  pickerGroup === g
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-charcoal-soft text-ink-light',
                ].join(' ')}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="mt-2 flex-1 overflow-y-auto px-5 pb-8">
            {filteredExercises.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink">Sin resultados</p>
            ) : (
              filteredExercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => pickExercise(ex.id)}
                  className="flex w-full items-center justify-between border-b border-charcoal-soft py-4 last:border-0"
                >
                  <div className="text-left">
                    <p className="text-sm text-ink-light">{ex.name}</p>
                    <p className="text-xs text-ink">{ex.muscleGroup}</p>
                  </div>
                  <Plus size={18} className="flex-shrink-0 text-gold" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}

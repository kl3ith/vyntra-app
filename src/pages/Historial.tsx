import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { ChevronDown, ChevronUp, Clock, Dumbbell, Trophy } from 'lucide-react'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m || 1}m`
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function Historial() {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const workouts = useLiveQuery(
    () => db.workouts.orderBy('startedAt').reverse().toArray(),
    [],
  )
  const allSets = useLiveQuery(() => db.sets.toArray(), [])
  const allExercises = useLiveQuery(() => db.exercises.toArray(), [])

  const exerciseMap = new Map((allExercises ?? []).map(e => [e.id, e]))

  const workoutDays = new Set(
    (workouts ?? [])
      .filter(w => {
        const d = new Date(w.startedAt)
        return d.getFullYear() === viewYear && d.getMonth() === viewMonth && w.endedAt
      })
      .map(w => new Date(w.startedAt).getDate()),
  )

  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const displayedWorkouts = (workouts ?? []).filter(w => {
    if (!selectedDay) return true
    const d = new Date(w.startedAt)
    return (
      d.getFullYear() === viewYear &&
      d.getMonth() === viewMonth &&
      d.getDate() === selectedDay
    )
  })

  function prevMonth() {
    setSelectedDay(null)
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    setSelectedDay(null)
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div className="px-5 pb-6 pt-8">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="px-2 py-1 text-xl text-ink active:text-ink-light">‹</button>
        <h1 className="font-display text-xl text-ink-light">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h1>
        <button onClick={nextMonth} className="px-2 py-1 text-xl text-ink active:text-ink-light">›</button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-ink">
        {DAY_LABELS.map((d, i) => <span key={i}>{d}</span>)}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`pad-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const hasWorkout = workoutDays.has(day)
          const isSelected = selectedDay === day
          const isToday =
            day === now.getDate() &&
            viewMonth === now.getMonth() &&
            viewYear === now.getFullYear()

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={[
                'relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors',
                isSelected
                  ? 'bg-gold font-display text-charcoal'
                  : hasWorkout
                    ? 'bg-charcoal-soft text-ink-light'
                    : 'text-ink',
                isToday && !isSelected ? 'ring-1 ring-gold-light' : '',
              ].join(' ')}
            >
              {day}
              {hasWorkout && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6 space-y-3">
        {(workouts ?? []).length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Dumbbell size={44} className="text-charcoal-soft" />
            <p className="text-sm text-ink">
              Todavía no hay entrenamientos registrados.
            </p>
          </div>
        )}

        {selectedDay !== null && displayedWorkouts.length === 0 && (workouts ?? []).length > 0 && (
          <p className="py-6 text-center text-sm text-ink">
            Sin entrenamiento el día {selectedDay}.
          </p>
        )}

        {displayedWorkouts.map(workout => {
          const sets = (allSets ?? []).filter(s => s.workoutId === workout.id)
          const exerciseIds = [...new Set(sets.map(s => s.exerciseId))]
          const isExpanded = expandedId === workout.id
          const duration = workout.endedAt ? workout.endedAt - workout.startedAt : null
          const prCount = sets.filter(s => s.isPR).length

          return (
            <div key={workout.id} className="overflow-hidden rounded-xl bg-charcoal-soft">
              <button
                className="flex w-full items-start justify-between p-4"
                onClick={() => setExpandedId(isExpanded ? null : workout.id)}
              >
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-display text-base capitalize text-ink-light">
                    {formatDate(workout.startedAt)}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink">
                    <span>{formatTime(workout.startedAt)}</span>
                    {duration !== null && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatDuration(duration)}
                      </span>
                    )}
                    {!workout.endedAt && (
                      <span className="text-gold-light">En progreso</span>
                    )}
                    <span>{sets.length} {sets.length === 1 ? 'serie' : 'series'}</span>
                    {prCount > 0 && (
                      <span className="flex items-center gap-1 text-gold">
                        <Trophy size={10} />
                        {prCount} PR
                      </span>
                    )}
                  </div>

                  {exerciseIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {exerciseIds.map(exId => (
                        <span
                          key={exId}
                          className="rounded-full bg-charcoal px-2 py-0.5 text-xs text-ink-light"
                        >
                          {exerciseMap.get(exId)?.name ?? '—'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ml-3 mt-1 flex-shrink-0">
                  {isExpanded
                    ? <ChevronUp size={16} className="text-ink" />
                    : <ChevronDown size={16} className="text-ink" />}
                </div>
              </button>

              {isExpanded && (
                <div className="space-y-4 border-t border-charcoal px-4 pb-4 pt-3">
                  {exerciseIds.map(exId => {
                    const ex = exerciseMap.get(exId)
                    const exSets = sets
                      .filter(s => s.exerciseId === exId)
                      .sort((a, b) => a.order - b.order)

                    return (
                      <div key={exId}>
                        <div className="mb-2 flex items-baseline gap-2">
                          <p className="font-display text-sm text-ink-light">{ex?.name ?? exId}</p>
                          {ex?.muscleGroup && (
                            <span className="text-xs text-ink">{ex.muscleGroup}</span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="grid grid-cols-[1.5rem_1fr_1fr] gap-2 px-1 text-xs text-ink">
                            <span>#</span>
                            <span>Peso (kg)</span>
                            <span>Reps</span>
                          </div>
                          {exSets.map((s, i) => (
                            <div
                              key={s.id}
                              className="grid grid-cols-[1.5rem_1fr_1fr] items-center gap-2"
                            >
                              <span className="text-xs text-ink">{i + 1}</span>
                              <div className={[
                                'flex items-center gap-1 rounded-lg px-3 py-1.5',
                                s.isPR ? 'bg-gold/10' : 'bg-charcoal',
                              ].join(' ')}>
                                <span className="text-sm text-ink-light">{s.weightKg}</span>
                                {s.isPR && (
                                  <Trophy size={10} className="ml-auto flex-shrink-0 text-gold" />
                                )}
                              </div>
                              <div className="rounded-lg bg-charcoal px-3 py-1.5">
                                <span className="text-sm text-ink-light">{s.reps}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

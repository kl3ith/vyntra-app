import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { Workout, WorkoutSet } from '../lib/db'
import { Flame, Trophy, CalendarCheck, TrendingUp } from 'lucide-react'

function dateKey(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function computeStreak(workouts: Workout[]): number {
  const days = new Set(workouts.filter(w => w.endedAt).map(w => dateKey(w.startedAt)))
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  if (!days.has(dateKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(dateKey(cursor.getTime()))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function weeklyVolume(sets: WorkoutSet[], workouts: Workout[]): number {
  const now = new Date()
  const dayOfWeek = (now.getDay() + 6) % 7
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
  const weekStartTs = weekStart.getTime()
  const weekIds = new Set(
    workouts.filter(w => w.startedAt >= weekStartTs && w.endedAt).map(w => w.id),
  )
  return sets.filter(s => weekIds.has(s.workoutId)).reduce((sum, s) => sum + s.weightKg * s.reps, 0)
}

function formatVolume(vol: number): string {
  if (vol === 0) return '—'
  if (vol >= 1000) return `${(vol / 1000).toFixed(0)}k`
  return `${Math.round(vol)}`
}

function thisMonthCount(workouts: Workout[]): number {
  const now = new Date()
  return workouts.filter(w => {
    if (!w.endedAt) return false
    const d = new Date(w.startedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
}

type ChartPoint = { weight: number; isPR: boolean }

function Sparkline({ points }: { points: ChartPoint[] }) {
  const W = 320
  const H = 88
  const PX = 8
  const PY = 10

  const weights = points.map(p => p.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const range = maxW - minW || 1

  function cx(i: number) {
    return PX + (i / Math.max(points.length - 1, 1)) * (W - PX * 2)
  }
  function cy(w: number) {
    return PY + (1 - (w - minW) / range) * (H - PY * 2)
  }

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${cx(i).toFixed(1)} ${cy(p.weight).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 88 }}>
      <path d={d} fill="none" stroke="#5F5E5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={cx(i).toFixed(1)}
          cy={cy(p.weight).toFixed(1)}
          r={p.isPR ? 5 : 3.5}
          fill={p.isPR ? '#BA7517' : '#141414'}
          stroke={p.isPR ? '#FAC775' : '#5F5E5A'}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}

export default function Progreso() {
  const [selectedExId, setSelectedExId] = useState<string | null>(null)

  const workouts = useLiveQuery(() => db.workouts.orderBy('startedAt').toArray(), [])
  const allSets = useLiveQuery(() => db.sets.toArray(), [])
  const allExercises = useLiveQuery(() => db.exercises.toArray(), [])

  const streak = computeStreak(workouts ?? [])
  const volume = weeklyVolume(allSets ?? [], workouts ?? [])
  const monthCount = thisMonthCount(workouts ?? [])
  const prCount = (allSets ?? []).filter(s => s.isPR).length

  const trackedExIds = [...new Set((allSets ?? []).map(s => s.exerciseId))]
  const exerciseMap = new Map((allExercises ?? []).map(e => [e.id, e]))
  const workoutMap = new Map((workouts ?? []).map(w => [w.id, w]))

  const activeExId = selectedExId ?? trackedExIds[0] ?? null

  const chartPoints: ChartPoint[] = (() => {
    if (!activeExId) return []
    const exSets = (allSets ?? []).filter(s => s.exerciseId === activeExId)

    const byWorkout = exSets.reduce<Record<string, WorkoutSet[]>>((acc, s) => {
      ;(acc[s.workoutId] ??= []).push(s)
      return acc
    }, {})

    return Object.entries(byWorkout)
      .map(([wId, sets]) => {
        const w = workoutMap.get(wId)
        if (!w?.endedAt) return null
        const maxWeight = Math.max(...sets.map(s => s.weightKg))
        const hasPR = sets.some(s => s.weightKg === maxWeight && s.isPR)
        return { weight: maxWeight, isPR: hasPR, startedAt: w.startedAt }
      })
      .filter(Boolean)
      .sort((a, b) => a!.startedAt - b!.startedAt)
      .map(p => ({ weight: p!.weight, isPR: p!.isPR }))
      .slice(-12)
  })()

  const currentWeight = chartPoints.length > 0 ? chartPoints[chartPoints.length - 1].weight : null
  const allTimePR = chartPoints.reduce((m, p) => Math.max(m, p.weight), 0)

  const stats = [
    { label: 'Racha', value: streak > 0 ? `${streak}d` : '—', Icon: Flame },
    { label: 'Volumen semana', value: formatVolume(volume), Icon: TrendingUp },
    { label: 'Este mes', value: monthCount > 0 ? `${monthCount}` : '—', Icon: CalendarCheck },
    { label: 'PRs totales', value: prCount > 0 ? `${prCount}` : '—', Icon: Trophy },
  ]

  const hasWorkouts = (workouts ?? []).some(w => w.endedAt)

  return (
    <div className="px-5 pb-6 pt-8">
      <h1 className="font-display text-xl text-ink-light">Progreso</h1>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-xl bg-charcoal-soft p-4">
            <div className="flex items-center gap-1.5 text-ink">
              <Icon size={12} />
              <p className="text-xs">{label}</p>
            </div>
            <p className="mt-1.5 font-display text-2xl text-gold-light">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-display text-sm uppercase tracking-widest text-ink">
        Evolución de peso
      </h2>

      {!hasWorkouts ? (
        <div className="mt-3 flex h-36 items-center justify-center rounded-xl bg-charcoal-soft text-sm text-ink">
          La gráfica aparece con tu primer entrenamiento
        </div>
      ) : trackedExIds.length === 0 ? (
        <div className="mt-3 flex h-36 items-center justify-center rounded-xl bg-charcoal-soft text-sm text-ink">
          Registrá series para ver tu progreso
        </div>
      ) : (
        <>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {trackedExIds.map(exId => {
              const ex = exerciseMap.get(exId)
              if (!ex) return null
              return (
                <button
                  key={exId}
                  onClick={() => setSelectedExId(exId)}
                  className={[
                    'whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors',
                    activeExId === exId
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-charcoal-soft text-ink-light',
                  ].join(' ')}
                >
                  {ex.name}
                </button>
              )
            })}
          </div>

          {chartPoints.length < 2 ? (
            <div className="mt-3 flex h-36 items-center justify-center rounded-xl bg-charcoal-soft text-sm text-ink">
              Necesitás al menos 2 sesiones para ver la curva
            </div>
          ) : (
            <div className="mt-3 rounded-xl bg-charcoal-soft p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-ink">Último</p>
                  <p className="font-display text-xl text-ink-light">{currentWeight} kg</p>
                </div>
                {allTimePR > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-ink">PR</p>
                    <p className="flex items-center justify-end gap-1 font-display text-xl text-gold">
                      <Trophy size={14} />
                      {allTimePR} kg
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Sparkline points={chartPoints} />
              </div>

              <p className="mt-1 text-right text-xs text-ink">{chartPoints.length} sesiones</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import type { Workout } from '../lib/db'
import { Dumbbell, Trophy, Flame, Target, Pencil, Check } from 'lucide-react'

const BELTS = [
  { label: 'Cinta Blanca',   threshold: 0 },
  { label: 'Cinta Amarilla', threshold: 5 },
  { label: 'Cinta Naranja',  threshold: 15 },
  { label: 'Cinta Verde',    threshold: 30 },
  { label: 'Cinta Azul',     threshold: 60 },
  { label: 'Cinta Violeta',  threshold: 100 },
  { label: 'Cinta Marrón',   threshold: 200 },
]

function getBeltIndex(count: number): number {
  let idx = 0
  for (let i = 0; i < BELTS.length; i++) {
    if (count >= BELTS[i].threshold) idx = i
    else break
  }
  return idx
}

function getWeekNum(firstTs: number): number {
  return Math.floor((Date.now() - firstTs) / (7 * 24 * 60 * 60 * 1000)) + 1
}

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

export default function Perfil() {
  const [name, setName] = useState(() => localStorage.getItem('vyntra-name') ?? '')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const workouts = useLiveQuery(() => db.workouts.orderBy('startedAt').toArray(), [])
  const allSets = useLiveQuery(() => db.sets.toArray(), [])

  const completed = (workouts ?? []).filter(w => w.endedAt)
  const totalWorkouts = completed.length
  const totalSets = (allSets ?? []).length
  const totalPRs = (allSets ?? []).filter(s => s.isPR).length
  const streak = computeStreak(workouts ?? [])

  const beltIdx = getBeltIndex(totalWorkouts)
  const belt = BELTS[beltIdx]
  const nextBelt = beltIdx + 1 < BELTS.length ? BELTS[beltIdx + 1] : null
  const firstAt = completed.length > 0 ? completed[0].startedAt : null
  const weekNum = firstAt ? getWeekNum(firstAt) : 1

  const beltProgress = nextBelt
    ? Math.min((totalWorkouts - belt.threshold) / (nextBelt.threshold - belt.threshold), 1)
    : 1

  function startEdit() {
    setDraft(name)
    setEditing(true)
  }

  function saveName() {
    const trimmed = draft.trim()
    setName(trimmed)
    localStorage.setItem('vyntra-name', trimmed)
    setEditing(false)
  }

  const stats = [
    { label: 'Entrenamientos', value: totalWorkouts > 0 ? totalWorkouts : '—', Icon: Dumbbell },
    { label: 'Series totales',  value: totalSets > 0 ? totalSets : '—',    Icon: Target },
    { label: 'PRs',             value: totalPRs > 0 ? totalPRs : '—',     Icon: Trophy },
    { label: 'Racha',           value: streak > 0 ? `${streak}d` : '—',   Icon: Flame },
  ]

  return (
    <div className="px-5 pb-6 pt-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-charcoal-soft">
          <Dumbbell size={36} className="text-ink" />
        </div>

        {editing ? (
          <div className="mt-4 flex items-center gap-2">
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              className="rounded-lg bg-charcoal-soft px-3 py-1.5 text-center font-display text-lg text-ink-light outline-none"
            />
            <button onClick={saveName} className="text-gold">
              <Check size={18} />
            </button>
          </div>
        ) : (
          <button onClick={startEdit} className="mt-4 flex items-center gap-2">
            <h1 className="font-display text-xl text-ink-light">
              {name || 'Tu nombre'}
            </h1>
            <Pencil size={14} className="text-ink" />
          </button>
        )}

        <p className="mt-0.5 text-sm text-gold-light">
          {belt.label} · Semana {weekNum}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
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

      {nextBelt && (
        <div className="mt-6 rounded-xl bg-charcoal-soft p-4">
          <div className="flex items-center justify-between text-xs text-ink">
            <span>{belt.label}</span>
            <span>{nextBelt.label}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-charcoal">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${beltProgress * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-xs text-ink">
            {nextBelt.threshold - totalWorkouts} entrenamientos para el próximo rango
          </p>
        </div>
      )}

      <div className="mt-4 rounded-xl bg-gradient-to-r from-gold-dark to-gold p-4">
        <p className="font-display text-base text-charcoal">Vyntra Pro</p>
        <p className="text-xs text-charcoal/80">
          Simplificá tu dashboard y desbloquá rutinas ilimitadas.
        </p>
      </div>
    </div>
  )
}

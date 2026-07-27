import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { Search, Plus, X, Dumbbell } from 'lucide-react'

const FILTER_GROUPS = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core']
const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps', 'Core']
const ARM_GROUPS = new Set(['Bíceps', 'Tríceps'])

export default function Ejercicios() {
  const [query, setQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('Todos')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newGroup, setNewGroup] = useState('')

  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray(), [])

  const filtered = (exercises ?? []).filter(ex => {
    const matchesQuery =
      query === '' ||
      ex.name.toLowerCase().includes(query.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(query.toLowerCase())

    const matchesGroup =
      selectedGroup === 'Todos' ||
      (selectedGroup === 'Brazos' ? ARM_GROUPS.has(ex.muscleGroup) : ex.muscleGroup === selectedGroup)

    return matchesQuery && matchesGroup
  })

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, ex) => {
    const key = selectedGroup === 'Brazos' && ARM_GROUPS.has(ex.muscleGroup) ? 'Brazos' : ex.muscleGroup
    ;(acc[key] ??= []).push(ex)
    return acc
  }, {})

  const groupKeys = Object.keys(grouped).sort()

  async function addExercise() {
    if (!newName.trim() || !newGroup) return
    await db.exercises.add({
      id: crypto.randomUUID(),
      name: newName.trim(),
      muscleGroup: newGroup,
    })
    setNewName('')
    setNewGroup('')
    setShowAdd(false)
  }

  return (
    <div className="px-5 pb-6 pt-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl text-ink-light">Ejercicios</h1>
        <button
          onClick={() => { setNewName(''); setNewGroup(''); setShowAdd(true) }}
          className="flex items-center gap-1 rounded-full bg-gold px-3 py-1.5 font-display text-xs tracking-wide text-charcoal active:bg-gold-dark"
        >
          <Plus size={13} />
          Nuevo
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-charcoal-soft px-4 py-3">
        <Search size={18} className="text-ink" />
        <input
          placeholder="Buscar ejercicio"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-ink-light outline-none placeholder:text-ink"
        />
        {query !== '' && (
          <button onClick={() => setQuery('')}>
            <X size={16} className="text-ink" />
          </button>
        )}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {FILTER_GROUPS.map(g => (
          <button
            key={g}
            onClick={() => setSelectedGroup(g)}
            className={[
              'whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors',
              selectedGroup === g
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-charcoal-soft text-ink-light',
            ].join(' ')}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {(exercises ?? []).length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Dumbbell size={44} className="text-charcoal-soft" />
            <p className="text-sm text-ink">No hay ejercicios todavía.</p>
          </div>
        )}

        {filtered.length === 0 && (exercises ?? []).length > 0 && (
          <p className="py-6 text-center text-sm text-ink">Sin resultados.</p>
        )}

        {groupKeys.map(group => (
          <div key={group}>
            <p className="mb-2 text-xs uppercase tracking-widest text-ink">{group}</p>
            <div className="space-y-1">
              {grouped[group].map(ex => (
                <div key={ex.id} className="rounded-xl bg-charcoal-soft px-4 py-3">
                  <p className="text-sm text-ink-light">{ex.name}</p>
                  {selectedGroup === 'Brazos' && (
                    <p className="text-xs text-ink">{ex.muscleGroup}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex flex-col bg-charcoal px-5 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink-light">Nuevo ejercicio</h2>
            <button onClick={() => setShowAdd(false)}>
              <X size={22} className="text-ink" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-ink">Nombre</label>
              <input
                autoFocus
                placeholder="ej. Press de banca"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full rounded-xl bg-charcoal-soft px-4 py-3 text-sm text-ink-light outline-none placeholder:text-ink"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-ink">Grupo muscular</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {MUSCLE_GROUPS.map(g => (
                  <button
                    key={g}
                    onClick={() => setNewGroup(g)}
                    className={[
                      'rounded-full border px-3 py-1 text-xs transition-colors',
                      newGroup === g
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-charcoal-soft text-ink-light',
                    ].join(' ')}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={addExercise}
            disabled={!newName.trim() || !newGroup}
            className="mt-8 w-full rounded-xl bg-gold py-4 font-display text-base tracking-wide text-charcoal active:bg-gold-dark disabled:opacity-40"
          >
            Guardar ejercicio
          </button>
        </div>
      )}
    </div>
  )
}

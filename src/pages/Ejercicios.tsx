import { Search } from 'lucide-react'

export default function Ejercicios() {
  return (
    <div className="px-5 pt-8">
      <h1 className="font-display text-xl text-ink-light">Ejercicios</h1>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-charcoal-soft px-4 py-3">
        <Search size={18} className="text-ink" />
        <input
          placeholder="Buscar ejercicio"
          className="flex-1 bg-transparent text-sm text-ink-light outline-none placeholder:text-ink"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {['Pecho', 'Espalda', 'Piernas', 'Hombro', 'Brazo', 'Core'].map((g) => (
          <span
            key={g}
            className="whitespace-nowrap rounded-full border border-charcoal-soft px-3 py-1 text-xs text-ink-light"
          >
            {g}
          </span>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-ink">
        La biblioteca de ejercicios se carga en la próxima etapa.
      </p>
    </div>
  )
}

import { Timer, Search } from 'lucide-react'

export default function Entrenar() {
  return (
    <div className="px-5 pt-8">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-charcoal-soft" />
        <div>
          <p className="font-display text-lg text-ink-light">Bienvenido de vuelta</p>
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
        className="mt-6 w-full rounded-xl bg-gold py-4 text-center font-display text-base
                   tracking-wide text-charcoal active:bg-gold-dark"
      >
        Iniciar entrenamiento vacío
      </button>

      <button className="mt-3 w-full rounded-xl border border-charcoal-soft py-3 text-sm text-ink-light">
        Rehacer última rutina
      </button>

      <h2 className="mt-8 font-display text-sm uppercase tracking-widest text-ink">
        Mis plantillas
      </h2>
      <div className="mt-3 rounded-xl border border-dashed border-charcoal-soft p-6 text-center text-sm text-ink">
        Todavía no guardaste ninguna rutina.
      </div>
    </div>
  )
}

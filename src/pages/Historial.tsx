const dias = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function Historial() {
  return (
    <div className="px-5 pt-8">
      <h1 className="font-display text-xl text-ink-light">Julio 2026</h1>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-ink">
        {dias.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
        {Array.from({ length: 31 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-lg bg-charcoal-soft text-sm text-ink-light"
          >
            {i + 1}
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-ink">
        Tocá un día con marca para ver el detalle del entrenamiento.
      </p>
    </div>
  )
}

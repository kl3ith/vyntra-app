const datos = [
  { label: 'PR más reciente', value: '—' },
  { label: 'Volumen semanal', value: '—' },
  { label: 'Días activos', value: '—' },
  { label: 'RPE promedio', value: '—' },
]

export default function Progreso() {
  return (
    <div className="px-5 pt-8">
      <h1 className="font-display text-xl text-ink-light">Progreso</h1>

      <div className="mt-4 flex h-40 items-center justify-center rounded-xl bg-charcoal-soft text-sm text-ink">
        La gráfica aparece con tu primer entrenamiento
      </div>

      <h2 className="mt-6 font-display text-sm uppercase tracking-widest text-ink">
        Tus datos
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {datos.map((d) => (
          <div key={d.label} className="rounded-xl bg-charcoal-soft p-4">
            <p className="text-2xl font-display text-gold-light">{d.value}</p>
            <p className="mt-1 text-xs text-ink">{d.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

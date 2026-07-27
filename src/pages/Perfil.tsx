export default function Perfil() {
  return (
    <div className="px-5 pt-8 text-center">
      <div className="mx-auto h-28 w-28 rounded-full bg-charcoal-soft" />
      <h1 className="mt-4 font-display text-xl text-ink-light">Tu nombre</h1>
      <p className="text-sm text-gold-light">Cinta Blanca</p>

      <div className="mt-6 rounded-xl bg-charcoal-soft p-4 text-left text-sm text-ink">
        Conexión de salud: no conectada
      </div>

      <div className="mt-4 rounded-xl bg-gradient-to-r from-gold-dark to-gold p-4 text-left">
        <p className="font-display text-charcoal">Vyntra Pro</p>
        <p className="text-xs text-charcoal/80">
          Simplificá tu dashboard y desbloqueá rutinas ilimitadas.
        </p>
      </div>
    </div>
  )
}

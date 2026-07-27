import { NavLink } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

export function NavTab({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: LucideIcon
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 px-3 text-xs ${
          isActive ? 'text-gold-light' : 'text-ink'
        }`
      }
    >
      <Icon size={22} strokeWidth={2} />
      <span className="font-body">{label}</span>
    </NavLink>
  )
}

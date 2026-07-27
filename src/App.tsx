import { Routes, Route } from 'react-router-dom'
import { Dumbbell, CalendarDays, TrendingUp, Search, UserRound } from 'lucide-react'
import { NavTab } from './components/NavTab'
import Entrenar from './pages/Entrenar'
import Historial from './pages/Historial'
import Progreso from './pages/Progreso'
import Ejercicios from './pages/Ejercicios'
import Perfil from './pages/Perfil'

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <main className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/" element={<Entrenar />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/progreso" element={<Progreso />} />
          <Route path="/ejercicios" element={<Ejercicios />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-charcoal-soft
                   bg-charcoal/95 py-2 backdrop-blur-sm"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <NavTab to="/" label="Entrenar" icon={Dumbbell} />
        <NavTab to="/historial" label="Historial" icon={CalendarDays} />
        <NavTab to="/progreso" label="Progreso" icon={TrendingUp} />
        <NavTab to="/ejercicios" label="Ejercicios" icon={Search} />
        <NavTab to="/perfil" label="Perfil" icon={UserRound} />
      </nav>
    </div>
  )
}

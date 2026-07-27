import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Semana 1: el esqueleto de pantallas funciona sin cuenta ni Supabase configurado.
// En cuanto se cree el proyecto en supabase.com y se agreguen las variables en .env,
// las cuentas y la sincronización entre dispositivos quedan disponibles sin tocar
// el resto del código.
export const supabase = url && key ? createClient(url, key) : null

export const isSupabaseConfigured = Boolean(supabase)

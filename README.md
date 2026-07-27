# Vyntra — Semana 1: esqueleto técnico

Esto es el punto de partida técnico de Vyntra: las 5 pantallas navegables
(Entrenar, Historial, Progreso, Ejercicios, Perfil), con la identidad visual
Dojo Sensei ya aplicada, funcionando como PWA instalable. Todavía sin datos
reales — eso es lo que sigue en las próximas semanas.

## Stack

- **React + TypeScript + Vite** — el código en sí.
- **Tailwind CSS** — con los colores y tipografías de marca ya cargados en `tailwind.config.js`.
- **vite-plugin-pwa** — genera el manifest y el service worker para que la app
  se pueda instalar en la pantalla de inicio y funcione sin internet.
- **Dexie (IndexedDB)** — `src/lib/db.ts`. Acá se guardan los entrenamientos
  en el propio dispositivo, al instante, sin depender de internet ni de un
  servidor. Esto es lo que garantiza que anotar una serie sea siempre rápido.
- **Supabase** — `src/lib/supabase.ts`. Cuentas, estado Pro y sincronización
  entre dispositivos. Es opcional para desarrollar: si no está configurado,
  la app funciona igual en modo local.

## Cómo correrlo en tu computadora

Necesitás tener [Node.js](https://nodejs.org) instalado (versión 18 o más
reciente). Después, en esta carpeta:

```bash
npm install
npm run dev
```

Abre la URL que te muestre la terminal (normalmente `http://localhost:5173`).

## Cómo conectar Supabase (cuando quieras cuentas y sincronización)

1. Creá una cuenta gratis en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. En el proyecto, ve a **Project Settings → API** y copiá la "Project URL" y la "anon public key".
3. Copiá `.env.example` a un archivo nuevo llamado `.env` y pegá esos dos valores.
4. Reiniciá `npm run dev`.

## Cómo publicarlo (deploy)

1. Subí esta carpeta a un repositorio de [GitHub](https://github.com) (gratis).
2. Entrá a [vercel.com](https://vercel.com), conectá tu cuenta de GitHub e importá el repositorio. Vercel detecta Vite automáticamente.
3. Si ya conectaste Supabase, agregá las mismas dos variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en la configuración del proyecto en Vercel.
4. Cada vez que subas un cambio a GitHub, Vercel republica solo automáticamente. Te da una URL gratis tipo `vyntra.vercel.app` — el dominio final (vyntra.io, etc.) se conecta ahí mismo más adelante, sin volver a tocar el código.

## Cómo seguir construyendo semana a semana

Para las próximas etapas (llenar Entrenar/Historial con datos reales,
sugerencia inteligente, cronómetro, etc.), lo más práctico es seguir con
**Claude Code** apuntando a esta misma carpeta/repositorio: le vas
describiendo cada pantalla o función y él edita el código directamente,
sin que tengas que escribir una línea. Esta conversación sirve para las
decisiones de producto y research; Claude Code es mejor para las sesiones
largas de programación semana a semana.

## Ícono de la app

`public/icon-*.png` son un placeholder generado a partir del logo ya
aprobado (seis chevrones dorados). Cuando el archivo final del logo esté
listo (pendiente #5 del documento de contexto), solo hay que reemplazar
esos tres PNG — no hace falta tocar nada más.

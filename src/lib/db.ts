import Dexie, { type EntityTable } from 'dexie'

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipmentVariant?: string
  thumbnailUrl?: string
}

export interface WorkoutSet {
  id: string
  workoutId: string
  exerciseId: string
  weightKg: number
  reps: number
  rpe?: number
  isPR: boolean
  order: number
}

export interface Workout {
  id: string
  startedAt: number
  endedAt?: number
  notes?: string
  synced: boolean // false hasta que Supabase confirma la sincronización
}

export interface Template {
  id: string
  name: string
  exerciseIds: string[]
}

const db = new Dexie('vyntra') as Dexie & {
  workouts: EntityTable<Workout, 'id'>
  sets: EntityTable<WorkoutSet, 'id'>
  exercises: EntityTable<Exercise, 'id'>
  templates: EntityTable<Template, 'id'>
}

db.version(1).stores({
  workouts: 'id, startedAt, synced',
  sets: 'id, workoutId, exerciseId, order',
  exercises: 'id, name, muscleGroup',
  templates: 'id, name',
})

export { db }

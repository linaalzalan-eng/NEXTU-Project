/**
 * The single entry point for data access (D-08). UI code imports from '@/services'
 * and never knows which implementation is active.
 *
 * Vite writes the value of VITE_DATA_SOURCE into the code at build time, so the
 * branch that is not chosen is removed from the build: the mock build contains no
 * Supabase library, and the Supabase build no mock (D-30). The dynamic import()
 * keeps each implementation in its own file until it is needed.
 */
export const dataSource = import.meta.env.VITE_DATA_SOURCE || 'mock'

let implementation
if (dataSource === 'supabase') {
  implementation = await import('./supabase/index.js')
} else if (dataSource === 'mock') {
  const [{ mockAuthService }, { mockTasksService }] = await Promise.all([
    import('./mock/mockAuthService.js'),
    import('./mock/mockTasksService.js'),
  ])
  implementation = { authService: mockAuthService, tasksService: mockTasksService }
} else {
  throw new Error(`Unknown VITE_DATA_SOURCE "${dataSource}". Available: mock, supabase`)
}

export const { authService, tasksService } = implementation
export { ServiceError } from './errors.js'

import { mockAuthService } from './mock/mockAuthService.js'
import { mockTasksService } from './mock/mockTasksService.js'

/**
 * The single entry point for data access (D-08). UI code imports from '@/services'
 * and never knows which implementation is active. Phase 5 adds 'supabase'.
 */
const implementations = {
  mock: { authService: mockAuthService, tasksService: mockTasksService },
}

const dataSource = import.meta.env.VITE_DATA_SOURCE || 'mock'

if (!implementations[dataSource]) {
  throw new Error(`Unknown VITE_DATA_SOURCE "${dataSource}". Available: ${Object.keys(implementations).join(', ')}`)
}

export const { authService, tasksService } = implementations[dataSource]
export { ServiceError } from './errors.js'

import { createSupabaseAuthService } from './supabaseAuthService.js'
import { supabase } from './supabaseClient.js'
import { createSupabaseTasksService } from './supabaseTasksService.js'

/** The Supabase implementations, sharing one client. Loaded only when VITE_DATA_SOURCE=supabase. */
export const authService = createSupabaseAuthService(supabase)
export const tasksService = createSupabaseTasksService(supabase)

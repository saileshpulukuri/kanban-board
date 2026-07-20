import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { isConfigured } from './utils'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  isConfigured() && url && anon ? createClient(url, anon) : null

export const usingLocalMode = !supabase

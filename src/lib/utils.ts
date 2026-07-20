import { clsx, type ClassValue } from 'clsx'
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  isPast,
  parseISO,
} from 'date-fns'
import type { Priority, Task } from './types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function uid() {
  return crypto.randomUUID()
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export function formatRelative(date: string) {
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true })
  } catch {
    return date
  }
}

export function formatShortDate(date: string) {
  try {
    return format(parseISO(date), 'MMM d')
  } catch {
    return date
  }
}

export type DueUrgency = 'overdue' | 'soon' | 'normal' | 'none'

export function getDueUrgency(dueDate: string | null): DueUrgency {
  if (!dueDate) return 'none'
  const d = parseISO(dueDate)
  if (isPast(d) && differenceInCalendarDays(new Date(), d) > 0) return 'overdue'
  const days = differenceInCalendarDays(d, new Date())
  if (days <= 2) return 'soon'
  return 'normal'
}

export function priorityRank(p: Priority) {
  return p === 'high' ? 0 : p === 'normal' ? 1 : 2
}

export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position
    return priorityRank(a.priority) - priorityRank(b.priority)
  })
}

export function isConfigured() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  )
}

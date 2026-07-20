export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'low' | 'normal' | 'high'

export interface TeamMember {
  id: string
  user_id: string
  name: string
  color: string
  avatar_url: string | null
  created_at: string
}

export interface Label {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  due_date: string | null
  assignee_id: string | null
  position: number
  created_at: string
  updated_at: string
  label_ids?: string[]
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  body: string
  created_at: string
}

export interface ActivityEntry {
  id: string
  task_id: string
  user_id: string
  action: string
  detail: string | null
  created_at: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: Priority
  due_date?: string | null
  assignee_id?: string | null
  status?: TaskStatus
  label_ids?: string[]
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  priority?: Priority
  due_date?: string | null
  assignee_id?: string | null
  status?: TaskStatus
  position?: number
  label_ids?: string[]
}

export interface BoardFilters {
  search: string
  priority: Priority | 'all'
  assigneeId: string | 'all'
  labelId: string | 'all'
}

export const COLUMNS: { id: TaskStatus; title: string; hint: string }[] = [
  { id: 'todo', title: 'To Do', hint: 'Queued work' },
  { id: 'in_progress', title: 'In Progress', hint: 'Actively moving' },
  { id: 'in_review', title: 'In Review', hint: 'Needs eyes' },
  { id: 'done', title: 'Done', hint: 'Shipped' },
]

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

export const MEMBER_COLORS = [
  '#0F766E',
  '#0369A1',
  '#B45309',
  '#BE123C',
  '#7C3AED',
  '#15803D',
  '#C2410C',
  '#1D4ED8',
]

export const LABEL_PRESETS = [
  { name: 'Bug', color: '#E11D48' },
  { name: 'Feature', color: '#0F766E' },
  { name: 'Design', color: '#7C3AED' },
  { name: 'Docs', color: '#0369A1' },
  { name: 'Chore', color: '#64748B' },
]

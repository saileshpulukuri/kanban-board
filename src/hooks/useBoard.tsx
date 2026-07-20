import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as api from '../lib/api'
import type {
  BoardFilters,
  CreateTaskInput,
  Label,
  Priority,
  Task,
  TaskStatus,
  TeamMember,
  UpdateTaskInput,
} from '../lib/types'
import { getDueUrgency, sortTasks } from '../lib/utils'
import { usingLocalMode } from '../lib/supabase'

interface BoardContextValue {
  loading: boolean
  error: string | null
  tasks: Task[]
  members: TeamMember[]
  labels: Label[]
  filters: BoardFilters
  setFilters: (f: Partial<BoardFilters>) => void
  filteredTasks: Task[]
  stats: {
    total: number
    done: number
    overdue: number
    inProgress: number
  }
  localMode: boolean
  refresh: () => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<Task>
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (id: string, status: TaskStatus) => Promise<void>
  createMember: (name: string, color: string) => Promise<void>
  deleteMember: (id: string) => Promise<void>
  createLabel: (name: string, color: string) => Promise<void>
  deleteLabel: (id: string) => Promise<void>
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  creating: boolean
  setCreating: (v: boolean) => void
}

const BoardContext = createContext<BoardContextValue | null>(null)

const defaultFilters: BoardFilters = {
  search: '',
  priority: 'all',
  assigneeId: 'all',
  labelId: 'all',
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [filters, setFiltersState] = useState<BoardFilters>(defaultFilters)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const data = await api.fetchBoardData()
      setTasks(sortTasks(data.tasks))
      setMembers(data.members)
      setLabels(data.labels)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load board')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setFilters = useCallback((partial: Partial<BoardFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }))
  }, [])

  const filteredTasks = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return sortTasks(
      tasks.filter((t) => {
        if (q && !t.title.toLowerCase().includes(q) && !(t.description ?? '').toLowerCase().includes(q)) {
          return false
        }
        if (filters.priority !== 'all' && t.priority !== filters.priority) return false
        if (filters.assigneeId !== 'all' && t.assignee_id !== filters.assigneeId) return false
        if (filters.labelId !== 'all' && !(t.label_ids ?? []).includes(filters.labelId)) return false
        return true
      }),
    )
  }, [tasks, filters])

  const stats = useMemo(() => {
    const overdue = tasks.filter(
      (t) => t.status !== 'done' && getDueUrgency(t.due_date) === 'overdue',
    ).length
    return {
      total: tasks.length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    }
  }, [tasks])

  const createTask = useCallback(async (input: CreateTaskInput) => {
    const task = await api.createTask(input)
    setTasks((prev) => sortTasks([...prev, task]))
    return task
  }, [])

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput) => {
    const updated = await api.updateTask(id, input)
    setTasks((prev) => sortTasks(prev.map((t) => (t.id === id ? updated : t))))
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    await api.deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setSelectedTaskId((cur) => (cur === id ? null : cur))
  }, [])

  const moveTask = useCallback(async (id: string, status: TaskStatus) => {
    setTasks((prev) =>
      sortTasks(prev.map((t) => (t.id === id ? { ...t, status } : t))),
    )
    try {
      const updated = await api.updateTask(id, { status })
      setTasks((prev) => sortTasks(prev.map((t) => (t.id === id ? updated : t))))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to move task')
      await refresh()
    }
  }, [refresh])

  const createMember = useCallback(async (name: string, color: string) => {
    const member = await api.createMember(name, color)
    setMembers((prev) => [...prev, member])
  }, [])

  const deleteMember = useCallback(async (id: string) => {
    await api.deleteMember(id)
    setMembers((prev) => prev.filter((m) => m.id !== id))
    setTasks((prev) =>
      prev.map((t) => (t.assignee_id === id ? { ...t, assignee_id: null } : t)),
    )
  }, [])

  const createLabel = useCallback(async (name: string, color: string) => {
    const label = await api.createLabel(name, color)
    setLabels((prev) => [...prev, label])
  }, [])

  const deleteLabel = useCallback(async (id: string) => {
    await api.deleteLabel(id)
    setLabels((prev) => prev.filter((l) => l.id !== id))
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        label_ids: (t.label_ids ?? []).filter((lid) => lid !== id),
      })),
    )
  }, [])

  const value: BoardContextValue = {
    loading,
    error,
    tasks,
    members,
    labels,
    filters,
    setFilters,
    filteredTasks,
    stats,
    localMode: usingLocalMode,
    refresh,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    createMember,
    deleteMember,
    createLabel,
    deleteLabel,
    selectedTaskId,
    setSelectedTaskId,
    creating,
    setCreating,
  }

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}

export function useBoard() {
  const ctx = useContext(BoardContext)
  if (!ctx) throw new Error('useBoard must be used within BoardProvider')
  return ctx
}

export type { Priority }

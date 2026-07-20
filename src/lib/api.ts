import { supabase, usingLocalMode } from './supabase'
import type {
  ActivityEntry,
  Comment,
  CreateTaskInput,
  Label,
  Task,
  TeamMember,
  UpdateTaskInput,
} from './types'
import { uid } from './utils'

const STORAGE_KEY = 'flowboard_local_v1'

interface LocalStore {
  userId: string
  tasks: Task[]
  members: TeamMember[]
  labels: Label[]
  comments: Comment[]
  activity: ActivityEntry[]
  taskLabels: { task_id: string; label_id: string }[]
}

function readStore(): LocalStore {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) return JSON.parse(raw) as LocalStore
  const seed = seedLocalStore()
  writeStore(seed)
  return seed
}

function writeStore(store: LocalStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function seedLocalStore(): LocalStore {
  const userId = uid()
  const members: TeamMember[] = [
    {
      id: uid(),
      user_id: userId,
      name: 'Alex Chen',
      color: '#0F766E',
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: uid(),
      user_id: userId,
      name: 'Jordan Lee',
      color: '#0369A1',
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
    {
      id: uid(),
      user_id: userId,
      name: 'Sam Rivera',
      color: '#B45309',
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
  ]
  const labels: Label[] = [
    { id: uid(), user_id: userId, name: 'Bug', color: '#E11D48', created_at: new Date().toISOString() },
    { id: uid(), user_id: userId, name: 'Feature', color: '#0F766E', created_at: new Date().toISOString() },
    { id: uid(), user_id: userId, name: 'Design', color: '#7C3AED', created_at: new Date().toISOString() },
  ]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const t1 = uid()
  const t2 = uid()
  const t3 = uid()
  const t4 = uid()
  const t5 = uid()

  const tasks: Task[] = [
    {
      id: t1,
      user_id: userId,
      title: 'Sketch onboarding flow',
      description: 'Map the first-run guest experience and empty states.',
      status: 'todo',
      priority: 'high',
      due_date: tomorrow.toISOString().slice(0, 10),
      assignee_id: members[2].id,
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: t2,
      user_id: userId,
      title: 'Wire drag-and-drop columns',
      description: 'Use dnd-kit for smooth status updates across the board.',
      status: 'in_progress',
      priority: 'high',
      due_date: nextWeek.toISOString().slice(0, 10),
      assignee_id: members[0].id,
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: t3,
      user_id: userId,
      title: 'Polish task detail drawer',
      description: 'Comments, activity timeline, and label assignment.',
      status: 'in_review',
      priority: 'normal',
      due_date: null,
      assignee_id: members[1].id,
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: t4,
      user_id: userId,
      title: 'Ship guest auth + RLS',
      description: 'Anonymous Supabase sessions with row-level security.',
      status: 'done',
      priority: 'normal',
      due_date: yesterday.toISOString().slice(0, 10),
      assignee_id: members[0].id,
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: t5,
      user_id: userId,
      title: 'Fix overdue badge contrast',
      description: null,
      status: 'todo',
      priority: 'low',
      due_date: yesterday.toISOString().slice(0, 10),
      assignee_id: null,
      position: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]

  return {
    userId,
    tasks,
    members,
    labels,
    comments: [
      {
        id: uid(),
        task_id: t2,
        user_id: userId,
        body: 'Keyboard accessibility for drag handles is next.',
        created_at: new Date(Date.now() - 3600_000).toISOString(),
      },
    ],
    activity: [
      {
        id: uid(),
        task_id: t2,
        user_id: userId,
        action: 'status_changed',
        detail: 'Moved from To Do → In Progress',
        created_at: new Date(Date.now() - 7200_000).toISOString(),
      },
      {
        id: uid(),
        task_id: t4,
        user_id: userId,
        action: 'status_changed',
        detail: 'Moved from In Review → Done',
        created_at: new Date(Date.now() - 86400_000).toISOString(),
      },
    ],
    taskLabels: [
      { task_id: t1, label_id: labels[2].id },
      { task_id: t2, label_id: labels[1].id },
      { task_id: t5, label_id: labels[0].id },
      { task_id: t3, label_id: labels[2].id },
    ],
  }
}

function attachLabels(store: LocalStore, tasks: Task[]): Task[] {
  return tasks.map((t) => ({
    ...t,
    label_ids: store.taskLabels.filter((tl) => tl.task_id === t.id).map((tl) => tl.label_id),
  }))
}

async function ensureAnonSession(): Promise<string> {
  if (usingLocalMode || !supabase) {
    return readStore().userId
  }
  const { data: existing } = await supabase.auth.getSession()
  if (existing.session?.user?.id) return existing.session.user.id

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  if (!data.user) throw new Error('Anonymous sign-in failed')
  return data.user.id
}

export async function getCurrentUserId(): Promise<string> {
  return ensureAnonSession()
}

export async function fetchBoardData() {
  const userId = await ensureAnonSession()

  if (usingLocalMode || !supabase) {
    const store = readStore()
    return {
      userId,
      tasks: attachLabels(store, store.tasks),
      members: store.members,
      labels: store.labels,
    }
  }

  const [tasksRes, membersRes, labelsRes, tlRes] = await Promise.all([
    supabase.from('tasks').select('*').order('position'),
    supabase.from('team_members').select('*').order('created_at'),
    supabase.from('labels').select('*').order('created_at'),
    supabase.from('task_labels').select('*'),
  ])

  if (tasksRes.error) throw tasksRes.error
  if (membersRes.error) throw membersRes.error
  if (labelsRes.error) throw labelsRes.error
  if (tlRes.error) throw tlRes.error

  const labelMap = new Map<string, string[]>()
  for (const row of tlRes.data ?? []) {
    const list = labelMap.get(row.task_id) ?? []
    list.push(row.label_id)
    labelMap.set(row.task_id, list)
  }

  const tasks: Task[] = (tasksRes.data ?? []).map((t) => ({
    ...t,
    label_ids: labelMap.get(t.id) ?? [],
  }))

  return {
    userId,
    tasks,
    members: (membersRes.data ?? []) as TeamMember[],
    labels: (labelsRes.data ?? []) as Label[],
  }
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const userId = await ensureAnonSession()
  const labelIds = input.label_ids ?? []

  if (usingLocalMode || !supabase) {
    const store = readStore()
    const task: Task = {
      id: uid(),
      user_id: userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'normal',
      due_date: input.due_date ?? null,
      assignee_id: input.assignee_id ?? null,
      position: store.tasks.filter((t) => t.status === (input.status ?? 'todo')).length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      label_ids: labelIds,
    }
    store.tasks.push(task)
    for (const lid of labelIds) {
      store.taskLabels.push({ task_id: task.id, label_id: lid })
    }
    store.activity.unshift({
      id: uid(),
      task_id: task.id,
      user_id: userId,
      action: 'created',
      detail: 'Task created',
      created_at: new Date().toISOString(),
    })
    writeStore(store)
    return task
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'normal',
      due_date: input.due_date || null,
      assignee_id: input.assignee_id || null,
      position: 0,
    })
    .select()
    .single()

  if (error) throw error

  if (labelIds.length) {
    await supabase.from('task_labels').insert(
      labelIds.map((label_id) => ({ task_id: data.id, label_id })),
    )
  }

  await supabase.from('activity_log').insert({
    task_id: data.id,
    user_id: userId,
    action: 'created',
    detail: 'Task created',
  })

  return { ...data, label_ids: labelIds }
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const userId = await ensureAnonSession()

  if (usingLocalMode || !supabase) {
    const store = readStore()
    const idx = store.tasks.findIndex((t) => t.id === id)
    if (idx < 0) throw new Error('Task not found')
    const prev = store.tasks[idx]

    if (input.status && input.status !== prev.status) {
      store.activity.unshift({
        id: uid(),
        task_id: id,
        user_id: userId,
        action: 'status_changed',
        detail: `Moved from ${labelStatus(prev.status)} → ${labelStatus(input.status)}`,
        created_at: new Date().toISOString(),
      })
    } else if (input.title || input.description !== undefined || input.priority || input.due_date !== undefined) {
      store.activity.unshift({
        id: uid(),
        task_id: id,
        user_id: userId,
        action: 'updated',
        detail: 'Task details updated',
        created_at: new Date().toISOString(),
      })
    }
    if (input.assignee_id !== undefined && input.assignee_id !== prev.assignee_id) {
      store.activity.unshift({
        id: uid(),
        task_id: id,
        user_id: userId,
        action: 'assigned',
        detail: input.assignee_id ? 'Assignee updated' : 'Assignee cleared',
        created_at: new Date().toISOString(),
      })
    }

    const next: Task = {
      ...prev,
      ...input,
      updated_at: new Date().toISOString(),
    }
    if (input.label_ids) {
      store.taskLabels = store.taskLabels.filter((tl) => tl.task_id !== id)
      for (const lid of input.label_ids) {
        store.taskLabels.push({ task_id: id, label_id: lid })
      }
      next.label_ids = input.label_ids
    } else {
      next.label_ids = store.taskLabels.filter((tl) => tl.task_id === id).map((tl) => tl.label_id)
    }
    store.tasks[idx] = next
    writeStore(store)
    return next
  }

  const { label_ids, ...fields } = input
  const payload: Record<string, unknown> = { ...fields }
  if (payload.due_date === '') payload.due_date = null

  const { data: prev } = await supabase.from('tasks').select('*').eq('id', id).single()

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  if (label_ids) {
    await supabase.from('task_labels').delete().eq('task_id', id)
    if (label_ids.length) {
      await supabase.from('task_labels').insert(
        label_ids.map((label_id) => ({ task_id: id, label_id })),
      )
    }
  }

  if (prev && input.status && input.status !== prev.status) {
    await supabase.from('activity_log').insert({
      task_id: id,
      user_id: userId,
      action: 'status_changed',
      detail: `Moved from ${labelStatus(prev.status)} → ${labelStatus(input.status)}`,
    })
  } else if (prev && (input.title || input.description !== undefined || input.priority)) {
    await supabase.from('activity_log').insert({
      task_id: id,
      user_id: userId,
      action: 'updated',
      detail: 'Task details updated',
    })
  }

  if (prev && input.assignee_id !== undefined && input.assignee_id !== prev.assignee_id) {
    await supabase.from('activity_log').insert({
      task_id: id,
      user_id: userId,
      action: 'assigned',
      detail: input.assignee_id ? 'Assignee updated' : 'Assignee cleared',
    })
  }

  const { data: tls } = await supabase.from('task_labels').select('label_id').eq('task_id', id)
  return { ...data, label_ids: (tls ?? []).map((r) => r.label_id) }
}

export async function deleteTask(id: string) {
  if (usingLocalMode || !supabase) {
    const store = readStore()
    store.tasks = store.tasks.filter((t) => t.id !== id)
    store.comments = store.comments.filter((c) => c.task_id !== id)
    store.activity = store.activity.filter((a) => a.task_id !== id)
    store.taskLabels = store.taskLabels.filter((tl) => tl.task_id !== id)
    writeStore(store)
    return
  }
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function createMember(name: string, color: string): Promise<TeamMember> {
  const userId = await ensureAnonSession()
  if (usingLocalMode || !supabase) {
    const store = readStore()
    const member: TeamMember = {
      id: uid(),
      user_id: userId,
      name: name.trim(),
      color,
      avatar_url: null,
      created_at: new Date().toISOString(),
    }
    store.members.push(member)
    writeStore(store)
    return member
  }
  const { data, error } = await supabase
    .from('team_members')
    .insert({ user_id: userId, name: name.trim(), color })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMember(id: string) {
  if (usingLocalMode || !supabase) {
    const store = readStore()
    store.members = store.members.filter((m) => m.id !== id)
    store.tasks = store.tasks.map((t) =>
      t.assignee_id === id ? { ...t, assignee_id: null } : t,
    )
    writeStore(store)
    return
  }
  const { error } = await supabase.from('team_members').delete().eq('id', id)
  if (error) throw error
}

export async function createLabel(name: string, color: string): Promise<Label> {
  const userId = await ensureAnonSession()
  if (usingLocalMode || !supabase) {
    const store = readStore()
    const label: Label = {
      id: uid(),
      user_id: userId,
      name: name.trim(),
      color,
      created_at: new Date().toISOString(),
    }
    store.labels.push(label)
    writeStore(store)
    return label
  }
  const { data, error } = await supabase
    .from('labels')
    .insert({ user_id: userId, name: name.trim(), color })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLabel(id: string) {
  if (usingLocalMode || !supabase) {
    const store = readStore()
    store.labels = store.labels.filter((l) => l.id !== id)
    store.taskLabels = store.taskLabels.filter((tl) => tl.label_id !== id)
    writeStore(store)
    return
  }
  const { error } = await supabase.from('labels').delete().eq('id', id)
  if (error) throw error
}

export async function fetchComments(taskId: string): Promise<Comment[]> {
  if (usingLocalMode || !supabase) {
    return readStore()
      .comments.filter((c) => c.task_id === taskId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  }
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at')
  if (error) throw error
  return data ?? []
}

export async function addComment(taskId: string, body: string): Promise<Comment> {
  const userId = await ensureAnonSession()
  if (usingLocalMode || !supabase) {
    const store = readStore()
    const comment: Comment = {
      id: uid(),
      task_id: taskId,
      user_id: userId,
      body: body.trim(),
      created_at: new Date().toISOString(),
    }
    store.comments.push(comment)
    store.activity.unshift({
      id: uid(),
      task_id: taskId,
      user_id: userId,
      action: 'commented',
      detail: 'Added a comment',
      created_at: new Date().toISOString(),
    })
    writeStore(store)
    return comment
  }
  const { data, error } = await supabase
    .from('comments')
    .insert({ task_id: taskId, user_id: userId, body: body.trim() })
    .select()
    .single()
  if (error) throw error
  await supabase.from('activity_log').insert({
    task_id: taskId,
    user_id: userId,
    action: 'commented',
    detail: 'Added a comment',
  })
  return data
}

export async function fetchActivity(taskId: string): Promise<ActivityEntry[]> {
  if (usingLocalMode || !supabase) {
    return readStore()
      .activity.filter((a) => a.task_id === taskId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  }
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

function labelStatus(s: string) {
  const map: Record<string, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
  }
  return map[s] ?? s
}

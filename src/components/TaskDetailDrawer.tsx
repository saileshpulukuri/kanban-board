import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import {
  Activity,
  Calendar,
  MessageSquare,
  Trash2,
  X,
} from 'lucide-react'
import * as api from '../lib/api'
import { useBoard } from '../hooks/useBoard'
import type { ActivityEntry, Comment, Priority, TaskStatus } from '../lib/types'
import { cn, formatRelative, formatShortDate, getDueUrgency, initials } from '../lib/utils'

export function TaskDetailDrawer() {
  const {
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    members,
    labels,
    updateTask,
    deleteTask,
  } = useBoard()

  const task = tasks.find((t) => t.id === selectedTaskId) ?? null
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [commentBody, setCommentBody] = useState('')
  const [tab, setTab] = useState<'comments' | 'activity'>('comments')
  const [saving, setSaving] = useState(false)
  const [loadingMeta, setLoadingMeta] = useState(false)

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description ?? '')
    setPriority(task.priority)
    setDueDate(task.due_date ?? '')
    setAssigneeId(task.assignee_id ?? '')
    setStatus(task.status)
    setLabelIds(task.label_ids ?? [])
    setTab('comments')
    setCommentBody('')
    setLoadingMeta(true)
    void Promise.all([api.fetchComments(task.id), api.fetchActivity(task.id)])
      .then(([c, a]) => {
        setComments(c)
        setActivity(a)
      })
      .finally(() => setLoadingMeta(false))
  }, [task?.id])

  if (!task) return null

  const assignee = members.find((m) => m.id === task.assignee_id)
  const urgency = getDueUrgency(task.status === 'done' ? null : task.due_date)

  async function save() {
    setSaving(true)
    try {
      await updateTask(task!.id, {
        title: title.trim() || task!.title,
        description: description.trim() || null,
        priority,
        due_date: dueDate || null,
        assignee_id: assigneeId || null,
        status,
        label_ids: labelIds,
      })
    } finally {
      setSaving(false)
    }
  }

  async function onAddComment(e: FormEvent) {
    e.preventDefault()
    if (!commentBody.trim()) return
    const c = await api.addComment(task!.id, commentBody)
    setComments((prev) => [...prev, c])
    setCommentBody('')
    const a = await api.fetchActivity(task!.id)
    setActivity(a)
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex justify-end bg-ink/35 backdrop-blur-[2px]"
      onClick={() => setSelectedTaskId(null)}
      role="presentation"
    >
      <aside
        className="animate-slide-in flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-label="Task details"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Task detail
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PriorityBadge priority={priority} />
              {urgency !== 'none' && task.due_date && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                    urgency === 'overdue' && 'bg-rose/10 text-rose',
                    urgency === 'soon' && 'bg-amber/10 text-amber',
                    urgency === 'normal' && 'bg-surface-3 text-ink-soft',
                  )}
                >
                  <Calendar size={10} />
                  {formatShortDate(task.due_date)}
                </span>
              )}
              {assignee && (
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-semibold text-white"
                    style={{ background: assignee.color }}
                  >
                    {initials(assignee.name)}
                  </span>
                  {assignee.name}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedTaskId(null)}
            className="focus-ring rounded-lg p-2 text-muted hover:bg-surface-3"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="board-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => void save()}
            className="focus-ring w-full rounded-xl border border-transparent bg-transparent px-2 py-1 font-display text-2xl text-ink hover:border-line focus:border-line focus:bg-surface-2"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => void save()}
            rows={4}
            placeholder="Add a description…"
            className="focus-ring w-full resize-none rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm leading-relaxed text-ink-soft"
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs">
              <span className="mb-1 block font-medium text-muted">Status</span>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as TaskStatus)
                  void updateTask(task.id, { status: e.target.value as TaskStatus }).then(
                    async () => setActivity(await api.fetchActivity(task.id)),
                  )
                }}
                className="focus-ring w-full rounded-xl border border-line bg-surface-2 px-2.5 py-2 text-sm"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label className="block text-xs">
              <span className="mb-1 block font-medium text-muted">Priority</span>
              <select
                value={priority}
                onChange={(e) => {
                  const p = e.target.value as Priority
                  setPriority(p)
                  void updateTask(task.id, { priority: p })
                }}
                className="focus-ring w-full rounded-xl border border-line bg-surface-2 px-2.5 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="block text-xs">
              <span className="mb-1 block font-medium text-muted">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value)
                  void updateTask(task.id, { due_date: e.target.value || null })
                }}
                className="focus-ring w-full rounded-xl border border-line bg-surface-2 px-2.5 py-2 text-sm"
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1 block font-medium text-muted">Assignee</span>
              <select
                value={assigneeId}
                onChange={(e) => {
                  setAssigneeId(e.target.value)
                  void updateTask(task.id, { assignee_id: e.target.value || null }).then(
                    async () => setActivity(await api.fetchActivity(task.id)),
                  )
                }}
                className="focus-ring w-full rounded-xl border border-line bg-surface-2 px-2.5 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {labels.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted">Labels</p>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((l) => {
                  const on = labelIds.includes(l.id)
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        const next = on
                          ? labelIds.filter((id) => id !== l.id)
                          : [...labelIds, l.id]
                        setLabelIds(next)
                        void updateTask(task.id, { label_ids: next })
                      }}
                      className={cn(
                        'rounded-md px-2 py-1 text-xs font-medium transition',
                        on ? 'ring-2 ring-offset-1' : 'opacity-60 hover:opacity-100',
                      )}
                      style={{
                        background: `${l.color}18`,
                        color: l.color,
                        ...(on
                          ? ({ ['--tw-ring-color' as string]: l.color } as CSSProperties)
                          : {}),
                      }}
                    >
                      {l.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="pt-2">
            <div className="mb-3 flex gap-1 rounded-xl bg-surface-2 p-1">
              <TabButton
                active={tab === 'comments'}
                onClick={() => setTab('comments')}
                icon={<MessageSquare size={13} />}
                label="Comments"
              />
              <TabButton
                active={tab === 'activity'}
                onClick={() => setTab('activity')}
                icon={<Activity size={13} />}
                label="Activity"
              />
            </div>

            {loadingMeta ? (
              <div className="space-y-2">
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-12 w-5/6" />
              </div>
            ) : tab === 'comments' ? (
              <div className="space-y-3">
                {comments.length === 0 && (
                  <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-muted">
                    No comments yet — start the thread.
                  </p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="rounded-xl border border-line bg-surface-2 px-3 py-2.5">
                    <p className="text-sm leading-relaxed text-ink">{c.body}</p>
                    <p className="mt-1.5 text-[11px] text-muted">{formatRelative(c.created_at)}</p>
                  </div>
                ))}
                <form onSubmit={(e) => void onAddComment(e)} className="flex gap-2">
                  <input
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Write a comment…"
                    className="focus-ring min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="focus-ring rounded-xl bg-teal px-3 py-2 text-sm font-medium text-white hover:bg-teal-bright"
                  >
                    Post
                  </button>
                </form>
              </div>
            ) : (
              <ol className="relative space-y-0 border-l border-line ml-2">
                {activity.length === 0 && (
                  <p className="ml-4 text-sm text-muted">No activity yet.</p>
                )}
                {activity.map((a) => (
                  <li key={a.id} className="relative pb-4 pl-4">
                    <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-teal" />
                    <p className="text-sm text-ink">{a.detail ?? a.action}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{formatRelative(a.created_at)}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={() => void deleteTask(task.id)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-rose hover:bg-rose/10"
          >
            <Trash2 size={14} />
            Delete
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="focus-ring rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </aside>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const map = {
    high: 'bg-rose/10 text-rose',
    normal: 'bg-sky/10 text-sky',
    low: 'bg-surface-3 text-muted',
  }
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase', map[priority])}>
      {priority}
    </span>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition',
        active ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

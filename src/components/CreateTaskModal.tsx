import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useBoard } from '../hooks/useBoard'
import type { Priority, TaskStatus } from '../lib/types'
import { cn } from '../lib/utils'

export function CreateTaskModal() {
  const { creating, setCreating, createTask, members, labels } = useBoard()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!creating) return
    setTitle('')
    setDescription('')
    setPriority('normal')
    setDueDate('')
    setAssigneeId('')
    setStatus('todo')
    setLabelIds([])
    setError(null)
  }, [creating])

  if (!creating) return null

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createTask({
        title,
        description,
        priority,
        due_date: dueDate || null,
        assignee_id: assigneeId || null,
        status,
        label_ids: labelIds,
      })
      setCreating(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={() => setCreating(false)}
      role="presentation"
    >
      <div
        className="animate-fade-up card-shadow-hover max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-surface sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-labelledby="create-task-title"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              New work
            </p>
            <h2 id="create-task-title" className="font-display text-2xl text-ink">
              Create task
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="focus-ring rounded-lg p-2 text-muted hover:bg-surface-3 hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 px-5 py-5">
          <Field label="Title">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to get done?"
              className="focus-ring w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional context…"
              className="focus-ring w-full resize-none rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="focus-ring w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="focus-ring w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </Field>
            <Field label="Due date">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="focus-ring w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm"
              />
            </Field>
            <Field label="Assignee">
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="focus-ring w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {labels.length > 0 && (
            <Field label="Labels">
              <div className="flex flex-wrap gap-1.5">
                {labels.map((l) => {
                  const on = labelIds.includes(l.id)
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() =>
                        setLabelIds((prev) =>
                          on ? prev.filter((id) => id !== l.id) : [...prev, l.id],
                        )
                      }
                      className={cn(
                        'rounded-md px-2 py-1 text-xs font-medium transition',
                        on ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100',
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
            </Field>
          )}

          {error && (
            <p className="rounded-lg bg-rose/10 px-3 py-2 text-sm text-rose">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="focus-ring rounded-xl px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="focus-ring rounded-xl bg-teal px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-bright disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  )
}

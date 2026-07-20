import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, GripVertical } from 'lucide-react'
import type { Label, Task, TeamMember } from '../lib/types'
import {
  cn,
  formatShortDate,
  getDueUrgency,
  initials,
} from '../lib/utils'

interface TaskCardProps {
  task: Task
  members: TeamMember[]
  labels: Label[]
  onOpen: () => void
  isOverlay?: boolean
}

export function TaskCard({ task, members, labels, onOpen, isOverlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
    disabled: isOverlay,
  })

  const assignee = members.find((m) => m.id === task.assignee_id)
  const taskLabels = labels.filter((l) => (task.label_ids ?? []).includes(l.id))
  const urgency = getDueUrgency(task.status === 'done' ? null : task.due_date)

  const style = isOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      }

  return (
    <article
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-xl border border-line bg-surface p-3 transition-shadow',
        !isOverlay && 'card-shadow hover:card-shadow-hover',
        isDragging && !isOverlay && 'opacity-30',
        isOverlay && 'dragging card-shadow-hover rotate-1',
        urgency === 'overdue' && 'border-l-[3px] border-l-rose',
        urgency === 'soon' && 'border-l-[3px] border-l-amber',
      )}
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none rounded p-0.5 text-muted opacity-0 transition group-hover:opacity-100 active:cursor-grabbing"
          aria-label="Drag task"
          {...(isOverlay ? {} : { ...attributes, ...listeners })}
        >
          <GripVertical size={14} />
        </button>

        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left"
        >
          <div className="mb-2 flex flex-wrap gap-1">
            <PriorityPill priority={task.priority} />
            {taskLabels.map((l) => (
              <span
                key={l.id}
                className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: `${l.color}18`, color: l.color }}
              >
                {l.name}
              </span>
            ))}
          </div>

          <h3 className="text-sm font-medium leading-snug text-ink">{task.title}</h3>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            {task.due_date ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                  urgency === 'overdue' && 'bg-rose/10 text-rose',
                  urgency === 'soon' && 'bg-amber/10 text-amber',
                  urgency === 'normal' && 'bg-surface-3 text-ink-soft',
                  urgency === 'none' && 'bg-surface-3 text-ink-soft',
                )}
              >
                <Calendar size={10} />
                {formatShortDate(task.due_date)}
                {urgency === 'overdue' && ' · overdue'}
                {urgency === 'soon' && ' · soon'}
              </span>
            ) : (
              <span />
            )}

            {assignee ? (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-semibold text-white ring-2 ring-white"
                style={{ background: assignee.color }}
                title={assignee.name}
              >
                {initials(assignee.name)}
              </span>
            ) : null}
          </div>
        </button>
      </div>
    </article>
  )
}

function PriorityPill({ priority }: { priority: Task['priority'] }) {
  const map = {
    high: 'bg-rose/10 text-rose',
    normal: 'bg-sky/10 text-sky',
    low: 'bg-surface-3 text-muted',
  }
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', map[priority])}>
      {priority}
    </span>
  )
}

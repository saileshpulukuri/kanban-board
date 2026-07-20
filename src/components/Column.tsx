import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { Label, Task, TaskStatus, TeamMember } from '../lib/types'
import { cn } from '../lib/utils'
import { TaskCard } from './TaskCard'

interface ColumnProps {
  id: TaskStatus
  title: string
  hint: string
  tasks: Task[]
  members: TeamMember[]
  labels: Label[]
  onOpenTask: (id: string) => void
  onAdd: () => void
  index: number
}

const accent: Record<TaskStatus, string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-teal',
  in_review: 'bg-amber',
  done: 'bg-sky',
}

export function Column({
  id,
  title,
  hint,
  tasks,
  members,
  labels,
  onOpenTask,
  onAdd,
  index,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: 'column', status: id } })

  return (
    <section
      className={cn(
        'animate-fade-up flex w-[280px] shrink-0 flex-col sm:w-[300px]',
        `stagger-${Math.min(index + 1, 4)}`,
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', accent[id])} />
          <div>
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            <p className="text-[11px] text-muted">{hint}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-surface/80 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted">
            {tasks.length}
          </span>
          <button
            type="button"
            onClick={onAdd}
            className="focus-ring rounded-md p-1 text-muted transition hover:bg-surface hover:text-teal"
            aria-label={`Add task to ${title}`}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'board-scroll flex min-h-[220px] flex-1 flex-col gap-2.5 rounded-2xl border border-transparent p-2 transition-colors',
          isOver && 'border-teal/30 bg-teal-soft/30',
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              members={members}
              labels={labels}
              onOpen={() => onOpenTask(task.id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            className={cn(
              'flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-line/80 bg-surface/40 px-4 py-10 text-center transition',
              isOver && 'border-teal bg-teal-soft/40',
            )}
          >
            <p className="text-sm font-medium text-ink-soft">Nothing here yet</p>
            <p className="mt-1 text-xs text-muted">Drop a card or add a task</p>
            <button
              type="button"
              onClick={onAdd}
              className="mt-3 text-xs font-medium text-teal hover:underline"
            >
              Create task
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

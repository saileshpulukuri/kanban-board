import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'
import { useBoard } from '../hooks/useBoard'
import { COLUMNS, type Task, type TaskStatus } from '../lib/types'
import { Column } from './Column'
import { TaskCard } from './TaskCard'

export function Board() {
  const {
    filteredTasks,
    members,
    labels,
    moveTask,
    setSelectedTaskId,
    setCreating,
    updateTask,
  } = useBoard()

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [localTasks, setLocalTasks] = useState<Task[] | null>(null)

  const tasks = localTasks ?? filteredTasks

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const byColumn = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    }
    for (const t of tasks) map[t.status].push(t)
    return map
  }, [tasks])

  function findContainer(id: string): TaskStatus | null {
    if (COLUMNS.some((c) => c.id === id)) return id as TaskStatus
    const task = tasks.find((t) => t.id === id)
    return task?.status ?? null
  }

  function onDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
    setLocalTasks(filteredTasks)
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || !localTasks) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const activeContainer = findContainer(activeId)
    const overContainer =
      findContainer(overId) ??
      (COLUMNS.some((c) => c.id === overId) ? (overId as TaskStatus) : null)

    if (!activeContainer || !overContainer || activeContainer === overContainer) return

    setLocalTasks((prev) => {
      if (!prev) return prev
      return prev.map((t) =>
        t.id === activeId ? { ...t, status: overContainer } : t,
      )
    })
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)

    if (!over || !localTasks) {
      setLocalTasks(null)
      return
    }

    const activeId = String(active.id)
    const overId = String(over.id)
    const task = localTasks.find((t) => t.id === activeId)
    if (!task) {
      setLocalTasks(null)
      return
    }

    const overContainer =
      findContainer(overId) ??
      (COLUMNS.some((c) => c.id === overId) ? (overId as TaskStatus) : task.status)

    const columnTasks = localTasks.filter((t) => t.status === overContainer)
    const oldIndex = columnTasks.findIndex((t) => t.id === activeId)
    const overIndex = columnTasks.findIndex((t) => t.id === overId)
    let nextOrder = columnTasks
    if (oldIndex >= 0 && overIndex >= 0 && oldIndex !== overIndex) {
      nextOrder = arrayMove(columnTasks, oldIndex, overIndex)
    }

    const original = filteredTasks.find((t) => t.id === activeId)
    const statusChanged = Boolean(original && original.status !== overContainer)

    setLocalTasks(null)

    if (statusChanged) {
      await moveTask(activeId, overContainer)
    }

    // Persist column order (skip active task status — already handled above)
    await Promise.all(
      nextOrder.map((t, i) => {
        if (t.id === activeId) {
          return statusChanged
            ? Promise.resolve()
            : t.position !== i
              ? updateTask(t.id, { position: i })
              : Promise.resolve()
        }
        return t.position !== i ? updateTask(t.id, { position: i }) : Promise.resolve()
      }),
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={(e) => void onDragEnd(e)}
    >
      <div className="board-scroll flex gap-4 overflow-x-auto pb-6 pt-1">
        {COLUMNS.map((col, index) => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            hint={col.hint}
            tasks={byColumn[col.id]}
            members={members}
            labels={labels}
            onOpenTask={setSelectedTaskId}
            onAdd={() => setCreating(true)}
            index={index}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
        {activeTask ? (
          <div className="w-[280px] sm:w-[284px]">
            <TaskCard
              task={activeTask}
              members={members}
              labels={labels}
              onOpen={() => undefined}
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

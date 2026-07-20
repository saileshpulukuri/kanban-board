import { Plus, Tag, Users, X } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { useBoard } from '../hooks/useBoard'
import { LABEL_PRESETS, MEMBER_COLORS } from '../lib/types'
import { cn, initials } from '../lib/utils'

export function Sidebar() {
  const {
    members,
    labels,
    filters,
    setFilters,
    createMember,
    deleteMember,
    createLabel,
    deleteLabel,
    stats,
  } = useBoard()

  const [memberName, setMemberName] = useState('')
  const [labelName, setLabelName] = useState('')
  const [memberColor, setMemberColor] = useState(MEMBER_COLORS[0])
  const [labelColor, setLabelColor] = useState(LABEL_PRESETS[0].color)

  return (
    <aside className="animate-fade-up stagger-1 hidden w-64 shrink-0 flex-col gap-5 lg:flex">
      <section className="card-shadow rounded-2xl border border-line bg-surface p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Board pulse
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <PulseCard label="Total" value={stats.total} />
          <PulseCard label="In progress" value={stats.inProgress} tone="teal" />
          <PulseCard label="Completed" value={stats.done} tone="sky" />
          <PulseCard label="Overdue" value={stats.overdue} tone="rose" />
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal to-teal-bright transition-all duration-500"
            style={{
              width: `${stats.total ? Math.round((stats.done / stats.total) * 100) : 0}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {stats.total
            ? `${Math.round((stats.done / stats.total) * 100)}% complete`
            : 'No tasks yet'}
        </p>
      </section>

      <section className="card-shadow rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink">
            <Users size={15} className="text-teal" />
            <h2 className="text-sm font-semibold">Team</h2>
          </div>
          <button
            type="button"
            onClick={() => setFilters({ assigneeId: 'all' })}
            className={cn(
              'text-[11px] font-medium',
              filters.assigneeId === 'all' ? 'text-teal' : 'text-muted hover:text-ink',
            )}
          >
            All
          </button>
        </div>

        <ul className="space-y-1">
          {members.map((m) => (
            <li key={m.id} className="group flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    assigneeId: filters.assigneeId === m.id ? 'all' : m.id,
                  })
                }
                className={cn(
                  'flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition',
                  filters.assigneeId === m.id
                    ? 'bg-teal-soft/60 text-teal'
                    : 'hover:bg-surface-3',
                )}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ background: m.color }}
                >
                  {initials(m.name)}
                </span>
                <span className="truncate">{m.name}</span>
              </button>
              <button
                type="button"
                onClick={() => void deleteMember(m.id)}
                className="rounded p-1 text-muted opacity-0 transition group-hover:opacity-100 hover:bg-rose/10 hover:text-rose"
                aria-label={`Remove ${m.name}`}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>

        <form
          className="mt-3 flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            if (!memberName.trim()) return
            void createMember(memberName, memberColor)
            setMemberName('')
          }}
        >
          <input
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            placeholder="Add member"
            className="focus-ring min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-xs"
          />
          <input
            type="color"
            value={memberColor}
            onChange={(e) => setMemberColor(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded-lg border border-line bg-transparent p-0.5"
            aria-label="Member color"
          />
          <button
            type="submit"
            className="focus-ring rounded-lg bg-surface-3 px-2 text-ink-soft hover:bg-teal-soft hover:text-teal"
            aria-label="Add member"
          >
            <Plus size={14} />
          </button>
        </form>
      </section>

      <section className="card-shadow rounded-2xl border border-line bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink">
            <Tag size={15} className="text-teal" />
            <h2 className="text-sm font-semibold">Labels</h2>
          </div>
          <button
            type="button"
            onClick={() => setFilters({ labelId: 'all' })}
            className={cn(
              'text-[11px] font-medium',
              filters.labelId === 'all' ? 'text-teal' : 'text-muted hover:text-ink',
            )}
          >
            All
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {labels.map((l) => (
            <div key={l.id} className="group relative">
              <button
                type="button"
                onClick={() =>
                  setFilters({ labelId: filters.labelId === l.id ? 'all' : l.id })
                }
                className={cn(
                  'rounded-md px-2 py-1 text-xs font-medium transition',
                  filters.labelId === l.id ? 'ring-2 ring-offset-1' : 'opacity-90 hover:opacity-100',
                )}
                style={{
                  background: `${l.color}18`,
                  color: l.color,
                  ...(filters.labelId === l.id
                    ? ({ ['--tw-ring-color' as string]: l.color } as CSSProperties)
                    : {}),
                }}
              >
                {l.name}
              </button>
              <button
                type="button"
                onClick={() => void deleteLabel(l.id)}
                className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-ink text-white group-hover:flex"
                aria-label={`Delete ${l.name}`}
              >
                <X size={8} />
              </button>
            </div>
          ))}
        </div>

        <form
          className="mt-3 flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            if (!labelName.trim()) return
            void createLabel(labelName, labelColor)
            setLabelName('')
          }}
        >
          <input
            value={labelName}
            onChange={(e) => setLabelName(e.target.value)}
            placeholder="New label"
            className="focus-ring min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-xs"
          />
          <input
            type="color"
            value={labelColor}
            onChange={(e) => setLabelColor(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded-lg border border-line bg-transparent p-0.5"
            aria-label="Label color"
          />
          <button
            type="submit"
            className="focus-ring rounded-lg bg-surface-3 px-2 text-ink-soft hover:bg-teal-soft hover:text-teal"
            aria-label="Add label"
          >
            <Plus size={14} />
          </button>
        </form>
      </section>
    </aside>
  )
}

function PulseCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'teal' | 'sky' | 'rose'
}) {
  const toneClass =
    tone === 'teal'
      ? 'text-teal'
      : tone === 'sky'
        ? 'text-sky'
        : tone === 'rose'
          ? 'text-rose'
          : 'text-ink'

  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2.5">
      <div className={cn('text-lg font-semibold tabular-nums', toneClass)}>{value}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  )
}

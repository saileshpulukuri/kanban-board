import { AlertCircle, Plus, RefreshCw, Search, X } from 'lucide-react'
import { useBoard } from '../hooks/useBoard'
import { cn } from '../lib/utils'

export function Header() {
  const { filters, setFilters, setCreating, stats, localMode, refresh, error } = useBoard()

  return (
    <header className="glass sticky top-0 z-30 border-b border-line/80">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="animate-fade-up flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal text-teal-soft shadow-sm">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <rect x="2" y="3" width="4" height="14" rx="1.2" fill="currentColor" opacity="0.95" />
                <rect x="8" y="3" width="4" height="9" rx="1.2" fill="currentColor" opacity="0.7" />
                <rect x="14" y="3" width="4" height="12" rx="1.2" fill="currentColor" opacity="0.5" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-2xl leading-none tracking-tight text-ink sm:text-[1.75rem]">
                Flowboard
              </h1>
              <p className="mt-0.5 text-xs text-muted">Plan · Ship · Repeat</p>
            </div>
          </div>

          <div className="animate-fade-up stagger-1 flex flex-wrap items-center gap-2">
            <div className="hidden items-center gap-3 rounded-xl border border-line bg-surface/80 px-3 py-2 text-xs text-ink-soft sm:flex">
              <Stat label="Total" value={stats.total} />
              <span className="h-3 w-px bg-line" />
              <Stat label="Active" value={stats.inProgress} />
              <span className="h-3 w-px bg-line" />
              <Stat label="Done" value={stats.done} accent />
              {stats.overdue > 0 && (
                <>
                  <span className="h-3 w-px bg-line" />
                  <Stat label="Overdue" value={stats.overdue} danger />
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => void refresh()}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft transition hover:bg-surface-3"
              aria-label="Refresh board"
            >
              <RefreshCw size={16} />
            </button>

            <button
              type="button"
              onClick={() => setCreating(true)}
              className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-teal px-4 text-sm font-medium text-white shadow-sm transition hover:bg-teal-bright active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={2.5} />
              New task
            </button>
          </div>
        </div>

        <div className="animate-fade-up stagger-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder="Search tasks…"
              className="focus-ring w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-9 text-sm text-ink placeholder:text-muted/70 transition hover:border-slate-300"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters({ search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:bg-surface-3 hover:text-ink"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterSelect
              value={filters.priority}
              onChange={(v) => setFilters({ priority: v as typeof filters.priority })}
              options={[
                { value: 'all', label: 'All priorities' },
                { value: 'high', label: 'High' },
                { value: 'normal', label: 'Normal' },
                { value: 'low', label: 'Low' },
              ]}
            />
          </div>
        </div>

        {(localMode || error) && (
          <div
            className={cn(
              'animate-fade-in flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm',
              error
                ? 'border border-rose/20 bg-rose/5 text-rose'
                : 'border border-amber/20 bg-amber/5 text-amber',
            )}
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              {error ? (
                <p>{error}</p>
              ) : (
                <p>
                  Running in <strong>local demo mode</strong> with sample data. Add Supabase env
                  vars to enable guest auth, RLS, and cloud persistence.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function Stat({
  label,
  value,
  accent,
  danger,
}: {
  label: string
  value: number
  accent?: boolean
  danger?: boolean
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className={cn(
          'text-sm font-semibold tabular-nums',
          accent && 'text-teal',
          danger && 'text-rose',
        )}
      >
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="focus-ring rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink-soft transition hover:border-slate-300"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function LoadingBoard() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex gap-4">
        <div className="hidden w-64 shrink-0 space-y-4 lg:block">
          <div className="skeleton h-36 w-full rounded-2xl" />
          <div className="skeleton h-48 w-full rounded-2xl" />
          <div className="skeleton h-40 w-full rounded-2xl" />
        </div>
        <div className="flex flex-1 gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[280px] shrink-0 space-y-3 sm:w-[300px]">
              <div className="skeleton h-8 w-32" />
              <div className="skeleton h-24 w-full rounded-xl" />
              <div className="skeleton h-20 w-full rounded-xl" />
              <div className="skeleton h-28 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-muted" style={{ animation: 'pulse-soft 1.5s ease infinite' }}>
        Preparing your board…
      </p>
    </div>
  )
}

import { Board } from './components/Board'
import { CreateTaskModal } from './components/CreateTaskModal'
import { Header } from './components/Header'
import { LoadingBoard } from './components/LoadingBoard'
import { Sidebar } from './components/Sidebar'
import { TaskDetailDrawer } from './components/TaskDetailDrawer'
import { BoardProvider, useBoard } from './hooks/useBoard'

function AppShell() {
  const { loading } = useBoard()

  return (
    <div className="min-h-screen">
      <Header />
      {loading ? (
        <LoadingBoard />
      ) : (
        <main className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <Board />
          </div>
        </main>
      )}
      <CreateTaskModal />
      <TaskDetailDrawer />
    </div>
  )
}

export default function App() {
  return (
    <BoardProvider>
      <AppShell />
    </BoardProvider>
  )
}

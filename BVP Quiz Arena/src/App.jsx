import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import QuestionBuilderPage from './pages/QuestionBuilderPage'
import HostLobbyPage from './pages/host/HostLobbyPage'
import HostGamePage from './pages/host/HostGamePage'
import PlayerJoinPage from './pages/player/PlayerJoinPage'
import PlayerGamePage from './pages/player/PlayerGamePage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary font-dm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  const { setUser, setProfile, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join" element={<PlayerJoinPage />} />
        <Route path="/play/:roomCode" element={<PlayerGamePage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions"
          element={
            <ProtectedRoute>
              <QuestionBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questions/:setId"
          element={
            <ProtectedRoute>
              <QuestionBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/lobby/:roomId"
          element={
            <ProtectedRoute>
              <HostLobbyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/host/game/:roomId"
          element={
            <ProtectedRoute>
              <HostGamePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, Plus, Play, BookOpen, Users, Trophy,
  LogOut, Settings, Clock, Trash2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store'
import { generateRoomCode } from '../lib/roomCode'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuthStore()
  const [questionSets, setQuestionSets] = useState([])
  const [recentRooms, setRecentRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingRoom, setCreatingRoom] = useState(null)

  useEffect(() => {
    fetchData()
  }, [user])

  async function fetchData() {
    if (!user) return
    setLoading(true)

    const [setsRes, roomsRes] = await Promise.all([
      supabase
        .from('question_sets')
        .select('*, questions(count)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('rooms')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    if (setsRes.data) setQuestionSets(setsRes.data)
    if (roomsRes.data) setRecentRooms(roomsRes.data)
    setLoading(false)
  }

  async function handleLaunchGame(setId) {
  setCreatingRoom(setId)
  try {
    // Get org_id from the user's profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError
    if (!profileData?.org_id) throw new Error('No organization found for this user.')

    const code = generateRoomCode()

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        code,
        host_id: user.id,
        org_id: profileData.org_id,
        question_set_id: setId,
        status: 'lobby',
        mode: 'individual',
      })
      .select()
      .single()

    if (roomError) throw roomError

    const { error: gsError } = await supabase.from('game_state').insert({
      room_id: room.id,
      phase: 'lobby',
      current_question_index: 0,
      time_remaining: 0,
    })

    if (gsError) throw gsError

    navigate(`/host/lobby/${room.id}`)
  } catch (err) {
    console.error('Error creating room:', err)
    alert(`Failed to create room: ${err.message}`)
  } finally {
    setCreatingRoom(null)
  }
}
      })

      if (gsError) throw gsError

      navigate(`/host/lobby/${room.id}`)
    } catch (err) {
      console.error('Error creating room:', err)
      alert('Failed to create room. Please try again.')
    } finally {
      setCreatingRoom(null)
    }
  }

  async function handleDeleteSet(setId, e) {
    e.stopPropagation()
    if (!confirm('Delete this question set? This cannot be undone.')) return
    await supabase.from('question_sets').delete().eq('id', setId)
    setQuestionSets((prev) => prev.filter((s) => s.id !== setId))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    signOut()
    navigate('/login')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-syne font-bold text-white">BVP QuizArena</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-text-secondary text-sm font-dm hidden sm:block">
              {profile?.full_name || user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-sm font-dm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-syne font-bold text-3xl text-white mb-1">
            Host Dashboard
          </h1>
          <p className="text-text-secondary font-dm">
            {profile?.organizations?.name || 'Your Organization'} · Create a game or manage your question sets
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: BookOpen, label: 'Question Sets', value: questionSets.length, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: Trophy, label: 'Games Hosted', value: recentRooms.length, color: 'text-accent', bg: 'bg-accent/10' },
            { icon: Users, label: 'Total Questions', value: questionSets.reduce((acc, s) => acc + (s.questions?.[0]?.count || 0), 0), color: 'text-success', bg: 'bg-success/10' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <motion.div key={label} variants={itemVariants} className="card flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-text-muted text-xs font-dm">{label}</p>
                <p className="text-white font-syne font-bold text-xl">{value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-syne font-bold text-lg text-white">Question Sets</h2>
              <button
                onClick={() => navigate('/questions')}
                className="flex items-center gap-1.5 text-primary hover:text-primary-hover text-sm font-dm transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Set
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-5 bg-border rounded w-1/3 mb-2" />
                    <div className="h-3 bg-border rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : questionSets.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card text-center py-12"
              >
                <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="font-syne font-bold text-white mb-2">No question sets yet</h3>
                <p className="text-text-secondary text-sm font-dm mb-4">
                  Create your first question set to start hosting games
                </p>
                <button onClick={() => navigate('/questions')} className="btn-primary">
                  Create Question Set
                </button>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {questionSets.map((set) => (
                  <motion.div
                    key={set.id}
                    variants={itemVariants}
                    className="card hover:border-primary/50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-syne font-semibold text-white truncate">
                          {set.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-text-muted text-xs font-dm">
                            {set.questions?.[0]?.count || 0} questions
                          </span>
                          {set.description && (
                            <span className="text-text-muted text-xs font-dm truncate">
                              {set.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => navigate(`/questions/${set.id}`)}
                          className="p-2 text-text-muted hover:text-white transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSet(set.id, e)}
                          className="p-2 text-text-muted hover:text-danger transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleLaunchGame(set.id)}
                          disabled={creatingRoom === set.id || (set.questions?.[0]?.count || 0) === 0}
                          className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm"
                        >
                          {creatingRoom === set.id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          Launch
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          <div>
            <h2 className="font-syne font-bold text-lg text-white mb-4">Recent Games</h2>
            {recentRooms.length === 0 ? (
              <div className="card text-center py-8">
                <Clock className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-text-muted text-sm font-dm">No games yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentRooms.map((room) => (
                  <div key={room.id} className="card p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-syne font-bold text-white text-lg tracking-widest">
                        {room.code}
                      </span>
                      <span className={`badge text-xs ${
                        room.status === 'finished' ? 'badge-success' :
                        room.status === 'active' ? 'badge-warning' : 'badge-primary'
                      }`}>
                        {room.status}
                      </span>
                    </div>
                    <p className="text-text-muted text-xs font-dm">
                      {new Date(room.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
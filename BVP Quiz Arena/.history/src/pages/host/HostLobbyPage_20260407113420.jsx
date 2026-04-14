import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Play, Copy, Check, ArrowLeft, Wifi, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useHostStore } from '../../store'

export default function HostLobbyPage() {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const { room, setRoom, players, setPlayers, addPlayer, setQuestions } = useHostStore()
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoomData()
    const cleanup = subscribeToPlayers()
    return cleanup
  }, [roomId])

  async function fetchRoomData() {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*, question_sets(*, questions(*))')
      .eq('id', roomId)
      .single()

    if (!roomData) { navigate('/'); return }

    setRoom(roomData)
    const questions = (roomData.question_sets?.questions || []).sort((a, b) => a.order_index - b.order_index)
    setQuestions(questions)

    const { data: existingPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true })

    if (existingPlayers) setPlayers(existingPlayers)
    setLoading(false)
  }

  function subscribeToPlayers() {
    const channel = supabase
      .channel(`lobby-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        (payload) => addPlayer(payload.new))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        (payload) => setPlayers((prev) => prev.filter((p) => p.id !== payload.old.id)))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  async function handleStartGame() {
    setStarting(true)
    try {
      await supabase.from('rooms').update({ status: 'active' }).eq('id', roomId)
      await supabase.from('game_state').update({
        phase: 'question_active',
        current_question_index: 0,
        question_started_at: new Date().toISOString(),
      }).eq('room_id', roomId)
      navigate(`/host/game/${roomId}`)
    } catch (err) {
      console.error('Start game error:', err)
      setStarting(false)
    }
  }

  async function handleKickPlayer(playerId) {
    await supabase.from('players').delete().eq('id', playerId)
    setPlayers((prev) => prev.filter((p) => p.id !== playerId))
  }

  async function handleCopyCode() {
    if (!room?.code) return
    await navigator.clipboard.writeText(room.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleCancelGame() {
    if (!confirm('Cancel this game? Players will be disconnected.')) return
    await supabase.from('rooms').update({ status: 'cancelled' }).eq('id', roomId)
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const joinUrl = `${window.location.origin}/join`

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={handleCancelGame} className="flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm font-dm">
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-text-secondary text-sm font-dm">Lobby Open</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h1 className="font-syne font-bold text-3xl text-white mb-1">
                {room?.question_sets?.title}
              </h1>
              <p className="text-text-secondary font-dm">Share the room code with your players</p>
            </div>

            <div className="card text-center py-8">
              <p className="text-text-muted text-sm font-dm mb-2">Room Code</p>
              <div className="font-syne font-bold text-6xl text-white tracking-[0.2em] mb-4"
                style={{ textShadow: '0 0 30px rgba(108,99,255,0.4)' }}>
                {room?.code}
              </div>
              <button onClick={handleCopyCode} className="flex items-center gap-2 mx-auto text-text-secondary hover:text-white transition-colors text-sm font-dm">
                {copied ? <><Check className="w-4 h-4 text-success" /><span className="text-success">Copied!</span></> : <><Copy className="w-4 h-4" />Copy code</>}
              </button>
            </div>

            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4 text-accent" />
                <span className="text-text-secondary text-sm font-dm">Players join at:</span>
              </div>
              <p className="font-syne font-medium text-accent text-lg">{joinUrl}</p>
            </div>

            <div className="card p-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-2xl font-syne font-bold text-white">{room?.question_sets?.questions?.length || 0}</p>
                  <p className="text-text-muted text-xs font-dm">Questions</p>
                </div>
                <div>
                  <p className="text-2xl font-syne font-bold text-white">{players.length}</p>
                  <p className="text-text-muted text-xs font-dm">Players Ready</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              disabled={starting || players.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg glow-primary"
            >
              {starting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Play className="w-5 h-5 fill-white" />Start Game</>
              )}
            </button>

            {players.length === 0 && (
              <p className="text-center text-text-muted text-sm font-dm">Waiting for at least 1 player to join...</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-text-secondary" />
              <h2 className="font-syne font-semibold text-white">Players ({players.length})</h2>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {players.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-8">
                    <Users className="w-8 h-8 text-text-muted mx-auto mb-2" />
                    <p className="text-text-muted font-dm text-sm">No players yet. Share the room code!</p>
                  </motion.div>
                ) : (
                  players.map((player, i) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 group"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-syne flex-shrink-0"
                        style={{ background: `hsl(${(player.display_name.charCodeAt(0) * 37) % 360}, 60%, 40%)` }}
                      >
                        {player.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 font-dm text-white truncate">{player.display_name}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-success rounded-full" />
                        <button
                          onClick={() => handleKickPlayer(player.id)}
                          className="p-1 text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
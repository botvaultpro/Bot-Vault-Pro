import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, ArrowRight, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { normalizeRoomCode, isValidRoomCode } from '../../lib/roomCode'

export default function PlayerJoinPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const nameRef = useRef(null)

  function handleCodeChange(e) {
    const val = normalizeRoomCode(e.target.value).slice(0, 6)
    setCode(val)
    if (val.length === 6) nameRef.current?.focus()
  }

  async function handleJoin(e) {
    e.preventDefault()
    const trimmedName = name.trim()

    if (!isValidRoomCode(code)) { setError('Enter a valid 6-character room code.'); return }
    if (!trimmedName) { setError('Enter your display name.'); return }
    if (trimmedName.length > 20) { setError('Name must be 20 characters or less.'); return }

    setLoading(true)
    setError(null)

    try {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, status, code')
        .eq('code', code)
        .in('status', ['lobby', 'active'])
        .single()

      if (roomError || !room) {
        setError('Room not found. Check the code and try again.')
        setLoading(false)
        return
      }

      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', room.id)
        .ilike('display_name', trimmedName)
        .single()

      if (existing) {
        setError('That name is taken in this room. Try another.')
        setLoading(false)
        return
      }

      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({ room_id: room.id, display_name: trimmedName, score: 0, streak: 0 })
        .select()
        .single()

      if (playerError) {
        setError('Failed to join. Please try again.')
        setLoading(false)
        return
      }

      sessionStorage.setItem(
        `bvp_player_${room.id}`,
        JSON.stringify({ playerId: player.id, name: trimmedName })
      )

      navigate(`/play/${room.code}`, {
        state: { playerId: player.id, roomId: room.id, playerName: trimmedName },
      })
    } catch (err) {
      console.error('Join error:', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#6C63FF 1px, transparent 1px), linear-gradient(90deg, #6C63FF 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-syne font-bold text-2xl text-white">QuizArena</span>
          </div>
          <p className="text-text-secondary font-dm text-sm">Enter a room code to play</p>
        </div>

        <div className="card">
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Room Code</label>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="e.g. QZ7K2M"
                className="input-field text-center text-2xl font-syne font-bold tracking-[0.3em] uppercase"
                maxLength={6}
                autoFocus
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Your Name</label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
                maxLength={20}
                autoComplete="off"
              />
              <p className="text-text-muted text-xs mt-1 font-dm">{20 - name.length} characters remaining</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 bg-danger/10 border border-danger/30 rounded-xl p-3"
              >
                <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                <p className="text-danger text-sm font-dm">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !code || !name.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Join Game<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/login" className="text-text-muted hover:text-white text-sm font-dm transition-colors">
            Host? Sign in here
          </a>
        </div>
      </motion.div>
    </div>
  )
}
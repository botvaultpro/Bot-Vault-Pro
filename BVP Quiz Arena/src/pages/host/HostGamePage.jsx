import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Eye, Trophy, Users, Clock, BarChart3, CheckCircle, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useHostStore } from '../../store'
import { formatPoints } from '../../lib/scoring'
import confetti from 'canvas-confetti'

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const OPTION_COLORS = ['text-primary', 'text-accent', 'text-warning', 'text-danger']
const OPTION_BG = ['bg-primary/20', 'bg-accent/20', 'bg-warning/20', 'bg-danger/20']
const OPTION_BORDER = ['border-primary/50', 'border-accent/50', 'border-warning/50', 'border-danger/50']

function Leaderboard({ players, limit = 10 }) {
  const sorted = [...players].sort((a, b) => b.score - a.score).slice(0, limit)
  return (
    <div className="space-y-2">
      {sorted.map((player, i) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 bg-surface rounded-xl px-4 py-3"
        >
          <span className={`font-syne font-bold text-lg w-6 flex-shrink-0 ${
            i === 0 ? 'text-warning' : i === 1 ? 'text-text-secondary' : i === 2 ? 'text-warning/60' : 'text-text-muted'
          }`}>{i + 1}</span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-syne flex-shrink-0"
            style={{ background: `hsl(${(player.display_name.charCodeAt(0) * 37) % 360}, 60%, 40%)` }}
          >
            {player.display_name.charAt(0).toUpperCase()}
          </div>
          <span className="flex-1 font-dm text-white text-sm truncate">{player.display_name}</span>
          <span className="font-syne font-bold text-primary text-sm">{formatPoints(player.score || 0)}</span>
        </motion.div>
      ))}
    </div>
  )
}

export default function HostGamePage() {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const {
    room, setRoom, gameState, setGameState,
    players, setPlayers, updatePlayer,
    questions, setQuestions,
    currentQuestion, setCurrentQuestion,
    answers, addAnswer, clearAnswers,
  } = useHostStore()

  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState(false)
  const [phase, setPhase] = useState('question_active')

  useEffect(() => {
    fetchData()
    const cleanup = subscribeToGameEvents()
    return cleanup
  }, [roomId])

  useEffect(() => {
    if (gameState?.phase) {
      setPhase(gameState.phase)
      if (gameState.phase === 'finished') triggerConfetti()
    }
  }, [gameState])

  async function fetchData() {
    const [roomRes, gsRes, playersRes] = await Promise.all([
      supabase.from('rooms').select('*, question_sets(*, questions(*))').eq('id', roomId).single(),
      supabase.from('game_state').select('*').eq('room_id', roomId).single(),
      supabase.from('players').select('*').eq('room_id', roomId),
    ])

    if (!roomRes.data) { navigate('/'); return }
    setRoom(roomRes.data)

    const qs = (roomRes.data.question_sets?.questions || []).sort((a, b) => a.order_index - b.order_index)
    setQuestions(qs)

    if (gsRes.data) {
      setGameState(gsRes.data)
      setCurrentQuestion(qs[gsRes.data.current_question_index] || null)

      if (gsRes.data.phase !== 'lobby') {
        const { data: answerData } = await supabase
          .from('answers').select('*').eq('room_id', roomId)
          .eq('question_id', qs[gsRes.data.current_question_index]?.id)
        if (answerData) answerData.forEach(addAnswer)
      }
    }

    if (playersRes.data) setPlayers(playersRes.data)
    setLoading(false)
  }

  function subscribeToGameEvents() {
    const channel = supabase
      .channel(`host-game-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers', filter: `room_id=eq.${roomId}` },
        (payload) => { if (payload.eventType === 'INSERT') addAnswer(payload.new) })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        (payload) => updatePlayer(payload.new.id, payload.new))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        (payload) => updatePlayer(payload.new.id, payload.new))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  function triggerConfetti() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6C63FF', '#00D4FF', '#00E096', '#FFB800'] })
  }

  async function handleRevealAnswer() {
    setAdvancing(true)
    try {
      await supabase.from('game_state').update({ phase: 'answer_revealed' }).eq('room_id', roomId)
      setPhase('answer_revealed')
    } finally { setAdvancing(false) }
  }

  async function handleNextQuestion() {
    const nextIndex = (gameState?.current_question_index ?? 0) + 1
    const isLastQuestion = nextIndex >= questions.length
    setAdvancing(true)
    clearAnswers()

    try {
      if (isLastQuestion) {
        await supabase.from('game_state').update({ phase: 'finished', current_question_index: nextIndex - 1 }).eq('room_id', roomId)
        await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId)
        setPhase('finished')
        triggerConfetti()
      } else {
        await supabase.from('game_state').update({
          phase: 'question_active',
          current_question_index: nextIndex,
          question_started_at: new Date().toISOString(),
        }).eq('room_id', roomId)
        setCurrentQuestion(questions[nextIndex])
        setPhase('question_active')
        setGameState({ ...gameState, current_question_index: nextIndex, phase: 'question_active' })
      }
    } finally { setAdvancing(false) }
  }

  async function handleExportCSV() {
    const sorted = [...players].sort((a, b) => b.score - a.score)
    const rows = [
      ['Rank', 'Name', 'Score'],
      ...sorted.map((p, i) => [i + 1, p.display_name, p.score || 0]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-results-${room?.code}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentIndex = gameState?.current_question_index ?? 0
  const totalQuestions = questions.length
  const answerCount = answers.length
  const playerCount = players.length

  const answerBreakdown = currentQuestion
    ? OPTION_LABELS.map((_, i) => ({
        label: OPTION_LABELS[i],
        text: currentQuestion.options?.[i] || '',
        count: answers.filter((a) => a.selected_answer === i).length,
        isCorrect: currentQuestion.correct_answer === i,
      }))
    : []

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="badge badge-primary font-syne tracking-widest">{room?.code}</div>
              <span className="text-text-secondary text-sm font-dm">
                Question {Math.min(currentIndex + 1, totalQuestions)} of {totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-text-secondary text-sm font-dm">
                <Users className="w-4 h-4" />{playerCount} players
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary text-sm font-dm">
                <BarChart3 className="w-4 h-4" />{answerCount}/{playerCount} answered
              </div>
            </div>
          </div>
          <div className="mt-2 h-1 bg-border rounded-full">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${((currentIndex + (phase !== 'question_active' ? 1 : 0)) / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {phase === 'finished' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-warning" />
              </div>
              <h1 className="font-syne font-bold text-4xl text-white mb-2">Game Over!</h1>
              <p className="text-text-secondary font-dm">Final Standings · {room?.question_sets?.title}</p>
            </div>
            <div className="card mb-6"><Leaderboard players={players} limit={20} /></div>
            <div className="flex gap-3">
              <button onClick={handleExportCSV} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />Export CSV
              </button>
              <button onClick={() => navigate('/')} className="btn-primary flex-1">Back to Dashboard</button>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="wait">
                {currentQuestion && (
                  <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="card mb-4">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-primary">Q{currentIndex + 1}</span>
                          <div className="flex items-center gap-1.5 text-text-muted text-xs font-dm">
                            <Clock className="w-3 h-3" />{currentQuestion.time_limit}s
                          </div>
                        </div>
                        <span className="text-text-muted text-xs font-dm">{currentQuestion.points} pts</span>
                      </div>
                      <h2 className="font-syne font-bold text-2xl text-white leading-snug">{currentQuestion.question_text}</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {answerBreakdown.map((opt, i) => {
                        const pct = answerCount > 0 ? Math.round((opt.count / answerCount) * 100) : 0
                        const revealed = phase === 'answer_revealed'
                        return (
                          <motion.div
                            key={i}
                            className={`relative rounded-xl border-2 p-4 overflow-hidden transition-all ${
                              revealed && opt.isCorrect ? 'border-success bg-success/10' :
                              revealed && !opt.isCorrect ? 'border-border bg-surface opacity-60' :
                              `${OPTION_BORDER[i]} ${OPTION_BG[i]}`
                            }`}
                          >
                            {revealed && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className={`absolute inset-y-0 left-0 ${opt.isCorrect ? 'bg-success/20' : 'bg-white/5'}`}
                              />
                            )}
                            <div className="relative">
                              <div className="flex items-start gap-2">
                                <span className={`font-syne font-bold text-sm ${revealed && opt.isCorrect ? 'text-success' : OPTION_COLORS[i]}`}>
                                  {opt.label}
                                </span>
                                {revealed && opt.isCorrect && <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />}
                              </div>
                              <p className="text-white font-dm text-sm mt-1">{opt.text}</p>
                              {revealed && <p className="text-text-secondary text-xs font-dm mt-1">{opt.count} ({pct}%)</p>}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {phase === 'answer_revealed' && currentQuestion.explanation && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-success/10 border border-success/30 rounded-xl p-4">
                        <p className="text-success text-sm font-dm">
                          <span className="font-semibold">Explanation: </span>{currentQuestion.explanation}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                {phase === 'question_active' ? (
                  <button onClick={handleRevealAnswer} disabled={advancing} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                    {advancing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Eye className="w-4 h-4" />Reveal Answer</>}
                  </button>
                ) : (
                  <button onClick={handleNextQuestion} disabled={advancing} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                    {advancing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                      currentIndex + 1 >= totalQuestions ? <><Trophy className="w-4 h-4" />Show Final Results</> : <>Next Question<ChevronRight className="w-4 h-4" /></>}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-sm font-dm text-text-secondary px-1">
                <span>Answers: {answerCount} / {playerCount}</span>
                {answerCount === playerCount && playerCount > 0 && <span className="text-success">All players answered!</span>}
              </div>
            </div>

            <div>
              <h3 className="font-syne font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-warning" />Live Standings
              </h3>
              <Leaderboard players={players} limit={10} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
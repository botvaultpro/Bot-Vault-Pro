import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Zap, CheckCircle, XCircle, Clock, Flame } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { calculateTotal, formatPoints } from '../../lib/scoring'

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const OPTION_STYLES = [
  { border: 'border-primary', bg: 'bg-primary/10', hover: 'hover:bg-primary/20', text: 'text-primary' },
  { border: 'border-accent', bg: 'bg-accent/10', hover: 'hover:bg-accent/20', text: 'text-accent' },
  { border: 'border-warning', bg: 'bg-warning/10', hover: 'hover:bg-warning/20', text: 'text-warning' },
  { border: 'border-danger', bg: 'bg-danger/10', hover: 'hover:bg-danger/20', text: 'text-danger' },
]

export default function PlayerGamePage() {
  const navigate = useNavigate()
  const { roomCode } = useParams()
  const location = useLocation()

  const [playerInfo, setPlayerInfo] = useState(location.state || null)
  const [room, setRoom] = useState(null)
  const [gameState, setGameStateLocal] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questions, setQuestions] = useState([])
  const [hasAnswered, setHasAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [streak, setStreak] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [phase, setPhase] = useState('lobby')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    fetchGameData()
    return () => clearInterval(timerRef.current)
  }, [roomCode])

  async function fetchGameData() {
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*, question_sets(*, questions(*))')
      .eq('code', roomCode)
      .single()

    if (!roomData) { navigate('/join'); return }

    if (playerInfo?.playerId) {
      const { data: player } = await supabase
        .from('players').select('*').eq('id', playerInfo.playerId).single()
      if (player) { setStreak(player.streak || 0); setTotalScore(player.score || 0) }
    }

    setRoom(roomData)
    const qs = (roomData.question_sets?.questions || []).sort((a, b) => a.order_index - b.order_index)
    setQuestions(qs)

    const { data: gs } = await supabase
      .from('game_state').select('*').eq('room_id', roomData.id).single()

    if (gs) handleGameStateChange(gs, qs)

    refreshLeaderboard(roomData.id)
    subscribeToGame(roomData.id, qs)
  }

  function handleGameStateChange(gs, qs) {
    const questionList = qs || questions
    setGameStateLocal(gs)
    setPhase(gs.phase)

    if (gs.phase === 'question_active' || gs.phase === 'answer_revealed') {
      const q = questionList[gs.current_question_index]
      if (q) {
        setCurrentQuestion(q)
        if (gs.phase === 'question_active') {
          setHasAnswered(false)
          setSelectedAnswer(null)
          setAnswerResult(null)
          startTimer(q.time_limit, gs.question_started_at)
        }
      }
    }
  }

  function startTimer(timeLimit, startedAt) {
    clearInterval(timerRef.current)
    const updateTimer = () => {
      const elapsed = startedAt ? (Date.now() - new Date(startedAt).getTime()) / 1000 : 0
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeRemaining(remaining)
      if (remaining <= 0) clearInterval(timerRef.current)
    }
    updateTimer()
    timerRef.current = setInterval(updateTimer, 100)
  }

  function subscribeToGame(roomId, qs) {
    const channel = supabase
      .channel(`player-game-${roomCode}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'game_state',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        handleGameStateChange(payload.new, qs)
        if (payload.new.phase === 'question_active') refreshLeaderboard(roomId)
        if (payload.new.phase === 'finished') { setPhase('finished'); refreshLeaderboard(roomId) }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  async function refreshLeaderboard(roomId) {
    const { data } = await supabase
      .from('players').select('id, display_name, score')
      .eq('room_id', roomId).order('score', { ascending: false }).limit(10)
    if (data) setLeaderboard(data)
  }

  async function handleAnswer(answerIndex) {
    if (hasAnswered || phase !== 'question_active') return

    const elapsed = gameState?.question_started_at
      ? (Date.now() - new Date(gameState.question_started_at).getTime()) / 1000
      : currentQuestion.time_limit

    const timeLeft = Math.max(0, currentQuestion.time_limit - elapsed)

    setSelectedAnswer(answerIndex)
    setHasAnswered(true)
    clearInterval(timerRef.current)

    const isCorrect = answerIndex === currentQuestion.correct_answer
    const { total, streakBonus, newStreak } = calculateTotal(timeLeft, currentQuestion.time_limit, streak, currentQuestion.points)
    const pointsEarned = isCorrect ? total : 0

    setAnswerResult({ correct: isCorrect, points: pointsEarned, streakBonus })
    if (isCorrect) { setStreak(newStreak); setTotalScore((prev) => prev + pointsEarned) }
    else setStreak(0)

    try {
      await supabase.from('answers').insert({
        room_id: room.id,
        question_id: currentQuestion.id,
        player_id: playerInfo?.playerId,
        selected_answer: answerIndex,
        is_correct: isCorrect,
        time_taken: elapsed,
        points_earned: pointsEarned,
      })

      await supabase.from('players')
        .update({ score: totalScore + pointsEarned, streak: isCorrect ? newStreak : 0 })
        .eq('id', playerInfo?.playerId)
    } catch (err) {
      console.error('Answer submit error:', err)
    }
  }

  const myRank = leaderboard.findIndex((p) => p.id === playerInfo?.playerId) + 1

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="bg-surface border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-syne font-bold text-white text-sm">{playerInfo?.playerName || 'Player'}</span>
            {streak >= 3 && (
              <div className="flex items-center gap-0.5 badge badge-warning py-0.5">
                <Flame className="w-3 h-3" />{streak}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {myRank > 0 && (
              <div className="flex items-center gap-1 text-text-secondary text-xs font-dm">
                <Trophy className="w-3 h-3" />#{myRank}
              </div>
            )}
            <span className="font-syne font-bold text-primary">{formatPoints(totalScore)}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          {phase === 'lobby' && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-syne font-bold text-2xl text-white mb-2">You're in!</h1>
              <p className="text-text-secondary font-dm mb-1">
                Welcome, <span className="text-white font-medium">{playerInfo?.playerName}</span>
              </p>
              <p className="text-text-muted font-dm text-sm mb-6">Waiting for the host to start the game...</p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </motion.div>
          )}

          {(phase === 'question_active' || phase === 'answer_revealed') && currentQuestion && (
            <motion.div key={`q-${currentQuestion.id}-${phase}`} initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">

              {phase === 'question_active' && !hasAnswered && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-dm text-text-muted mb-1">
                    <span>Time remaining</span>
                    <span className={timeRemaining < 5 ? 'text-danger' : 'text-text-secondary'}>
                      {Math.ceil(timeRemaining)}s
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${timeRemaining < 5 ? 'bg-danger' : timeRemaining < 10 ? 'bg-warning' : 'bg-primary'}`}
                      style={{ width: `${(timeRemaining / currentQuestion.time_limit) * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              )}

              <div className="card mb-4">
                <p className="font-syne font-bold text-xl text-white leading-snug">{currentQuestion.question_text}</p>
              </div>

              {!hasAnswered && phase === 'question_active' ? (
                <div className="grid grid-cols-1 gap-3 flex-1">
                  {currentQuestion.options?.map((option, i) => {
                    const style = OPTION_STYLES[i]
                    return (
                      <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => handleAnswer(i)}
                        className={`${style.bg} ${style.hover} border-2 ${style.border} rounded-xl p-4 text-left transition-all`}>
                        <div className="flex items-start gap-3">
                          <span className={`font-syne font-bold ${style.text} flex-shrink-0`}>{OPTION_LABELS[i]}</span>
                          <span className="font-dm text-white">{option}</span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  {hasAnswered && answerResult && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-6">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${answerResult.correct ? 'bg-success/20' : 'bg-danger/20'}`}>
                        {answerResult.correct ? <CheckCircle className="w-10 h-10 text-success" /> : <XCircle className="w-10 h-10 text-danger" />}
                      </div>
                      <p className={`font-syne font-bold text-2xl mb-1 ${answerResult.correct ? 'text-success' : 'text-danger'}`}>
                        {answerResult.correct ? 'Correct!' : 'Wrong!'}
                      </p>
                      {answerResult.correct && (
                        <div className="space-y-1">
                          <p className="font-syne font-bold text-3xl text-white">+{formatPoints(answerResult.points)}</p>
                          {answerResult.streakBonus > 0 && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="badge badge-warning mx-auto">
                              <Flame className="w-3 h-3" />Streak bonus +{formatPoints(answerResult.streakBonus)}
                            </motion.div>
                          )}
                          {streak >= 3 && <p className="text-warning font-dm text-sm">🔥 {streak} in a row!</p>}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {selectedAnswer !== null && currentQuestion.options && (
                    <div className={`w-full p-4 rounded-xl border-2 mb-4 ${
                      phase === 'answer_revealed'
                        ? answerResult?.correct ? 'border-success bg-success/10' : 'border-danger bg-danger/10'
                        : 'border-primary bg-primary/10'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="font-syne font-bold text-primary">{OPTION_LABELS[selectedAnswer]}</span>
                        <span className="font-dm text-white">{currentQuestion.options[selectedAnswer]}</span>
                      </div>
                    </div>
                  )}

                  {phase === 'answer_revealed' && !answerResult?.correct && (
                    <div className="w-full p-4 rounded-xl border-2 border-success bg-success/10">
                      <p className="text-success text-xs font-dm mb-1">Correct answer:</p>
                      <div className="flex items-center gap-2">
                        <span className="font-syne font-bold text-success">{OPTION_LABELS[currentQuestion.correct_answer]}</span>
                        <span className="font-dm text-white">{currentQuestion.options?.[currentQuestion.correct_answer]}</span>
                      </div>
                    </div>
                  )}

                  {phase === 'question_active' && (
                    <p className="text-text-muted font-dm text-sm mt-4">Waiting for host to reveal...</p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {phase === 'finished' && (
            <motion.div key="finished" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-warning" />
              </div>
              <h1 className="font-syne font-bold text-3xl text-white mb-2">Game Over!</h1>
              <div className="card w-full mb-6 text-center">
                <p className="text-text-muted text-sm font-dm mb-1">Your Final Score</p>
                <p className="font-syne font-bold text-4xl text-primary mb-2">{formatPoints(totalScore)}</p>
                {myRank > 0 && <p className="font-dm text-text-secondary">Rank #{myRank} of {leaderboard.length}</p>}
              </div>
              <div className="w-full space-y-2 mb-6">
                {leaderboard.slice(0, 5).map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                    p.id === playerInfo?.playerId ? 'bg-primary/20 border border-primary/40' : 'bg-surface'
                  }`}>
                    <span className={`font-syne font-bold w-5 ${i === 0 ? 'text-warning' : 'text-text-muted'}`}>{i + 1}</span>
                    <span className="flex-1 font-dm text-white text-sm truncate">
                      {p.display_name}{p.id === playerInfo?.playerId && ' (you)'}
                    </span>
                    <span className="font-syne font-bold text-primary text-sm">{formatPoints(p.score || 0)}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/join')} className="btn-secondary w-full">Play Again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
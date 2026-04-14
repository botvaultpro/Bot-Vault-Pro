import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Zap, CheckCircle, XCircle, Flame } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const OPTION_STYLES = [
  { border: 'border-primary', bg: 'bg-primary/10', hover: 'hover:bg-primary/20', text: 'text-primary' },
  { border: 'border-accent', bg: 'bg-accent/10', hover: 'hover:bg-accent/20', text: 'text-accent' },
  { border: 'border-warning', bg: 'bg-warning/10', hover: 'hover:bg-warning/20', text: 'text-warning' },
  { border: 'border-danger', bg: 'bg-danger/10', hover: 'hover:bg-danger/20', text: 'text-danger' },
]

function formatPoints(pts) {
  if (!pts) return '0'
  return pts.toLocaleString()
}

// Returns options as array from DB row
function getOptions(q) {
  return [q.option_a || '', q.option_b || '', q.option_c || '', q.option_d || '']
}

// Calculate points earned based on time remaining
function calcPoints(basePoints, timeLimit, timeLeft, streak) {
  if (timeLimit <= 0) return { total: basePoints, streakBonus: 0, newStreak: streak + 1 }
  const timeFactor = 0.5 + 0.5 * (timeLeft / timeLimit)
  const base = Math.round(basePoints * timeFactor)
  const newStreak = streak + 1
  const streakBonus = newStreak >= 3 ? Math.round(base * 0.1 * Math.min(newStreak - 2, 5)) : 0
  return { total: base + streakBonus, streakBonus, newStreak }
}

export default function PlayerGamePage() {
  const navigate = useNavigate()
  const { roomCode } = useParams()
  const location = useLocation()

  const playerInfo = location.state || null // { playerId, playerName }

  const [room, setRoom] = useState(null)
  const [gameStatus, setGameStatus] = useState('waiting') // matches game_state.status
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questions, setQuestions] = useState([])
  const [hasAnswered, setHasAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null) // 'A'/'B'/'C'/'D'
  const [answerResult, setAnswerResult] = useState(null)
  const [streak, setStreak] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [questionStartedAt, setQuestionStartedAt] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!playerInfo?.playerId) {
      navigate('/join')
      return
    }
    fetchGameData()
    return () => clearInterval(timerRef.current)
  }, [roomCode])

  async function fetchGameData() {
    // Load room + question set + questions
    const { data: roomData } = await supabase
      .from('rooms')
      .select('*, question_sets(*, questions(*))')
      .eq('code', roomCode)
      .single()

    if (!roomData) { navigate('/join'); return }
    setRoom(roomData)

    const qs = (roomData.question_sets?.questions || [])
      .sort((a, b) => a.order_index - b.order_index)
    setQuestions(qs)

    // Load player score/streak
    const { data: player } = await supabase
      .from('players').select('score, streak').eq('id', playerInfo.playerId).single()
    if (player) {
      setTotalScore(player.score || 0)
      setStreak(player.streak || 0)
    }

    // Load current game state
    const { data: gs } = await supabase
      .from('game_state').select('*').eq('room_id', roomData.id).single()
    if (gs) applyGameState(gs, qs)

    refreshLeaderboard(roomData.id)
    subscribeToGame(roomData.id, qs)
  }

  function applyGameState(gs, qs) {
    const questionList = qs || questions
    const status = gs.status
    setGameStatus(status)
    setCurrentIndex(gs.current_question_index || 0)

    if (status === 'question_active') {
      const q = questionList[gs.current_question_index || 0]
      if (q) {
        setCurrentQuestion(q)
        setHasAnswered(false)
        setSelectedAnswer(null)
        setAnswerResult(null)
        setQuestionStartedAt(gs.question_started_at)
        startTimer(q.time_limit, gs.question_started_at)
      }
    } else if (status === 'answer_revealed') {
      const q = questionList[gs.current_question_index || 0]
      if (q) setCurrentQuestion(q)
      clearInterval(timerRef.current)
    } else if (status === 'finished') {
      clearInterval(timerRef.current)
    }
  }

  function startTimer(timeLimit, startedAt) {
    clearInterval(timerRef.current)
    const updateTimer = () => {
      const elapsed = startedAt
        ? (Date.now() - new Date(startedAt).getTime()) / 1000
        : timeLimit
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeRemaining(remaining)
      if (remaining <= 0) clearInterval(timerRef.current)
    }
    updateTimer()
    timerRef.current = setInterval(updateTimer, 100)
  }

  function subscribeToGame(roomId, qs) {
    supabase
      .channel(`player-game-${roomCode}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'game_state',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        applyGameState(payload.new, qs)
        refreshLeaderboard(roomId)
      })
      .subscribe()
  }

  async function refreshLeaderboard(roomId) {
    const { data } = await supabase
      .from('players')
      .select('id, display_name, score')
      .eq('room_id', roomId)
      .order('score', { ascending: false })
      .limit(10)
    if (data) setLeaderboard(data)
  }

  async function handleAnswer(label) {
    if (hasAnswered || gameStatus !== 'question_active' || !currentQuestion) return

    const elapsedMs = questionStartedAt
      ? Date.now() - new Date(questionStartedAt).getTime()
      : currentQuestion.time_limit * 1000
    const elapsedSec = elapsedMs / 1000
    const timeLeft = Math.max(0, currentQuestion.time_limit - elapsedSec)

    setSelectedAnswer(label)
    setHasAnswered(true)
    clearInterval(timerRef.current)

    const isCorrect = label === currentQuestion.correct_answer
    const { total, streakBonus, newStreak } = calcPoints(
      currentQuestion.points || 1000,
      currentQuestion.time_limit,
      timeLeft,
      streak
    )
    const pointsEarned = isCorrect ? total : 0

    setAnswerResult({ correct: isCorrect, points: pointsEarned, streakBonus })

    const newStreak2 = isCorrect ? newStreak : 0
    const newScore = totalScore + pointsEarned
    setStreak(newStreak2)
    setTotalScore(newScore)

    try {
      await supabase.from('answers').insert({
        room_id: room.id,
        question_id: currentQuestion.id,
        player_id: playerInfo.playerId,
        selected_answer: label,           // 'A'/'B'/'C'/'D'
        is_correct: isCorrect,
        time_taken_ms: Math.round(elapsedMs),
        points_earned: pointsEarned,
      })

      await supabase.from('players')
        .update({ score: newScore, streak: newStreak2 })
        .eq('id', playerInfo.playerId)
    } catch (err) {
      console.error('Answer submit error:', err)
    }
  }

  const myRank = leaderboard.findIndex((p) => p.id === playerInfo?.playerId) + 1
  const options = currentQuestion ? getOptions(currentQuestion) : []

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-syne font-bold text-white text-sm">
              {playerInfo?.playerName || 'Player'}
            </span>
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

          {/* LOBBY */}
          {gameStatus === 'waiting' && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-syne font-bold text-2xl text-white mb-2">You're in!</h1>
              <p className="text-text-secondary font-dm mb-1">
                Welcome, <span className="text-white font-medium">{playerInfo?.playerName}</span>
              </p>
              <p className="text-text-muted font-dm text-sm mb-6">
                Waiting for the host to start the game...
              </p>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* QUESTION ACTIVE */}
          {gameStatus === 'question_active' && currentQuestion && (
            <motion.div key={`q-active-${currentQuestion.id}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col">

              {/* Timer bar */}
              {!hasAnswered && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-dm text-text-muted mb-1">
                    <span>Time remaining</span>
                    <span className={timeRemaining < 5 ? 'text-danger' : 'text-text-secondary'}>
                      {Math.ceil(timeRemaining)}s
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full transition-colors ${
                        timeRemaining < 5 ? 'bg-danger' : timeRemaining < 10 ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${(timeRemaining / currentQuestion.time_limit) * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              )}

              {/* Question card */}
              <div className="card mb-4">
                <p className="font-syne font-bold text-xl text-white leading-snug">
                  {currentQuestion.question_text}
                </p>
              </div>

              {/* Answer buttons or waiting state */}
              {!hasAnswered ? (
                <div className="grid grid-cols-1 gap-3 flex-1">
                  {options.map((option, i) => {
                    const style = OPTION_STYLES[i]
                    return (
                      <motion.button key={i} whileTap={{ scale: 0.97 }}
                        onClick={() => handleAnswer(OPTION_LABELS[i])}
                        className={`${style.bg} ${style.hover} border-2 ${style.border} rounded-xl p-4 text-left transition-all`}>
                        <div className="flex items-start gap-3">
                          <span className={`font-syne font-bold ${style.text} flex-shrink-0`}>
                            {OPTION_LABELS[i]}
                          </span>
                          <span className="font-dm text-white">{option}</span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  {answerResult && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="text-center mb-6">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        answerResult.correct ? 'bg-success/20' : 'bg-danger/20'
                      }`}>
                        {answerResult.correct
                          ? <CheckCircle className="w-10 h-10 text-success" />
                          : <XCircle className="w-10 h-10 text-danger" />}
                      </div>
                      <p className={`font-syne font-bold text-2xl mb-1 ${
                        answerResult.correct ? 'text-success' : 'text-danger'
                      }`}>
                        {answerResult.correct ? 'Correct!' : 'Wrong!'}
                      </p>
                      {answerResult.correct && (
                        <div className="space-y-1">
                          <p className="font-syne font-bold text-3xl text-white">
                            +{formatPoints(answerResult.points)}
                          </p>
                          {answerResult.streakBonus > 0 && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                              className="badge badge-warning mx-auto flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              Streak bonus +{formatPoints(answerResult.streakBonus)}
                            </motion.div>
                          )}
                          {streak >= 3 && (
                            <p className="text-warning font-dm text-sm">🔥 {streak} in a row!</p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Selected answer display */}
                  {selectedAnswer !== null && (
                    <div className={`w-full p-4 rounded-xl border-2 mb-4 ${
                      answerResult?.correct ? 'border-success bg-success/10' : 'border-danger bg-danger/10'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="font-syne font-bold text-white">{selectedAnswer}</span>
                        <span className="font-dm text-white">
                          {options[OPTION_LABELS.indexOf(selectedAnswer)]}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-text-muted font-dm text-sm mt-4">
                    Waiting for host to reveal answer...
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ANSWER REVEALED */}
          {gameStatus === 'answer_revealed' && currentQuestion && (
            <motion.div key={`q-revealed-${currentQuestion.id}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center">

              {answerResult && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="text-center mb-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    answerResult.correct ? 'bg-success/20' : 'bg-danger/20'
                  }`}>
                    {answerResult.correct
                      ? <CheckCircle className="w-10 h-10 text-success" />
                      : <XCircle className="w-10 h-10 text-danger" />}
                  </div>
                  <p className={`font-syne font-bold text-2xl mb-1 ${
                    answerResult.correct ? 'text-success' : 'text-danger'
                  }`}>
                    {answerResult.correct ? 'Correct!' : 'Wrong!'}
                  </p>
                  {answerResult.correct && (
                    <p className="font-syne font-bold text-3xl text-white">
                      +{formatPoints(answerResult.points)}
                    </p>
                  )}
                </motion.div>
              )}

              {!hasAnswered && (
                <div className="text-center mb-6">
                  <XCircle className="w-16 h-16 text-danger mx-auto mb-3" />
                  <p className="font-syne font-bold text-xl text-danger">Time's up!</p>
                </div>
              )}

              {/* Correct answer reveal */}
              <div className="w-full p-4 rounded-xl border-2 border-success bg-success/10 mb-4">
                <p className="text-success text-xs font-dm mb-1">Correct answer:</p>
                <div className="flex items-center gap-2">
                  <span className="font-syne font-bold text-success">
                    {currentQuestion.correct_answer}
                  </span>
                  <span className="font-dm text-white">
                    {options[OPTION_LABELS.indexOf(currentQuestion.correct_answer)]}
                  </span>
                </div>
              </div>

              {currentQuestion.explanation && (
                <div className="w-full p-4 rounded-xl border border-border bg-surface">
                  <p className="text-text-muted text-xs font-dm mb-1">Explanation</p>
                  <p className="font-dm text-white text-sm">{currentQuestion.explanation}</p>
                </div>
              )}

              <p className="text-text-muted font-dm text-sm mt-6">
                Next question coming up...
              </p>
            </motion.div>
          )}

          {/* FINISHED */}
          {gameStatus === 'finished' && (
            <motion.div key="finished" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-warning" />
              </div>
              <h1 className="font-syne font-bold text-3xl text-white mb-2">Game Over!</h1>
              <div className="card w-full mb-6 text-center">
                <p className="text-text-muted text-sm font-dm mb-1">Your Final Score</p>
                <p className="font-syne font-bold text-4xl text-primary mb-2">
                  {formatPoints(totalScore)}
                </p>
                {myRank > 0 && (
                  <p className="font-dm text-text-secondary">
                    Rank #{myRank} of {leaderboard.length}
                  </p>
                )}
              </div>
              <div className="w-full space-y-2 mb-6">
                {leaderboard.slice(0, 5).map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                    p.id === playerInfo?.playerId
                      ? 'bg-primary/20 border border-primary/40'
                      : 'bg-surface'
                  }`}>
                    <span className={`font-syne font-bold w-5 ${
                      i === 0 ? 'text-warning' : 'text-text-muted'
                    }`}>{i + 1}</span>
                    <span className="flex-1 font-dm text-white text-sm truncate">
                      {p.display_name}{p.id === playerInfo?.playerId && ' (you)'}
                    </span>
                    <span className="font-syne font-bold text-primary text-sm">
                      {formatPoints(p.score || 0)}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/join')} className="btn-secondary w-full">
                Play Again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
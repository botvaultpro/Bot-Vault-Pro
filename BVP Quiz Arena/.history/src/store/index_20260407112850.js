import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  signOut: () => set({ user: null, profile: null }),
}))

export const useHostStore = create((set, get) => ({
  room: null,
  gameState: null,
  players: [],
  questions: [],
  currentQuestion: null,
  answers: [],
  leaderboard: [],

  setRoom: (room) => set({ room }),
  setGameState: (gameState) => set({ gameState }),
  setPlayers: (players) => set({ players }),
  setQuestions: (questions) => set({ questions }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setAnswers: (answers) => set({ answers }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),

  addPlayer: (player) =>
    set((state) => ({
      players: state.players.find((p) => p.id === player.id)
        ? state.players.map((p) => (p.id === player.id ? player : p))
        : [...state.players, player],
    })),

  updatePlayer: (playerId, updates) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, ...updates } : p
      ),
    })),

  addAnswer: (answer) =>
    set((state) => ({
      answers: state.answers.find((a) => a.player_id === answer.player_id)
        ? state.answers
        : [...state.answers, answer],
    })),

  clearAnswers: () => set({ answers: [] }),

  reset: () =>
    set({
      room: null,
      gameState: null,
      players: [],
      questions: [],
      currentQuestion: null,
      answers: [],
      leaderboard: [],
    }),
}))

export const usePlayerStore = create((set) => ({
  room: null,
  gameState: null,
  playerRecord: null,
  currentQuestion: null,
  hasAnswered: false,
  lastAnswerCorrect: null,
  lastPointsEarned: 0,
  streak: 0,
  totalScore: 0,
  leaderboard: [],

  setRoom: (room) => set({ room }),
  setGameState: (gameState) => set({ gameState }),
  setPlayerRecord: (playerRecord) => set({ playerRecord }),
  setCurrentQuestion: (currentQuestion) =>
    set({ currentQuestion, hasAnswered: false }),
  setAnswered: (correct, points) =>
    set((state) => ({
      hasAnswered: true,
      lastAnswerCorrect: correct,
      lastPointsEarned: points,
      streak: correct ? state.streak + 1 : 0,
      totalScore: state.totalScore + (correct ? points : 0),
    })),
  setLeaderboard: (leaderboard) => set({ leaderboard }),

  reset: () =>
    set({
      room: null,
      gameState: null,
      playerRecord: null,
      currentQuestion: null,
      hasAnswered: false,
      lastAnswerCorrect: null,
      lastPointsEarned: 0,
      streak: 0,
      totalScore: 0,
      leaderboard: [],
    }),
}))
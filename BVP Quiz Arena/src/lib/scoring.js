/**
 * BVP QuizArena Scoring Engine
 * points_earned = base_points × ((time_remaining / time_limit) × 0.5 + 0.5)
 * Streak bonus: 3+ correct in a row = +100 per streak level
 */

export const BASE_POINTS = 1000
export const STREAK_BONUS = 100
export const STREAK_THRESHOLD = 3

export function calculatePoints(timeRemaining, timeLimit, basePoints = BASE_POINTS) {
  if (timeRemaining < 0) timeRemaining = 0
  if (timeLimit <= 0) return basePoints

  const timeRatio = timeRemaining / timeLimit
  const multiplier = timeRatio * 0.5 + 0.5
  return Math.round(basePoints * multiplier)
}

export function calculateStreakBonus(streak) {
  if (streak < STREAK_THRESHOLD) return 0
  const streakLevel = streak - STREAK_THRESHOLD + 1
  return streakLevel * STREAK_BONUS
}

export function calculateTotal(timeRemaining, timeLimit, streak = 0, basePoints = BASE_POINTS) {
  const points = calculatePoints(timeRemaining, timeLimit, basePoints)
  const newStreak = streak + 1
  const streakBonus = calculateStreakBonus(newStreak)
  return {
    points,
    streakBonus,
    total: points + streakBonus,
    newStreak,
  }
}

export function formatPoints(points) {
  return points.toLocaleString()
}
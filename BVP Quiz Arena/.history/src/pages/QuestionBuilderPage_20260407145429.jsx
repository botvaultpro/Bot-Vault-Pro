import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, Trash2, Save, GripVertical,
  CheckCircle, Clock, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store'

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const DEFAULT_TIME = 20

function QuestionEditor({ question, index, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="card"
    >
      <div className="flex items-center gap-3 mb-4">
        <GripVertical className="w-4 h-4 text-text-muted flex-shrink-0" />
        <span className="badge badge-primary text-xs">Q{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-text-secondary text-sm font-dm truncate">
            {question.question_text || 'New question'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-text-muted hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-text-muted hover:text-danger transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Question
              </label>
              <textarea
                value={question.question_text}
                onChange={(e) => onUpdate({ question_text: e.target.value })}
                placeholder="Type your question here..."
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Answer Options — click the circle to mark correct
              </label>
              <div className="space-y-2">
                {OPTION_LABELS.map((label, i) => {
                  const isCorrect = question.correct_answer === i
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdate({ correct_answer: i })}
                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          isCorrect ? 'border-success bg-success' : 'border-border hover:border-success/50'
                        }`}
                      >
                        {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-bg" />}
                      </button>
                      <span className={`w-6 text-xs font-bold font-syne flex-shrink-0 ${
                        isCorrect ? 'text-success' : 'text-text-muted'
                      }`}>
                        {label}
                      </span>
                      <input
                        type="text"
                        value={question.options?.[i] || ''}
                        onChange={(e) => {
                          const newOptions = [...(question.options || ['', '', '', ''])]
                          newOptions[i] = e.target.value
                          onUpdate({ options: newOptions })
                        }}
                        placeholder={`Option ${label}`}
                        className="input-field flex-1 py-2 text-sm"
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time Limit (seconds)
                </label>
                <select
                  value={question.time_limit || DEFAULT_TIME}
                  onChange={(e) => onUpdate({ time_limit: Number(e.target.value) })}
                  className="input-field py-2 text-sm"
                >
                  {[10, 15, 20, 30, 45, 60, 90, 120].map((t) => (
                    <option key={t} value={t}>{t}s</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Points
                </label>
                <select
                  value={question.points || 1000}
                  onChange={(e) => onUpdate({ points: Number(e.target.value) })}
                  className="input-field py-2 text-sm"
                >
                  {[500, 1000, 1500, 2000].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Explanation (shown after reveal — optional)
              </label>
              <input
                type="text"
                value={question.explanation || ''}
                onChange={(e) => onUpdate({ explanation: e.target.value })}
                placeholder="Why is this the correct answer?"
                className="input-field text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function QuestionBuilderPage() {
  const navigate = useNavigate()
  const { setId } = useParams()
  const { user } = useAuthStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(!!setId)

  useEffect(() => {
    if (setId) fetchSet()
  }, [setId])

  async function fetchSet() {
    const { data } = await supabase
      .from('question_sets')
      .select('*, questions(*)')
      .eq('id', setId)
      .single()

    if (data) {
      setTitle(data.title)
      setDescription(data.description || '')
      setQuestions(
        (data.questions || [])
          .sort((a, b) => a.order_index - b.order_index)
          .map(q => ({
            ...q,
            options: [q.option_a || '', q.option_b || '', q.option_c || '', q.option_d || '']
          }))
      )
    }
    setLoading(false)
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, {
      id: `new-${Date.now()}`,
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      time_limit: DEFAULT_TIME,
      points: 1000,
      explanation: '',
      _isNew: true,
    }])
  }

  function updateQuestion(index, updates) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...updates } : q)))
  }

  function deleteQuestion(index) {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!title.trim()) {
      alert('Please enter a title for your question set.')
      return
    }

    const validQuestions = questions.filter(
      (q) => q.question_text.trim() && q.options.some((o) => o.trim()) && q.options[q.correct_answer]?.trim()
    )

    if (validQuestions.length === 0) {
      alert('Add at least one complete question before saving.')
      return
    }

    setSaving(true)

    try {
      let currentSetId = setId

      if (!currentSetId) {
        const { data, error } = await supabase
          .from('question_sets')
          .insert({ title: title.trim(), description: description.trim(), created_by: user.id })
          .select()
          .single()
        if (error) throw error
        currentSetId = data.id
      } else {
        await supabase
          .from('question_sets')
          .update({ title: title.trim(), description: description.trim() })
          .eq('id', currentSetId)

        const existingIds = validQuestions.filter((q) => !q._isNew).map((q) => q.id)
        if (existingIds.length > 0) {
          await supabase
            .from('questions')
            .delete()
            .eq('set_id', currentSetId)
            .not('id', 'in', `(${existingIds.join(',')})`)
        } else {
          await supabase.from('questions').delete().eq('set_id', currentSetId)
        }
      }

      const questionsToSave = validQuestions.map((q, i) => ({
        ...(q._isNew ? {} : { id: q.id }),
        qset_id: currentSetId,
        question_text: q.question_text.trim(),
        option_a: q.options?.[0] || '',
        option_b: q.options?.[1] || '',
        option_c: q.options?.[2] || '',
        option_d: q.options?.[3] || '',
        correct_answer: q.correct_answer,
        time_limit: q.time_limit || DEFAULT_TIME,
        points: q.points || 1000,
        order_index: i,
      }))

      const { error: qError } = await supabase
        .from('questions')
        .upsert(questionsToSave, { onConflict: 'id' })
      if (qError) throw qError

      setSaved(true)
      setTimeout(() => { setSaved(false); navigate('/') }, 1500)
    } catch (err) {
      console.error('Save error:', err)
      alert(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-dm text-sm">Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs font-dm">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`btn-primary flex items-center gap-2 py-2 px-4 text-sm ${saved ? 'bg-success hover:bg-success' : ''}`}
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saved ? 'Saved!' : 'Save Set'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-syne font-bold text-white">
              {setId ? 'Edit Question Set' : 'New Question Set'}
            </h1>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Set Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Compliance Training"
                className="input-field"
                autoFocus={!setId}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this set"
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {questions.map((q, i) => (
              <QuestionEditor
                key={q.id}
                question={q}
                index={i}
                onUpdate={(updates) => updateQuestion(i, updates)}
                onDelete={() => deleteQuestion(i)}
              />
            ))}
          </AnimatePresence>
        </div>

        <motion.button
          onClick={addQuestion}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full mt-4 p-4 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl text-text-muted hover:text-primary transition-all duration-200 flex items-center justify-center gap-2 font-dm"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </motion.button>
      </main>
    </div>
  )
}
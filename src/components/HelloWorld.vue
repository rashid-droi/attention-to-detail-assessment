<template>
  <div class="assessment-app gf-forms" id="assessment-start">
    <!-- Centered Select Logo at the top on the gradient background -->
    <div class="assessment-logo-container">
      <img src="/Screenshot_2026-05-19_at_10.53.45_AM-removebg-preview.png" alt="Select" class="assessment-logo-img" />
    </div>

    <section class="assessment-scroll-wrap" aria-label="Attention to Detail assessment">
      <div class="assessment-scroll-wrap__inner">
        <div class="container gf-container">
          <div class="assessment-card glass-card gf-sheet">
            <!-- Progress Bar at the very top of the card -->
            <div class="gf-sticky-progress gf-sticky-progress--integrated" :class="{ 'gf-sticky-progress--scrolled': scrolled }">
              <div class="gf-sticky-progress-inner">
                <div class="gf-sticky-progress-track" role="progressbar"
                  :aria-valuenow="completionPercent" aria-valuemin="0" aria-valuemax="100"
                  :aria-valuetext="`${completionPercent}% complete, ${answeredCount} of ${questions.length} answered`"
                  aria-label="Form completion">
                  <div class="gf-sticky-progress-fill" :style="{ width: completionPercent + '%' }" />
                </div>
                <p class="gf-sticky-progress-meta">
                  {{ answeredCount }} of {{ questions.length }} answered<span class="gf-meta-sep" aria-hidden="true"> · </span><span>{{ completionPercent }}%</span>
                </p>
              </div>
            </div>

            <!-- Title and Description inside the Card -->
            <div class="assessment-intro-section">
              <h1 class="assessment-main-title">Attention to Detail Assessment</h1>
              <p class="assessment-description">
                Evaluate your meticulousness and precision through this assessment. Each statement reflects real-world scenarios that measure your attention to detail.
              </p>
            </div>

            <!-- User Information Section -->
            <div class="user-info-section gf-form-section">
              <h2 class="gf-section-title">Your details</h2>
              <div class="input-group">
                <label for="username">Full Name<span class="required">*</span></label>
                <input id="username" type="text" v-model="username" placeholder="" class="premium-input gf-input" autocomplete="name" required aria-required="true" />
              </div>
              <div class="input-group">
                <label for="email">Email <span class="optional">(Optional)</span></label>
                <input id="email" type="email" v-model="email" placeholder="" class="premium-input gf-input" autocomplete="email" inputmode="email" />
              </div>
            </div>

            <div class="gf-divider" aria-hidden="true" />

            <!-- Answer scale reference (multiple choice legend) -->
            <section class="mcq-instructions-panel gf-form-section" aria-labelledby="mcq-instructions-heading">
              <h2 id="mcq-instructions-heading" class="mcq-instructions-title gf-section-title">How this scale works</h2>
              <p class="mcq-instructions-lead">
                Each question lists five choices. Tap or click one row—the left badge shows points (1–5); the label describes how often it applies to you.
              </p>
            </section>

            <div class="gf-divider gf-divider--muted" aria-hidden="true" />

            <!-- Questions Section -->
            <ol class="questions-section" aria-label="Assessment questions">
              <li v-for="(question, qIndex) in questions" :key="qIndex"
                class="question-item gf-form-section gf-question-card"
                :class="{ 'answered': ratings[qIndex] > 0, 'highlighted': highlightedIndex === qIndex }"
                :style="{ '--gf-q-index': qIndex }"
                :ref="el => { if (el) questionRefs[qIndex] = el }">
                <div class="gf-question-head">
                  <div class="question-number-badge">
                    Question {{ String(qIndex + 1).padStart(2, '0') }} / {{ questions.length }}
                  </div>
                  <h3 class="question-text-title" :id="'question-text-' + qIndex">
                    {{ question }}
                  </h3>
                </div>

                <fieldset
                  class="mcq-options gf-mcq-fieldset"
                  :aria-labelledby="'question-text-' + qIndex"
                  @change="onQuestionFieldsetChange(qIndex, $event)"
                >
                  <div class="mcq-option-list gf-mcq-list" role="presentation">
                    <label
                      v-for="value in SCALE_VALUES"
                      :key="value"
                      class="mcq-option gf-option-row"
                      :class="{ 'mcq-option--selected': ratings[qIndex] === value }"
                    >
                      <input
                        :id="'q-' + qIndex + '-opt-' + value"
                        type="radio"
                        class="mcq-radio-native gf-radio gf-radio-hit"
                        :name="'attention-assessment-q-' + qIndex"
                        :checked="ratings[qIndex] === value"
                        :value="String(value)"
                      />
                      <span class="mcq-option-card gf-option-body">
                        <span class="mcq-radio-custom" aria-hidden="true"></span>
                        <span class="mcq-option-caption">{{ tooltipMeaning[value] }}</span>
                        <span class="mcq-option-score-badge" aria-hidden="true">{{ value }} pt{{ value === 1 ? '' : 's' }}</span>
                      </span>
                    </label>
                  </div>
                </fieldset>

                <div v-if="qIndex < questions.length - 1" class="gf-divider gf-divider--inset" aria-hidden="true" />
              </li>
            </ol>

            <!-- Submit row -->
            <div class="submission-section gf-submit-band">
              <div class="action-buttons gf-submit-actions">
                <button type="button" class="btn-primary gf-submit-btn" :class="{ 'loading': isSubmitting }" :disabled="isSubmitting"
                  @click="submitAssessment">
                  <span v-if="!isSubmitting">
                    Submit
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M5 12h14M13 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span v-else class="gf-loading-row">
                    <span class="gf-loading-bars" aria-hidden="true"><span /><span /><span /></span>
                    Processing...
                  </span>
                </button>
              </div>
              <div class="submission-copy">
                <p class="submission-note">
                  {{ answeredCount }} of {{ questions.length }} questions answered.<br />Answer every required question to submit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {
  questions,
  interpretationNote,
  interpretationForScore,
  scoreInterpretationRows,
  RESULT_STORAGE_KEY
} from '../assessmentData.js'

const router = useRouter()

// Prefer VITE_API_BASE_URL=http://HOST:PORT. Else use VITE_API_PORT (defaults to 8000).
// const runtimeApiBaseUrl = `${window.location.protocol}//${window.location.hostname}:${import.meta.env.VITE_API_PORT ?? '8000'}`
const API_BASE_URL = "https://hatters-api.thegamearcade.com"

const SCALE_VALUES = [1, 2, 3, 4, 5]

function pointsLabel(value) {
  const n = Number(value)
  return `${n} point${n === 1 ? '' : 's'}`
}

const tooltipMeaning = {
  1: 'Almost never',
  2: 'Rarely',
  3: 'Occasionally',
  4: 'Often',
  5: 'Almost always'
}

// State — new array instance per update so the ref always notifies (reliable vs index assignment)
const ratings = ref(Array.from({ length: questions.length }, () => 0))
const username = ref('')
const email = ref('')
const isSubmitting = ref(false)
const scrolled = ref(false)
const highlightedIndex = ref(-1)
const questionRefs = ref([])

const STORAGE_KEY = 'premium_attention_assessment'

// Computed
function ratingIsAnswered(n) {
  const x = Number(n)
  return Number.isFinite(x) && x >= 1 && x <= 5
}

const answeredCount = computed(() => ratings.value.filter(ratingIsAnswered).length)
const allAnswered = computed(
  () =>
    ratings.value.length === questions.length &&
    ratings.value.every(ratingIsAnswered)
)
const completionPercent = computed(() => Math.round((answeredCount.value / questions.length) * 100))
const totalScore = computed(() => ratings.value.reduce((sum, n) => sum + n, 0))
const averagePointsPerQuestion = computed(() =>
  questions.length ? (totalScore.value / questions.length).toFixed(1) : '0'
)

// Core functions
function setRating(questionIndex, value) {
  const v = Number(value)
  if (!Number.isFinite(v) || v < 1 || v > 5) return

  const next = ratings.value.slice()
  next[questionIndex] = v
  ratings.value = next

  saveDraft()

  // Visual feedback
  highlightedIndex.value = questionIndex
  setTimeout(() => { highlightedIndex.value = -1 }, 300)
}

/** Fieldset change delegation: `event.target` is always the radio that became checked. */
function onQuestionFieldsetChange(questionIndex, e) {
  const el = e.target
  if (!(el instanceof HTMLInputElement) || el.type !== 'radio' || !el.checked) return
  setRating(questionIndex, el.value)
  void maybeScrollToNextQuestion(questionIndex)
}

async function maybeScrollToNextQuestion(questionIndex) {
  if (window.innerWidth > 768) return
  const nextIndex = questionIndex + 1
  if (nextIndex >= questions.length) return

  await nextTick()
  if (questionRefs.value[nextIndex]) {
    questionRefs.value[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

/** Keep ratings aligned with `questions` if storage or older builds left a shorter/longer array. */
function normalizeRatingsLength() {
  const len = questions.length
  if (ratings.value.length === len) return
  ratings.value = Array.from({ length: len }, (_, i) => {
    const n = Number(ratings.value[i])
    return ratingIsAnswered(n) ? n : 0
  })
}

async function submitAssessment() {
  if (!username.value.trim()) {
    alert('Please enter your Full Name before submitting.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  normalizeRatingsLength()

  if (!allAnswered.value) {
    const missing = ratings.value
      .map((n, i) => (ratingIsAnswered(n) ? -1 : i + 1))
      .filter((n) => n > 0)
    const first = missing[0]
    if (first != null) {
      const idx = first - 1
      await nextTick()
      questionRefs.value[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    alert(
      `Please complete all ${questions.length} questions before submitting.` +
        (missing.length ? ` Still open: ${missing.slice(0, 8).join(', ')}${missing.length > 8 ? '…' : ''}.` : '')
    )
    return
  }

  isSubmitting.value = true
  
  try {
    const averageRating = Math.round(totalScore.value / questions.length)
    const payload = {
      username: username.value,
      email: email.value || null,
      score: totalScore.value,
      rating: averageRating,
      question_scores: ratings.value.map(Number)
    }

    // Axios POST request to backend
    // Assumes JWT token is stored in localStorage
    const token = localStorage.getItem('token') || ''
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }
    
    await axios.post(`${API_BASE_URL}/assessments`, payload, config)

    localStorage.removeItem(STORAGE_KEY)

    const snapshot = {
      username: username.value.trim(),
      email: email.value || '',
      ratings: ratings.value.map(Number),
      totalScore: totalScore.value,
      completionPercent: completionPercent.value,
      averagePointsPerQuestion: averagePointsPerQuestion.value,
      interpretation: interpretationForScore(totalScore.value),
      interpretationNote,
      scoreInterpretationRows,
      submittedAt: new Date().toISOString()
    }
    sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(snapshot))

    await router.push({ name: 'assessment-result' })
  } catch (error) {
    const detail = error?.response?.data?.detail ?? error?.response?.data ?? error?.message
    console.error('Assessment submission failed:', detail || error)
    const msg =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d?.msg ?? d).join(' ')
          : typeof detail === 'object' && detail !== null && 'message' in detail
            ? String(detail.message)
            : ''
    alert(
      msg
        ? `Could not submit: ${msg}`
        : `Could not submit. Is the API running and reachable at ${API_BASE_URL}?`
    )
  } finally {
    isSubmitting.value = false
  }
}

// Scroll handler for floating progress
function handleScroll() {
  scrolled.value = window.scrollY > 200
}

// Save/Load functions
function saveDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    ratings: ratings.value,
    username: username.value,
    email: email.value
  }))
}

function loadDraft() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      const raw = Array.isArray(data.ratings) ? data.ratings : []
      ratings.value = Array.from({ length: questions.length }, (_, i) => {
        const n = Number(raw[i])
        return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 0
      })
      username.value = data.username || ''
      email.value = data.email || ''
    } catch (e) {
      console.error('Failed to load draft', e)
    }
  }
}

// Auto-save
watch([ratings, username, email], () => {
  saveDraft()
}, { deep: true })

onMounted(() => {
  loadDraft()
  normalizeRatingsLength()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Reset and Core Variables */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.assessment-app {
  --brand-navy: #00334e;
  --brand-teal: #008080;
  --brand-teal-light: rgba(0, 128, 128, 0.08);
  --brand-teal-focus: rgba(0, 128, 128, 0.15);
  --brand-gray: #f8f9fa;
  --brand-gray-hover: #f1f3f5;
  --text-dark: #00334e;
  --text-body: #4a5568;
  --text-light: #718096;
  --shell-gutter: clamp(0.75rem, 3vw, 1.75rem);
  --shell-inner-gutter: clamp(1rem, 3vw, 1.75rem);

  flex: 1 1 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: 'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--text-body);
  
  /* Stunning Premium Gradient Mesh Background matching the screenshot */
  background: 
    radial-gradient(circle at 0% 100%, #d6e12c 0%, transparent 60%),
    radial-gradient(circle at 0% 0%, #1d8c82 0%, transparent 55%),
    radial-gradient(circle at 100% 0%, #1a5c68 0%, transparent 55%),
    radial-gradient(circle at 100% 100%, #152e42 0%, transparent 60%),
    linear-gradient(135deg, #1d8c82, #152e42) !important;
  background-attachment: fixed !important;
  padding-bottom: 4rem;
}

/* Centered Top Select Logo */
.assessment-logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.25rem var(--shell-gutter) 0.75rem;
  width: 100%;
  z-index: 10;
  position: relative;
}

.assessment-logo-img {
  height: clamp(38px, 5vw, 48px);
  width: auto;
  opacity: 0.95;
}

/* Page Scroll Wrapper */
.assessment-scroll-wrap {
  width: 100%;
  position: relative;
  z-index: 2;
  padding: 0 var(--shell-gutter);
}

.assessment-scroll-wrap__inner {
  max-width: 580px;
  margin: 0 auto;
  width: 100%;
}

.container.gf-container {
  width: 100%;
}

/* Main Form Card */
.gf-sheet.assessment-card {
  width: 100%;
  background: #ffffff !important;
  border-radius: 40px !important;
  border: none !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  overflow: visible;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Completely remove previous default top border accents */
.gf-sheet.assessment-card::after,
.gf-sheet.glass-card::before {
  display: none !important;
  content: none !important;
}

/* Integrated Progress Section */
.gf-sticky-progress.gf-sticky-progress--integrated {
  margin: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  padding: 1.25rem var(--shell-inner-gutter) 0;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  overflow: hidden !important;
}

.gf-sticky-progress-inner {
  width: 100%;
  position: relative;
  border-bottom: 1.5px solid #edf2f7;
  padding-bottom: 0.85rem;
}

.gf-sticky-progress-track {
  position: absolute;
  top: -1.25rem;
  left: 0;
  right: 0;
  height: 5px;
  background: rgba(0, 128, 128, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.gf-sticky-progress-fill {
  background: var(--brand-teal) !important;
  height: 100%;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.gf-sticky-progress-meta {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--brand-teal);
  letter-spacing: 0.01em;
  margin: 0.35rem 0 0;
  display: flex;
  align-items: center;
}

.gf-meta-sep {
  color: rgba(0, 128, 128, 0.35);
  margin: 0 0.4rem;
}

/* Title and Description Section */
.assessment-intro-section {
  padding: 1.5rem var(--shell-inner-gutter) 1.25rem;
}

.assessment-main-title {
  font-size: clamp(1.35rem, 4.5vw, 1.7rem);
  font-weight: 500;
  color: var(--brand-navy);
  margin: 0 0 0.85rem;
  letter-spacing: -0.025em;
  line-height: 1.25;
}

.assessment-description {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-body);
  margin: 0;
}

/* Custom Dividers */
.gf-divider {
  margin: 0;
  border: 0;
  border-top: 1.5px solid #edf2f7;
}

.gf-divider--muted {
  border-top-color: #edf2f7;
}

.gf-divider--inset {
  border-top: 1.5px solid #edf2f7;
  margin-top: 1.25rem;
  margin-bottom: 0rem;
}

/* User Info Form Section */
.user-info-section {
  padding: 0.5rem var(--shell-inner-gutter) 2.25rem !important;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  margin: 0 !important;
}

.gf-section-title {
  font-size: 1.35rem !important;
  font-weight: 500 !important;
  color: var(--brand-navy) !important;
  margin: 0 0 0.5rem !important;
  letter-spacing: -0.01em;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.input-group label {
  font-size: 0.925rem !important;
  font-weight: 500 !important;
  color: var(--brand-navy) !important;
  display: flex;
  align-items: center;
}

.input-group .required {
  color: #e53e3e;
  margin-left: 0.2rem;
}

.input-group .optional {
  color: #718096;
  font-weight: 400;
  font-size: 0.9rem;
  margin-left: 0.35rem;
}

.premium-input {
  background: #f8f9fa !important;
  border: 1px solid transparent !important;
  border-radius: 8px !important;
  padding: 0.8rem 1.1rem !important;
  font-size: 0.95rem !important;
  color: #1a202c !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  outline: none !important;
  width: 100%;
  box-shadow: none !important;
}

.premium-input:focus {
  background: #ffffff !important;
  border-color: var(--brand-teal) !important;
  box-shadow: 0 0 0 3px rgba(0, 128, 128, 0.15) !important;
}

/* Instructions Panel */
.mcq-instructions-panel {
  padding: 1.75rem var(--shell-inner-gutter) !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

.mcq-instructions-title {
  font-size: 1.35rem !important;
  font-weight: 500 !important;
  color: var(--brand-navy) !important;
  margin: 0 0 0.85rem !important;
}

.mcq-instructions-lead {
  font-size: 0.925rem !important;
  line-height: 1.6 !important;
  color: var(--text-body) !important;
  margin: 0 !important;
}

/* Questions Section */
.questions-section {
  list-style: none;
  padding: 1rem var(--shell-inner-gutter) 0.5rem !important;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.question-item {
  border: none !important;
  background: #ffffff !important;
  padding: 0.75rem 0 !important;
  box-shadow: none !important;
  margin: 0 !important;
  border-radius: 0 !important;
  display: flex;
  flex-direction: column;
}

.gf-question-head {
  margin-bottom: 0.65rem;
  text-align: left !important;
}

.question-number-badge {
  border: 1px solid var(--brand-teal);
  color: var(--brand-teal);
  padding: 0.2rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 400;
  border-radius: 100px;
  display: inline-block;
  margin-bottom: 0.4rem;
  background: #ffffff;
  text-align: left !important;
}

.question-text-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--brand-navy);
  line-height: 1.4;
  letter-spacing: -0.015em;
  text-align: left !important;
}

.mcq-options {
  border: none !important;
  margin: 0 !important;
  padding: 0 !important;
  min-width: 0 !important;
}

/* MCQ Options List styling */
.mcq-option-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  width: 100%;
}

.mcq-option {
  width: 100%;
  display: block;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.mcq-radio-native {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.mcq-option-card {
  display: flex !important;
  align-items: center !important;
  background: var(--brand-gray) !important;
  border: 1.5px solid transparent !important;
  border-radius: 8px !important;
  padding: 0.35rem 0.7rem !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  width: 100%;
  box-sizing: border-box;
}

.mcq-option:hover .mcq-option-card {
  background: var(--brand-gray-hover) !important;
}

/* Custom Circular Radio Button indicator */
.mcq-radio-custom {
  width: 16px;
  height: 16px;
  border: 1.5px solid rgba(0, 128, 128, 0.65);
  border-radius: 50%;
  margin-right: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
  background: #ffffff;
}

.mcq-option--selected .mcq-radio-custom {
  border-color: var(--brand-teal);
  background: #ffffff;
}

.mcq-option--selected .mcq-radio-custom::after {
  content: '';
  width: 6px;
  height: 6px;
  background-color: var(--brand-teal);
  border-radius: 50%;
  display: block;
}

.mcq-option-caption {
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  color: #2d3748 !important;
  line-height: 1.35;
  flex-grow: 1;
  text-align: left !important;
}

.mcq-option--selected .mcq-option-caption {
  color: var(--brand-navy) !important;
}

.mcq-option-score-badge {
  font-size: 0.65rem !important;
  font-weight: 700 !important;
  color: var(--brand-teal) !important;
  margin-left: auto !important;
  background: #ffffff !important;
  padding: 0.15rem 0.4rem !important;
  border-radius: 5px !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  flex-shrink: 0;
}

/* Selected row styling */
.mcq-option--selected .mcq-option-card {
  border: 1.5px solid var(--brand-teal) !important;
  background: #ffffff !important;
  box-shadow: 0 4px 16px rgba(0, 128, 128, 0.08) !important;
}

/* Submission Section */
.submission-section.gf-submit-band {
  padding: 0.75rem var(--shell-inner-gutter) 2rem !important;
  margin-top: 0;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.submission-copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  text-align: right !important;
}

.submission-title {
  font-size: 1.35rem;
  font-weight: 500;
  color: var(--brand-navy);
  margin: 0;
  text-align: right !important;
}

.submission-note {
  font-size: 0.775rem;
  line-height: 1.55;
  color: var(--text-light);
  margin: 0;
  text-align: right !important;
}

.gf-submit-actions {
  display: flex;
  width: auto;
  flex-shrink: 0;
}

.btn-primary.gf-submit-btn {
  background: var(--brand-teal) !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 0.75rem 2.5rem !important;
  min-width: 260px !important;
  font-size: 0.95rem !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.65rem !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: 0 4px 14px rgba(0, 128, 128, 0.25) !important;
  width: auto;
  /* min-width: 140px !important; */
}

.btn-primary.gf-submit-btn:not(:disabled):hover {
  background: #006666 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(0, 128, 128, 0.35) !important;
}

.btn-primary.gf-submit-btn:not(:disabled):active {
  transform: translateY(0) !important;
}

.btn-primary.gf-submit-btn:disabled {
  opacity: 0.55 !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
}

.gf-loading-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gf-loading-bars {
  display: flex;
  gap: 3px;
}

.gf-loading-bars span {
  width: 3px;
  height: 10px;
  background: #ffffff;
  animation: loadingBar 0.8s ease-in-out infinite;
}

.gf-loading-bars span:nth-child(2) {
  animation-delay: 0.15s;
}

.gf-loading-bars span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes loadingBar {
  0%, 100% {
    transform: scaleY(0.4);
    opacity: 0.5;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* Animations */
@keyframes gf-sheet-rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsive fixes */
@media (max-width: 640px) {
  .assessment-app {
    padding-bottom: 2rem;
  }
  
  .assessment-logo-container {
    padding: 2rem var(--shell-gutter) 1rem;
  }

  .gf-sheet.assessment-card {
    border-radius: 28px !important;
  }

  .gf-sticky-progress.gf-sticky-progress--integrated {
    border-top-left-radius: 28px;
    border-top-right-radius: 28px;
  }

  .btn-primary.gf-submit-btn {
    width: 100% !important;
  }

  .submission-section.gf-submit-band {
    flex-direction: column-reverse !important;
    align-items: stretch !important;
    gap: 1.25rem !important;
  }

  .gf-submit-actions {
    width: 100% !important;
  }

  .submission-copy {
    text-align: left !important;
  }

  .submission-note {
    text-align: left !important;
  }
}
</style>
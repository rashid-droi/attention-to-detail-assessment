<template>
  <div class="assessment-app gf-forms">
    <!-- Subtle brand wash (kept light for “form” feel) -->
    <div class="animated-bg" aria-hidden="true">
      <div class="bg-gradient"></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Google-Form–style sticky progress (thin bar + caption) -->
    <div class="gf-sticky-progress" :class="{ 'gf-sticky-progress--scrolled': scrolled }">
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

    <div class="container gf-container">
      <div class="assessment-card glass-card gf-sheet">
        <!-- Title block (form header) -->
        <header class="gf-title-block">
          <p class="gf-form-type">Self-assessment · Hatters</p>
          <h1 class="gf-main-title">
            Attention to Detail
            <span class="title-highlight">Assessment</span>
          </h1>
          <p class="gf-description">
            Evaluate your meticulousness and precision through this assessment.
            Each statement reflects real-world scenarios that measure your attention to detail.
          </p>
          <p class="gf-helper">
            For each required question, choose <strong>exactly one</strong> answer. The same response scale applies to all {{ questions.length }} statements.
          </p>
        </header>

        <div class="gf-divider" aria-hidden="true" />

        <!-- User Information Section -->
        <div class="user-info-section gf-form-section">
          <h2 class="gf-section-title">Your details</h2>
          <div class="input-group">
            <label for="username">Full Name <span class="required">*</span></label>
            <input id="username" type="text" v-model="username" placeholder="Full name" class="premium-input gf-input" autocomplete="name" required aria-required="true" />
          </div>
          <div class="input-group">
            <label for="email">Email <span class="optional">(Optional)</span></label>
            <input id="email" type="email" v-model="email" placeholder="you@company.com" class="premium-input gf-input" autocomplete="email" inputmode="email" />
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
              <span class="gf-question-num-tile" aria-hidden="true">{{ String(qIndex + 1).padStart(2, '0') }}</span>
              <p class="gf-question-line" :id="'question-text-' + qIndex">
                <span class="gf-question-text-wrap">
                  <span class="sr-only">Question {{ qIndex + 1 }} of {{ questions.length }}. </span>
                  {{ question }}
                </span>
              </p>
              <transition name="gf-chip">
                <span v-if="ratings[qIndex] > 0" class="gf-answered-chip" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                  </svg>
                </span>
              </transition>
            </div>

            <fieldset
              class="mcq-options gf-mcq-fieldset"
              :aria-labelledby="'question-text-' + qIndex"
              @change="onQuestionFieldsetChange(qIndex, $event)"
            >
              <legend class="sr-only">Choose one answer for statement {{ qIndex + 1 }} of {{ questions.length }}</legend>
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
                    <span class="sr-only">{{ pointsLabel(value) }}.</span>
                    <span class="mcq-option-score-badge" aria-hidden="true">{{ value }} pt{{ value === 1 ? '' : 's' }}</span>
                    <span class="mcq-option-caption">{{ tooltipMeaning[value] }}</span>
                  </span>
                </label>
              </div>
            </fieldset>

            <div v-if="qIndex < questions.length - 1" class="gf-divider gf-divider--inset" aria-hidden="true" />
          </li>
        </ol>

        <!-- Submit row -->
        <div class="submission-section gf-submit-band">
          <div class="submission-copy">
            <p class="submission-title">Submit</p>
            <p class="submission-note">
              {{ answeredCount }} of {{ questions.length }} questions answered. Answer every required question to submit.
            </p>
          </div>
          <div class="action-buttons gf-submit-actions">
            <button type="button" class="btn-primary gf-submit-btn" :class="{ 'loading': isSubmitting }" :disabled="isSubmitting"
              @click="submitAssessment">
              <span v-if="!isSubmitting">
                Complete Assessment
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
        </div>
      </div>
    </div>
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
const runtimeApiBaseUrl = `${window.location.protocol}//${window.location.hostname}:${import.meta.env.VITE_API_PORT ?? '8000'}`
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || runtimeApiBaseUrl).replace(/\/$/, '')

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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.assessment-app {
  /* Exact Select slide palette (mesh): navy TL/BR • teal TR • bright cyan centre-right • yellow BL→lime inward */
  --brand-navy: #002b5c;
  --brand-teal: #008b8b;
  --brand-cyan: #00a8a8;
  --brand-teal-soft: rgba(0, 139, 139, 0.14);
  --brand-yellow: #f0e400;
  --brand-lime: #9acd32;

  --page-mint: #ecfeff;
  --page-peach: #fff7ed;
  --page-lilac: #f5f3ff;
  --card-bg: rgba(255, 255, 255, 0.92);
  --card-border: var(--brand-teal-soft);
  --accent-teal: var(--brand-teal);
  --accent-coral: #ea580c;
  --accent-sky: #0e6b73;
  --accent-cyan: var(--brand-cyan);
  --text-primary: #0f172a;
  --text-muted: #64748b;
  --text-soft: #475569;
  /* Question index chips tinted to teal / navy / citrus (still pastel) */
  --theme-chip-a: linear-gradient(135deg, #d4f5f3, #9ee5df);
  --theme-chip-b: linear-gradient(135deg, #e8eef8, #c9d9e8);
  --theme-chip-c: linear-gradient(135deg, #fdf6c8, #f5ea7a);
  --theme-chip-d: linear-gradient(135deg, #e8f6d6, #c8e99a);
  --theme-chip-e: linear-gradient(135deg, #d8f5f8, #a8e8e8);
  --theme-chip-text-a: #0a5c62;
  --theme-chip-text-b: #083359;
  --theme-chip-text-c: #5c5410;
  --theme-chip-text-d: #3d6220;
  --theme-chip-text-e: #0a6270;

  min-height: 100vh;
  background:
    radial-gradient(ellipse 82% 78% at 0% 100%, rgba(240, 228, 0, 0.22) 0%, transparent 55%),
    radial-gradient(ellipse 78% 72% at 100% 100%, rgba(0, 43, 92, 0.085) 0%, transparent 52%),
    radial-gradient(ellipse 72% 58% at 92% 12%, rgba(0, 139, 139, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 68% 56% at 78% 48%, rgba(0, 168, 168, 0.12) 0%, transparent 52%),
    radial-gradient(ellipse 70% 55% at 0% 0%, rgba(0, 43, 92, 0.072) 0%, transparent 48%),
    radial-gradient(ellipse 70% 50% at 50% 40%, rgba(154, 205, 50, 0.1) 0%, transparent 45%),
    linear-gradient(165deg, #f8fafc 0%, #f0faf9 38%, #f8faf6 72%, #fefce8 100%);
  position: relative;
  font-family: 'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 2rem;
  color: var(--text-primary);
}

.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(circle at 24% 36%, rgba(0, 139, 139, 0.14) 0%, transparent 48%),
    radial-gradient(circle at 82% 28%, rgba(0, 168, 168, 0.13) 0%, transparent 42%),
    radial-gradient(circle at 76% 72%, rgba(0, 43, 92, 0.09) 0%, transparent 55%),
    radial-gradient(circle at 52% 58%, rgba(240, 228, 0, 0.11) 0%, transparent 45%),
    radial-gradient(circle at 44% 62%, rgba(154, 205, 50, 0.08) 0%, transparent 44%);
  animation: rotateGradient 40s linear infinite;
}

.noise-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
}

@keyframes rotateGradient {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.floating-progress {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 100;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.floating-progress.compact {
  transform: scale(0.85);
  top: 1rem;
  right: 1rem;
}

.progress-content {
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  border-radius: 32px;
  padding: 0.8rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  border: 1px solid rgba(0, 139, 139, 0.2);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.65) inset,
    0 8px 28px rgba(0, 43, 92, 0.1),
    0 2px 8px rgba(15, 23, 42, 0.06),
    0 12px 36px rgba(240, 228, 0, 0.13);
}

.progress-stats {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--accent-teal);
  line-height: 1;
}

.stat-label {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(15, 23, 42, 0.1);
}

.progress-ring-container {
  position: relative;
  width: 60px;
  height: 60px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: rgba(15, 23, 42, 0.1);
  stroke-width: 4;
}

.progress-ring-fill {
  fill: none;
  stroke: var(--brand-teal);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 166;
  transition: stroke-dashoffset 0.6s ease;
}

.progress-percent {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--accent-teal);
}

.assessment-card {
  position: relative;
  border-radius: 48px;
  overflow: hidden;
  transition: all 0.5s ease;
}

.assessment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    var(--brand-navy) 0%,
    var(--brand-teal) 28%,
    var(--brand-cyan) 52%,
    var(--brand-lime) 78%,
    var(--brand-yellow) 100%
  );
  opacity: 0.92;
}

.glass-card {
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 139, 139, 0.14);
  box-shadow:
    0 20px 50px -18px rgba(0, 43, 92, 0.1),
    0 8px 24px rgba(0, 139, 139, 0.1);
}

.hero-header {
  position: relative;
  isolation: isolate;
  padding: 3rem 3rem 2rem;
  margin: 1rem 1rem 0.6rem;
  border-radius: 1.25rem;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.9) 40%, rgba(255, 251, 235, 0.88) 100%);
  border: 1px solid rgba(0, 139, 139, 0.16);
  box-shadow: 0 12px 32px rgba(0, 43, 92, 0.08), 0 4px 20px rgba(0, 168, 168, 0.07);
  overflow: hidden;
}

.hero-header::after {
  content: '';
  position: absolute;
  inset: -45% -25%;
  background:
    radial-gradient(circle at 16% 30%, rgba(0, 139, 139, 0.16) 0%, transparent 40%),
    radial-gradient(circle at 78% 36%, rgba(0, 168, 168, 0.12) 0%, transparent 42%),
    radial-gradient(circle at 84% 44%, rgba(0, 43, 92, 0.1) 0%, transparent 42%),
    radial-gradient(circle at 52% 90%, rgba(240, 228, 0, 0.18) 0%, transparent 38%),
    radial-gradient(circle at 40% 60%, rgba(154, 205, 50, 0.1) 0%, transparent 36%);
  pointer-events: none;
  z-index: 0;
}

.hero-header > * {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, rgba(212, 245, 243, 0.95), rgba(230, 248, 252, 0.9));
  padding: 0.4rem 1rem;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand-navy);
  margin-bottom: 1.5rem;
  border: 1px solid rgba(0, 139, 139, 0.22);
  box-shadow: 0 2px 14px rgba(0, 43, 92, 0.08);
}

.badge-icon {
  display: inline-block;
  animation: badgeSparkle 5s ease-in-out infinite;
}

@keyframes badgeSparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    filter: drop-shadow(0 0 0 transparent);
  }
  40% {
    transform: scale(1.08) rotate(-6deg);
    filter: drop-shadow(0 1px 5px rgba(240, 228, 0, 0.55));
  }
  55% {
    transform: scale(1.05) rotate(4deg);
  }
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.title-highlight {
  background: linear-gradient(135deg, var(--brand-navy), var(--brand-teal) 42%, var(--brand-cyan));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.hero-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-soft);
  max-width: 80%;
}

.hero-mcq-hint {
  margin-top: 1.15rem;
  font-size: 0.93rem;
  line-height: 1.55;
  color: var(--text-muted);
  max-width: 68ch;
}

.mcq-instructions-panel {
  position: relative;
  margin: 0 1rem 0.75rem;
  padding: 1.1rem clamp(1rem, 2.5vw, 1.5rem);
  border-radius: 1rem;
  border: 1px solid rgba(240, 228, 0, 0.38);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 253, 232, 0.82) 100%);
  box-shadow: 0 4px 20px rgba(0, 43, 92, 0.05);
}

.mcq-instructions-panel::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.85rem;
  bottom: 0.85rem;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(180deg, var(--brand-yellow), var(--brand-cyan), var(--brand-navy));
  opacity: 0.85;
  pointer-events: none;
}

.mcq-instructions-title {
  margin: 0 0 0.45rem;
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--brand-navy);
  letter-spacing: 0.02em;
}

.mcq-instructions-lead {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--text-soft);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.progress-section {
  padding: 1.5rem 3rem;
  background: rgba(248, 252, 251, 0.72);
  border-bottom: 1px solid rgba(0, 139, 139, 0.12);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.progress-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-cyan);
}

.progress-tip {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.progress-success {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--accent-cyan);
}

.progress-bar-container {
  background: rgba(15, 23, 42, 0.08);
  border-radius: 100px;
  height: 8px;
  overflow: hidden;
}

.mcq-options {
  border: none;
  margin: 0.85rem 0 0;
  padding: 0;
}

.mcq-option-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.mcq-option {
  cursor: pointer;
  margin: 0;
}

.mcq-radio-native {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.mcq-option-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem 1rem;
  padding: 0.62rem 0.82rem;
  border-radius: 0.77rem;
  border: 1px solid rgba(0, 43, 92, 0.1);
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 43, 92, 0.05);
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.mcq-option:hover .mcq-option-card {
  border-color: rgba(0, 139, 139, 0.28);
  background: rgba(248, 252, 251, 0.95);
}

.mcq-option:focus-within .mcq-option-card {
  outline: 2px solid var(--brand-teal);
  outline-offset: 2px;
}

.mcq-option--selected .mcq-option-card {
  border-color: rgba(0, 139, 139, 0.45);
  background: rgba(255, 253, 232, 0.92);
  box-shadow:
    0 0 0 1px rgba(0, 139, 139, 0.22),
    0 2px 10px rgba(0, 43, 92, 0.08);
}

.mcq-option-score-badge {
  flex-shrink: 0;
  min-width: 3.25rem;
  padding: 0.2rem 0.45rem;
  font-size: 0.72rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  text-align: center;
  color: var(--brand-navy);
  background: rgba(0, 168, 168, 0.12);
  border: 1px solid rgba(0, 139, 139, 0.28);
  border-radius: 6px;
}

.mcq-option-caption {
  font-size: 0.84rem;
  font-weight: 600;
  color: #0f172a;
}

.mcq-option--selected .mcq-option-caption {
  color: var(--brand-navy);
}

.mcq-option--selected .mcq-option-score-badge {
  color: #fff;
  background: linear-gradient(145deg, var(--brand-cyan), var(--brand-teal) 55%, var(--brand-navy));
  border-color: rgba(0, 43, 92, 0.2);
}

.submission-section {
  margin-top: 1.6rem;
  padding: 1.2rem;
  border-top: 1px solid rgba(0, 139, 139, 0.14);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.65);
  display: grid;
  gap: 0.9rem;
  box-shadow: 0 -1px 0 rgba(240, 228, 0, 0.12);
}

.submission-copy {
  text-align: center;
  margin-bottom: 0.95rem;
}

.submission-title {
  font-size: 1.02rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: 0.01em;
}

.submission-note {
  margin-top: 0.28rem;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.btn-primary {
  border: none;
  outline: none;
  border-radius: 14px;
  padding: 0.9rem 1.35rem;
  min-width: 240px;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  background: linear-gradient(135deg, var(--brand-teal) 0%, #006f6f 46%, var(--brand-navy) 100%);
  box-shadow: 0 4px 16px rgba(0, 139, 139, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.2s ease, filter 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-primary:hover {
  transform: translateY(-1px);
  filter: brightness(1.06);
  box-shadow: 0 6px 22px rgba(0, 139, 139, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.28);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
  filter: grayscale(0.15);
}

.btn-primary.loading {
  pointer-events: none;
}

.gf-loading-row {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.gf-loading-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 3px;
  height: 1rem;
}

.gf-loading-bars > span {
  display: block;
  width: 4px;
  height: 10px;
  border-radius: 1px;
  background: currentColor;
  transform-origin: center bottom;
  animation: gf-loading-bar 0.75s ease-in-out infinite;
}

.gf-loading-bars > span:nth-child(2) {
  animation-delay: 0.12s;
}

.gf-loading-bars > span:nth-child(3) {
  animation-delay: 0.24s;
}

@keyframes gf-loading-bar {
  0%,
  100% {
    transform: scaleY(0.35);
    opacity: 0.45;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* Layout polish overrides */
.container {
  width: min(1140px, 100%);
  padding-top: 1.5rem;
}

.assessment-card {
  display: flex;
  flex-direction: column;
}

.hero-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hero-description {
  max-width: 68ch;
}

.questions-section {
  display: grid;
  gap: 1rem;
  padding: 1.5rem clamp(1rem, 2.5vw, 2rem) 0.5rem;
  list-style: none;
  margin: 0;
}

.question-item {
  border: 1px solid rgba(0, 43, 92, 0.1);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.88);
  padding: 1rem 1rem 1.1rem;
  box-shadow: 0 2px 12px rgba(0, 43, 92, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.question-item:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 139, 139, 0.35);
  box-shadow: 0 10px 28px rgba(0, 139, 139, 0.1);
}

.question-item.answered {
  border-color: rgba(0, 139, 139, 0.45);
  background: rgba(240, 253, 250, 0.55);
}

.question-item.highlighted {
  outline: 2px solid rgba(0, 139, 139, 0.45);
}

.question-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: start;
}

.question-number {
  min-width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--theme-chip-text-a);
  background: var(--theme-chip-a);
  box-shadow: 0 1px 8px rgba(15, 23, 42, 0.06);
}

.question-item:nth-child(5n + 2) .question-number {
  color: var(--theme-chip-text-b);
  background: var(--theme-chip-b);
}

.question-item:nth-child(5n + 3) .question-number {
  color: var(--theme-chip-text-c);
  background: var(--theme-chip-c);
}

.question-item:nth-child(5n + 4) .question-number {
  color: var(--theme-chip-text-d);
  background: var(--theme-chip-d);
}

.question-item:nth-child(5n) .question-number {
  color: var(--theme-chip-text-e);
  background: var(--theme-chip-e);
}

.question-text {
  line-height: 1.55;
  color: var(--text-primary);
  font-weight: 500;
}

.question-status svg {
  color: var(--accent-teal);
}

.question-status {
  align-self: center;
}

@media (max-width: 900px) {
  .assessment-app {
    padding: 1rem;
  }

  .floating-progress {
    position: static;
    margin-bottom: 1rem;
  }

  .progress-content {
    width: 100%;
    justify-content: space-between;
  }

  .hero-header {
    padding: 1.4rem 1.1rem 1.1rem;
    margin: 0.75rem 0.75rem 0.35rem;
  }

  .hero-title {
    font-size: 2.1rem;
  }

  .hero-description {
    max-width: 100%;
    font-size: 0.95rem;
  }

  .mcq-instructions-panel {
    margin: 0 0.75rem 0.65rem;
    padding: 0.95rem 0.85rem;
  }

  .questions-section {
    padding: 1rem 0.85rem 0.3rem;
  }

  .question-item {
    padding: 0.85rem 0.8rem 1rem;
  }

  .question-header {
    grid-template-columns: auto 1fr;
  }

  .question-status {
    grid-column: 2;
    justify-self: end;
  }

  .mcq-option-card {
    padding: 0.55rem 0.72rem;
  }

  .mcq-option-score-badge {
    min-width: 3rem;
    font-size: 0.68rem;
  }

  .submission-section {
    padding: 1rem 0.85rem;
  }

  .btn-primary {
    width: 100%;
    min-width: 0;
  }
}

/* User Info Section */
.user-info-section {
  padding: 1.5rem 3rem;
  margin: 0 1rem 1rem;
  background:
    linear-gradient(125deg, rgba(212, 245, 243, 0.42) 0%, transparent 44%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(248, 252, 251, 0.92) 100%);
  border: 1px solid rgba(0, 139, 139, 0.14);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 14px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}

.input-group .required {
  color: #ff6b6b;
}

.input-group .optional {
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 400;
}

.premium-input {
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 12px;
  padding: 0.9rem 1.2rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.premium-input:focus {
  border-color: var(--accent-teal);
  box-shadow: 0 0 0 3px rgba(0, 139, 139, 0.18);
}

.premium-input::placeholder {
  color: rgba(100, 116, 139, 0.75);
}

/* —— Google Forms–style layout & surfaces (brand colours preserved) —— */
.gf-forms {
  --gf-line: #dadce0;
  --gf-sheet: #ffffff;
  --gf-page-tint: #f1f6f8;
  --gf-ink: #202124;
  --gf-muted-ink: #5f6368;
  --gf-radius: 8px;
  --gf-radius-sm: 6px;
  --gf-focus: var(--brand-teal);
  --gf-focus-ring: rgba(0, 168, 168, 0.45);
  --gf-motion-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --gf-motion-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --gf-stagger-base: 0.2s;
  --gf-stagger-step: 28ms;
  -webkit-font-smoothing: antialiased;
}

@keyframes gf-fade-shift {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gf-sheet-rise {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gf-sticky-enter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gf-forms.assessment-app {
  background:
    radial-gradient(ellipse 76% 64% at 100% 0%, rgba(0, 139, 139, 0.06) 0%, transparent 50%),
    var(--gf-page-tint) !important;
  padding-left: clamp(0.85rem, 3vw, 1.75rem);
  padding-right: clamp(0.85rem, 3vw, 1.75rem);
}

.gf-forms .animated-bg {
  opacity: 0.42;
}

.gf-forms .noise-overlay {
  opacity: 0.02;
}

.gf-forms .gf-container.container {
  max-width: 640px;
  width: 100%;
  padding-top: 0.5rem;
}

.gf-sticky-progress {
  position: sticky;
  top: 0;
  z-index: 101;
  margin: 0 calc(-1 * clamp(0.85rem, 3vw, 1.75rem));
  padding: 0.55rem clamp(0.85rem, 3vw, 1.75rem) 0.5rem;
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid var(--gf-line);
  backdrop-filter: blur(14px) saturate(1.4);
  animation: gf-sticky-enter 0.52s var(--gf-motion-ease-out) both;
  transition:
    padding 0.2s ease,
    box-shadow 0.28s var(--gf-motion-ease-out);
}

.gf-sticky-progress-inner {
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}

.gf-sticky-progress--scrolled {
  box-shadow: 0 1px 0 rgba(0, 43, 92, 0.04), 0 4px 12px rgba(60, 64, 67, 0.08);
}

.gf-sticky-progress-track {
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
  background: rgba(0, 43, 92, 0.09);
}

.gf-sticky-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--brand-navy), var(--brand-teal) 42%, var(--brand-cyan));
  transition: width 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.gf-sticky-progress-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.15rem 0;
  margin: 0.45rem 0 0;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--gf-muted-ink);
  letter-spacing: 0.02em;
  line-height: 1.35;
}

.gf-meta-sep {
  color: #bdc1c6;
  font-weight: 500;
}

.gf-sheet.assessment-card {
  margin-top: 0.75rem;
  border-radius: var(--gf-radius) !important;
  overflow: hidden;
  background: var(--gf-sheet) !important;
  border: 1px solid var(--gf-line) !important;
  box-shadow:
    0 1px 2px rgba(60, 64, 67, 0.1),
    0 2px 8px rgba(60, 64, 67, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.65) inset;
  backdrop-filter: none !important;
  animation: gf-sheet-rise 0.72s var(--gf-motion-ease-out) both;
}

.gf-sheet.glass-card::before {
  height: 6px !important;
  opacity: 1 !important;
  border-radius: var(--gf-radius) var(--gf-radius) 0 0 !important;
}

.gf-title-block {
  padding: clamp(1.2rem, 3.2vw, 1.75rem) clamp(1.05rem, 3vw, 1.65rem);
}

.gf-forms .gf-title-block > * {
  animation: gf-fade-shift 0.48s var(--gf-motion-ease-out) backwards;
}

.gf-forms .gf-title-block > *:nth-child(1) {
  animation-delay: 0.05s;
}

.gf-forms .gf-title-block > *:nth-child(2) {
  animation-delay: 0.1s;
}

.gf-forms .gf-title-block > *:nth-child(3) {
  animation-delay: 0.15s;
}

.gf-forms .gf-title-block > *:nth-child(4) {
  animation-delay: 0.19s;
}

@keyframes gf-title-highlight-sheen {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.gf-form-type {
  margin: 0 0 0.4rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gf-muted-ink);
}

.gf-forms .gf-main-title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.4rem, 3.8vw, 1.875rem);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.33;
  color: var(--gf-ink);
}

.gf-forms .gf-main-title .title-highlight {
  font-weight: 600;
  display: inline-block;
  background: linear-gradient(
    105deg,
    var(--brand-navy) 0%,
    var(--brand-teal) 28%,
    var(--brand-cyan) 45%,
    var(--brand-teal) 62%,
    var(--brand-navy) 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gf-title-highlight-sheen 5.5s ease-in-out infinite;
}

.gf-description {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--gf-muted-ink);
  max-width: none;
}

.gf-helper {
  margin: 0.65rem 0 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--gf-muted-ink);
  max-width: none;
}

.gf-helper strong {
  color: var(--gf-ink);
  font-weight: 600;
}

.gf-divider {
  margin: 0;
  border: 0;
  border-top: 1px solid var(--gf-line);
}

.gf-divider--muted {
  border-top-color: #f1f3f4;
}

.gf-divider--inset {
  margin-top: 1.05rem;
  border-top-color: #eceff1;
}

.gf-forms .gf-section-title {
  margin: 0 0 0.875rem !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: var(--gf-ink) !important;
}

.gf-forms .user-info-section {
  margin: 0 !important;
  padding: 1.25rem clamp(1.05rem, 3vw, 1.65rem) !important;
  gap: 1.125rem !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
  animation: gf-fade-shift 0.52s var(--gf-motion-ease-out) backwards;
  animation-delay: calc(var(--gf-stagger-base) + var(--gf-stagger-step));
}

.gf-forms .input-group label {
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  color: var(--gf-muted-ink) !important;
  line-height: 1.4;
}

.gf-forms .input-group .required {
  color: #d93025;
  font-weight: 700;
  margin-left: 0.1rem;
}

.gf-forms .input-group .optional {
  font-weight: 500;
  opacity: 0.88;
}

.gf-forms .premium-input.gf-input {
  display: block;
  width: 100%;
  margin-top: 0.05rem;
  padding: 0.75rem 0.875rem !important;
  border: none !important;
  border-bottom: 1px solid var(--gf-line) !important;
  border-radius: var(--gf-radius-sm) var(--gf-radius-sm) 0 0 !important;
  background: #f8faf9 !important;
  font-family: inherit;
  font-size: 0.875rem !important;
  color: var(--gf-ink);
  caret-color: var(--brand-teal);
  transition:
    border-color 0.2s ease,
    box-shadow 0.18s ease,
    background 0.2s ease;
}

.gf-forms .premium-input.gf-input::placeholder {
  color: #9aa0a6;
}

.gf-forms .premium-input.gf-input:hover {
  background: #f3f8f7 !important;
}

.gf-forms .premium-input.gf-input:focus {
  outline: none !important;
}

.gf-forms .premium-input.gf-input:focus-visible {
  background: #fff !important;
  border-bottom-width: 2px !important;
  border-bottom-color: var(--gf-focus) !important;
  box-shadow: 0 0 0 3px var(--gf-focus-ring) !important;
}

.gf-forms .mcq-instructions-panel {
  margin: 0 !important;
  padding: 1.25rem clamp(1.05rem, 3vw, 1.65rem) !important;
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  animation: gf-fade-shift 0.52s var(--gf-motion-ease-out) backwards;
  animation-delay: calc(var(--gf-stagger-base) + 2 * var(--gf-stagger-step));
}

.gf-forms .mcq-instructions-panel::before {
  display: none;
}

.gf-forms .mcq-instructions-lead {
  font-size: 0.8125rem !important;
  line-height: 1.58 !important;
}

.gf-forms .questions-section {
  gap: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

.gf-forms .question-item.gf-question-card {
  padding: 1.35rem clamp(1.05rem, 3vw, 1.65rem);
  margin: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
  animation: gf-fade-shift 0.48s var(--gf-motion-ease-out) backwards;
  animation-delay: calc(
    var(--gf-stagger-base) + 3 * var(--gf-stagger-step) + var(--gf-q-index, 0) * var(--gf-stagger-step)
  );
  transition:
    background-color 0.35s var(--gf-motion-ease-out),
    box-shadow 0.35s ease;
}

.gf-forms .question-item:hover {
  transform: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

.gf-forms .question-item.answered {
  background: transparent !important;
  border: none !important;
}

.gf-forms .question-item.highlighted {
  outline: none !important;
  background: rgba(0, 168, 168, 0.07);
  box-shadow: inset 0 0 0 1px rgba(0, 168, 168, 0.12);
}

.gf-question-head {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.gf-question-num-tile {
  flex-shrink: 0;
  width: 2.65rem;
  height: 2.65rem;
  border-radius: 0.78rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  line-height: 1;
  color: #063d52;
  background: linear-gradient(165deg, #dff8f6 0%, #caece8 45%, #bce5df 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 1px 3px rgba(0, 43, 92, 0.08);
  transform: scale(1);
  transition:
    transform 0.42s var(--gf-motion-spring),
    color 0.28s ease,
    background 0.32s ease,
    box-shadow 0.32s ease;
}

.gf-forms .question-item.answered .gf-question-num-tile {
  color: var(--brand-navy);
  background: linear-gradient(165deg, #ccf0ec 0%, #aee2dc 52%, #9dd9d2 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.75),
    0 0 0 1.5px rgba(0, 139, 139, 0.28),
    0 2px 8px rgba(0, 43, 92, 0.07);
  transform: scale(1.035);
}

.gf-forms .question-item.highlighted .gf-question-num-tile {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 0 0 2px rgba(0, 168, 168, 0.55),
    0 2px 10px rgba(0, 139, 139, 0.12);
}

.gf-question-line {
  flex: 1;
  min-width: 0;
  margin: 0 !important;
  padding: 0 !important;
  display: flex;
  gap: 0.4rem;
  align-items: flex-start;
  font-size: 0.948rem !important;
  font-weight: 400 !important;
  line-height: 1.55 !important;
  color: var(--gf-ink) !important;
}

.gf-question-text-wrap {
  flex: 1;
  min-width: 0;
}

.gf-answered-chip {
  flex-shrink: 0;
  margin-top: 0;
  padding: 0.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--brand-teal);
  background: rgba(0, 139, 139, 0.1);
  will-change: transform, opacity;
}

.gf-answered-chip svg {
  display: block;
}

.gf-chip-enter-active {
  transition:
    opacity 0.3s var(--gf-motion-ease-out),
    transform 0.34s var(--gf-motion-spring);
}

.gf-chip-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.18s ease;
}

.gf-chip-enter-from,
.gf-chip-leave-to {
  opacity: 0;
  transform: scale(0.65);
}

.gf-forms .gf-mcq-fieldset.mcq-options {
  margin-top: 0.25rem !important;
}

.gf-forms .gf-mcq-list {
  gap: 0.15rem !important;
}

.gf-forms .gf-option-row.mcq-option {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  min-height: 2.75rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transform: translateX(0);
  transition: transform 0.22s var(--gf-motion-ease-out);
}

.gf-forms .gf-option-row.mcq-option:hover {
  transform: translateX(3px);
}

/* Invisible input covers the entire row so badge, text, and whitespace are all clickable */
.gf-forms .mcq-radio-native.gf-radio.gf-radio-hit {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  opacity: 0 !important;
  cursor: pointer !important;
  z-index: 2;
  appearance: none !important;
  clip: auto !important;
  overflow: visible !important;
}

.gf-forms .mcq-radio-native.gf-radio.gf-radio-hit:focus {
  outline: none;
}

.gf-forms .mcq-option:focus-within .mcq-option-card {
  outline: none !important;
}

.gf-forms .mcq-option-card.gf-option-body {
  position: relative;
  z-index: 1;
  flex: 1 !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  gap: 0.625rem 0.875rem !important;
  min-height: 2.625rem !important;
  padding: 0.5rem 0.625rem !important;
  margin: -0.15rem 0 !important;
  border-radius: var(--gf-radius-sm) !important;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  pointer-events: none;
  user-select: none;
  transition:
    background-color 0.2s var(--gf-motion-ease-out),
    box-shadow 0.22s ease;
}

.gf-forms .mcq-option-card .mcq-option-score-badge {
  background: rgba(248, 252, 251, 0.95);
  border-color: rgba(0, 139, 139, 0.22);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.22s var(--gf-motion-spring);
}

.gf-forms .gf-radio-hit:checked ~ .mcq-option-card .mcq-option-score-badge {
  color: #fff !important;
  background: linear-gradient(145deg, var(--brand-cyan), var(--brand-teal) 55%, var(--brand-navy)) !important;
  border-color: rgba(0, 43, 92, 0.25) !important;
  transform: scale(1.02);
}

.gf-forms .gf-option-row:hover .mcq-option-card {
  border-color: transparent !important;
  background: rgba(0, 139, 139, 0.055) !important;
}

.gf-forms .gf-option-row.mcq-option--selected .mcq-option-card {
  background: rgba(0, 168, 168, 0.12) !important;
  box-shadow: inset 0 0 0 1px rgba(0, 139, 139, 0.18) !important;
}

.gf-forms .gf-option-row.mcq-option--selected:focus-within .mcq-option-card {
  outline: 2px solid rgba(0, 139, 139, 0.45);
  outline-offset: 1px;
}

.gf-forms .mcq-option-caption {
  font-size: 0.875rem !important;
  line-height: 1.45 !important;
}

.gf-forms .mcq-option--selected .mcq-option-caption {
  color: var(--gf-ink) !important;
  font-weight: 600 !important;
}

.gf-forms .submission-section.gf-submit-band {
  margin-top: 0 !important;
  padding: 1.35rem clamp(1.05rem, 3vw, 1.65rem);
  border-top: 1px solid var(--gf-line) !important;
  border-radius: 0 !important;
  background: #fafcfc !important;
  box-shadow: none !important;
  animation: gf-fade-shift 0.48s var(--gf-motion-ease-out) backwards;
  animation-delay: calc(var(--gf-stagger-base) + 3 * var(--gf-stagger-step) + 15 * var(--gf-stagger-step) + 0.12s);
}

.gf-forms .submission-copy {
  margin-bottom: 0.875rem !important;
  text-align: left !important;
}

.gf-forms .submission-title {
  font-size: 1.0625rem !important;
  font-weight: 600 !important;
  text-align: left !important;
}

.gf-forms .submission-note {
  text-align: left !important;
  margin-top: 0.35rem !important;
  max-width: 42rem;
  line-height: 1.5 !important;
  font-size: 0.8125rem !important;
}

.gf-forms .gf-submit-actions {
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.gf-forms .gf-submit-btn.btn-primary {
  min-height: 44px !important;
  min-width: auto !important;
  padding: 0 1.5rem !important;
  border-radius: var(--gf-radius-sm) !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.01em;
  box-shadow:
    0 1px 2px rgba(60, 64, 67, 0.18),
    0 2px 4px rgba(0, 43, 92, 0.1);
  transition:
    transform 0.22s var(--gf-motion-ease-out),
    box-shadow 0.22s ease,
    filter 0.2s ease,
    background 0.2s ease;
}

.gf-forms .gf-submit-btn.btn-primary:not(:disabled):active {
  transform: translateY(1px);
}

.gf-forms .gf-submit-btn.btn-primary:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow:
    0 2px 4px rgba(60, 64, 67, 0.2),
    0 4px 12px rgba(0, 43, 92, 0.12);
}

.gf-forms .gf-submit-btn.btn-primary:focus-visible {
  outline: 2px solid var(--brand-cyan);
  outline-offset: 3px;
}

.gf-forms .gf-submit-btn.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 560px) {
  .gf-forms .gf-submit-actions.action-buttons .btn-primary {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 900px) {
  .gf-forms .gf-sticky-progress-meta {
    font-size: 0.65625rem;
  }

  .gf-forms .btn-primary {
    width: auto !important;
    min-width: 0 !important;
  }

  .gf-forms .mcq-instructions-panel {
    margin: 0 !important;
    padding: 1.1rem clamp(1rem, 3vw, 1.35rem) !important;
  }

  .gf-forms .questions-section {
    padding: 0 !important;
  }

  .gf-question-num-tile {
    width: 2.4rem;
    height: 2.4rem;
    font-size: 0.75rem;
    border-radius: 0.7rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .question-item,
  .mcq-option-card,
  .btn-primary,
  .gf-sticky-progress-fill,
  .gf-sticky-progress {
    transition: none !important;
  }

  .gf-forms .gf-sheet.assessment-card,
  .gf-sticky-progress,
  .gf-forms .gf-title-block > *,
  .gf-forms .user-info-section,
  .gf-forms .mcq-instructions-panel,
  .gf-forms .questions-section .question-item.gf-question-card,
  .gf-forms .submission-section.gf-submit-band {
    animation: none !important;
  }

  .gf-forms .gf-main-title .title-highlight {
    animation: none !important;
  }

  .gf-forms .gf-option-row.mcq-option,
  .gf-forms .gf-option-row.mcq-option:hover {
    transform: none !important;
    transition: none !important;
  }

  .gf-forms .mcq-option-card .mcq-option-score-badge {
    transition: none !important;
  }

  .gf-loading-bars > span {
    animation: none !important;
  }

  .gf-forms .gf-submit-btn.btn-primary:not(:disabled):hover,
  .gf-forms .gf-submit-btn.btn-primary:not(:disabled):active {
    transform: none !important;
  }

  .gf-chip-enter-active,
  .gf-chip-leave-active {
    transition: none !important;
  }
}
</style>
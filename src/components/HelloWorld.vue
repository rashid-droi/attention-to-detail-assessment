<template>
  <div class="assessment-app">
    <!-- Premium Animated Background -->
    <div class="animated-bg">
      <div class="bg-gradient"></div>
      <div class="noise-overlay"></div>
    </div>

    <div class="container">
      <!-- Floating Progress Card -->
      <div class="floating-progress" :class="{ 'compact': scrolled }">
        <div class="progress-content">
          <div class="progress-stats">
            <div class="stat">
              <span class="stat-value">{{ answeredCount }}</span>
              <span class="stat-label">Answered</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">{{ questions.length }}</span>
              <span class="stat-label">Total</span>
            </div>
            <div class="stat-divider"></div>
          </div>
          <div class="progress-ring-container">
            <svg class="progress-ring" width="60" height="60">
              <circle class="progress-ring-bg" r="26" cx="30" cy="30" />
              <circle class="progress-ring-fill" r="26" cx="30" cy="30"
                :style="{ strokeDashoffset: 166 - (166 * completionPercent) / 100 }" />
            </svg>
            <span class="progress-percent">{{ completionPercent }}%</span>
          </div>
        </div>
      </div>

      <!-- Main Card -->
      <div class="assessment-card glass-card">
        <!-- Hero Header -->
        <div class="hero-header">
          <div class="hero-badge">
            <span class="badge-icon">✨</span>
            <span>Self-Assessment Tool</span>
          </div>
          <h1 class="hero-title">
            Attention to Detail
            <span class="title-highlight">Assessment</span>
          </h1>
          <p class="hero-description">
            Evaluate your meticulousness and precision through our comprehensive assessment.
            Each statement reflects real-world scenarios that measure your attention to detail.
          </p>

          <!-- Likert Scale Visual Guide -->
          <div class="likert-guide">
            <div v-for="val in STAR_VALUES" :key="val" class="likert-item">
              <div class="likert-marker" :data-value="val"></div>
              <span class="likert-stars">{{ '★'.repeat(val) }}</span>
              <span class="likert-label">{{ tooltipMeaning[val] }}</span>
            </div>
          </div>
        </div>

        <!-- Questions Section -->
        <ol class="questions-section" aria-label="Assessment questions">
          <li v-for="(question, qIndex) in questions" :key="qIndex" class="question-item"
            :class="{ 'answered': ratings[qIndex] > 0, 'highlighted': highlightedIndex === qIndex }"
            :ref="el => { if (el) questionRefs[qIndex] = el }">
            <div class="question-header">
              <div class="question-number">
                <span>{{ String(qIndex + 1).padStart(2, '0') }}</span>
                <div class="number-glow"></div>
              </div>
              <p class="question-text">{{ question }}</p>
              <div class="question-status" v-if="ratings[qIndex] > 0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </div>
            </div>

            <!-- Premium Rating Buttons -->
            <div class="rating-buttons" @mouseleave="hoverRatings[qIndex] = 0">
              <button v-for="value in STAR_VALUES" :key="value" type="button"
                class="rating-btn" :class="{
                  'active': value <= (hoverRatings[qIndex] || ratings[qIndex]),
                  'premium-effect': value <= (hoverRatings[qIndex] || ratings[qIndex])
                }"
                @mouseenter="hoverRatings[qIndex] = value"
                @focus="hoverRatings[qIndex] = value"
                @blur="hoverRatings[qIndex] = 0"
                @click="setRatingAndMaybeAdvance(qIndex, value)"
                :aria-label="`${value} star - ${tooltipMeaning[value]}`">
                <svg viewBox="0 0 24 24" class="rating-star" aria-hidden="true">
                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                </svg>
                <div class="rating-tooltip">{{ tooltipMeaning[value] }}</div>
                <div class="rating-ripple"></div>
              </button>
            </div>
          </li>
        </ol>

        <!-- Premium Submission Section -->
        <div v-if="!submitted" class="submission-section">
          <div class="submission-copy">
            <p class="submission-title">Ready to Submit?</p>
            <p class="submission-note">
              {{ answeredCount }} of {{ questions.length }} questions answered. Complete all ratings to finish.
            </p>
          </div>
          <div class="action-buttons">
            <button class="btn-primary" :class="{ 'loading': isSubmitting }" :disabled="!allAnswered || isSubmitting"
              @click="submitAssessment">
              <span v-if="!isSubmitting">
                Complete Assessment
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span v-else>
                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" />
                </svg>
                Processing...
              </span>
            </button>
          </div>
        </div>

        <!-- Premium Results Panel -->
        <transition name="result-appear">
          <div v-if="submitted" class="results-panel">
            <div class="results-header">
              <div class="success-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" />
                  <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" />
                </svg>
              </div>
              <h2>Assessment Complete</h2>
              <p class="results-subtitle">Attention to Detail Assessment Results</p>
            </div>

            <div class="score-section">
              <div class="score-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="6" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="url(#scoreGradient)" stroke-width="6"
                    stroke-dasharray="339.292" :stroke-dashoffset="339.292 * (1 - totalScore / 75)" stroke-linecap="round" />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#83C5BE" />
                      <stop offset="100%" stop-color="#006D77" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="score-value">
                  <span class="score-number">{{ totalScore }}</span>
                  <span class="score-max">/ 75</span>
                </div>
              </div>
              <div class="score-metrics">
                <div class="metric">
                  <span class="metric-value">{{ completionPercent }}%</span>
                  <span class="metric-label">Completion</span>
                </div>
                <div class="metric-divider"></div>
                <div class="metric">
                  <span class="metric-value">{{ (totalScore / questions.length).toFixed(1) }}</span>
                  <span class="metric-label">Average Score</span>
                </div>
              </div>
            </div>

            <div class="interpretation-card">
              <div class="interpretation-badge">Analysis Result</div>
              <p class="interpretation-text">{{ interpretation }}</p>
              <div class="interpretation-bars">
                <div class="bar" :style="{ width: '100%' }" data-level="excellent"></div>
                <div class="bar" :style="{ width: totalScore >= 50 ? '100%' : '0%' }" data-level="above"></div>
                <div class="bar" :style="{ width: totalScore >= 35 ? '100%' : '0%' }" data-level="average"></div>
              </div>
            </div>

            <div class="results-actions">
              <button class="btn-outline" @click="resetAssessment">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                New Assessment
              </button>
              <button class="btn-outline" @click="printResults">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 9V3h12v6M6 21h12v-6H6z" />
                  <path d="M18 9h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h2" />
                  <path d="M6 15h12" />
                </svg>
                Print Results
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

// Questions Data
const questions = [
  'When reading, I notice even minor errors in spelling or grammar.',
  'I double-check names, numbers, and other important details before finalising a document or sending an email.',
  'When given multi-step instructions, I can accurately recall and follow each step without frequently referring back.',
  'I carefully organise my workspace, ensuring everything has a specific place.',
  'When someone provides oral information, I often need to clarify or ask them to repeat details.',
  'I find discrepancies in data or patterns that others often overlook.',
  'I tend to complete tasks well before deadlines, giving myself ample time to review my work.',
  'I feel the need to make to-do lists and check off tasks as I complete them.',
  'In team meetings or discussions, I frequently catch and remember points that others may forget.',
  'I prefer to work on one task at a time rather than juggling multiple tasks simultaneously.',
  'When learning a new task, I prefer step-by-step guidance and thorough explanations.',
  'I often spot inconsistencies in stories, articles, or reports that others might miss.',
  'Before making decisions, I gather all the necessary information and consider every detail.',
  "I feel uncomfortable if I don't get the chance to review my work multiple times.",
  'People often rely on me to catch mistakes or oversee quality checks because of my meticulous nature.'
]

const STAR_VALUES = [1, 2, 3, 4, 5]
const tooltipMeaning = {
  1: 'Almost never',
  2: 'Rarely',
  3: 'Occasionally',
  4: 'Often',
  5: 'Almost always'
}

// State
const ratings = ref(Array(questions.length).fill(0))
const hoverRatings = ref(Array(questions.length).fill(0))
const submitted = ref(false)
const isSubmitting = ref(false)
const scrolled = ref(false)
const highlightedIndex = ref(-1)
const questionRefs = ref([])

const STORAGE_KEY = 'premium_attention_assessment'

// Computed
const answeredCount = computed(() => ratings.value.filter(n => n > 0).length)
const allAnswered = computed(() => answeredCount.value === questions.length)
const completionPercent = computed(() => Math.round((answeredCount.value / questions.length) * 100))
const totalScore = computed(() => ratings.value.reduce((sum, n) => sum + n, 0))

const interpretation = computed(() => {
  const score = totalScore.value
  if (score >= 65) return 'Exceptional attention to detail — You demonstrate extraordinary precision and thoroughness in your work.'
  if (score >= 50) return 'Above-average attention to detail — You consistently notice important details and maintain high quality standards.'
  if (score >= 35) return 'Average attention to detail — You have a solid foundation with potential for further development.'
  return 'Below-average attention to detail — Consider implementing structured review processes to enhance your work quality.'
})

// Core functions
function setRating(questionIndex, value) {
  ratings.value[questionIndex] = value
  hoverRatings.value[questionIndex] = 0
  submitted.value = false
  saveDraft()

  // Visual feedback
  highlightedIndex.value = questionIndex
  setTimeout(() => { highlightedIndex.value = -1 }, 300)
}

async function setRatingAndMaybeAdvance(questionIndex, value) {
  setRating(questionIndex, value)

  if (window.innerWidth > 768) return
  const nextIndex = questionIndex + 1
  if (nextIndex >= questions.length) return

  await nextTick()
  if (questionRefs.value[nextIndex]) {
    questionRefs.value[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

async function submitAssessment() {
  if (!allAnswered.value || isSubmitting.value) {
    if (!allAnswered.value) {
      const firstUnanswered = ratings.value.findIndex(r => r === 0)
      if (questionRefs.value[firstUnanswered]) {
        questionRefs.value[firstUnanswered].scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    return
  }

  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  isSubmitting.value = false
  submitted.value = true
  localStorage.removeItem(STORAGE_KEY)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetAssessment() {
  if (!confirm('Are you sure you want to reset the assessment? All progress will be lost.')) return
  ratings.value = Array(questions.length).fill(0)
  hoverRatings.value = Array(questions.length).fill(0)
  submitted.value = false
  isSubmitting.value = false
  localStorage.removeItem(STORAGE_KEY)
}

function printResults() {
  window.print()
}

// Scroll handler for floating progress
function handleScroll() {
  scrolled.value = window.scrollY > 200
}

// Save/Load functions
function saveDraft() {
  if (!submitted.value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ratings: ratings.value
    }))
  }
}

function loadDraft() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      ratings.value = data.ratings || Array(questions.length).fill(0)
    } catch (e) {
      console.error('Failed to load draft', e)
    }
  }
}

// Auto-save
watch([ratings], () => {
  saveDraft()
}, { deep: true })

onMounted(() => {
  loadDraft()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
:root {
  --bg-deep: #0d1f5b;
  --bg-ocean: #005b88;
  --bg-teal: #0da8a8;
  --card-bg: rgba(8, 37, 84, 0.72);
  --card-border: rgba(156, 230, 233, 0.22);
  --accent-cyan: #9ce8ee;
  --text-soft: rgba(255, 255, 255, 0.82);
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.assessment-app {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 90%, rgba(245, 211, 40, 0.88) 0%, rgba(245, 211, 40, 0.3) 18%, transparent 38%),
    radial-gradient(circle at 28% 75%, rgba(111, 190, 72, 0.45) 0%, transparent 42%),
    radial-gradient(circle at 55% 16%, rgba(24, 194, 184, 0.46) 0%, transparent 44%),
    linear-gradient(120deg, var(--bg-deep) 0%, var(--bg-teal) 48%, var(--bg-ocean) 100%);
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 2rem;
  color: #ffffff;
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
  background: radial-gradient(circle at 30% 40%, rgba(153, 248, 252, 0.16) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(29, 130, 205, 0.16) 0%, transparent 60%);
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
  background: rgba(7, 39, 84, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 32px;
  padding: 0.8rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  border: 1px solid var(--card-border);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
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
  color: var(--accent-cyan);
  line-height: 1;
}

.stat-label {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-soft);
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.16);
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
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 4;
}

.progress-ring-fill {
  fill: none;
  stroke: url(#scoreGradient);
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
  color: var(--accent-cyan);
}

.assessment-card {
  border-radius: 48px;
  overflow: hidden;
  transition: all 0.5s ease;
}

.glass-card {
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--card-border);
  box-shadow: 0 24px 42px -16px rgba(0, 0, 0, 0.5);
}

.hero-header {
  padding: 3rem 3rem 2rem;
  margin: 1rem 1rem 0.6rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(6, 34, 76, 0.82), rgba(8, 52, 95, 0.72));
  border: 1px solid rgba(156, 230, 233, 0.28);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(156, 230, 233, 0.2);
  padding: 0.4rem 1rem;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--accent-cyan);
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.title-highlight {
  background: linear-gradient(135deg, #9ce8ee, #2fc8c8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.hero-description {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  max-width: 80%;
}

.likert-guide {
  display: flex;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid rgba(156, 230, 233, 0.22);
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.05);
}

.likert-item {
  flex: 1;
  text-align: center;
}

.likert-marker {
  height: 4px;
  background: rgba(156, 230, 233, 0.4);
  border-radius: 2px;
  margin-bottom: 0.5rem;
  position: relative;
}

.likert-stars {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: #f0b429;
  letter-spacing: 0.05em;
  margin-bottom: 0.35rem;
  text-shadow: 0 1px 5px rgba(240, 180, 41, 0.35);
}

.likert-label {
  font-size: 0.65rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  display: none;
}

@media (min-width: 768px) {
  .likert-label { display: block; }
}

.progress-section {
  padding: 1.5rem 3rem;
  background: rgba(5, 26, 63, 0.28);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  color: var(--text-soft);
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
  background: rgba(255, 255, 255, 0.16);
  border-radius: 100px;
  height: 8px;
  overflow: hidden;
}

.rating-buttons {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 0.8rem;
}

.rating-btn {
  position: relative;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.rating-btn:hover {
  transform: translateY(-2px) scale(1.06);
}

.rating-star {
  width: 100%;
  height: 100%;
  fill: #cad9e6;
  stroke: #5d7c96;
  stroke-width: 0.6;
  transition: all 0.2s ease;
}

.rating-btn.active .rating-star {
  fill: #f3bd2f;
  stroke: #de9f00;
  filter: drop-shadow(0 2px 6px rgba(243, 189, 47, 0.45));
}

.rating-tooltip {
  position: absolute;
  left: 50%;
  bottom: 110%;
  transform: translateX(-50%);
  background: #0f4567;
  color: #ffffff;
  padding: 0.3rem 0.45rem;
  border-radius: 0.4rem;
  font-size: 0.62rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.rating-btn:hover .rating-tooltip,
.rating-btn:focus-visible .rating-tooltip {
  opacity: 1;
}

.submission-section {
  margin-top: 1.6rem;
  padding: 1.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 1rem;
  background: rgba(6, 30, 69, 0.32);
  display: grid;
  gap: 0.9rem;
}

.submission-copy {
  text-align: center;
  margin-bottom: 0.95rem;
}

.submission-title {
  font-size: 1.02rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.01em;
}

.submission-note {
  margin-top: 0.28rem;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.btn-primary {
  border: none;
  border-radius: 14px;
  padding: 0.9rem 1.35rem;
  min-width: 240px;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  background: linear-gradient(135deg, #1591c8 0%, #0b6fa2 55%, #0a557f 100%);
  box-shadow:
    0 12px 22px rgba(18, 100, 146, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
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
  box-shadow:
    0 16px 28px rgba(18, 100, 146, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  filter: saturate(1.08);
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

.results-panel {
  margin: 1.8rem clamp(1rem, 2.5vw, 2rem) 1.1rem;
  padding: 1.4rem clamp(1rem, 2vw, 1.6rem);
  border: 1px solid rgba(156, 230, 233, 0.24);
  border-radius: 1rem;
  background: rgba(6, 30, 69, 0.35);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.25);
}

.results-header {
  text-align: center;
}

.score-section,
.interpretation-card {
  margin-top: 1rem;
}

.score-metrics {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.9rem;
  margin-top: 0.7rem;
}

.metric-divider {
  width: 1px;
  height: 2rem;
  background: rgba(255, 255, 255, 0.2);
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.btn-outline {
  border: 1px solid rgba(156, 230, 233, 0.38);
  background: rgba(8, 43, 86, 0.32);
  color: #e7fbff;
  border-radius: 0.75rem;
  padding: 0.62rem 0.95rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.btn-outline:hover {
  background: rgba(15, 73, 123, 0.44);
  transform: translateY(-1px);
}

.spinner {
  animation: spin 0.85s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
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
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  background: rgba(5, 26, 63, 0.28);
  padding: 1rem 1rem 1.1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.question-item:hover {
  transform: translateY(-1px);
  border-color: rgba(156, 230, 233, 0.28);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
}

.question-item.answered {
  border-color: rgba(156, 230, 233, 0.36);
}

.question-item.highlighted {
  outline: 2px solid rgba(156, 230, 233, 0.42);
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
  color: #0f4a70;
  background: linear-gradient(135deg, #d2f8fb, #9ce8ee);
}

.question-text {
  line-height: 1.55;
  color: #ffffff;
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

  .likert-guide {
    gap: 0.35rem;
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

  .rating-buttons {
    gap: 0.35rem;
  }

  .rating-btn {
    width: 2rem;
    height: 2rem;
  }

  .submission-section {
    padding: 1rem 0.85rem;
  }

  .btn-primary {
    width: 100%;
    min-width: 0;
  }

  .results-panel {
    margin: 1.2rem 0.75rem 0.75rem;
  }

  .score-metrics {
    flex-direction: column;
    gap: 0.45rem;
  }

  .metric-divider {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .question-item,
  .rating-btn,
  .btn-primary,
  .btn-outline {
    transition: none !important;
  }
}

</style>
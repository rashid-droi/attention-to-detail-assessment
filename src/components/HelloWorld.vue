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

        <!-- User Information Section -->
        <div class="user-info-section">
          <div class="input-group">
            <label for="username">Full Name <span class="required">*</span></label>
            <input id="username" type="text" v-model="username" placeholder="Enter your full name" class="premium-input" />
          </div>
          <div class="input-group">
            <label for="email">Email Address <span class="optional">(Optional)</span></label>
            <input id="email" type="email" v-model="email" placeholder="Enter your email address" class="premium-input" />
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
            <button class="btn-primary" :class="{ 'loading': isSubmitting }" :disabled="isSubmitting"
              @click="submitAssessment" v-if="!isSuccess">
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

            <button class="btn-primary success-btn" :class="{ 'loading': isPdfGenerating }" :disabled="isPdfGenerating"
              @click="generatePDF" v-if="isSuccess">
              <span v-if="!isPdfGenerating">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Download PDF Report
              </span>
              <span v-else>
                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" />
                </svg>
                Generating PDF...
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
              <p class="interpretation-note">{{ interpretationNote }}</p>
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

            <div class="pdf-preview-panel" v-if="isSuccess">
              <h3 class="pdf-preview-title">PDF Preview</h3>
              <p class="pdf-preview-subtitle">Your generated report preview is shown below.</p>
              <div class="pdf-preview-frame-wrap">
                <div v-if="isPdfPreviewLoading" class="pdf-preview-loading">Generating preview...</div>
                <iframe
                  v-else-if="pdfPreviewUrl"
                  :src="pdfPreviewUrl"
                  class="pdf-preview-frame"
                  title="Assessment PDF preview"
                ></iframe>
                <div v-else class="pdf-preview-loading">Preview unavailable. Please click Download PDF Report.</div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Hidden PDF Report Template -->
    <div id="pdf-report-template" style="display: none;">
      <div class="hatters-pdf-wrapper">
        <div class="pdf-header">
          <h1 class="pdf-brand">Hatters</h1>
          <h2 class="pdf-doc-title">Assessment Report</h2>
          <div class="pdf-header-divider"></div>
        </div>

        <div class="pdf-meta">
          <p><strong>Username:</strong> {{ username }}</p>
          <p v-if="email"><strong>Email:</strong> {{ email }}</p>
          <p><strong>Date & Time:</strong> {{ new Date().toLocaleString() }}</p>
        </div>

        <div class="pdf-metrics-box">
          <div class="pdf-metric">
            <h3>Assessment Score</h3>
            <div class="pdf-score-highlight">{{ totalScore }} <span class="pdf-score-max">/ {{ questions.length * 5 }}</span></div>
          </div>
          
          <div class="pdf-metric">
            <h3>Star Rating</h3>
            <div class="pdf-stars">
              <span v-for="n in 5" :key="n" class="pdf-star" :class="{'filled': n <= Math.round(totalScore / questions.length)}">★</span>
            </div>
          </div>
        </div>

        <div class="pdf-interpretation-box">
          <h3>Analysis Result</h3>
          <p class="pdf-main-interpretation">{{ interpretation }}</p>
          <p class="pdf-interpretation-note">{{ interpretationNote }}</p>
        </div>

        <div class="pdf-score-interpretation">
          <h3>Score interpretation</h3>
          <table class="pdf-interpretation-table" aria-label="Score interpretation guide">
            <tbody>
              <tr v-for="row in scoreInterpretationRows" :key="row.range">
                <td class="pdf-range-cell">{{ row.range }}</td>
                <td class="pdf-detail-cell">
                  <p class="pdf-level-title">{{ row.title }}</p>
                  <p class="pdf-level-description">{{ row.description }}</p>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="pdf-score-interpretation-note">{{ interpretationNote }}</p>
        </div>

        <div class="pdf-footer">
          <p>Generated securely by Hatters Assessment Platform</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import html2pdf from 'html2pdf.js'
import axios from 'axios'

const runtimeApiBaseUrl = `${window.location.protocol}//${window.location.hostname}:8000`
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || runtimeApiBaseUrl).replace(/\/$/, '')

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
const username = ref('')
const email = ref('')
const isPdfGenerating = ref(false)
const isPdfPreviewLoading = ref(false)
const isSuccess = ref(false)
const submitted = ref(false)
const isSubmitting = ref(false)
const scrolled = ref(false)
const highlightedIndex = ref(-1)
const questionRefs = ref([])
const pdfPreviewUrl = ref('')

const STORAGE_KEY = 'premium_attention_assessment'

// Computed
const answeredCount = computed(() => ratings.value.filter(n => n > 0).length)
const allAnswered = computed(() => answeredCount.value === questions.length)
const completionPercent = computed(() => Math.round((answeredCount.value / questions.length) * 100))
const totalScore = computed(() => ratings.value.reduce((sum, n) => sum + n, 0))

const interpretation = computed(() => {
  const score = totalScore.value
  if (score >= 65) return 'Exceptional attention to detail. You have a keen eye for specifics and rarely overlook even the minutest details.'
  if (score >= 50) return 'Above-average attention to detail. You are generally meticulous, but there may be occasional lapses.'
  if (score >= 35) return "Average attention to detail. While you catch many details, there's room for improvement in certain scenarios."
  return 'Below-average attention to detail. You might miss out on certain details; consider strategies to enhance your focus and thoroughness.'
})

const interpretationNote = 'Remember, this quiz provides a general indication and might not capture all nuances of an individual\'s attention to detail. Regular feedback, reflection, and training can help improve this skill over time.'
const scoreInterpretationRows = [
  {
    range: '65-75',
    title: 'Exceptional attention to detail.',
    description: 'You have a keen eye for specifics and rarely overlook even the minutest details.'
  },
  {
    range: '50-64',
    title: 'Above-average attention to detail.',
    description: 'You are generally meticulous, but there may be occasional lapses.'
  },
  {
    range: '35-49',
    title: 'Average attention to detail.',
    description: "While you catch many details, there's room for improvement in certain scenarios."
  },
  {
    range: '15-34',
    title: 'Below-average attention to detail.',
    description: 'You might miss out on certain details; consider strategies to enhance your focus and thoroughness.'
  }
]

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
  if (!username.value.trim()) {
    alert('Please enter your Full Name before submitting.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  if (!allAnswered.value) {
    alert(`Please complete all ${questions.length} questions before submitting.`)
    return
  }
  
  isSubmitting.value = true
  
  try {
    const averageRating = Math.round(totalScore.value / questions.length)
    const payload = {
      username: username.value,
      email: email.value || null,
      score: totalScore.value,
      rating: averageRating
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
    
    // Clear the draft from local storage since it's now submitted
    localStorage.removeItem(STORAGE_KEY)
    
    // Feedback to let user know it succeeded
    isSuccess.value = true
    submitted.value = true
    await nextTick()
    await generatePdfPreview()
    alert('Assessment data submitted successfully! You can now download your PDF report.')
    
  } catch (error) {
    console.error(
      'Assessment submission failed:',
      error?.response?.data || error?.message || error
    )
    alert('There was an error submitting your assessment. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

async function generatePdfPreview() {
  isPdfPreviewLoading.value = true
  try {
    const element = document.getElementById('pdf-report-template')
    if (!element) return

    element.style.display = 'block'

    const opt = {
      margin: 0.5,
      filename: `Hatters_Assessment_Report_${username.value.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    }

    const worker = html2pdf().set(opt).from(element).toPdf()
    const pdf = await worker.get('pdf')
    const blobUrl = pdf.output('bloburl')

    if (pdfPreviewUrl.value) {
      URL.revokeObjectURL(pdfPreviewUrl.value)
    }
    pdfPreviewUrl.value = blobUrl
    element.style.display = 'none'
  } catch (error) {
    console.error('Error generating PDF preview:', error)
    if (document.getElementById('pdf-report-template')) {
      document.getElementById('pdf-report-template').style.display = 'none'
    }
  } finally {
    isPdfPreviewLoading.value = false
  }
}

function resetAssessment() {
  if (!confirm('Are you sure you want to reset the assessment? All progress will be lost.')) return
  ratings.value = Array(questions.length).fill(0)
  hoverRatings.value = Array(questions.length).fill(0)
  username.value = ''
  email.value = ''
  submitted.value = false
  isSuccess.value = false
  isSubmitting.value = false
  localStorage.removeItem(STORAGE_KEY)
}

async function generatePDF() {
  isPdfGenerating.value = true
  try {
    const element = document.getElementById('pdf-report-template')
    element.style.display = 'block'
    
    const opt = {
      margin:       0.5,
      filename:     `Hatters_Assessment_Report_${username.value.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] }
    }
    
    await html2pdf().set(opt).from(element).save()
    element.style.display = 'none'
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Failed to generate PDF. Please try again.')
    if (document.getElementById('pdf-report-template')) {
      document.getElementById('pdf-report-template').style.display = 'none'
    }
  } finally {
    isPdfGenerating.value = false
  }
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
      ratings: ratings.value,
      username: username.value,
      email: email.value
    }))
  }
}

function loadDraft() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      ratings.value = data.ratings || Array(questions.length).fill(0)
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
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value)
  }
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
  background: transparent;
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
  outline: none;
  border-radius: 14px;
  padding: 0.9rem 1.35rem;
  min-width: 240px;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  background: rgb(10 50 91);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
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
  background: #17365a;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
  filter: none;
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

.pdf-preview-panel {
  margin-top: 1.2rem;
  border: 1px solid #dbeafe;
  background: #ffffff;
  border-radius: 0.9rem;
  padding: 0.9rem;
}

.pdf-preview-title {
  font-size: 1rem;
  color: #1e3a8a;
  margin-bottom: 0.2rem;
}

.pdf-preview-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.7rem;
}

.pdf-preview-frame-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 0.7rem;
  overflow: hidden;
  min-height: 420px;
  background: #f8fafc;
}

.pdf-preview-frame {
  width: 100%;
  height: 420px;
  border: 0;
  background: #ffffff;
}

.pdf-preview-loading {
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-weight: 600;
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

/* User Info Section */
.user-info-section {
  padding: 1.5rem 3rem;
  margin: 0 1rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  border-radius: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #9ce8ee;
  letter-spacing: 0.02em;
}

.input-group .required {
  color: #ff6b6b;
}

.input-group .optional {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  font-weight: 400;
}

.premium-input {
  background: rgba(4, 20, 48, 0.6);
  border: 1px solid rgba(156, 230, 233, 0.2);
  border-radius: 12px;
  padding: 0.9rem 1.2rem;
  color: #ffffff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.premium-input:focus {
  border-color: #9ce8ee;
  box-shadow: 0 0 0 3px rgba(156, 230, 233, 0.15);
}

.premium-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.success-btn {
  background: #006D77;
}

.success-btn:hover {
  background: #00818a;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

/* PDF Template Styles */
.hatters-pdf-wrapper {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  padding: 24px 28px;
  background: #ffffff;
  color: #1a1a1a;
}
.pdf-header {
  text-align: center;
  margin-bottom: 14px;
}
.pdf-brand {
  font-size: 24px;
  font-weight: 900;
  color: #111827;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0 0 10px 0;
}
.pdf-doc-title {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.pdf-header-divider {
  width: 60px;
  height: 3px;
  background: #3b82f6;
  margin: 10px auto 0;
  border-radius: 2px;
}
.pdf-meta {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-left: 4px solid #3b82f6;
  border-radius: 0 8px 8px 0;
}
.pdf-meta p {
  margin: 4px 0;
  font-size: 11px;
  color: #374151;
}
.pdf-meta strong {
  color: #111827;
  display: inline-block;
  width: 76px;
}
.pdf-metrics-box {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.pdf-metric {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 10px;
  text-align: center;
  background: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.pdf-metric h3 {
  margin: 0 0 8px 0;
  font-size: 11px;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 1px;
}
.pdf-score-highlight {
  font-size: 26px;
  font-weight: 800;
  color: #3b82f6;
  line-height: 1;
}
.pdf-score-max {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
}
.pdf-stars {
  font-size: 20px;
  line-height: 1.5;
}
.pdf-star {
  color: #e5e7eb;
}
.pdf-star.filled {
  color: #fbbf24;
}
.pdf-interpretation-box {
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
  margin-bottom: 8px;
}
.pdf-interpretation-box h3 {
  font-size: 13px;
  color: #111827;
  margin: 0 0 10px 0;
}
.pdf-interpretation-box p {
  font-size: 10.5px;
  line-height: 1.35;
  color: #4b5563;
  margin: 0;
}

.pdf-main-interpretation {
  font-size: 12px !important;
  font-weight: 700;
  color: #111827 !important;
  line-height: 1.45;
}

.interpretation-note {
  margin-top: 0.65rem;
  font-size: 0.84rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.78);
}

.pdf-interpretation-note {
  margin-top: 5px !important;
  font-size: 10px !important;
  color: #6b7280 !important;
}

.pdf-score-interpretation {
  margin-top: 0;
  margin-bottom: 8px;
}

.pdf-score-interpretation h3 {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  margin: 0 0 6px 0;
}

.pdf-interpretation-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #c8b85f;
}

.pdf-interpretation-table tr:not(:last-child) {
  border-bottom: 1px solid #c8b85f;
}

.pdf-range-cell {
  width: 56px;
  font-size: 10px;
  font-weight: 700;
  color: #111827;
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid #c8b85f;
  padding: 7px 6px;
}

.pdf-detail-cell {
  padding: 7px 8px;
}

.pdf-level-title {
  margin: 0 0 2px 0;
  font-size: 10.5px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.pdf-level-description {
  margin: 0;
  font-size: 10px;
  color: #1f2937;
  line-height: 1.3;
}

.pdf-score-interpretation-note {
  margin-top: 6px;
  font-size: 10px;
  line-height: 1.35;
  color: #111827;
}
.pdf-footer {
  text-align: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 9px;
  color: #9ca3af;
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
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
        <header
          class="gf-title-block"
          data-aos="fade-down"
          data-aos-duration="680"
          :data-aos-easing="AOS_EASING"
        >
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
        <div
          class="user-info-section gf-form-section"
          data-aos="fade-up"
          data-aos-delay="50"
          data-aos-duration="700"
          :data-aos-easing="AOS_EASING"
        >
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
        <section
          class="mcq-instructions-panel gf-form-section"
          aria-labelledby="mcq-instructions-heading"
          data-aos="fade-up"
          data-aos-delay="80"
          data-aos-duration="700"
          :data-aos-easing="AOS_EASING"
        >
          <h2 id="mcq-instructions-heading" class="mcq-instructions-title gf-section-title">How this scale works</h2>
          <p class="mcq-instructions-lead">
            Each question lists these five choices. Tap or click one option—the column of dots counts points on the scale (one dot&nbsp;=&nbsp;1 point, up to five); the wording describes how often it applies to you.
          </p>
          <dl class="mcq-scale-reference">
            <template v-for="val in SCALE_VALUES" :key="val">
              <dt class="mcq-scale-points">
                <span class="sr-only">{{ pointsLabel(val) }}</span>
                <span class="mcq-dots" aria-hidden="true">
                  <span v-for="n in val" :key="n" class="mcq-dot" />
                </span>
              </dt>
              <dd class="mcq-scale-label">{{ tooltipMeaning[val] }}</dd>
            </template>
          </dl>
        </section>

        <div class="gf-divider gf-divider--muted" aria-hidden="true" />

        <!-- Questions Section -->
        <ol class="questions-section" aria-label="Assessment questions">
          <li v-for="(question, qIndex) in questions" :key="qIndex"
            class="question-item gf-form-section gf-question-card"
            :class="{ 'answered': ratings[qIndex] > 0, 'highlighted': highlightedIndex === qIndex }"
            :style="{ '--gf-q-index': qIndex }"
            :ref="el => { if (el) questionRefs[qIndex] = el }"
            data-aos="fade-up"
            :data-aos-delay="aosDelayPerQuestion(qIndex)"
            data-aos-duration="650"
            :data-aos-easing="AOS_EASING"
          >
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

            <fieldset class="mcq-options gf-mcq-fieldset" :aria-labelledby="'question-text-' + qIndex">
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
                    @change="setRatingAndMaybeAdvance(qIndex, value)"
                  />
                  <span class="gf-radio-face" aria-hidden="true" />
                  <span class="mcq-option-card gf-option-body">
                    <span class="sr-only">{{ pointsLabel(value) }}.</span>
                    <span class="mcq-option-points" aria-hidden="true">
                      <span class="mcq-dots">
                        <span v-for="n in value" :key="n" class="mcq-dot" />
                      </span>
                    </span>
                    <span class="mcq-option-caption">{{ tooltipMeaning[value] }}</span>
                  </span>
                </label>
              </div>
            </fieldset>

            <div v-if="qIndex < questions.length - 1" class="gf-divider gf-divider--inset" aria-hidden="true" />
          </li>
        </ol>

        <!-- Submit row -->
        <div
          v-if="!submitted"
          class="submission-section gf-submit-band"
          data-aos="fade-up"
          data-aos-delay="100"
          data-aos-duration="700"
          :data-aos-easing="AOS_EASING"
        >
          <div class="submission-copy">
            <p class="submission-title">Submit</p>
            <p class="submission-note">
              {{ answeredCount }} of {{ questions.length }} questions answered. Answer every required question to submit.
            </p>
          </div>
          <div class="action-buttons gf-submit-actions">
            <button type="button" class="btn-primary gf-submit-btn" :class="{ 'loading': isSubmitting }" :disabled="isSubmitting"
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

            <button class="btn-primary success-btn gf-submit-btn gf-btn-secondary" type="button" :class="{ 'loading': isPdfGenerating }" :disabled="isPdfGenerating"
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
          <div v-if="submitted" class="results-panel gf-results-sheet">
            <div
              class="results-header gf-results-header"
              data-aos="fade-down"
              data-aos-duration="640"
              :data-aos-easing="AOS_EASING"
            >
              <h2>Assessment Complete</h2>
              <p class="results-subtitle">Attention to Detail Assessment Results</p>
            </div>

            <div
              class="score-section"
              data-aos="fade-up"
              data-aos-delay="60"
              data-aos-duration="680"
              :data-aos-easing="AOS_EASING"
            >
              <div class="score-headline" aria-live="polite">
                <span class="score-number">{{ totalScore }}</span>
                <span class="score-max">/ 75</span>
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

            <div
              class="interpretation-card"
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="680"
              :data-aos-easing="AOS_EASING"
            >
              <div class="interpretation-badge">Analysis Result</div>
              <p class="interpretation-text">{{ interpretation }}</p>
              <p class="interpretation-note">{{ interpretationNote }}</p>
              <div class="interpretation-bars">
                <div class="bar" :style="{ width: '100%' }" data-level="excellent"></div>
                <div class="bar" :style="{ width: totalScore >= 50 ? '100%' : '0%' }" data-level="above"></div>
                <div class="bar" :style="{ width: totalScore >= 35 ? '100%' : '0%' }" data-level="average"></div>
              </div>
            </div>

            <div
              class="results-actions"
              data-aos="fade-up"
              data-aos-delay="140"
              data-aos-duration="650"
              :data-aos-easing="AOS_EASING"
            >
              <button class="btn-outline" @click="resetAssessment">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                New Assessment
              </button>
              <button type="button" class="btn-outline gf-results-pdf-btn" :class="{ loading: isPdfGenerating }" :disabled="isPdfGenerating"
                @click="generatePDF" :aria-busy="isPdfGenerating">
                <span v-if="!isPdfGenerating">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  Download PDF
                </span>
                <span v-else>
                  <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" />
                  </svg>
                  Generating PDF...
                </span>
              </button>
            </div>

            <div
              class="pdf-preview-panel"
              v-if="isSuccess"
              data-aos="zoom-in"
              data-aos-delay="80"
              data-aos-duration="720"
              :data-aos-easing="AOS_EASING"
            >
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
            <h3>Average points</h3>
            <div class="pdf-points-value">
              {{ averagePointsPerQuestion }}<span class="pdf-score-max"> / 5</span>
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
import AOS from 'aos'
import html2pdf from 'html2pdf.js'
import axios from 'axios'

const AOS_EASING = 'ease-out-cubic'

function aosShouldDisable() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function aosDelayPerQuestion(qIndex, step = 32, base = 64, max = 420) {
  return Math.min(base + qIndex * step, max)
}

function refreshAos() {
  nextTick(() => {
    requestAnimationFrame(() => {
      AOS.refresh()
    })
  })
}

// Prefer VITE_API_BASE_URL=http://HOST:PORT. Else use VITE_API_PORT (defaults to 8000).
const runtimeApiBaseUrl = `${window.location.protocol}//${window.location.hostname}:${import.meta.env.VITE_API_PORT ?? '8000'}`
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

// State
const ratings = ref(Array(questions.length).fill(0))
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
const averagePointsPerQuestion = computed(() =>
  questions.length ? (totalScore.value / questions.length).toFixed(1) : '0'
)

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
    
    // Clear the draft from local storage since it's now submitted
    localStorage.removeItem(STORAGE_KEY)
    
    // Feedback to let user know it succeeded
    isSuccess.value = true
    submitted.value = true
    await nextTick()
    await generatePdfPreview()
    alert('Assessment data submitted successfully! You can now download your PDF report.')
    
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

watch(submitted, () => {
  refreshAos()
})

watch(isSuccess, () => {
  refreshAos()
})

onMounted(() => {
  loadDraft()
  AOS.init({
    duration: 720,
    easing: AOS_EASING,
    once: true,
    offset: 48,
    anchorPlacement: 'top-bottom',
    disable: aosShouldDisable()
  })
  refreshAos()
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

.mcq-scale-reference {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.45rem 1.25rem;
  margin: 0.9rem 0 0;
  align-items: center;
}

.mcq-scale-points {
  margin: 0;
  min-width: 4.75rem;
}

.mcq-dots {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.mcq-dot {
  width: 0.52rem;
  height: 0.52rem;
  border-radius: 50%;
  background: var(--brand-teal);
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 43, 92, 0.12);
}

.mcq-scale-points .mcq-dot {
  width: 0.56rem;
  height: 0.56rem;
}

.mcq-scale-label {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
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

.mcq-option-points {
  min-width: 4.75rem;
  display: flex;
  align-items: center;
}

.mcq-option-caption {
  font-size: 0.84rem;
  font-weight: 600;
  color: #0f172a;
}

.mcq-option--selected .mcq-option-caption {
  color: var(--brand-navy);
}

.mcq-option--selected .mcq-dot {
  background: var(--brand-navy);
  box-shadow: 0 0 0 1px rgba(0, 168, 168, 0.35);
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

.results-panel {
  margin: 1.8rem clamp(1rem, 2.5vw, 2rem) 1.1rem;
  padding: 1.4rem clamp(1rem, 2vw, 1.6rem);
  border: 1px solid rgba(0, 139, 139, 0.18);
  border-radius: 1.15rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 253, 250, 0.5) 100%);
  box-shadow:
    0 16px 40px rgba(0, 43, 92, 0.07),
    0 0 0 1px rgba(240, 228, 0, 0.08);
}

.results-header {
  text-align: center;
}

.results-header h2 {
  color: var(--text-primary);
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 0.35rem;
}

.results-subtitle {
  color: var(--text-muted);
  font-size: 0.92rem;
  font-weight: 500;
}

.score-section {
  margin-top: 1rem;
}

.interpretation-card {
  margin-top: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 0.95rem;
  border: 1px solid rgba(0, 139, 139, 0.22);
  background: rgba(255, 253, 240, 0.55);
  box-shadow: 0 2px 14px rgba(0, 43, 92, 0.06);
}

.interpretation-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--brand-navy);
  margin-bottom: 0.65rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: rgba(212, 245, 243, 0.75);
  border: 1px solid rgba(0, 139, 139, 0.22);
}

.interpretation-text {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.58;
  font-weight: 600;
  color: var(--text-primary);
}

.interpretation-bars {
  display: flex;
  gap: 0.35rem;
  margin-top: 0.85rem;
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.06);
}

.interpretation-bars .bar {
  flex: 1;
  min-height: 100%;
  border-radius: inherit;
}

.interpretation-bars .bar[data-level='excellent'] {
  background: linear-gradient(90deg, var(--brand-teal), var(--brand-lime));
}

.interpretation-bars .bar[data-level='above'] {
  background: linear-gradient(90deg, var(--brand-navy), var(--brand-teal));
}

.interpretation-bars .bar[data-level='average'] {
  background: linear-gradient(90deg, var(--brand-yellow), #bfb300);
}

.score-headline {
  text-align: center;
  margin-bottom: 0.35rem;
}

.score-headline .score-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--accent-cyan);
  letter-spacing: -0.02em;
}

.score-headline .score-max {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-left: 0.2rem;
}

.score-metrics {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.9rem;
  margin-top: 0.7rem;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--accent-teal);
  line-height: 1.2;
}

.metric-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.metric-divider {
  width: 1px;
  height: 2rem;
  background: linear-gradient(180deg, transparent, rgba(0, 139, 139, 0.25), transparent);
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
  border: 1px solid rgba(0, 139, 139, 0.22);
  background: #ffffff;
  border-radius: 0.9rem;
  padding: 0.9rem;
}

.pdf-preview-title {
  font-size: 1rem;
  color: var(--brand-navy);
  margin-bottom: 0.2rem;
}

.pdf-preview-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.7rem;
}

.pdf-preview-frame-wrap {
  border: 1px solid rgba(0, 43, 92, 0.1);
  border-radius: 0.7rem;
  overflow: hidden;
  min-height: 420px;
  background: rgba(248, 252, 251, 0.85);
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
  border: 1px solid rgba(0, 139, 139, 0.35);
  background: rgba(255, 255, 255, 0.9);
  color: var(--accent-teal);
  border-radius: 0.75rem;
  padding: 0.62rem 0.95rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.btn-outline:hover {
  background: rgba(204, 251, 241, 0.55);
  border-color: rgba(0, 139, 139, 0.5);
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

  .mcq-scale-reference {
    gap: 0.35rem 0.85rem;
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

  .mcq-option-points {
    min-width: 4.25rem;
  }

  .mcq-dots {
    gap: 0.24rem;
  }

  .mcq-dot {
    width: 0.46rem;
    height: 0.46rem;
  }

  .mcq-scale-points .mcq-dot {
    width: 0.5rem;
    height: 0.5rem;
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

.success-btn {
  background: linear-gradient(135deg, var(--brand-cyan) 0%, #006f6f 44%, var(--brand-navy) 100%);
  box-shadow: 0 4px 14px rgba(0, 139, 139, 0.32);
}

.success-btn:hover {
  filter: brightness(1.06);
  box-shadow: 0 6px 18px rgba(0, 139, 139, 0.4);
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
  background: linear-gradient(
    90deg,
    var(--brand-navy),
    var(--brand-teal) 38%,
    var(--brand-cyan) 62%,
    var(--brand-lime) 82%,
    var(--brand-yellow)
  );
  margin: 10px auto 0;
  border-radius: 2px;
}
.pdf-meta {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-left: 4px solid var(--brand-cyan);
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
  color: var(--brand-cyan);
  line-height: 1;
}
.pdf-score-max {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
}
.pdf-points-value {
  font-size: 26px;
  font-weight: 800;
  color: var(--brand-cyan);
  line-height: 1.2;
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
  color: var(--text-muted);
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
  border: 1px solid rgba(0, 139, 139, 0.35);
}

.pdf-interpretation-table tr:not(:last-child) {
  border-bottom: 1px solid rgba(0, 139, 139, 0.28);
}

.pdf-range-cell {
  width: 56px;
  font-size: 10px;
  font-weight: 700;
  color: #111827;
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid rgba(0, 139, 139, 0.28);
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
  border-radius: 999px;
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
}

.gf-forms .mcq-instructions-panel::before {
  display: none;
}

.gf-forms .mcq-instructions-lead {
  font-size: 0.8125rem !important;
  line-height: 1.58 !important;
}

.gf-forms .mcq-scale-reference {
  margin-top: 0.65rem;
  padding: 0.75rem 0.9rem;
  background: #f8faf9;
  border: 1px solid #eceff1;
  border-radius: var(--gf-radius-sm);
  transition:
    border-color 0.25s ease,
    box-shadow 0.3s var(--gf-motion-ease-out);
}

.gf-forms .mcq-instructions-panel:hover .mcq-scale-reference {
  border-color: rgba(0, 139, 139, 0.22);
  box-shadow: 0 2px 10px rgba(0, 43, 92, 0.05);
}

.gf-forms .mcq-scale-label {
  font-size: 0.8125rem !important;
  font-weight: 500 !important;
  line-height: 1.45;
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
  border-radius: 999px;
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

.result-appear-enter-active {
  transition:
    opacity 0.55s var(--gf-motion-ease-out),
    transform 0.62s var(--gf-motion-ease-out);
}

.result-appear-enter-from {
  opacity: 0;
  transform: translateY(18px);
}

.result-appear-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.24s ease;
}

.result-appear-leave-to {
  opacity: 0;
  transform: translateY(10px);
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

/* Invisible input covers the entire row so dots, text, and whitespace are all clickable */
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

.gf-forms .gf-radio-face {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  margin-top: 0.38rem;
  border-radius: 50%;
  pointer-events: none;
  background: #ffffff;
  box-shadow:
    inset 0 0 0 1px rgba(0, 43, 92, 0.08),
    0 0 0 2px rgba(0, 139, 139, 0.5);
  transform: scale(1);
  transition:
    box-shadow 0.2s var(--gf-motion-ease-out),
    background 0.18s ease,
    transform 0.22s var(--gf-motion-spring);
}

.gf-forms .gf-radio-hit:checked ~ .gf-radio-face {
  box-shadow:
    inset 0 0 0 1px rgba(0, 43, 92, 0.1),
    0 0 0 2px var(--brand-teal);
  transform: scale(1.04);
}

.gf-forms .gf-radio-face::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--brand-cyan), var(--brand-teal) 55%, var(--brand-navy));
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.65);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.35);
  transition:
    opacity 0.18s ease,
    transform 0.3s var(--gf-motion-spring);
}

.gf-forms .gf-radio-hit:checked ~ .gf-radio-face::after {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.gf-forms .gf-option-row:focus-within .gf-radio-face {
  box-shadow:
    inset 0 0 0 1px rgba(0, 43, 92, 0.08),
    0 0 0 2px var(--brand-teal),
    0 0 0 5px rgba(0, 168, 168, 0.35);
}

.gf-forms .gf-radio-hit:focus-visible ~ .gf-radio-face {
  box-shadow:
    inset 0 0 0 1px rgba(0, 43, 92, 0.08),
    0 0 0 2px var(--brand-cyan),
    0 0 0 5px rgba(0, 168, 168, 0.42);
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

/* Scale dots: white “points” with brand ring (stays readable on hover rows) */
.gf-forms .gf-option-row .mcq-option-points .mcq-dot {
  background: #ffffff !important;
  box-shadow:
    0 0 0 1.5px var(--brand-teal),
    0 1px 3px rgba(0, 43, 92, 0.06) !important;
  transform: scale(1);
  transition:
    box-shadow 0.24s var(--gf-motion-ease-out),
    transform 0.26s var(--gf-motion-spring);
}

.gf-forms .gf-radio-hit:checked ~ .mcq-option-card .mcq-dot {
  box-shadow:
    0 0 0 2px var(--brand-navy),
    inset 0 0 0 1px rgba(0, 139, 139, 0.2) !important;
  transform: scale(1.08);
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

.gf-forms .gf-btn-secondary.btn-primary.success-btn {
  min-height: 44px !important;
  padding: 0 1.5rem !important;
  background: #fff !important;
  background-image: none !important;
  color: var(--brand-navy) !important;
  border: 1px solid rgba(0, 139, 139, 0.42) !important;
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.1) !important;
}

.gf-forms .gf-btn-secondary.btn-primary.success-btn:hover {
  filter: none !important;
  background: rgba(0, 168, 168, 0.08) !important;
}

.gf-forms .gf-btn-secondary.btn-primary.success-btn:active {
  background: rgba(0, 168, 168, 0.12) !important;
}

@media (max-width: 560px) {
  .gf-forms .gf-submit-actions.action-buttons .btn-primary {
    width: 100%;
    justify-content: center;
  }
}

.gf-forms .results-panel.gf-results-sheet {
  margin: 1rem clamp(1.05rem, 3vw, 1.65rem) 1.75rem !important;
  border-radius: var(--gf-radius) !important;
  border: 1px solid var(--gf-line) !important;
  box-shadow:
    0 1px 2px rgba(60, 64, 67, 0.1),
    0 4px 12px rgba(60, 64, 67, 0.05);
  padding-bottom: 0.25rem;
}

.gf-forms .results-header h2 {
  font-size: 1.3125rem !important;
  font-weight: 600 !important;
  color: var(--gf-ink) !important;
  letter-spacing: -0.02em;
}

.gf-forms .gf-results-header .results-subtitle {
  font-size: 0.875rem !important;
}

.gf-forms .results-actions {
  gap: 0.5rem;
}

.gf-forms .btn-outline:focus-visible {
  outline: 2px solid var(--brand-cyan);
  outline-offset: 2px;
}

.gf-forms .gf-results-pdf-btn.loading {
  pointer-events: none;
  opacity: 0.85;
}

.gf-forms .pdf-preview-panel {
  border-radius: 8px !important;
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
  .btn-outline,
  .gf-sticky-progress-fill,
  .gf-sticky-progress {
    transition: none !important;
  }

  .gf-forms .gf-sheet.assessment-card,
  .gf-sticky-progress {
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

  .gf-forms .gf-radio-face,
  .gf-forms .gf-radio-face::after,
  .gf-forms .gf-option-row .mcq-option-points .mcq-dot {
    transition: none !important;
  }

  .gf-forms .gf-submit-btn.btn-primary:not(:disabled):hover,
  .gf-forms .gf-submit-btn.btn-primary:not(:disabled):active {
    transform: none !important;
  }

  .gf-chip-enter-active,
  .gf-chip-leave-active,
  .result-appear-enter-active,
  .result-appear-leave-active {
    transition: none !important;
  }
}
</style>

<style>
/* AOS: ensure content stays readable when prefers-reduced-motion (library init may still run briefly) */
@media (prefers-reduced-motion: reduce) {
  .gf-forms [data-aos],
  .gf-forms [data-aos].aos-animate {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    filter: none !important;
  }
}
</style>
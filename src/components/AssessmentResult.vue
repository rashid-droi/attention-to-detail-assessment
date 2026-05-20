<template>
  <div class="assessment-app gf-forms" id="assessment-result-top" tabindex="-1">
    <div class="assessment-logo-container">
      <img
        src="/Screenshot_2026-05-19_at_10.53.45_AM-removebg-preview.png"
        alt="Select"
        class="assessment-logo-img"
      />
    </div>

    <section class="assessment-scroll-wrap" aria-label="Assessment result">
      <div class="assessment-scroll-wrap__inner">
        <div class="container gf-container">
          <div v-if="result" class="assessment-card glass-card gf-sheet result-sheet">
            <div class="gf-sticky-progress gf-sticky-progress--integrated gf-sticky-progress--complete">
              <div class="gf-sticky-progress-inner">
                <div
                  class="gf-sticky-progress-track"
                  role="progressbar"
                  aria-valuenow="100"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuetext="100% complete"
                  aria-label="Assessment completion"
                >
                  <div class="gf-sticky-progress-fill" style="width: 100%" />
                </div>
                <p class="gf-sticky-progress-meta">
                  {{ result.completionPercent }}% complete<span class="gf-meta-sep" aria-hidden="true"> · </span>
                  <span>All {{ questions.length }} questions answered</span>
                </p>
              </div>
            </div>

            <div class="assessment-intro-section result-intro">
              <h1 class="assessment-main-title">Assessment Complete</h1>
              <p v-if="result.username" class="assessment-description">
                Results for <strong>{{ result.username }}</strong
                ><template v-if="result.email"> · {{ result.email }}</template>
              </p>
              <p v-if="formattedSubmittedAt" class="result-submitted-at">
                Submitted {{ formattedSubmittedAt }}
              </p>
            </div>

            <div class="gf-divider" aria-hidden="true" />

            <section class="score-section gf-form-section" aria-label="Assessment summary">
              <h2 class="gf-section-title">Your score</h2>
              <div class="score-headline" aria-live="polite">
                <span class="score-number">{{ result.totalScore }}</span>
                <span class="score-max">/ {{ maxScore }}</span>
              </div>
              <div class="score-metrics">
                <div class="metric">
                  <span class="metric-value">{{ result.completionPercent }}%</span>
                  <span class="metric-label">Completion</span>
                </div>
                <div class="metric-divider" aria-hidden="true"></div>
                <div class="metric">
                  <span class="metric-value">{{ result.averagePointsPerQuestion }}</span>
                  <span class="metric-label">Average score</span>
                </div>
              </div>
            </section>

            <div class="gf-divider gf-divider--muted" aria-hidden="true" />

            <section class="interpretation-card gf-form-section" aria-label="Analysis summary">
              <h2 class="gf-section-title">Analysis result</h2>
              <p class="interpretation-text">{{ result.interpretation }}</p>
              <p class="interpretation-note">{{ result.interpretationNote }}</p>
              <div class="interpretation-bars" aria-hidden="true">
                <div class="bar" :style="{ width: '100%' }" data-level="excellent"></div>
                <div
                  class="bar"
                  :style="{ width: result.totalScore >= 50 ? '100%' : '0%' }"
                  data-level="above"
                ></div>
                <div
                  class="bar"
                  :style="{ width: result.totalScore >= 35 ? '100%' : '0%' }"
                  data-level="average"
                ></div>
              </div>
            </section>

            <div class="gf-divider gf-divider--muted" aria-hidden="true" />

            <section class="pdf-preview-panel gf-form-section" aria-label="PDF preview panel">
              <h2 class="gf-section-title">PDF preview</h2>
              <div class="pdf-preview-frame-wrap">
                <div v-if="isPdfPreviewLoading" class="pdf-preview-loading">Generating preview…</div>
                <iframe
                  v-else-if="pdfPreviewUrl"
                  :src="pdfPreviewUrl"
                  class="pdf-preview-frame"
                  title="Assessment PDF preview"
                ></iframe>
                <div v-else class="pdf-preview-loading">Preview unavailable. Use Download PDF.</div>
              </div>
            </section>

            <div class="gf-divider" aria-hidden="true" />

            <div class="submission-section gf-submit-band result-actions-band">
              <div class="gf-submit-actions">
                <button type="button" class="btn-primary gf-submit-btn" @click="startNewAssessment">
                  New assessment
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M21 3v5h-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M3 21v-5h5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
              <div class="submission-copy">
                <button
                  type="button"
                  class="btn-secondary gf-pdf-btn"
                  :class="{ loading: isPdfGenerating }"
                  :disabled="isPdfGenerating"
                  @click="generatePDF"
                  :aria-busy="isPdfGenerating"
                >
                  <span v-if="!isPdfGenerating" class="btn-secondary__inner">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path
                        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    Download PDF
                  </span>
                  <span v-else class="gf-loading-row">
                    <span class="gf-loading-bars" aria-hidden="true"><span></span><span></span><span></span></span>
                    Generating PDF…
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="result" id="pdf-report-template" style="display: none">
      <div class="hatters-pdf-wrapper">
        <div class="pdf-accent-bar"></div>
        <div class="pdf-main-content">
        <div class="pdf-header-branded">
          <div class="pdf-logo-wrap">
            <img :src="logoSrc" alt="Select" class="pdf-logo-img" />
          </div>
          <div class="pdf-tagline-wrap">
            <p>When <strong>employees</strong> thrive,</p>
            <p><strong>organisations</strong> thrive</p>
          </div>
        </div>

        <div class="pdf-report-title-section">
          <h1 class="pdf-report-main-title">Assessment Report</h1>
          <div class="pdf-title-underline"></div>
        </div>

        <div class="pdf-meta">
          <p><strong>Username:</strong> {{ result.username }}</p>
          <p v-if="result.email"><strong>Email:</strong> {{ result.email }}</p>
          <p><strong>Date & Time:</strong> {{ formattedSubmittedAt }}</p>
        </div>

        <div class="pdf-metrics-box">
          <div class="pdf-metric">
            <h3>Score</h3>
            <div class="pdf-score-highlight">
              {{ result.totalScore }} <span class="pdf-score-max">/ {{ maxScore }}</span>
            </div>
          </div>

          <div class="pdf-metric">
            <h3>Average</h3>
            <div class="pdf-points-value">
              {{ result.averagePointsPerQuestion }}<span class="pdf-score-max"> / 5</span>
            </div>
          </div>
        </div>

        <div class="pdf-interpretation-box">
          <h3>Analysis Result</h3>
          <p class="pdf-main-interpretation">{{ result.interpretation }}</p>
        </div>

        <div class="pdf-score-interpretation">
          <h3>Score interpretation</h3>
          <table class="pdf-interpretation-table" aria-label="Score interpretation guide">
            <tbody>
              <tr v-for="row in result.scoreInterpretationRows" :key="row.range">
                <td class="pdf-range-cell">{{ row.range }}</td>
                <td class="pdf-detail-cell">
                  <p class="pdf-level-title">{{ row.title }}</p>
                  <p class="pdf-level-description">{{ row.description }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>

        <div class="pdf-branded-footer">
          <div class="pdf-footer-col pdf-footer-col--left">
            <span>Select Training and</span>
            <span>Management Consultancy LLC</span>
          </div>
          <div class="pdf-footer-col pdf-footer-col--center">
            <span>00 971 2 674 0340</span>
            <span>www.selecttraining.ae</span>
          </div>
          <div class="pdf-footer-col pdf-footer-col--right">
            <span>F 803, Al Yasat Tower, Najda St.</span>
            <span>P.O. Box 44705, Abu Dhabi, UAE</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import html2pdf from 'html2pdf.js'
import { questions, RESULT_STORAGE_KEY } from '../assessmentData.js'

const logoSrc = `${import.meta.env.BASE_URL}logo-black.png`

const router = useRouter()

/** @type {import('vue').Ref<null | Record<string, unknown>>} */
const result = ref(null)

const maxScore = computed(() => questions.length * 5)

const formattedSubmittedAt = computed(() => {
  const raw = result.value?.submittedAt
  if (!raw || typeof raw !== 'string') return ''
  try {
    return new Date(raw).toLocaleString()
  } catch {
    return String(raw)
  }
})

const isPdfGenerating = ref(false)
const isPdfPreviewLoading = ref(false)
const pdfPreviewUrl = ref('')

function scrollToPageHeader() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  const el = document.getElementById('assessment-result-top')
  el?.scrollIntoView({ block: 'start', behavior: 'auto' })
}

function isValidSnapshot(data) {
  if (!data || typeof data !== 'object') return false
  if (typeof data.username !== 'string' || !data.username.trim()) return false
  if (!Array.isArray(data.ratings) || data.ratings.length !== questions.length) return false
  if (!data.ratings.every((n) => typeof n === 'number' && n >= 0 && n <= 5)) return false
  if (typeof data.totalScore !== 'number') return false
  if (typeof data.completionPercent !== 'number') return false
  if (typeof data.averagePointsPerQuestion !== 'string') return false
  if (typeof data.interpretation !== 'string') return false
  if (typeof data.interpretationNote !== 'string') return false
  if (!Array.isArray(data.scoreInterpretationRows)) return false
  return true
}

async function generatePdfPreview() {
  if (!result.value) return
  isPdfPreviewLoading.value = true
  try {
    const element = document.getElementById('pdf-report-template')
    if (!element) return

    element.style.display = 'block'

    const safeName = String(result.value.username).replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const opt = {
      margin: 0.5,
      filename: `Assessment_Complete_${safeName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    }

    const worker = html2pdf().set(opt).from(element).toPdf()
    const pdf = await worker.get('pdf')
    pdf.setProperties({
      title: 'Assessment Complete',
      subject: '',
      keywords: 'attention assessment'
    })
    const blobUrl = pdf.output('bloburl')

    if (pdfPreviewUrl.value) {
      URL.revokeObjectURL(pdfPreviewUrl.value)
    }
    pdfPreviewUrl.value = blobUrl
    element.style.display = 'none'
  } catch (error) {
    console.error('Error generating PDF preview:', error)
    const el = document.getElementById('pdf-report-template')
    if (el) el.style.display = 'none'
  } finally {
    isPdfPreviewLoading.value = false
  }
}

async function generatePDF() {
  if (!result.value) return
  isPdfGenerating.value = true
  try {
    const element = document.getElementById('pdf-report-template')
    if (!element) return
    element.style.display = 'block'

    const safeName = String(result.value.username).replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const opt = {
      margin: 0.5,
      filename: `Assessment_Complete_${safeName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    }

    const worker = html2pdf().set(opt).from(element).toPdf()
    const pdf = await worker.get('pdf')
    pdf.setProperties({
      title: 'Assessment Complete',
      subject: '',
      keywords: 'attention assessment'
    })
    await worker.save()
    element.style.display = 'none'
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Failed to generate PDF. Please try again.')
    const el = document.getElementById('pdf-report-template')
    if (el) el.style.display = 'none'
  } finally {
    isPdfGenerating.value = false
  }
}

function startNewAssessment() {
  sessionStorage.removeItem(RESULT_STORAGE_KEY)
  router.push({ name: 'home' })
}

onMounted(async () => {
  scrollToPageHeader()
  const raw = sessionStorage.getItem(RESULT_STORAGE_KEY)
  if (!raw) {
    router.replace({ name: 'home' })
    return
  }
  try {
    const data = JSON.parse(raw)
    if (!isValidSnapshot(data)) {
      sessionStorage.removeItem(RESULT_STORAGE_KEY)
      router.replace({ name: 'home' })
      return
    }
    result.value = data
    await nextTick()
    scrollToPageHeader()
    await generatePdfPreview()
    await nextTick()
    scrollToPageHeader()
  } catch (e) {
    console.error('Invalid assessment result payload', e)
    sessionStorage.removeItem(RESULT_STORAGE_KEY)
    router.replace({ name: 'home' })
  }
})

onUnmounted(() => {
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value)
  }
})
</script>

<style scoped>
/* Shared theme with HelloWorld.vue */
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
  background:
    radial-gradient(circle at 0% 100%, #d6e12c 0%, transparent 60%),
    radial-gradient(circle at 0% 0%, #1d8c82 0%, transparent 55%),
    radial-gradient(circle at 100% 0%, #1a5c68 0%, transparent 55%),
    radial-gradient(circle at 100% 100%, #152e42 0%, transparent 60%),
    linear-gradient(135deg, #1d8c82, #152e42) !important;
  background-attachment: fixed !important;
  padding-bottom: 4rem;
}

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
  animation: gf-sheet-rise 0.72s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.gf-sheet.assessment-card::after,
.gf-sheet.glass-card::before {
  display: none !important;
  content: none !important;
}

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
}

.gf-sticky-progress-meta {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--brand-teal);
  letter-spacing: 0.01em;
  margin: 0.35rem 0 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.gf-meta-sep {
  color: rgba(0, 128, 128, 0.35);
  margin: 0 0.4rem;
}

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

.assessment-description strong {
  color: var(--brand-navy);
  font-weight: 600;
}

.result-submitted-at {
  margin: 0.5rem 0 0;
  font-size: 0.775rem;
  color: var(--text-light);
}

.gf-divider {
  margin: 0;
  border: 0;
  border-top: 1.5px solid #edf2f7;
}

.gf-divider--muted {
  border-top-color: #edf2f7;
}

.gf-form-section {
  padding: 1.5rem var(--shell-inner-gutter);
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin: 0 !important;
}

.gf-section-title {
  font-size: 1.35rem !important;
  font-weight: 500 !important;
  color: var(--brand-navy) !important;
  margin: 0 0 1rem !important;
  letter-spacing: -0.01em;
}

.score-headline {
  text-align: center;
  margin-bottom: 0.25rem;
}

.score-number {
  font-size: clamp(2.25rem, 8vw, 2.75rem);
  font-weight: 600;
  color: var(--brand-teal);
  letter-spacing: -0.03em;
  line-height: 1;
}

.score-max {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-light);
  margin-left: 0.15rem;
}

.score-metrics {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.25rem;
  margin-top: 1.25rem;
  padding: 1rem;
  background: var(--brand-gray);
  border-radius: 12px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
}

.metric-value {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--brand-navy);
  line-height: 1.2;
}

.metric-label {
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-light);
}

.metric-divider {
  width: 1px;
  height: 2.25rem;
  background: #e2e8f0;
}

.interpretation-text {
  margin: 0 0 0.75rem;
  padding: 1rem 1.1rem;
  font-size: 0.925rem;
  line-height: 1.6;
  font-weight: 500;
  color: var(--brand-navy);
  background: var(--brand-gray);
  border-left: 3px solid var(--brand-teal);
  border-radius: 8px;
}

.interpretation-note {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--text-body);
  margin: 0;
}

.interpretation-bars {
  display: flex;
  gap: 0.35rem;
  margin-top: 1rem;
  height: 5px;
  border-radius: 999px;
  overflow: hidden;
  background: #edf2f7;
}

.interpretation-bars .bar {
  flex: 1;
  min-height: 100%;
  border-radius: inherit;
  transition: width 0.4s ease;
}

.interpretation-bars .bar[data-level='excellent'] {
  background: var(--brand-teal);
}

.interpretation-bars .bar[data-level='above'] {
  background: #1d8c82;
}

.interpretation-bars .bar[data-level='average'] {
  background: #d6e12c;
}

.pdf-preview-frame-wrap {
  border: 1.5px solid #edf2f7;
  border-radius: 12px;
  overflow: hidden;
  min-height: 380px;
  background: var(--brand-gray);
}

.pdf-preview-frame {
  width: 100%;
  height: 380px;
  border: 0;
  background: #ffffff;
}

.pdf-preview-loading {
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  font-size: 0.875rem;
  font-weight: 500;
}

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
  align-items: flex-end;
  flex: 1;
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
  padding: 0.75rem 2rem !important;
  min-width: 200px !important;
  font-size: 0.95rem !important;
  font-weight: 700 !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.65rem !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: 0 4px 14px rgba(0, 128, 128, 0.25) !important;
}

.btn-primary.gf-submit-btn:hover {
  background: #006666 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(0, 128, 128, 0.35) !important;
}

.btn-secondary.gf-pdf-btn {
  background: transparent !important;
  color: var(--brand-teal) !important;
  border: 1.5px solid rgba(0, 128, 128, 0.35) !important;
  border-radius: 12px !important;
  padding: 0.65rem 1.25rem !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.btn-secondary__inner {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-secondary.gf-pdf-btn:not(:disabled):hover {
  background: var(--brand-teal-light) !important;
  border-color: var(--brand-teal) !important;
}

.btn-secondary.gf-pdf-btn:disabled,
.btn-secondary.gf-pdf-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
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
  background: var(--brand-teal);
  animation: loadingBar 0.8s ease-in-out infinite;
}

.gf-loading-bars span:nth-child(2) {
  animation-delay: 0.15s;
}

.gf-loading-bars span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes loadingBar {
  0%,
  100% {
    transform: scaleY(0.4);
    opacity: 0.5;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

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

/* PDF template (off-screen export only) */
#pdf-report-template .hatters-pdf-wrapper {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  box-sizing: border-box;
  position: relative;
  width: 7.27in;
  /* Fit inside the A4 printable area (jsPDF margin: 0.5in -> printable height ~10.69in).
     Use fixed height, limit overflow and reduce bottom padding so content does not spill to a second page. */
  height: 10.5in;
  max-height: 10.5in;
  overflow: hidden;
  padding: 24px 28px 20px;
  background: #ffffff;
  color: #1a1a1a;
  page-break-inside: avoid;
  page-break-after: avoid;
  display: flex;
  flex-direction: column;
}

#pdf-report-template .pdf-main-content {
  width: 100%;
}

.pdf-accent-bar {
  height: 12px;
  width: calc(100% + 56px);
  margin-left: -28px;
  margin-right: -28px;
  margin-top: -24px;
  background: linear-gradient(90deg, #00334e 0%, #008080 34%, #76b852 66%, #ffd700 100%);
  margin-bottom: 24px;
}

.pdf-header-branded {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.pdf-logo-img {
  height: 48px;
  width: auto;
}

.pdf-tagline-wrap {
  text-align: right;
  font-family: 'Merriweather', Georgia, serif;
  font-size: 11px;
  color: #00334e;
  line-height: 1.4;
}

.pdf-tagline-wrap p {
  margin: 0;
}

.pdf-tagline-wrap strong {
  color: #008080;
  font-weight: 700;
}

.pdf-report-title-section {
  text-align: center;
  margin-bottom: 24px;
}

.pdf-report-main-title {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.pdf-title-underline {
  width: 40px;
  height: 3px;
  background: #008080;
  margin: 0 auto;
  border-radius: 2px;
}

.pdf-meta {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-left: 4px solid #008080;
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

.pdf-score-highlight,
.pdf-points-value {
  font-size: 26px;
  font-weight: 800;
  color: #008080;
  line-height: 1;
}

.pdf-score-max {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
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

.pdf-main-interpretation {
  font-size: 12px !important;
  font-weight: 700;
  color: #111827 !important;
  line-height: 1.45;
  margin: 0;
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
  border: 1px solid rgba(0, 128, 128, 0.35);
}

.pdf-interpretation-table tr:not(:last-child) {
  border-bottom: 1px solid rgba(0, 128, 128, 0.28);
}

.pdf-range-cell {
  width: 56px;
  font-size: 10px;
  font-weight: 700;
  color: #111827;
  text-align: center;
  vertical-align: middle;
  border-right: 1px solid rgba(0, 128, 128, 0.28);
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

#pdf-report-template .pdf-branded-footer {
  /* Use auto margin to naturally push the footer to the bottom of the flex container */
  position: static;
  margin: auto 0 0 0;
  padding: 10px 28px 12px;
  border-top: 1px solid #eeeeee;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 8.5px;
  color: #0b3d63;
  line-height: 1.4;
  background: #f4f4f4;
  page-break-inside: avoid;
}

.pdf-footer-col {
  display: flex;
  flex-direction: column;
}

.pdf-footer-col--center {
  text-align: center;
}

.pdf-footer-col--right {
  text-align: right;
}

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
    min-width: 0 !important;
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
    align-items: stretch !important;
  }

  .btn-secondary.gf-pdf-btn {
    width: 100%;
    justify-content: center;
  }

  .score-metrics {
    flex-direction: column;
    gap: 0.75rem;
  }

  .metric-divider {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gf-sheet.assessment-card {
    animation: none !important;
  }

  .gf-loading-bars span {
    animation: none !important;
  }

  .btn-primary.gf-submit-btn:hover {
    transform: none !important;
  }
}
</style>

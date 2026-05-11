<template>
  <div class="assessment-app gf-forms">
    <div class="animated-bg" aria-hidden="true">
      <div class="bg-gradient"></div>
      <div class="noise-overlay"></div>
    </div>

    <div class="container gf-container">
      <div class="assessment-card glass-card gf-sheet">
        <div v-if="result" class="results-panel gf-results-sheet">
          <div class="results-header gf-results-header">
            <h2>Assessment Complete</h2>
            <p class="results-subtitle">Attention to Detail Assessment Results</p>
          </div>

          <div class="score-section">
            <div class="score-headline" aria-live="polite">
              <span class="score-number">{{ result.totalScore }}</span>
              <span class="score-max">/ {{ maxScore }}</span>
            </div>
            <div class="score-metrics">
              <div class="metric">
                <span class="metric-value">{{ result.completionPercent }}%</span>
                <span class="metric-label">Completion</span>
              </div>
              <div class="metric-divider"></div>
              <div class="metric">
                <span class="metric-value">{{ result.averagePointsPerQuestion }}</span>
                <span class="metric-label">Average Score</span>
              </div>
            </div>
          </div>

          <div class="interpretation-card">
            <div class="interpretation-badge">Analysis Result</div>
            <p class="interpretation-text">{{ result.interpretation }}</p>
            <p class="interpretation-note">{{ result.interpretationNote }}</p>
            <div class="interpretation-bars">
              <div class="bar" :style="{ width: '100%' }" data-level="excellent"></div>
              <div class="bar" :style="{ width: result.totalScore >= 50 ? '100%' : '0%' }" data-level="above"></div>
              <div class="bar" :style="{ width: result.totalScore >= 35 ? '100%' : '0%' }" data-level="average"></div>
            </div>
          </div>

          <div class="results-actions">
            <button type="button" class="btn-outline" @click="startNewAssessment">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              New Assessment
            </button>
            <button
              type="button"
              class="btn-outline gf-results-pdf-btn"
              :class="{ loading: isPdfGenerating }"
              :disabled="isPdfGenerating"
              @click="generatePDF"
              :aria-busy="isPdfGenerating"
            >
              <span v-if="!isPdfGenerating">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Download PDF
              </span>
              <span v-else class="gf-loading-row">
                <span class="gf-loading-bars" aria-hidden="true"><span /><span /><span /></span>
                Generating PDF...
              </span>
            </button>
          </div>

          <div class="pdf-preview-panel">
            <h3 class="pdf-preview-title">PDF Preview</h3>
            <p class="pdf-preview-subtitle">Your generated report preview is shown below.</p>
            <div class="pdf-preview-frame-wrap">
              <div v-if="isPdfPreviewLoading" class="pdf-preview-loading">Generating preview...</div>
              <iframe
                v-else-if="pdfPreviewUrl"
                :src="pdfPreviewUrl"
                class="pdf-preview-frame"
                title="Assessment PDF preview"
              />
              <div v-else class="pdf-preview-loading">Preview unavailable. Use Download PDF.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="result" id="pdf-report-template" style="display: none">
      <div class="hatters-pdf-wrapper">
        <div class="pdf-header">
          <h1 class="pdf-brand">Hatters</h1>
          <h2 class="pdf-doc-title">Assessment Report</h2>
          <div class="pdf-header-divider"></div>
        </div>

        <div class="pdf-meta">
          <p><strong>Username:</strong> {{ result.username }}</p>
          <p v-if="result.email"><strong>Email:</strong> {{ result.email }}</p>
          <p><strong>Date & Time:</strong> {{ formattedSubmittedAt }}</p>
        </div>

        <div class="pdf-metrics-box">
          <div class="pdf-metric">
            <h3>Assessment Score</h3>
            <div class="pdf-score-highlight">
              {{ result.totalScore }} <span class="pdf-score-max">/ {{ maxScore }}</span>
            </div>
          </div>

          <div class="pdf-metric">
            <h3>Average points</h3>
            <div class="pdf-points-value">
              {{ result.averagePointsPerQuestion }}<span class="pdf-score-max"> / 5</span>
            </div>
          </div>
        </div>

        <div class="pdf-interpretation-box">
          <h3>Analysis Result</h3>
          <p class="pdf-main-interpretation">{{ result.interpretation }}</p>
          <p class="pdf-interpretation-note">{{ result.interpretationNote }}</p>
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
          <p class="pdf-score-interpretation-note">{{ result.interpretationNote }}</p>
        </div>

        <div class="pdf-footer">
          <p>Generated securely by Hatters Assessment Platform</p>
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
      filename: `Hatters_Assessment_Report_${safeName}.pdf`,
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
      filename: `Hatters_Assessment_Report_${safeName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] }
    }

    await html2pdf().set(opt).from(element).save()
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
    await generatePdfPreview()
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.assessment-app {
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
  -webkit-font-smoothing: antialiased;
}

.gf-forms.assessment-app {
  background:
    radial-gradient(ellipse 76% 64% at 100% 0%, rgba(0, 139, 139, 0.06) 0%, transparent 50%),
    var(--gf-page-tint) !important;
  padding-left: clamp(0.85rem, 3vw, 1.75rem);
  padding-right: clamp(0.85rem, 3vw, 1.75rem);
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

.gf-forms .animated-bg {
  opacity: 0.42;
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

.gf-forms .noise-overlay {
  opacity: 0.02;
}

@keyframes rotateGradient {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.gf-forms .gf-container.container {
  max-width: 640px;
  width: 100%;
  padding-top: 0.5rem;
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
  border-radius: 6px;
  background: rgba(212, 245, 243, 0.75);
  border: 1px solid rgba(0, 139, 139, 0.22);
}

.interpretation-text {
  margin: 0 0 0.85rem;
  padding: 1.05rem 1.15rem 1.1rem 1.2rem;
  font-size: 1.02rem;
  line-height: 1.65;
  font-weight: 600;
  color: var(--brand-navy);
  letter-spacing: -0.01em;
  background: linear-gradient(
    145deg,
    rgba(212, 245, 243, 0.58) 0%,
    rgba(255, 255, 255, 0.98) 45%,
    rgba(232, 248, 252, 0.72) 100%
  );
  border: 1px solid rgba(0, 139, 139, 0.22);
  border-left: 4px solid var(--brand-teal);
  border-radius: 10px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.85),
    0 4px 20px rgba(0, 43, 92, 0.07);
}

.interpretation-bars {
  display: flex;
  gap: 0.35rem;
  margin-top: 0.85rem;
  height: 6px;
  border-radius: 3px;
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

.interpretation-note {
  margin-top: 0.65rem;
  font-size: 0.84rem;
  line-height: 1.5;
  color: var(--text-muted);
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
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}

.btn-outline:hover {
  background: rgba(204, 251, 241, 0.55);
  border-color: rgba(0, 139, 139, 0.5);
  transform: translateY(-1px);
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

@media (max-width: 900px) {
  .assessment-app {
    padding: 1rem;
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
  .bg-gradient {
    animation: none !important;
  }

  .gf-sheet.assessment-card {
    animation: none !important;
  }

  .gf-loading-bars > span {
    animation: none !important;
  }

  .btn-outline:hover {
    transform: none !important;
  }
}
</style>

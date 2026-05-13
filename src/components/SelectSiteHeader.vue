<template>
  <header class="select-site-header">
    <div class="select-site-header__accent" aria-hidden="true" />
    <div class="select-site-header__bar">
      <RouterLink to="/" class="select-site-header__brand">
        <img
          class="select-site-header__logo-img"
          :src="logoSrc"
          alt="Select"
        />
      </RouterLink>
      <div class="select-site-header__tagline" aria-label="Company tagline">
        <p class="select-site-header__tagline-line">
          When <em>employees</em> thrive,
        </p>
        <p class="select-site-header__tagline-line">
          <em>organisations</em> thrive
        </p>
      </div>
    </div>
    <div
      v-if="showAssessmentIntro"
      class="select-site-header__intro-wrap"
    >
      <div class="select-site-header__intro">
        <h1 class="select-site-header__intro-title">{{ assessmentTitle }}</h1>
        <p class="select-site-header__intro-description">
          {{ assessmentDescription }}
        </p>
      </div>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
defineProps({
  showAssessmentIntro: { type: Boolean, default: false },
  assessmentTitle: { type: String, default: 'Attention to Detail Assessment' },
  assessmentDescription: {
    type: String,
    default:
      'Evaluate your meticulousness and precision through this assessment. Each statement reflects real-world scenarios that measure your attention to detail.'
  }
})

/** Served from `public/`; respects Vite `base` (e.g. GitHub Pages). */
const logoSrc = `${import.meta.env.BASE_URL}select-logo.png`
</script>

<style scoped>
.select-site-header {
  --select-navy: #00334e;
  --select-teal: #008080;
  --select-green: #76b852;
  --select-yellow: #ffd700;

  flex-shrink: 0;
  width: 100%;
  background: #ffffff;
  box-shadow: 0 1px 0 rgba(0, 51, 78, 0.1);
}

.select-site-header__accent {
  height: 14px;
  width: 100%;
  background: linear-gradient(
    90deg,
    var(--select-navy) 0%,
    var(--select-teal) 34%,
    var(--select-green) 66%,
    var(--select-yellow) 100%
  );
}

.select-site-header__bar {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.25rem clamp(1.35rem, 4vw, 2.75rem) 1.35rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.25rem 2rem;
  flex-wrap: wrap;
}

.select-site-header__brand {
  display: inline-flex;
  align-items: flex-end;
  line-height: 0;
  text-decoration: none;
  border-radius: 4px;
}

.select-site-header__brand:hover {
  opacity: 0.92;
}

.select-site-header__brand:focus-visible {
  outline: 2px solid var(--select-teal);
  outline-offset: 3px;
}

.select-site-header__logo-img {
  display: block;
  height: clamp(42px, 5.8vw, 58px);
  width: auto;
  max-width: min(260px, 70vw);
}

.select-site-header__tagline {
  margin: 0;
  padding-bottom: 0.1rem;
  text-align: right;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: clamp(0.8rem, 1.65vw, 0.95rem);
  font-weight: 400;
  line-height: 1.45;
  color: var(--select-navy);
}

.select-site-header__tagline-line {
  margin: 0;
}

.select-site-header__tagline-line em {
  font-style: normal;
  font-weight: 600;
  color: var(--select-teal);
}

.select-site-header__intro-wrap {
  border-top: 1px solid rgba(0, 51, 78, 0.08);
}

.select-site-header__intro {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem clamp(1.35rem, 4vw, 2.75rem) 1.2rem;
}

.select-site-header__intro-title {
  margin: 0 0 0.65rem;
  font-size: clamp(1.4rem, 3.8vw, 1.875rem);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.33;
  color: var(--select-navy);
}

.select-site-header__intro-description {
  margin: 0;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  font-family: 'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 0.875rem;
  line-height: 1.55;
  color: #5f6368;
}

@media (max-width: 640px) {
  .select-site-header__bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .select-site-header__brand {
    align-items: center;
  }

  .select-site-header__tagline {
    text-align: right;
    width: auto;
    margin-left: auto;
  }

  .select-site-header__intro {
    padding-top: 0.85rem;
    padding-bottom: 1rem;
  }
}

@media (max-width: 1024px) {
  .select-site-header__tagline {
    text-align: right;
    margin-left: auto;
  }
}
</style>

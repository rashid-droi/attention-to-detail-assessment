<template>
  <footer class="select-site-footer">
    <div class="select-site-footer__inner">
      <div class="select-site-footer__col select-site-footer__col--left">
        <span>Select Training and</span>
        <span>Management Consultancy LLC</span>
      </div>
      <div class="select-site-footer__col select-site-footer__col--center">
        <a href="tel:0097126740340" class="select-site-footer__link">00 971 2 674 0340</a>
        <a
          href="https://www.selecttraining.ae"
          class="select-site-footer__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          www.selecttraining.ae
        </a>
      </div>
      <div class="select-site-footer__col select-site-footer__col--right">
        <span>F 803, Al Yasat Tower, Najda St.</span>
        <span>P.O. Box 44705, Abu Dhabi, UAE</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.select-site-footer {
  flex-shrink: 0;
  width: 100%;
  background: #eaeaea;
  border-top: 0;
  margin-top: auto;
  position: relative;
  z-index: 20;
}

.select-site-footer__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.95rem clamp(1.35rem, 4vw, 2.75rem) 1rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.5rem 1.8rem;
  align-items: start;
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  font-size: 0.82rem;
  line-height: 1.35;
  color: #0b3d63;
  text-align: left;

}

.select-site-footer__col {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.select-site-footer__col--left {
  padding-right: 0.5rem;
}

.select-site-footer__col--center {
  text-align: center;
  align-items: center;
}

.select-site-footer__col--right {
  text-align: right;
  align-items: flex-end;
}

.select-site-footer__link {
  color: inherit;
  text-decoration: none;
  font-weight: inherit;
  line-height: 1.35;
  pointer-events: auto;
}

.select-site-footer__link:hover {
  text-decoration: none;
  color: #0b3d63;
}

@media (max-width: 768px) {
  .select-site-footer__inner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .select-site-footer__col--left,
  .select-site-footer__col--center,
  .select-site-footer__col--right {
    text-align: center;
    align-items: center;
    padding-right: 0;
  }
}
</style>

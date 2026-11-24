const studio = {
  name: 'Encore Design',
  whatsapp: '34659762533',
};

for (const label of document.querySelectorAll('[data-studio]')) {
  label.textContent = studio.name;
}

const contactLink = document.querySelector('#contact-link');
if (contactLink?.dataset.whatsappMessage && studio.whatsapp) {
  const message = contactLink.dataset.whatsappMessage;
  contactLink.href = 'https://wa.me/' + studio.whatsapp + '?text=' + encodeURIComponent(message);
  contactLink.hidden = false;
  document.querySelector('#contact-note').hidden = true;
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroMedia = document.querySelector('.hero-media');

if (heroMedia) {
  const hero = heroMedia.closest('.hero');
  let glowFrame = null;
  let glowProgress = -1;

  function updateGlow() {
    glowFrame = null;
    const { top, height } = hero.getBoundingClientRect();
    const travel = Math.min(height, window.innerHeight) * 0.58;
    if (travel <= 0) return;

    const progress = Math.min(1, Math.max(0, -top / travel));
    if (progress === glowProgress) return;

    glowProgress = progress;
    heroMedia.style.setProperty('--glow-progress', String(progress));
  }

  function scheduleGlowUpdate() {
    if (reducedMotion.matches || glowFrame !== null) return;
    glowFrame = requestAnimationFrame(updateGlow);
  }

  window.addEventListener('scroll', scheduleGlowUpdate, { passive: true });
  window.addEventListener('resize', scheduleGlowUpdate);
  reducedMotion.addEventListener('change', scheduleGlowUpdate);
  scheduleGlowUpdate();
}

const motionToggle = document.querySelector('[data-motion-toggle]');
const films = document.querySelectorAll('[data-motion]');

for (const film of films) {
  let userPaused = false;
  let visible = false;

  function syncMotion() {
    const shouldPlay = visible && !userPaused && !reducedMotion.matches
      && !document.hidden;

    if (shouldPlay) {
      if (!film.getAttribute('src')) film.src = film.dataset.src;
      film.play().catch(() => {});
    } else {
      film.pause();
    }
  }

  if (motionToggle) {
    motionToggle.addEventListener('click', () => {
      userPaused = !userPaused;
      motionToggle.textContent = userPaused ? 'Reproducir vídeo' : 'Pausar vídeo';
      syncMotion();
    });
    film.addEventListener('playing', () => { motionToggle.hidden = false; });
    film.addEventListener('error', () => { motionToggle.hidden = true; });
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncMotion();
  });
  observer.observe(film);
  reducedMotion.addEventListener('change', () => {
    if (motionToggle && reducedMotion.matches) motionToggle.hidden = true;
    syncMotion();
  });
  document.addEventListener('visibilitychange', syncMotion);
}

const studio = {
  name: 'Encore Design',
  whatsapp: '34659762533',
};

for (const label of document.querySelectorAll('[data-studio]')) {
  label.textContent = studio.name;
}

const contactLink = document.querySelector('#contact-link');
if (contactLink && studio.whatsapp) {
  const message = 'Hola, me gustaría hablar sobre una web para mi negocio.';
  contactLink.href = 'https://wa.me/' + studio.whatsapp + '?text=' + encodeURIComponent(message);
  contactLink.hidden = false;
  document.querySelector('#contact-note').hidden = true;
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroMedia = document.querySelector('.hero-media');
const desktop = window.matchMedia('(min-width: 741px)');

if (heroMedia) {
  let pendingFrame;

  function updateHeroOffset() {
    pendingFrame = undefined;
    const enabled = desktop.matches && !reducedMotion.matches;
    const offset = enabled ? Math.min(Math.max(0, window.scrollY) * 0.06, 20) : 0;
    heroMedia.style.setProperty('--hero-offset', offset + 'px');
  }

  function queueHeroOffset() {
    if (pendingFrame === undefined) pendingFrame = requestAnimationFrame(updateHeroOffset);
  }

  window.addEventListener('scroll', queueHeroOffset, { passive: true });
  desktop.addEventListener('change', queueHeroOffset);
  reducedMotion.addEventListener('change', queueHeroOffset);
  updateHeroOffset();
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

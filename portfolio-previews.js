const previews = document.querySelectorAll('[data-preview]');
const previewMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function playPreview(stage) {
  if (previewMotion.matches) return;

  stage.classList.remove('is-playing');
  void stage.offsetWidth;
  stage.classList.add('is-playing');

  const film = stage.querySelector('[data-preview-film]');
  if (film) {
    if (!film.getAttribute('src')) film.src = film.dataset.src;
    if (film.readyState > 0) film.currentTime = 0;
    film.play().catch(() => {});
  }
}

const previewObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.intersectionRatio < .32) continue;
    previewObserver.unobserve(entry.target);
    playPreview(entry.target);
  }
}, { threshold: .32 });

function updatePreviewMotion() {
  previewObserver.disconnect();
  for (const stage of previews) {
    const replay = stage.closest('.project').querySelector('[data-replay]');
    replay.hidden = previewMotion.matches;
    if (previewMotion.matches) {
      stage.classList.remove('is-playing');
      const film = stage.querySelector('[data-preview-film]');
      if (film) {
        film.pause();
        film.classList.remove('is-ready');
      }
    } else if (!stage.classList.contains('is-playing')) {
      previewObserver.observe(stage);
    }
  }
}

for (const stage of previews) {
  const replay = stage.closest('.project').querySelector('[data-replay]');
  const film = stage.querySelector('[data-preview-film]');
  if (film) {
    film.addEventListener('playing', () => film.classList.add('is-ready'));
    film.addEventListener('error', () => film.classList.remove('is-ready'));
  }
  replay.addEventListener('click', () => {
    previewObserver.unobserve(stage);
    playPreview(stage);
  });
}

previewMotion.addEventListener('change', updatePreviewMotion);
updatePreviewMotion();

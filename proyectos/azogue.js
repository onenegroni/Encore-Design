const azogueMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const ambientFilm = document.querySelector('[data-azogue-film]');
const ambientControl = document.querySelector('[data-film-control]');
let ambientVisible = false;
let ambientPaused = false;

function syncAmbientFilm() {
  const enabled = ambientVisible && !ambientPaused && !azogueMotion.matches && !document.hidden;
  if (!enabled) {
    ambientFilm.pause();
    return;
  }

  if (!ambientFilm.getAttribute('src')) ambientFilm.src = ambientFilm.dataset.src;
  ambientFilm.play().catch(() => {});
}

ambientFilm.addEventListener('playing', () => {
  ambientFilm.classList.add('is-ready');
  ambientControl.hidden = false;
});
ambientFilm.addEventListener('error', () => {
  ambientFilm.classList.remove('is-ready');
  ambientControl.hidden = true;
});
ambientControl.addEventListener('click', () => {
  ambientPaused = !ambientPaused;
  ambientControl.textContent = ambientPaused ? 'Reproducir ambiente' : 'Pausar ambiente';
  syncAmbientFilm();
});
azogueMotion.addEventListener('change', () => {
  if (azogueMotion.matches) {
    ambientFilm.classList.remove('is-ready');
    ambientControl.hidden = true;
  } else if (ambientPaused && ambientFilm.readyState >= 2) {
    ambientFilm.classList.add('is-ready');
    ambientControl.hidden = false;
  }
  syncAmbientFilm();
});
document.addEventListener('visibilitychange', syncAmbientFilm);
const ambientObserver = new IntersectionObserver(([entry]) => {
  ambientVisible = entry.intersectionRatio >= .25;
  syncAmbientFilm();
}, { threshold: .25 });
ambientObserver.observe(ambientFilm);

const menu = document.querySelector('[data-azogue-menu]');
const drinks = [...menu.querySelectorAll('[data-drink]')];
const photos = [...menu.querySelectorAll('[data-drink-photo]')];
const filters = [...menu.querySelectorAll('[data-azogue-filter]')];
const portraitName = menu.querySelector('[data-portrait-title]');
const portraitKind = menu.querySelector('[data-portrait-kind]');
let selectedDrink = drinks[0];

function chooseDrink(drink) {
  if (drink === selectedDrink) return;

  selectedDrink.setAttribute('aria-pressed', 'false');
  selectedDrink = drink;
  selectedDrink.setAttribute('aria-pressed', 'true');
  portraitName.textContent = drink.querySelector('.drink-name').textContent;
  portraitKind.textContent = drink.parentElement.dataset.drinkKind === 'autor' ? 'De autor' : 'Sin alcohol';

  for (const photo of photos) {
    const active = photo.dataset.drinkPhoto === drink.dataset.drink;
    photo.classList.toggle('is-active', active);
    if (active) photo.removeAttribute('aria-hidden');
    else photo.setAttribute('aria-hidden', 'true');
  }
}

for (const drink of drinks) drink.addEventListener('click', () => chooseDrink(drink));

for (const filter of filters) {
  filter.addEventListener('click', () => {
    const category = filter.dataset.azogueFilter;

    for (const option of filters) option.setAttribute('aria-pressed', String(option === filter));
    for (const drink of drinks) {
      const item = drink.parentElement;
      item.hidden = category !== 'all' && item.dataset.drinkKind !== category;
    }

    if (selectedDrink.parentElement.hidden) chooseDrink(drinks.find(drink => !drink.parentElement.hidden));
  });
}

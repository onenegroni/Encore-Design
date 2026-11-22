const heroImage = document.querySelector('.hero-image');

function playEntrance() {
  document.documentElement.classList.add('intro-on');
}

if (heroImage?.decode) heroImage.decode().then(playEntrance, playEntrance);
else playEntrance();

const venuePhotos = document.querySelectorAll('.venue-grid img, [data-venue-photo]');
if (venuePhotos.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const venueObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in-view');
      venueObserver.unobserve(entry.target);
    }
  }, { threshold: .25 });

  for (const photo of venuePhotos) venueObserver.observe(photo);
}

for (const widget of document.querySelectorAll('[data-filter-widget]')) {
  const buttons = [...widget.querySelectorAll('[data-filter]')];
  const choices = widget.querySelectorAll('[data-kind]');

  function select(button) {
    for (const option of buttons) {
      option.setAttribute('aria-pressed', String(option === button));
    }
    for (const choice of choices) {
      choice.hidden = button.dataset.filter !== 'all' && choice.dataset.kind !== button.dataset.filter;
    }
  }

  for (const button of buttons) button.addEventListener('click', () => select(button));
}

const booking = document.querySelector('[data-demo-booking]');
if (booking) {
  const confirmation = booking.querySelector('output');
  booking.addEventListener('submit', event => {
    event.preventDefault();
    const request = new FormData(booking);
    const summary = [...request.values()].join(' · ');
    const purpose = booking.dataset.demoBooking || 'Cita de demostración';
    confirmation.textContent = summary + '. ' + purpose + '.';
  });
  booking.addEventListener('change', () => { confirmation.textContent = ''; });
}

const bag = document.querySelector('#bag');
if (bag) {
  const items = new Map();
  const currency = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const list = bag.querySelector('[data-bag-items]');
  const empty = bag.querySelector('[data-bag-empty]');
  const total = bag.querySelector('[data-bag-total]');
  const count = document.querySelector('[data-bag-count]');

  function updateBag() {
    let amount = 0;
    let quantity = 0;
    list.replaceChildren();

    for (const [id, item] of items) {
      quantity += item.quantity;
      amount += item.price * item.quantity;

      const entry = document.createElement('li');
      const summary = document.createElement('span');
      summary.textContent = item.quantity + ' × ' + item.title;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Quitar';
      remove.setAttribute('aria-label', 'Quitar una unidad de ' + item.title);
      remove.addEventListener('click', () => {
        if (item.quantity === 1) items.delete(id);
        else item.quantity--;
        updateBag();
        (list.querySelector('button') ?? bag.querySelector('.close-bag')).focus();
      });
      entry.append(summary, remove);
      list.append(entry);
    }

    count.textContent = String(quantity);
    empty.hidden = quantity > 0;
    total.textContent = currency.format(amount);
  }

  for (const button of document.querySelectorAll('[data-add-print]')) {
    button.addEventListener('click', () => {
      const id = button.dataset.addPrint;
      const item = items.get(id) ?? { title: button.dataset.title, price: Number(button.dataset.price), quantity: 0 };
      item.quantity++;
      items.set(id, item);
      updateBag();
      bag.showModal();
    });
  }

  document.querySelector('[data-open-bag]').addEventListener('click', () => bag.showModal());
}

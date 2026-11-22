const bookingsKey = 'umbral-demo-bookings';
const sessionKey = 'umbral-demo-session';
const monthlyClasses = 8;
const attendedClasses = 3;
const exampleBookings = ['fuerza-mie'];

const entry = document.querySelector('#member-entry');
const dashboard = document.querySelector('#member-dashboard');
const openMember = document.querySelector('#open-member');
const closeMember = document.querySelector('#close-member');
const demoNote = document.querySelector('#demo-note');
const dashboardNote = document.querySelector('#dashboard-note');
const balance = document.querySelector('#class-balance');
const bookedClasses = document.querySelector('#booked-classes');
const emptyBookings = document.querySelector('#empty-bookings');
const bookingForm = document.querySelector('#class-booking');
const session = document.querySelector('#class-slot');
const confirmBooking = bookingForm.querySelector('button');
const noAvailability = document.querySelector('#booking-availability');
const feedback = document.querySelector('#booking-feedback');
const options = [...session.options];
const requestedClass = new URLSearchParams(window.location.search).get('clase');
const classSlots = new Map(options.map(option => [option.value, option]));

let bookings = new Set(exampleBookings);
let storesBookings = true;

function loadBookings() {
  if (!storesBookings) return;
  let value;
  try {
    value = localStorage.getItem(bookingsKey);
  } catch {
    storesBookings = false;
    return;
  }
  try {
    const saved = value === null ? exampleBookings : JSON.parse(value);
    if (Array.isArray(saved)) {
      bookings = new Set(saved.filter(id => classSlots.has(id)).slice(0, monthlyClasses - attendedClasses));
    }
  } catch {
    bookings = new Set(exampleBookings);
  }
}

function saveBookings() {
  if (!storesBookings) return;
  try {
    localStorage.setItem(bookingsKey, JSON.stringify([...bookings]));
  } catch {
    storesBookings = false;
  }
}

function sessionIsOpen() {
  try {
    return sessionStorage.getItem(sessionKey) === '1';
  } catch {
    return false;
  }
}

function showMember(isOpen, focusTitle = false) {
  entry.hidden = isOpen;
  dashboard.hidden = !isOpen;
  feedback.textContent = '';
  if (isOpen) {
    loadBookings();
    renderBookings();
  }
  if (focusTitle) document.querySelector(isOpen ? '#dashboard-title' : '#entry-title').focus();
}

function changeSession(isOpen) {
  try {
    if (isOpen) sessionStorage.setItem(sessionKey, '1');
    else sessionStorage.removeItem(sessionKey);
  } catch {
    // The demo can still be opened for the current page.
  }
  showMember(isOpen, true);
}

function availableClasses() {
  return monthlyClasses - attendedClasses - bookings.size;
}

function renderBookings(preferredSlot = '') {
  const currentSlot = preferredSlot || session.value;
  balance.textContent = `${availableClasses()} de ${monthlyClasses}`;
  bookedClasses.replaceChildren();

  for (const option of options) {
    if (!bookings.has(option.value)) continue;
    const className = option.parentElement.label;
    const item = document.createElement('li');
    const details = document.createElement('div');
    const name = document.createElement('strong');
    const time = document.createElement('span');
    const cancel = document.createElement('button');
    name.textContent = className;
    time.textContent = option.textContent;
    cancel.type = 'button';
    cancel.textContent = 'Cancelar';
    cancel.setAttribute('aria-label', `Cancelar ${className}, ${option.textContent}`);
    cancel.addEventListener('click', () => {
      loadBookings();
      const removed = bookings.delete(option.value);
      saveBookings();
      renderBookings(option.value);
      feedback.textContent = removed
        ? 'Reserva cancelada. Recuperas una clase de tu plan.'
        : 'La reserva ya estaba cancelada.';
      session.focus();
    });
    details.append(name, time);
    item.append(details, cancel);
    bookedClasses.append(item);
  }

  for (const option of options) option.disabled = bookings.has(option.value);
  const available = options.filter(option => !option.disabled);
  const selected = available.find(option => option.value === currentSlot)
    ?? available.find(option => option.dataset.class === requestedClass)
    ?? available[0];
  session.value = selected?.value ?? '';
  session.disabled = !selected || availableClasses() === 0;
  confirmBooking.disabled = session.disabled;
  noAvailability.hidden = !session.disabled;
  emptyBookings.hidden = bookings.size > 0;
  dashboardNote.textContent = storesBookings
    ? 'Las reservas de prueba se guardan en este navegador.'
    : 'Las reservas de prueba se conservan mientras tengas esta página abierta.';
}

openMember.hidden = false;
demoNote.hidden = false;
openMember.addEventListener('click', () => changeSession(true));
closeMember.addEventListener('click', () => changeSession(false));
bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  const option = classSlots.get(session.value);
  loadBookings();
  if (!option || bookings.has(option.value) || availableClasses() === 0) {
    renderBookings();
    feedback.textContent = 'La sesión ya está reservada o el plan no tiene clases disponibles.';
    return;
  }
  bookings.add(option.value);
  saveBookings();
  renderBookings();
  feedback.textContent = `Reserva de prueba confirmada: ${option.parentElement.label}, ${option.textContent}.`;
  if (confirmBooking.disabled) bookedClasses.querySelector('button')?.focus();
});

window.addEventListener('storage', event => {
  if ((event.key === bookingsKey || event.key === null) && !dashboard.hidden) {
    loadBookings();
    renderBookings();
  }
});

// A class link from the public schedule takes precedence on first entry.
session.selectedIndex = -1;
showMember(sessionIsOpen());

const FORMAT_LABELS = {
  offen: 'Noch offen',
  phase1: 'Phase 1 – Intuition für KI schärfen',
  phase2: 'Phase 2 – Einsatzfähige Agenten bauen',
  phase3: 'Phase 3 – Vollautonome Workflows',
  talk: 'Vortrag / Keynote',
};

// Links in den Phasen wählen das passende Format im Anfrage-Formular vor.
document.querySelectorAll('[data-format]').forEach((link) => {
  link.addEventListener('click', () => {
    const select = document.getElementById('r-format');
    if (select) select.value = link.dataset.format;
  });
});

// Beide Formulare gehen über FormSubmit als E-Mail an diese Adresse.
const INBOX = 'franziska.wittleder@gmail.com';
const ENDPOINT = `https://formsubmit.co/ajax/${INBOX}`;

const FIELD_LABELS = {
  name: 'Name',
  email: 'E-Mail',
  company: 'Unternehmen',
  who: 'Wer nimmt teil',
  time: 'Zeitrahmen',
  format: 'Format',
  goal: 'Woran merken Sie, dass das Invest sich gelohnt hat',
};

function buildPayload(form) {
  const d = new FormData(form);
  const payload = {};
  for (const [key, value] of d) {
    if (key === '_honey') continue;
    payload[FIELD_LABELS[key] || key] = key === 'format' ? FORMAT_LABELS[value] : (value || '–');
  }
  let subject = form.dataset.subject;
  if (d.has('format')) subject += `: ${FORMAT_LABELS[d.get('format')]}`;
  payload._subject = subject;
  payload._replyto = d.get('email');
  payload._template = 'table';
  payload._honey = d.get('_honey');
  return payload;
}

async function sendForm(e) {
  e.preventDefault();
  const form = e.target;
  const button = form.querySelector('button[type="submit"]');
  const error = form.querySelector('.form-error');
  error.hidden = true;
  button.disabled = true;

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildPayload(form)),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) !== 'true') throw new Error(data.message || res.status);

    form.hidden = true;
    form.nextElementSibling.hidden = false;
  } catch (err) {
    error.innerHTML = `Das hat leider nicht geklappt. Schreiben Sie mir bitte direkt an <a href="mailto:${INBOX}">${INBOX}</a>.`;
    error.hidden = false;
    button.disabled = false;
  }
}

document.querySelectorAll('form[data-subject]').forEach((form) => {
  form.addEventListener('submit', sendForm);
});

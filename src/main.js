/* ------------------------------------------------------------------
   Form endpoints — configured via environment variables at build time.
   Copy .env.example to .env and set:
     VITE_NEWSLETTER_ENDPOINT  (e.g. a Formspree/Buttondown/ConvertKit URL)
     VITE_CONTACT_ENDPOINT
   Both receive a JSON POST; see README.md for payload shapes.
   ------------------------------------------------------------------ */
const NEWSLETTER_ENDPOINT = import.meta.env.VITE_NEWSLETTER_ENDPOINT || '';
const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || '';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (import.meta.env.DEV) {
  if (!NEWSLETTER_ENDPOINT) console.info('[Raag Khajana] VITE_NEWSLETTER_ENDPOINT is not set — newsletter form will show a fallback notice on submit.');
  if (!CONTACT_ENDPOINT) console.info('[Raag Khajana] VITE_CONTACT_ENDPOINT is not set — contact form will show a fallback notice on submit.');
}

/* ------------------------------------------------------------------
   Sticky nav: hairline border once the page is scrolled
   ------------------------------------------------------------------ */
const header = document.querySelector('[data-site-header]');

const onScroll = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 4);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ------------------------------------------------------------------
   Mobile nav toggle
   ------------------------------------------------------------------ */
const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = document.querySelector('[data-nav-links]');

const setNavOpen = (open) => {
  header.classList.toggle('nav-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
};

navToggle.addEventListener('click', () => {
  setNavOpen(!header.classList.contains('nav-open'));
});

navLinks.addEventListener('click', (event) => {
  if (event.target.closest('a')) setNavOpen(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && header.classList.contains('nav-open')) {
    setNavOpen(false);
    navToggle.focus();
  }
});

/* ------------------------------------------------------------------
   Shared form helpers
   ------------------------------------------------------------------ */
async function postJSON(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response;
}

/* The status elements stay permanently in the DOM (never `hidden`) so that
   screen readers reliably announce text injected into the live region. */
function setStatus(statusEl, message, state) {
  statusEl.textContent = message;
  statusEl.dataset.state = state;
}

function clearStatus(statusEl) {
  statusEl.textContent = '';
  delete statusEl.dataset.state;
}

function setBusy(button, busyLabel) {
  button.dataset.label = button.textContent;
  button.textContent = busyLabel;
  button.disabled = true;
}

function clearBusy(button) {
  button.textContent = button.dataset.label || button.textContent;
  button.disabled = false;
}

/* ------------------------------------------------------------------
   Newsletter form
   ------------------------------------------------------------------ */
const newsletterForm = document.querySelector('[data-newsletter-form]');

if (newsletterForm) {
  const emailInput = newsletterForm.querySelector('input[name="email"]');
  const submitButton = newsletterForm.querySelector('[data-submit]');
  const statusEl = document.querySelector('.newsletter__status');

  emailInput.addEventListener('input', () => {
    emailInput.removeAttribute('aria-invalid');
  });

  newsletterForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus(statusEl);

    const email = emailInput.value.trim();
    if (!EMAIL_RE.test(email)) {
      emailInput.setAttribute('aria-invalid', 'true');
      setStatus(statusEl, 'Please enter a valid email address.', 'error');
      emailInput.focus();
      return;
    }

    if (!NEWSLETTER_ENDPOINT) {
      setStatus(
        statusEl,
        'Sign-ups aren’t live quite yet — email hello@raagkhajana.org and we’ll add you to the list.',
        'notice'
      );
      return;
    }

    setBusy(submitButton, 'Subscribing…');
    try {
      await postJSON(NEWSLETTER_ENDPOINT, { email });
      newsletterForm.reset();
      setStatus(statusEl, 'You’re on the list — thank you for following the journey.', 'success');
    } catch (error) {
      console.error('[Raag Khajana] Newsletter signup failed:', error);
      setStatus(
        statusEl,
        'Something went wrong — please try again, or email hello@raagkhajana.org.',
        'error'
      );
    } finally {
      clearBusy(submitButton);
    }
  });
}

/* ------------------------------------------------------------------
   Contact form
   ------------------------------------------------------------------ */
const contactForm = document.querySelector('[data-contact-form]');

if (contactForm) {
  const nameInput = contactForm.querySelector('input[name="name"]');
  const emailInput = contactForm.querySelector('input[name="email"]');
  const messageInput = contactForm.querySelector('textarea[name="message"]');
  const submitButton = contactForm.querySelector('[data-submit]');
  const statusEl = contactForm.querySelector('.contact__status');

  [nameInput, emailInput, messageInput].forEach((field) => {
    field.addEventListener('input', () => field.removeAttribute('aria-invalid'));
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus(statusEl);

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    let firstInvalid = null;
    if (!name) {
      nameInput.setAttribute('aria-invalid', 'true');
      firstInvalid = firstInvalid || nameInput;
    }
    if (!EMAIL_RE.test(email)) {
      emailInput.setAttribute('aria-invalid', 'true');
      firstInvalid = firstInvalid || emailInput;
    }
    if (!message) {
      messageInput.setAttribute('aria-invalid', 'true');
      firstInvalid = firstInvalid || messageInput;
    }
    if (firstInvalid) {
      setStatus(statusEl, 'Please fill in every field (with a valid email address).', 'error');
      firstInvalid.focus();
      return;
    }

    if (!CONTACT_ENDPOINT) {
      setStatus(
        statusEl,
        'The form isn’t connected yet — please email hello@raagkhajana.org instead.',
        'notice'
      );
      return;
    }

    setBusy(submitButton, 'Sending…');
    try {
      await postJSON(CONTACT_ENDPOINT, { name, email, message });
      contactForm.reset();
      setStatus(statusEl, 'Message sent — we’ll get back to you soon.', 'success');
    } catch (error) {
      console.error('[Raag Khajana] Contact form submission failed:', error);
      setStatus(
        statusEl,
        'Something went wrong — please try again, or email hello@raagkhajana.org.',
        'error'
      );
    } finally {
      clearBusy(submitButton);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const primaryNav = document.querySelector('#primary-nav');

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      menuToggle.setAttribute('aria-label', isExpanded ? 'Open navigation' : 'Close navigation');
      primaryNav.classList.toggle('is-open', !isExpanded);
    });
  }

  document.querySelectorAll('[data-year]').forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });

  const contactForm = document.querySelector('#contact-form');
  const formStatus = document.querySelector('#form-status');
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      formStatus.textContent = 'Thanks for your note. This demo form does not send messages yet; please email hello@pocketplan.student to get in touch.';
    });
  }
});
const button = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
  button.textContent = open ? '×' : '☰';
  nav.classList.toggle('open', open);
});
function closeMenu() {
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', '開啟選單');
  button.textContent = '☰';
  nav.classList.remove('open');
}
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.querySelector('#year').textContent = new Date().getFullYear();

// Reveal the course photographs once, when their shared row enters the viewport.
const courseGrid = document.querySelector('.course-grid');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (courseGrid && 'IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      courseGrid.classList.add('course-photos-visible');
      observer.disconnect();
    }
  }, { threshold: 0.05 });

  courseGrid.classList.add('course-photos-ready');
  observer.observe(courseGrid);

  function respectReducedMotion(event) {
    if (event.matches) {
      observer.disconnect();
      courseGrid.classList.remove('course-photos-ready', 'course-photos-visible');
      reducedMotion.removeEventListener('change', respectReducedMotion);
    }
  }
  reducedMotion.addEventListener('change', respectReducedMotion);
}

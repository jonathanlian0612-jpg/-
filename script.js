import { INSTAGRAM_URL } from './site-config.js';

document.querySelector('.instagram-floating').href = INSTAGRAM_URL;

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

// Keep revealed photos visible until the entire course row leaves the viewport.
const courseGrid = document.querySelector('.course-grid');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (courseGrid && 'IntersectionObserver' in window) {
  const photos = [...courseGrid.querySelectorAll('.course-image')];
  let photoObserver;
  let rowObserver;

  function observePhotos() {
    photoObserver?.disconnect();
    // A stacked mobile row can exceed the viewport. Observe each photo instead
    // so offscreen photos cannot finish before the visitor reaches them.
    const photoHeight = Math.max(...photos.map(photo => photo.offsetHeight));
    const threshold = Math.min(0.5, window.innerHeight * 0.5 / photoHeight);
    photoObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          entry.target.classList.add('course-photo-visible');
        }
      }
    }, { threshold: [0, threshold] });
    photos.forEach(photo => photoObserver.observe(photo));
  }

  function stopCourseAnimation() {
    photoObserver?.disconnect();
    rowObserver?.disconnect();
    window.removeEventListener('resize', observePhotos);
    courseGrid.classList.remove('course-photos-ready');
    photos.forEach(photo => photo.classList.remove('course-photo-visible'));
  }

  function configureCourseAnimation() {
    stopCourseAnimation();
    if (reducedMotion.matches) return;
    courseGrid.classList.add('course-photos-ready');
    rowObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => !entry.isIntersecting)) {
        // Reset only after the whole row is outside, never at the 50% boundary.
        photos.forEach(photo => photo.classList.remove('course-photo-visible'));
      }
    }, { threshold: 0 });
    rowObserver.observe(courseGrid);
    observePhotos();
    window.addEventListener('resize', observePhotos);
  }

  configureCourseAnimation();
  reducedMotion.addEventListener('change', configureCourseAnimation);
}

// A stationary target prevents the photo's own transform from retriggering its observer.
const heroPhoto = document.querySelector('.hero-art');
if (heroPhoto && 'IntersectionObserver' in window) {
  const target = document.createElement('span');
  target.className = 'hero-photo-trigger';
  target.setAttribute('aria-hidden', 'true');
  heroPhoto.parentElement.append(target);
  let heroObserver;

  function observeHeroPhoto() {
    heroObserver?.disconnect();
    Object.assign(target.style, {
      left: `${heroPhoto.offsetLeft}px`,
      top: `${heroPhoto.offsetTop}px`,
      width: `${heroPhoto.offsetWidth}px`,
      height: `${heroPhoto.offsetHeight}px`,
    });
    const threshold = Math.min(0.5, window.innerHeight * 0.5 / heroPhoto.offsetHeight);
    heroObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          heroPhoto.classList.remove('hero-photo-visible');
        } else if (entry.intersectionRatio >= threshold) {
          heroPhoto.classList.add('hero-photo-visible');
        }
      }
    }, { threshold: [0, threshold] });
    heroObserver.observe(target);
  }

  function configureHeroAnimation() {
    heroObserver?.disconnect();
    window.removeEventListener('resize', observeHeroPhoto);
    heroPhoto.classList.remove('hero-photo-ready', 'hero-photo-visible');
    if (reducedMotion.matches) return;
    heroPhoto.classList.add('hero-photo-ready');
    observeHeroPhoto();
    window.addEventListener('resize', observeHeroPhoto);
  }

  configureHeroAnimation();
  // Font loading can change the hero text height and the photo's grid position.
  document.fonts.ready.then(() => {
    if (!reducedMotion.matches) observeHeroPhoto();
  });
  reducedMotion.addEventListener('change', configureHeroAnimation);
}

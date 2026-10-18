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

// Independent reveal targets keep text and 3D transforms from moving observer bounds.
const artReveals = [
  ...[...document.querySelectorAll('.hero h1')].map(element => ({ element, kind: 'headline' })),
  ...[...document.querySelectorAll('main .section h2')].map(element => ({ element, kind: 'heading' })),
  ...[...document.querySelectorAll('.about-body > div > p')].map(element => ({ element, kind: 'philosophy' })),
  ...[...document.querySelectorAll('.moment-art')].map(element => ({ element, kind: 'tilt' })),
];
if ('IntersectionObserver' in window) {
  const records = artReveals.map(({ element, kind }) => {
    element.dataset.artReveal = kind;
    const marker = document.createElement('span');
    marker.className = 'art-reveal-trigger';
    marker.setAttribute('aria-hidden', 'true');
    document.body.append(marker);
    return { element, marker, observer: null };
  });

  function updateArtObservers() {
    for (const record of records) {
      const { element, marker } = record;
      record.observer?.disconnect();
      if (reducedMotion.matches) continue;
      // offset geometry is independent of the animated transform/filter.
      let left = 0;
      let top = 0;
      for (let node = element; node; node = node.offsetParent) {
        left += node.offsetLeft;
        top += node.offsetTop;
      }
      Object.assign(marker.style, {
        left: `${left}px`, top: `${top}px`,
        width: `${element.offsetWidth}px`, height: `${element.offsetHeight}px`,
      });
      const threshold = Math.min(0.5, window.innerHeight * 0.5 / element.offsetHeight);
      record.observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            element.classList.remove('art-reveal-visible');
          } else if (entry.intersectionRatio >= threshold) {
            element.classList.add('art-reveal-visible');
          }
        }
      }, { threshold: [0, threshold] });
      record.observer.observe(marker);
    }
  }

  function configureArtReveals() {
    for (const { element, observer } of records) {
      observer?.disconnect();
      element.classList.remove('art-reveal-ready', 'art-reveal-visible');
      if (!reducedMotion.matches) element.classList.add('art-reveal-ready');
    }
    updateArtObservers();
  }

  // Follow responsive reflow and font loading without reacting to scroll or transforms.
  let artResizeFrame;
  function scheduleArtUpdate() {
    cancelAnimationFrame(artResizeFrame);
    artResizeFrame = requestAnimationFrame(updateArtObservers);
  }
  configureArtReveals();
  window.addEventListener('resize', scheduleArtUpdate);
  document.fonts.ready.then(scheduleArtUpdate);
  if ('ResizeObserver' in window) {
    const layoutObserver = new ResizeObserver(scheduleArtUpdate);
    layoutObserver.observe(document.body);
    records.forEach(({ element }) => layoutObserver.observe(element));
  }
  reducedMotion.addEventListener('change', configureArtReveals);
}

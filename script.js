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

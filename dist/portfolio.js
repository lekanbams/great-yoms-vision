const root = document.documentElement;
const theme = document.querySelector('.theme');
const workMenu = document.querySelector('.work-menu');
const menu = document.querySelector('.mobile-menu');
const nav = document.querySelector('.nav');
const dialog = document.querySelector('dialog');
const player = document.querySelector('.player');
const labels = { music: 'Music videos', promo: 'Promotional films', bts: 'Behind the scenes' };

function updateTheme() {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  theme.querySelector('.sun').toggleAttribute('hidden', next !== 'light');
  theme.querySelector('.moon').toggleAttribute('hidden', next !== 'dark');
  theme.setAttribute('aria-label', 'Switch to ' + next + ' mode');
}
updateTheme();
theme.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('greatyoms-theme', root.dataset.theme); } catch {}
  updateTheme();
});
function closeNav() {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu');
  workMenu.open = false;
}
menu.addEventListener('click', () => {
  if (nav.classList.contains('open')) {
    closeNav();
  } else {
    nav.classList.add('open');
    menu.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-label', 'Close menu');
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeNav();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (workMenu.open) {
    workMenu.open = false;
    workMenu.querySelector('summary').focus();
  } else if (nav.classList.contains('open')) {
    closeNav();
    menu.focus();
  }
});
const category = new URLSearchParams(location.search).get('work');
if (document.querySelector('.gallery') && Object.hasOwn(labels, category)) {
  document.querySelector('.work-title').textContent = labels[category];
  document.querySelector('.mastline > p').hidden = true;
  document.querySelectorAll('.project').forEach(project => {
    project.hidden = project.dataset.category !== category;
    project.classList.remove('featured');
  });
  document.querySelector('[data-category-link="' + category + '"]').setAttribute('aria-current', 'page');
}
if (dialog) {
  let opener;
  document.querySelectorAll('[data-film], [data-reel]').forEach(button => {
    button.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = button;
      const project = button.closest('.project');
      const title = project.querySelector('h2').textContent.trim();
      const external = dialog.querySelector('.external');
      const reel = button.dataset.reel;
      dialog.querySelector('h2').textContent = title;
      dialog.querySelector('.role').textContent = project.dataset.role || '';
      external.href = project.querySelector('h2 a').href;
      external.textContent = reel ? 'Open original on Instagram' : 'Watch on YouTube';
      player.classList.toggle('reel-player', Boolean(reel));

      const frame = document.createElement('iframe');
      frame.title = title;
      frame.src = reel
        ? 'https://www.instagram.com/reel/' + reel + '/embed/'
        : 'https://www.youtube-nocookie.com/embed/' + button.dataset.film + '?autoplay=1&playsinline=1';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      player.replaceChildren(frame);
      dialog.showModal();
    });
  });
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.replaceChildren();
    opener?.focus();
  });
}

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const gallery = document.querySelector('.gallery');
if (gallery && !Object.hasOwn(labels, category)) {
  const projects = [...gallery.querySelectorAll('.project:not([hidden])')];
  const rows = [projects.slice(0, 1), projects.slice(1, 2), projects.slice(2)];
  gallery.classList.add('gallery-feature');
  for (const projectsInRow of rows) {
    if (!projectsInRow.length) continue;
    const row = document.createElement('div');
    row.className = 'work-row';
    if (projectsInRow.length === 1) row.classList.add('work-row-wide');
    row.append(...projectsInRow);
    gallery.append(row);
  }
}
if ('IntersectionObserver' in window && !motion.matches && gallery) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('revealed');
      reveal.unobserve(entry.target);
    }
  }, {threshold: 0, rootMargin: '0px 0px -10% 0px'});
  const isPhone = window.matchMedia('(max-width: 620px)').matches;
  const selector = gallery.classList.contains('gallery-feature') && !isPhone
    ? '.work-row' : '.project:not([hidden])';
  const targets = [document.querySelector('.masthead'), ...gallery.querySelectorAll(selector)];
  for (const target of targets) {
    target.classList.add('reveal-ready');
    reveal.observe(target);
  }
}

const heroFilm = document.querySelector('.hero-film');
if (heroFilm && motion.matches) {
  heroFilm.autoplay = false;
  heroFilm.pause();
}
if (heroFilm && 'IntersectionObserver' in window && !motion.matches) {
  const filmObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) heroFilm.play().catch(() => {});
    else heroFilm.pause();
  });
  if (!document.documentElement.classList.contains('category-view')) filmObserver.observe(heroFilm);
  else {
    heroFilm.autoplay = false;
    heroFilm.pause();
  }
}

const track = document.querySelector('.experience-slides');
if (track) {
  const dots = [...document.querySelectorAll('.experience-dots button')];
  const slides = [...track.querySelectorAll('article')];
  let timer;
  let inView = !('IntersectionObserver' in window);
  let interacting = false;
  let active = 0;

  function schedule() {
    clearTimeout(timer);
    if (inView && !interacting && !motion.matches && !document.hidden) {
      timer = setTimeout(() => goTo((active + 1) % slides.length), 6500);
    }
  }

  function updateDots() {
    active = Math.min(slides.length - 1, Math.round(track.scrollLeft / (track.clientWidth || 1)));
    dots.forEach((dot, i) => {
      if (i === active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    schedule();
  }

  function goTo(index) {
    track.scrollTo({left: index * track.clientWidth, behavior: motion.matches ? 'instant' : 'smooth'});
    schedule();
  }

  document.querySelector('.experience-dots').hidden = false;
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  track.addEventListener('scroll', updateDots, {passive: true});
  track.addEventListener('pointerdown', () => {
    interacting = true;
    schedule();
  });
  for (const event of ['pointerup', 'pointercancel']) {
    window.addEventListener(event, () => {
      if (!interacting) return;
      interacting = false;
      schedule();
    });
  }
  window.addEventListener('resize', () => track.scrollTo({left: active * track.clientWidth, behavior: 'instant'}));
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      schedule();
    }, {threshold: 0.25});
    observer.observe(track);
  }
  schedule();
}


const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (a, b, value) => {
  const x = clamp((value - a) / (b - a));
  return x * x * (3 - 2 * x);
};

const root = document.querySelector('[data-v10-experience]');
const stage = document.querySelector('[data-v10-stage]');
const film = document.querySelector('[data-v10-film]');
const media = document.querySelector('[data-v10-media]');
const poster = document.querySelector('[data-v10-poster]');
const loadLabel = document.querySelector('[data-v10-load]');
const progressBar = document.querySelector('[data-v10-progress]');
const indexLabel = document.querySelector('[data-v10-index]');
const chapterLabel = document.querySelector('[data-v10-label]');
const statusLabel = document.querySelector('[data-v10-status]');
const copies = [...document.querySelectorAll('[data-v10-copy]')];

if (root && stage && film && media) {
  const chapters = [
    { label: 'ENTRATA', status: 'Entrata' },
    { label: 'SALA SINISTRA', status: 'Sala sinistra' },
    { label: 'SALA DESTRA', status: 'Sala destra' },
    { label: 'DETTAGLIO', status: 'Dettaglio' },
  ];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const constrained = Boolean(connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || ''));
  const mobile = window.matchMedia('(max-width: 759px)').matches || constrained;
  const source = mobile ? '/v10/media/scroll-film-mobile.mp4' : '/v10/media/scroll-film-desktop.mp4';
  let duration = 12;
  let targetProgress = 0;
  let renderProgress = 0;
  let lastFrame = performance.now();
  let lastChapter = -1;
  let seekTarget = 0;
  let videoReady = false;
  let decoderUnlocked = false;
  let frameRequest = 0;

  const readProgress = () => {
    const rect = stage.getBoundingClientRect();
    const travel = Math.max(1, stage.offsetHeight - window.innerHeight);
    targetProgress = clamp(-rect.top / travel);
  };

  const bufferedPercent = () => {
    if (!film.duration || !film.buffered?.length) return 0;
    let end = 0;
    for (let i = 0; i < film.buffered.length; i += 1) end = Math.max(end, film.buffered.end(i));
    return clamp(end / film.duration);
  };

  const updateLoad = () => {
    const percent = Math.round(bufferedPercent() * 100);
    if (loadLabel) loadLabel.textContent = `FILM ${String(percent).padStart(2, '0')}%`;
    if (videoReady || percent >= 98) loadLabel?.classList.add('is-complete');
  };

  const setReady = () => {
    videoReady = true;
    if (!reduceMotion) media.classList.add('is-ready');
    loadLabel?.classList.add('is-complete');
  };

  const unlockDecoder = async () => {
    if (decoderUnlocked || reduceMotion) return;
    decoderUnlocked = true;
    try {
      const before = film.currentTime;
      await film.play();
      film.pause();
      film.currentTime = before;
    } catch (_) {
      decoderUnlocked = false;
    }
  };

  const chapterOpacity = (chapter, progress) => {
    const start = chapter / 4;
    const end = (chapter + 1) / 4;
    const fade = 0.026;
    const enter = chapter === 0 ? 1 : smoothstep(start - fade, start + fade, progress);
    const exit = chapter === 3 ? 1 : 1 - smoothstep(end - fade, end + fade, progress);
    return clamp(enter * exit);
  };

  const updateUI = (progress) => {
    root.style.setProperty('--v10-progress', progress.toFixed(5));
    root.style.setProperty('--v10-outro', smoothstep(.965, 1, progress).toFixed(4));
    root.style.setProperty('--v10-cue-opacity', (1 - smoothstep(.006, .055, progress)).toFixed(4));
    const active = Math.min(3, Math.floor(clamp(progress * 4, 0, 3.9999)));
    if (active !== lastChapter) {
      lastChapter = active;
      if (indexLabel) indexLabel.textContent = String(active + 1).padStart(2, '0');
      if (chapterLabel) chapterLabel.textContent = chapters[active].label;
      if (statusLabel) statusLabel.textContent = `${chapters[active].status}, capitolo ${active + 1} di 4`;
      poster?.setAttribute('data-chapter', String(active + 1));
      if (reduceMotion && poster) poster.src = `/v10/media/chapters/${String(active + 1).padStart(2, '0')}.webp`;
    }
    copies.forEach((copy, i) => {
      const opacity = chapterOpacity(i, progress);
      const center = (i + .5) / 4;
      const relative = (progress - center) * 100;
      copy.style.setProperty('--v10-opacity', opacity.toFixed(4));
      copy.style.setProperty('--v10-y', `${clamp(relative * -0.38, -22, 22).toFixed(2)}px`);
      copy.style.setProperty('--v10-copy-blur', `${((1 - opacity) * 8).toFixed(2)}px`);
    });
    media.classList.toggle('is-idle', progress < .004);
  };

  const requestSeek = (time) => {
    seekTarget = time;
    if (!videoReady || reduceMotion || !Number.isFinite(time)) return;
    const threshold = 1 / 42;
    if (Math.abs(film.currentTime - seekTarget) < threshold) return;
    try { film.currentTime = seekTarget; } catch (_) {}
  };

  const render = (now) => {
    const dt = Math.min(.05, Math.max(.001, (now - lastFrame) / 1000));
    lastFrame = now;
    const distance = Math.abs(targetProgress - renderProgress);
    const response = distance > .16 ? 24 : distance > .055 ? 16 : 10;
    const alpha = 1 - Math.exp(-response * dt);
    renderProgress += (targetProgress - renderProgress) * alpha;
    if (distance < .00008) renderProgress = targetProgress;
    updateUI(renderProgress);
    const safeDuration = Math.max(.25, duration - .08);
    requestSeek(.035 + renderProgress * safeDuration);
    frameRequest = requestAnimationFrame(render);
  };

  const onMetadata = () => {
    if (Number.isFinite(film.duration) && film.duration > 0) duration = film.duration;
    requestSeek(.035 + renderProgress * Math.max(.25, duration - .08));
    updateLoad();
  };

  film.muted = true;
  film.playsInline = true;
  film.preload = 'auto';
  film.src = source;
  film.addEventListener('loadedmetadata', onMetadata, { passive: true });
  film.addEventListener('loadeddata', setReady, { once: true, passive: true });
  film.addEventListener('canplay', setReady, { once: true, passive: true });
  film.addEventListener('progress', updateLoad, { passive: true });
  film.addEventListener('error', () => {
    media.classList.add('is-fallback');
    loadLabel?.classList.add('is-complete');
  }, { passive: true });
  film.load();

  readProgress();
  renderProgress = targetProgress;
  updateUI(renderProgress);
  window.addEventListener('scroll', readProgress, { passive: true });
  window.addEventListener('resize', readProgress, { passive: true });
  window.addEventListener('orientationchange', readProgress, { passive: true });
  window.addEventListener('pageshow', readProgress, { passive: true });
  document.addEventListener('pointerdown', unlockDecoder, { once: true, passive: true });
  document.addEventListener('touchstart', unlockDecoder, { once: true, passive: true });
  frameRequest = requestAnimationFrame(render);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) film.pause();
    else readProgress();
  }, { passive: true });

  // Keep the original V9+ page below the new film, while suppressing only its superseded intro/header.
  const hideLegacyIntro = () => {
    const legacyRoots = [...document.body.children].filter((node) => node !== root && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE');
    legacyRoots.forEach((legacyRoot) => {
      legacyRoot.querySelectorAll('header').forEach((header) => header.setAttribute('data-v10-legacy-hidden', 'true'));
      const selectors = 'section, main > div, main > article, [data-section]';
      const candidates = [...legacyRoot.querySelectorAll(selectors)];
      const labels = ['entrata', 'bancone', 'sala sinistra', 'sala destra'];
      const scored = candidates.map((element) => {
        const text = (element.textContent || '').toLocaleLowerCase('it');
        const hits = labels.reduce((sum, label) => sum + (text.includes(label) ? 1 : 0), 0);
        const hasFilm = element.querySelectorAll('video, canvas').length > 0;
        const hasMenu = /il men[uù]|pizze|birre alla spina/i.test(text);
        return { element, hits, hasFilm, hasMenu, length: text.length, depth: element.querySelectorAll('*').length };
      }).filter((item) => item.hits >= 3 && item.length < 9000 && !item.hasMenu);
      scored.sort((a, b) => b.hits - a.hits || Number(b.hasFilm) - Number(a.hasFilm) || a.depth - b.depth);
      if (scored[0]) {
        scored[0].element.setAttribute('data-v10-legacy-hidden', 'true');
        return;
      }
      const menuSection = candidates.find((element) => /il men[uù]/i.test(element.textContent || ''));
      const beforeMenu = candidates.filter((element) => {
        if (!menuSection) return true;
        return Boolean(element.compareDocumentPosition(menuSection) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      const introSections = beforeMenu.filter((element) => {
        const text = (element.textContent || '').toLocaleLowerCase('it');
        return labels.some((label) => text.includes(label)) || element.querySelector('video');
      }).slice(0, 4);
      introSections.forEach((element) => element.setAttribute('data-v10-legacy-hidden', 'true'));
    });
  };

  hideLegacyIntro();
  const observer = new MutationObserver(hideLegacyIntro);
  observer.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 9000);

  const findDestination = (key) => {
    const direct = document.getElementById(key) || document.querySelector(`[data-section="${key}"]`);
    if (direct && !direct.closest('#v10-experience')) return direct;
    const patterns = {
      menu: /il men[uù]|men[uù]/i,
      socials: /la serata continua|socials|seguici/i,
      info: /ci vediamo|info|orari|aperto|chiuso/i,
    };
    return [...document.querySelectorAll('section, footer')].find((element) => !element.closest('#v10-experience') && patterns[key]?.test(element.textContent || ''));
  };

  root.querySelectorAll('[data-v10-jump]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (/^(tel:|https?:)/i.test(href)) return;
    link.addEventListener('click', (event) => {
      const destination = findDestination(link.dataset.v10Jump);
      if (!destination) return;
      event.preventDefault();
      destination.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  window.addEventListener('pagehide', () => cancelAnimationFrame(frameRequest), { once: true });
}

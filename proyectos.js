/**
 * Deal Sports - Proyectos Gallery Logic
 */

// --- API ---
const ERP_API = `${location.origin}/backend/api`;

function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/assets/')) return url; // relativo al propio sitio
  return ERP_API.replace('/backend/api', '') + url;   // subidas al ERP
}

// Miniatura para tarjetas y grillas (la foto completa queda para el lightbox).
// Locales: assets/fotos_web/thumbs/*.webp (se generan con scripts/thumbs.sh).
// Cloudinary: se pide redimensionada y en formato automático agregando la transformación a la URL.
function thumbUrl(url) {
  if (!url) return '';
  if (url.includes('res.cloudinary.com/') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/w_800,c_limit,f_auto,q_auto/');
  }
  const m = url.match(/^(.*\/assets\/fotos_web\/)([^/]+)\.(jpe?g|png)$/i);
  return m ? `${m[1]}thumbs/${m[2]}.webp` : url;
}

function mapProject(p) {
  return {
    _id:         p.id,
    id:          'proj-' + p.id,
    title:       p.titulo,
    sport:       p.sport,
    type:        p.type,
    image:       resolveImageUrl(p.portada_url),
    thumb:       thumbUrl(resolveImageUrl(p.portada_url)),
    featured:    p.featured == 1,
    date:        p.fecha || '2025-01-01',
    alt:         p.titulo,
    departamento: p.departamento || '',
    descripcion: p.descripcion || '',
    slug:        p.slug || '',
  };
}

// --- DATA (cargado desde API) ---
let projects = [];

// --- STATE ---
let activeSport = 'all';
let activeType = 'all';
let currentSort = 'recent';
let currentViewMode = 'gallery';
let currentFilteredProjects = [];

let lightboxIndex = 0;
let lightboxActive = false;
let lightboxPhotos = [];   // fotos del proyecto actual
let lightboxPhotoIndex = 0;

// --- CARGA DESDE API ---
async function fetchProyectos() {
  try {
    const res = await fetch(`${ERP_API}/web/proyectos.php`);
    const json = await res.json();
    return (json.data || []).map(mapProject);
  } catch (_) {
    return [];
  }
}

// ── LABELS ──────────────────────────────────────────────────────
const SPORT_LABEL = { padel:'Pádel', tenis:'Tenis', futbol:'Fútbol', golf:'Golf', basket:'Basket', skate:'Skate', hockey:'Hockey' };
const TYPE_LABEL  = { edificio:'Edificio', particular:'Particular', urbanizacion:'Urbanización', complejo:'Complejo', colegio:'Colegio', club:'Club' };

// ── FEATURED CAROUSEL ────────────────────────────────────────────
let fcAutoTimer = null;

function buildCarouselCards(list, onclick) {
  return list.map(p => `
    <div class="fc-slide">
      <div class="portfolio-card" onclick="${onclick}(${p._id})">
        <div class="portfolio-card__bg" style="background:linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,0.8) 100%),url('${p.thumb}') center/cover no-repeat;"></div>
        <div class="portfolio-card__tags">
          <span class="portfolio-card__tag">${SPORT_LABEL[p.sport] || p.sport}</span>
          ${p.departamento ? `<span class="portfolio-card__tag">${p.departamento}</span>` : ''}
        </div>
        <div class="portfolio-card__content">
          <h3 class="portfolio-card__title">${p.title}</h3>
          ${p.descripcion
            ? `<p class="portfolio-card__desc">${p.descripcion.length > 90 ? p.descripcion.slice(0,90)+'…' : p.descripcion}</p>`
            : `<p class="portfolio-card__desc">${TYPE_LABEL[p.type] || p.type}</p>`}
          <div class="portfolio-card__btn"><span>Ver Proyecto</span><span class="portfolio-card__btn-arrow">↗</span></div>
        </div>
      </div>
    </div>
  `).join('');
}

function initCarousel(viewportId, trackId, dotsId, prevId, nextId, count, autoAdvance) {
  const viewport = document.getElementById(viewportId);
  const track    = document.getElementById(trackId);
  const dotsEl   = document.getElementById(dotsId);
  if (!viewport || !track) return;

  // Build dots
  if (dotsEl) {
    dotsEl.innerHTML = Array.from({length: count}, (_, i) =>
      `<button class="fc-dot${i===0?' active':''}" data-i="${i}"></button>`
    ).join('');
  }

  let cur = 0;
  const isMobile = () => window.innerWidth < 768;
  const perPage  = () => isMobile() ? 1 : 3;

  function slideWidth() {
    const slide = track.querySelector('.fc-slide');
    if (!slide) return 0;
    const gap = parseInt(getComputedStyle(track).gap) || 30;
    return slide.offsetWidth + gap;
  }

  function goTo(idx) {
    const pp = perPage();
    const max = Math.max(0, count - pp);
    cur = Math.max(0, Math.min(idx, max));
    track.style.transform = `translateX(-${cur * slideWidth()}px)`;
    if (dotsEl) dotsEl.querySelectorAll('.fc-dot').forEach((d,i) => d.classList.toggle('active', i === cur));
    const prevEl = document.getElementById(prevId);
    const nextEl = document.getElementById(nextId);
    if (prevEl) prevEl.disabled = cur === 0;
    if (nextEl) nextEl.disabled = cur >= max;
  }

  document.getElementById(prevId)?.addEventListener('click', () => { goTo(cur - 1); resetAuto(); });
  document.getElementById(nextId)?.addEventListener('click', () => { goTo(cur + 1); resetAuto(); });
  dotsEl?.querySelectorAll('.fc-dot').forEach(d =>
    d.addEventListener('click', () => { goTo(+d.dataset.i); resetAuto(); })
  );
  window.addEventListener('resize', () => goTo(cur));

  function resetAuto() {
    if (!autoAdvance) return;
    clearInterval(fcAutoTimer);
    fcAutoTimer = setInterval(() => {
      const pp = perPage();
      goTo(cur + pp >= count ? 0 : cur + 1);
    }, 5000);
  }

  goTo(0);
  resetAuto();
}

async function renderFeaturedHome() {
  const grid = document.getElementById('ds-featured-grid');
  if (!grid) return;
  const featured = projects.filter(p => p.featured);
  if (!featured.length) return;

  grid.innerHTML = `
    <div class="fc-container">
      <button class="fc-arrow fc-arrow--prev" id="fc-prev">&#8592;</button>
      <div class="fc-viewport" id="fc-viewport">
        <div class="fc-track" id="fc-track">
          ${buildCarouselCards(featured, 'navigateToProject')}
        </div>
      </div>
      <button class="fc-arrow fc-arrow--next" id="fc-next">&#8594;</button>
    </div>
    <div class="fc-dots" id="fc-dots"></div>
  `;

  initCarousel('fc-viewport', 'fc-track', 'fc-dots', 'fc-prev', 'fc-next', featured.length, true);
}

// ── PROJECT DETAIL ────────────────────────────────────────────────
let proyGalleryPhotos = [];
let proyGalleryIdx    = 0;

// URL de la ficha: /proyectos/12-nombre-del-proyecto/ (la arma el servidor con el mismo slug)
function projectUrl(id) {
  const p = projects.find(q => String(q._id) === String(id));
  return `/proyectos/${id}${p && p.slug ? '-' + p.slug : ''}/`;
}

async function navigateToProject(id, pushHistory) {
  if (pushHistory !== false) history.pushState({ page: 'proyecto', id }, '', projectUrl(id));
  navigate('proyecto', false);

  const loadEl    = document.getElementById('proy-loading');
  const contentEl = document.getElementById('proy-content');
  // Si el servidor ya mandó esta ficha armada (ver ficha_proyecto.php), no mostrar "Cargando..."
  const yaArmada  = contentEl && contentEl.dataset.id === String(id);
  if (!yaArmada) {
    if (loadEl)    { loadEl.style.display = 'block'; loadEl.textContent = 'Cargando...'; }
    if (contentEl) contentEl.style.display = 'none';
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res  = await fetch(`${ERP_API}/web/proyectos.php?id=${id}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.data) throw new Error('Proyecto no encontrado');
    renderProjectDetail(json.data);
    document.title = `${json.data.titulo} | Proyectos Deal Sports`;
  } catch(e) {
    const msg = e.name === 'AbortError' ? 'Tiempo de espera agotado, intentá de nuevo' : 'No se pudo cargar el proyecto, intentá de nuevo';
    if (loadEl) { loadEl.style.display = 'block'; loadEl.textContent = msg; }
  }
}

function renderProjectDetail(p) {
  proyGalleryPhotos = (p.fotos || []).map(f => resolveImageUrl(f.url));
  proyGalleryIdx    = 0;

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('proy-titulo',   p.titulo || '');
  setTxt('proy-sport-tag', SPORT_LABEL[p.sport] || p.sport || '');
  setTxt('proy-depto',    p.departamento || '');
  setTxt('proy-year',     p.fecha ? new Date(p.fecha).getFullYear() : '');
  setTxt('proy-desc',     p.descripcion || '');

  // Gallery grid
  const galleryEl = document.getElementById('proy-gallery');
  if (galleryEl) {
    galleryEl.innerHTML = proyGalleryPhotos.map((url, i) => `
      <div class="proy-photo" onclick="openProyLightbox(${i})">
        <img src="${thumbUrl(url)}" alt="${p.titulo} foto ${i+1}" loading="lazy">
      </div>
    `).join('');
  }

  document.getElementById('proy-loading').style.display  = 'none';
  document.getElementById('proy-content').style.display  = 'block';
  document.getElementById('proy-content').dataset.id    = String(p.id);

  renderOtrosDestacados(p.id);

  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Carrusel "Otros proyectos destacados" de la ficha. Se vuelve a dibujar cuando llega la
// lista de proyectos, porque al entrar directo a una ficha puede no estar cargada todavía.
function renderOtrosDestacados(currentId) {
  const otros = projects.filter(q => q.featured && String(q._id) !== String(currentId));
  const otrosTrack = document.getElementById('otros-fc-track');
  const otrosWrap  = document.getElementById('otros-fc-wrap');
  if (otrosTrack && otros.length) {
    otrosTrack.innerHTML = buildCarouselCards(otros, 'navigateToProject');
    if (otrosWrap) otrosWrap.style.display = '';
    initCarousel('otros-fc-viewport', 'otros-fc-track', 'otros-fc-dots', 'otros-fc-prev', 'otros-fc-next', otros.length, false);
  } else if (otrosWrap) {
    otrosWrap.style.display = 'none';
  }
}

// ── LIGHTBOX ──────────────────────────────────────────────────────
function openProyLightbox(idx) {
  proyGalleryIdx = idx;
  updateProyLightbox();
  document.getElementById('proy-lightbox').style.display = 'flex';
  document.addEventListener('keydown', onLightboxKey);
}

function closeProyLightbox() {
  document.getElementById('proy-lightbox').style.display = 'none';
  document.removeEventListener('keydown', onLightboxKey);
}

function onLightboxKey(e) {
  if (e.key === 'ArrowLeft')  { proyGalleryIdx = Math.max(0, proyGalleryIdx - 1); updateProyLightbox(); }
  if (e.key === 'ArrowRight') { proyGalleryIdx = Math.min(proyGalleryPhotos.length - 1, proyGalleryIdx + 1); updateProyLightbox(); }
  if (e.key === 'Escape')     closeProyLightbox();
}

function updateProyLightbox() {
  const lbImg = document.getElementById('proy-lb-img');
  lbImg.src = proyGalleryPhotos[proyGalleryIdx];
  lbImg.alt = `${document.getElementById('proy-titulo').textContent} foto ${proyGalleryIdx + 1}`;
  document.getElementById('proy-lb-counter').textContent = `${proyGalleryIdx + 1} / ${proyGalleryPhotos.length}`;
  document.getElementById('proy-lb-prev').disabled = proyGalleryIdx === 0;
  document.getElementById('proy-lb-next').disabled = proyGalleryIdx === proyGalleryPhotos.length - 1;
}

// ── DOM INIT ──────────────────────────────────────────────────────
// La última lista se guarda en el navegador: en visitas siguientes el carrusel y el
// portafolio se dibujan al instante y la API solo se consulta para actualizar.
const PROY_CACHE_KEY = 'ds_proyectos_v1';

function readCachedProyectos() {
  try { return JSON.parse(localStorage.getItem(PROY_CACHE_KEY)) || null; } catch (_) { return null; }
}

// Sección "Obras realizadas" de cada página de superficie: links a las fichas de ese deporte.
// scripts/build-pages.py genera el mismo HTML en el deploy para que Google vea los links.
function renderObrasPorDeporte() {
  document.querySelectorAll('.surface-obras').forEach(sec => {
    const obras = projects.filter(p => p.sport === sec.dataset.sport);
    sec.hidden = obras.length === 0;
    sec.querySelector('.obras-list').innerHTML = obras.map(p => `
      <a class="obra-link" href="${projectUrl(p._id)}" onclick="navigateToProject(${p._id}); return false;">
        <span class="obra-link__title">${p.title}</span>
        <span class="obra-link__meta">${[TYPE_LABEL[p.type], p.departamento].filter(Boolean).join(' · ')}</span>
      </a>`).join('');
  });
}

function renderProjects(list) {
  projects = list;
  currentFilteredProjects = [...projects];
  renderFeaturedHome();
  renderObrasPorDeporte();
  if (document.getElementById("portfolio-grid-dynamic")) applyFiltersAndRender();
  const fichaId = document.getElementById('proy-content')?.dataset.id;
  if (fichaId && document.getElementById('page-proyecto').classList.contains('active')) renderOtrosDestacados(fichaId);
}

document.addEventListener("DOMContentLoaded", async () => {
  if (document.getElementById("portfolio-grid-dynamic")) {
    bindFilters();
    bindSorting();
    bindViewModes();
    bindLightbox();
  }

  const cached = readCachedProyectos();
  if (cached && cached.length) renderProjects(cached);

  const fresh = await fetchProyectos();
  if (!fresh.length) return;   // API caída: queda lo que había en caché
  if (!cached || JSON.stringify(cached) !== JSON.stringify(fresh)) renderProjects(fresh);
  try { localStorage.setItem(PROY_CACHE_KEY, JSON.stringify(fresh)); } catch (_) {}
});

// --- FILTERING & RENDERING ---
function bindFilters() {
  const sportBtns = document.querySelectorAll('.filter-sport');
  const typeBtns = document.querySelectorAll('.filter-type');

  sportBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      sportBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeSport = e.currentTarget.dataset.filter;
      applyFiltersAndRender();
    });
  });

  typeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      typeBtns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeType = e.currentTarget.dataset.filter;
      applyFiltersAndRender();
    });
  });
}

function bindSorting() {
  const sortSelect = document.getElementById('portfolio-sort');
  if(sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFiltersAndRender();
    });
  }
}

function bindViewModes() {
  const viewBtns = document.querySelectorAll('.view-mode-btn');
  const gridContainer = document.getElementById('portfolio-grid-dynamic');

  viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const btnTarget = e.currentTarget;
      viewBtns.forEach(b => b.classList.remove('active'));
      btnTarget.classList.add('active');
      
      currentViewMode = btnTarget.dataset.view;
      gridContainer.className = 'portfolio-grid-dynamic'; 
      gridContainer.classList.add(`view-${currentViewMode}`);
    });
  });
}

function updateCounters() {
  document.querySelectorAll('.filter-sport').forEach(btn => {
    const f = btn.dataset.filter;
    let count = 0;
    if (f === 'all') {
      count = projects.filter(p => activeType === 'all' || p.type === activeType).length;
    } else {
      count = projects.filter(p => p.sport === f && (activeType === 'all' || p.type === activeType)).length;
    }
    const countSpan = btn.querySelector('.filter-count');
    if (countSpan) countSpan.textContent = count;
  });

  document.querySelectorAll('.filter-type').forEach(btn => {
    const f = btn.dataset.filter;
    let count = 0;
    if (f === 'all') {
      count = projects.filter(p => activeSport === 'all' || p.sport === activeSport).length;
    } else {
      count = projects.filter(p => p.type === f && (activeSport === 'all' || p.sport === activeSport)).length;
    }
    const countSpan = btn.querySelector('.filter-count');
    if (countSpan) countSpan.textContent = count;
  });
}

function applyFiltersAndRender() {
  currentFilteredProjects = projects.filter(p => {
    const matchSport = activeSport === 'all' || p.sport === activeSport;
    const matchType = activeType === 'all' || p.type === activeType;
    return matchSport && matchType;
  });

  currentFilteredProjects.sort((a, b) => {
    if (currentSort === 'recent') {
      return new Date(b.date) - new Date(a.date);
    } else if (currentSort === 'az') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const resultText = document.getElementById('portfolio-results-text');
  if (resultText) {
    if (currentFilteredProjects.length === 0) {
      resultText.textContent = "No hay proyectos para esta combinación de filtros.";
    } else {
      resultText.textContent = `Mostrando ${currentFilteredProjects.length} proyectos`;
    }
  }

  updateCounters();

  const gridContainer = document.getElementById('portfolio-grid-dynamic');
  gridContainer.innerHTML = '';

  currentFilteredProjects.forEach((proj, index) => {
    const card = document.createElement('div');
    card.className = 'portfolio-item dynamic-card';
    card.innerHTML = `
      <div class="portfolio-item__bg" style="background: url('${proj.thumb}') center/cover no-repeat;"></div>
      <div class="portfolio-item__overlay">
        <h3 class="portfolio-item__title">${proj.title}</h3>
        <p class="portfolio-item__type">${formatCategory(proj.sport)} · ${formatType(proj.type)}</p>
      </div>
    `;
    card.addEventListener('click', () => openLightbox(index));
    gridContainer.appendChild(card);
  });
}

// --- LIGHTBOX ---
function bindLightbox() {
  const lightbox = document.getElementById('ds-lightbox');
  const btnClose = document.getElementById('ds-lightbox-close');
  const btnPrev = document.getElementById('ds-lightbox-prev');
  const btnNext = document.getElementById('ds-lightbox-next');

  if (!lightbox) return;

  btnClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });

  document.addEventListener('keydown', (e) => {
    if (!lightboxActive) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

async function openLightbox(index) {
  if (currentFilteredProjects.length === 0) return;
  lightboxIndex      = index;
  lightboxPhotoIndex = 0;
  lightboxActive     = true;
  document.body.style.overflow = 'hidden';

  const proj    = currentFilteredProjects[index];
  const lightbox = document.getElementById('ds-lightbox');

  // Mostrar portada de inmediato mientras carga el resto
  lightboxPhotos = [{ url: proj.image, alt: proj.title }];
  updateLightboxImage();
  lightbox.classList.add('active');

  // Fetch de todas las fotos del proyecto
  try {
    const res  = await fetch(`${ERP_API}/web/proyectos.php?id=${proj._id}`);
    const json = await res.json();
    const fotos = (json.data?.fotos || []);
    if (fotos.length) {
      lightboxPhotos = fotos.map(f => ({ url: resolveImageUrl(f.url), alt: proj.title }));
      updateLightboxImage();
    }
  } catch (_) { /* mantiene la portada */ }
}

function closeLightbox() {
  lightboxActive = false;
  document.body.style.overflow = '';
  document.getElementById('ds-lightbox').classList.remove('active');
}

function navigateLightbox(dir) {
  lightboxPhotoIndex += dir;
  if (lightboxPhotoIndex < 0) lightboxPhotoIndex = lightboxPhotos.length - 1;
  if (lightboxPhotoIndex >= lightboxPhotos.length) lightboxPhotoIndex = 0;
  updateLightboxImage();
}

function updateLightboxImage() {
  const imgEl     = document.getElementById('ds-lightbox-img');
  const titleEl   = document.getElementById('ds-lightbox-title');
  const counterEl = document.getElementById('ds-lightbox-counter');
  const prevBtn   = document.getElementById('ds-lightbox-prev');
  const nextBtn   = document.getElementById('ds-lightbox-next');

  const foto = lightboxPhotos[lightboxPhotoIndex];
  const proj = currentFilteredProjects[lightboxIndex];

  imgEl.src   = foto.url;
  imgEl.alt   = foto.alt;
  titleEl.textContent   = proj.title;
  counterEl.textContent = lightboxPhotos.length > 1
    ? `${lightboxPhotoIndex + 1} / ${lightboxPhotos.length}`
    : '';

  // Ocultar flechas si solo hay una foto
  if (prevBtn) prevBtn.style.display = lightboxPhotos.length > 1 ? '' : 'none';
  if (nextBtn) nextBtn.style.display = lightboxPhotos.length > 1 ? '' : 'none';
}

function formatCategory(val) {
  const map = { padel: "Padel", tenis: "Tenis", futbol: "Fútbol", golf: "Putting Green", basket: "Basket & Pickleball", skate: "Skate", hockey: "Hockey" };
  return map[val] || val;
}
function formatType(val) {
  const map = { club: "Club", particular: "Particular", edificio: "Edificio", urbanizacion: "Urbanización", colegio: "Colegio", complejo: "Complejo" };
  return map[val] || val;
}

// --- CUSTOM NAVIGATION ---
function openProjectFromHome(projectId) {
  if (typeof navigate === 'function') {
    navigate('portafolio');
  }

  activeSport = 'all';
  activeType = 'all';
  document.querySelectorAll('.filter-sport').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.filter-type').forEach(b => b.classList.remove('active'));
  
  const allSportBtn = document.querySelector('.filter-sport[data-filter="all"]');
  if (allSportBtn) allSportBtn.classList.add('active');
  const allTypeBtn = document.querySelector('.filter-type[data-filter="all"]');
  if (allTypeBtn) allTypeBtn.classList.add('active');

  applyFiltersAndRender();

  setTimeout(() => {
    const index = currentFilteredProjects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      openLightbox(index);
    }
  }, 300);
}

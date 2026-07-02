/**
 * Deal Sports - Proyectos Gallery Logic
 */

// --- API ---
const ERP_API = 'https://dserp-production.up.railway.app/backend/api';

function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/assets/')) return url; // relativo al sitio Vercel
  return ERP_API.replace('/backend/api', '') + url;   // subidas al ERP (Railway)
}

function mapProject(p) {
  return {
    id:          'proj-' + p.id,
    title:       p.titulo,
    sport:       p.sport,
    type:        p.type,
    image:       resolveImageUrl(p.portada_url),
    featured:    p.featured == 1,
    date:        p.fecha || '2025-01-01',
    alt:         p.titulo,
    departamento: p.departamento || '',
    descripcion: p.descripcion || '',
  };
}

// --- DATA (cargado desde API) ---
let projects = [
  {
    "id": "proj-0",
    "title": "Veramansa",
    "sport": "tenis",
    "type": "edificio",
    "image": "./assets/fotos_web/1--Veramansa-tenis-Edificio.jpg",
    "featured": true,
    "date": "2025-01-01"
  },
  {
    "id": "proj-1",
    "title": "Dovat",
    "sport": "tenis",
    "type": "particular",
    "image": "./assets/fotos_web/10-dovat-particular-tenis.jpg",
    "featured": true,
    "date": "2025-01-02"
  },
  {
    "id": "proj-2",
    "title": "Soriano",
    "sport": "tenis",
    "type": "particular",
    "image": "./assets/fotos_web/11-soriano-particular.jpg",
    "featured": true,
    "date": "2025-01-03"
  },
  {
    "id": "proj-3",
    "title": "Reserva Montoya",
    "sport": "tenis",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/12--reserva-montoya-tenis- urbanizacion.JPG",
    "featured": true,
    "date": "2025-01-04"
  },
  {
    "id": "proj-4",
    "title": "Tomas",
    "sport": "tenis",
    "type": "particular",
    "image": "./assets/fotos_web/14--tomas-particular tenis.jpg",
    "featured": true,
    "date": "2025-01-05"
  },
  {
    "id": "proj-5",
    "title": "Venetian",
    "sport": "tenis",
    "type": "edificio",
    "image": "./assets/fotos_web/15----venetian-tenis-edificio.jpg",
    "featured": false,
    "date": "2025-01-06"
  },
  {
    "id": "proj-6",
    "title": "Reserva Montoya",
    "sport": "golf",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/16--reserva-montoya-golf-- urbanizacion.jpg",
    "featured": false,
    "date": "2025-01-07"
  },
  {
    "id": "proj-7",
    "title": "Reserva Montoya",
    "sport": "padel",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/17---reserva-montoya-padel-- urbanizacion.jpg",
    "featured": false,
    "date": "2025-01-08"
  },
  {
    "id": "proj-8",
    "title": "Solanas",
    "sport": "tenis",
    "type": "complejo",
    "image": "./assets/fotos_web/18---solanas-tenis-complejo.jpg",
    "featured": false,
    "date": "2025-01-09"
  },
  {
    "id": "proj-9",
    "title": "Indigo",
    "sport": "tenis",
    "type": "edificio",
    "image": "./assets/fotos_web/19--Indigo-edificio-tenis.jpg",
    "featured": false,
    "date": "2025-01-01"
  },
  {
    "id": "proj-10",
    "title": "Horneros",
    "sport": "basket",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/2--horneros-pickleball-Urbanizacion.jpg",
    "featured": false,
    "date": "2025-01-02"
  },
  {
    "id": "proj-12",
    "title": "Aura",
    "sport": "padel",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/21--aura-padel-- urbanizacion.jpg",
    "featured": false,
    "date": "2025-01-04"
  },
  {
    "id": "proj-13",
    "title": "Aura",
    "sport": "golf",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/22--aura-golf- urbanizacion.jpg",
    "featured": false,
    "date": "2025-01-05"
  },
  {
    "id": "proj-14",
    "title": "Laguna Estates",
    "sport": "tenis",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/23--laguna-estates-tenis- urbanizacion.jpg",
    "featured": false,
    "date": "2025-01-06"
  },
  {
    "id": "proj-15",
    "title": "Proyecto Deal Sports",
    "sport": "basket",
    "type": "particular",
    "image": "./assets/fotos_web/24--particular-pickleball.jpg",
    "featured": false,
    "date": "2025-01-07"
  },
  {
    "id": "proj-16",
    "title": "Distrito 52",
    "sport": "padel",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/25---distrito-52-tenis-padel- urbanizacion.JPG",
    "featured": false,
    "date": "2025-01-08"
  },
  {
    "id": "proj-17",
    "title": "Distrito 52",
    "sport": "futbol",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/26---distrito-52-futbol- urbanizacion.JPG",
    "featured": false,
    "date": "2025-01-09"
  },
  {
    "id": "proj-18",
    "title": "Reserva Montoya",
    "sport": "skate",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/28---reserva-montoya-skate- urbanizacion.JPG",
    "featured": false,
    "date": "2025-01-01"
  },
  {
    "id": "proj-19",
    "title": "Aldeana",
    "sport": "tenis",
    "type": "edificio",
    "image": "./assets/fotos_web/29---edificio-aldeana-tenis.JPG",
    "featured": false,
    "date": "2025-01-02"
  },
  {
    "id": "proj-20",
    "title": "Reserva",
    "sport": "futbol",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/3--reserva-futbol-Urbanizacion.jpg",
    "featured": false,
    "date": "2025-01-03"
  },
  {
    "id": "proj-21",
    "title": "North Schools Multi Cancha",
    "sport": "hockey",
    "type": "colegio",
    "image": "./assets/fotos_web/31---north-schools-hockey-multi-cancha-colegio.jpg",
    "featured": false,
    "date": "2025-01-04"
  },
  {
    "id": "proj-22",
    "title": "Cliente",
    "sport": "tenis",
    "type": "particular",
    "image": "./assets/fotos_web/32---tenis-cliente-particular.jpg",
    "featured": false,
    "date": "2025-01-05"
  },
  {
    "id": "proj-24",
    "title": "Surfside",
    "sport": "tenis",
    "type": "edificio",
    "image": "./assets/fotos_web/5--surfside-edificio.jpeg",
    "featured": false,
    "date": "2025-01-07"
  },
  {
    "id": "proj-25",
    "title": "Los Pinos",
    "sport": "basket",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/7--pickleball-los-pinos-urbanizacion.jpg",
    "featured": false,
    "date": "2025-01-08"
  },
  {
    "id": "proj-26",
    "title": "Posada Luz",
    "sport": "tenis",
    "type": "urbanizacion",
    "image": "./assets/fotos_web/8--posada luz-tenis-urbanizacion.jpg",
    "featured": false,
    "date": "2025-01-09"
  },
  {
    "id": "proj-27",
    "title": "Veramansa Polideportiva",
    "sport": "basket",
    "type": "edificio",
    "image": "./assets/fotos_web/9-veramansa-polideportiva-edificio.jpg",
    "featured": false,
    "date": "2025-01-01"
  }
];

// --- STATE ---
let activeSport = 'all';
let activeType = 'all';
let currentSort = 'recent';
let currentViewMode = 'gallery';
let currentFilteredProjects = [];

let lightboxIndex = 0;
let lightboxActive = false;

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

async function renderFeaturedHome() {
  const grid = document.getElementById('ds-featured-grid');
  if (!grid) return;
  const featured = projects.filter(p => p.featured).slice(0, 3);
  if (!featured.length) return;

  const SPORT_LABEL = { padel:'Pádel', tenis:'Tenis', futbol:'Fútbol', golf:'Golf', basket:'Basket', skate:'Skate', hockey:'Hockey' };
  const TYPE_LABEL  = { edificio:'Edificio', particular:'Particular', urbanizacion:'Urbanización', complejo:'Complejo', colegio:'Colegio', club:'Club' };

  grid.innerHTML = featured.map(p => `
    <div class="portfolio-card" onclick="navigate('portafolio')">
      <div class="portfolio-card__bg" style="background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), url('${p.image}') center/cover no-repeat;"></div>
      <div class="portfolio-card__tags">
        <span class="portfolio-card__tag">${SPORT_LABEL[p.sport] || p.sport}</span>
        ${p.departamento ? `<span class="portfolio-card__tag">${p.departamento}</span>` : ''}
      </div>
      <div class="portfolio-card__content">
        <h3 class="portfolio-card__title">${p.title}</h3>
        ${p.descripcion ? `<p class="portfolio-card__desc">${p.descripcion}</p>` : `<p class="portfolio-card__desc">${TYPE_LABEL[p.type] || p.type}</p>`}
        <div class="portfolio-card__btn">
          <span>Ver Proyecto</span>
          <span class="portfolio-card__btn-arrow">↗</span>
        </div>
      </div>
    </div>
  `).join('');
}

// --- DOM ELEMENTS ---
document.addEventListener("DOMContentLoaded", async () => {
  projects = await fetchProyectos();
  currentFilteredProjects = [...projects];

  renderFeaturedHome();

  if (!document.getElementById("portfolio-grid-dynamic")) return;
  initGallery();
});

function initGallery() {
  bindFilters();
  bindSorting();
  bindViewModes();
  bindLightbox();

  applyFiltersAndRender();
}

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
      <div class="portfolio-item__bg" style="background: url('${proj.image}') center/cover no-repeat;"></div>
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

function openLightbox(index) {
  if (currentFilteredProjects.length === 0) return;
  lightboxIndex = index;
  lightboxActive = true;
  document.body.style.overflow = 'hidden'; 

  const lightbox = document.getElementById('ds-lightbox');
  updateLightboxImage();
  lightbox.classList.add('active');
}

function closeLightbox() {
  lightboxActive = false;
  document.body.style.overflow = '';
  const lightbox = document.getElementById('ds-lightbox');
  lightbox.classList.remove('active');
}

function navigateLightbox(dir) {
  lightboxIndex += dir;
  if (lightboxIndex < 0) lightboxIndex = currentFilteredProjects.length - 1;
  if (lightboxIndex >= currentFilteredProjects.length) lightboxIndex = 0;
  updateLightboxImage();
}

function updateLightboxImage() {
  const imgElement = document.getElementById('ds-lightbox-img');
  const titleElement = document.getElementById('ds-lightbox-title');
  const counterElement = document.getElementById('ds-lightbox-counter');
  
  const proj = currentFilteredProjects[lightboxIndex];
  imgElement.src = proj.image;
  imgElement.alt = proj.alt;
  titleElement.textContent = proj.title;
  counterElement.textContent = `${lightboxIndex + 1} / ${currentFilteredProjects.length}`;
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

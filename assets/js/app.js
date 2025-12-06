async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('fetch failed');
    return await res.json();
  } catch (e) {
    console.error('Erreur de chargement', path, e);
    return null;
  }
}

function renderNav(nav) {
  if (!nav) return;
  const brandFull = document.getElementById('brand-full');
  const brandShort = document.getElementById('brand-short');
  if (brandFull && nav.brand) brandFull.textContent = nav.brand;
  if (brandShort && nav.brandShort) brandShort.textContent = nav.brandShort;
}

function renderHero(data, nav) {
  const hero = document.getElementById('hero');
  if (!hero || !data) return;
  hero.innerHTML = `
    <div class="hero-bg-container"><div class="hero-bg-image"></div></div>
    <div class="hero-overlay"></div>
    <div class="hero-content max-w-5xl mx-auto w-full px-4 md:px-0 text-center text-white">
      <div class="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-blue-300/30 rounded-full bg-slate-900/40 text-blue-100 text-sm backdrop-blur-md shadow-lg">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        ${nav?.availability || ''}
      </div>
      <h1 class="hero-title font-extrabold mb-8 tracking-tight text-shadow-lg">
        ${data.title} <br/>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white drop-shadow-sm">${data.accent}</span>
      </h1>
      <p class="hero-subtitle mb-12 text-slate-100 font-light max-w-3xl mx-auto leading-relaxed text-shadow-lg">${data.subtitle}</p>
      <div class="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <a href="#dashboard-demo" class="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-500 transition shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-3 transform hover:scale-105 duration-200">
          <i class="fas fa-chart-pie text-lg"></i> ${data.primaryCta}
        </a>
        <a href="#projects" class="w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-900 transition flex items-center justify-center gap-3 shadow-lg">
          <i class="fas fa-project-diagram text-lg"></i> ${data.secondaryCta}
        </a>
      </div>
    </div>`;
}

function renderServices(data) {
  const container = document.getElementById('services');
  if (!container || !data) return;
  const colors = {
    blue: {bg: 'bg-blue-50', border: 'border-blue-600'},
    emerald: {bg: 'bg-emerald-50', border: 'border-emerald-500'},
    purple: {bg: 'bg-purple-50', border: 'border-purple-500'}
  };
  container.querySelector('.section-header').innerHTML = `
    <span class="section-kicker text-blue-700 text-xs font-semibold uppercase">Expertises clés</span>
    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mt-3">${data.heading}</h2>
    <p class="text-slate-600 mt-4">${data.intro}</p>`;
  const grid = container.querySelector('.services-grid');
  grid.innerHTML = data.items.map(item => {
    const c = colors[item.color] || colors.blue;
    return `
      <div class="glass-card p-6 flex flex-col gap-4 border-l-4 ${c.border}">
        <div class="flex items-start gap-3">
          <span class="w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center text-${item.color}-700 text-xl"><i class="fas fa-drafting-compass"></i></span>
          <div>
            <h3 class="text-lg font-bold text-slate-900">${item.title}</h3>
            <p class="text-slate-600 text-sm leading-relaxed">${item.description}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          ${item.badges.map(b => `<span class="badge">${b}</span>`).join('')}
        </div>
      </div>`;
  }).join('');
}

function renderAbout(data) {
  const title = document.getElementById('about-title');
  const desc = document.getElementById('about-desc');
  const skills = document.getElementById('about-skills');
  if (!data || !title || !desc || !skills) return;
  title.textContent = data.title;
  desc.textContent = data.description;
  skills.innerHTML = data.skills.map(skill => `
    <div class="flex items-center p-4 bg-white shadow-sm hover:shadow-md transition rounded-xl border border-slate-100 group">
      <div class="bg-${skill.color}-50 p-3 rounded-lg mr-4 group-hover:bg-${skill.color}-100 transition">
        <i class="fas ${skill.icon} text-${skill.color}-600 text-xl"></i>
      </div>
      <span class="font-bold text-slate-700">${skill.label}</span>
    </div>`).join('');
}

function renderDashboard(data) {
  const heading = document.getElementById('dash-heading');
  const intro = document.getElementById('dash-intro');
  const kpis = document.getElementById('dash-kpis');
  if (!data) return;
  if (heading) heading.textContent = data.heading;
  if (intro) intro.textContent = data.intro;
  if (kpis) {
    kpis.innerHTML = data.kpis.map(kpi => {
      const colorMap = {green: 'green', blue: 'blue', red: 'red', purple: 'purple'};
      const c = colorMap[kpi.color] || 'blue';
      const icon = kpi.trend === 'up' ? 'fa-arrow-up' : kpi.trend === 'plus' ? 'fa-plus' : kpi.trend === 'alert' ? 'fa-exclamation-triangle' : 'fa-coins';
      return `
        <div class="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 dash-card hover:border-blue-500/50 transition shadow-lg">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-slate-400 text-sm font-medium mb-1">${kpi.label}</p>
              <h3 class="text-4xl font-bold text-white tracking-tight">${kpi.value}</h3>
            </div>
            <span class="bg-${c}-500/20 text-${c}-400 w-10 h-10 flex items-center justify-center rounded-lg"><i class="fas ${icon}"></i></span>
          </div>
          ${kpi.progress ? `<div class="w-full bg-slate-700 h-2 rounded-full overflow-hidden"><div class="bg-gradient-to-r from-${c}-500 to-${c}-300 h-full rounded-full" style="width:${kpi.progress}%"></div></div>` : ''}
          ${kpi.note ? `<p class="text-sm text-slate-400 mt-2">${kpi.note}</p>` : ''}
        </div>`;
    }).join('');
  }
}

function renderProjects(projects) {
  const container = document.getElementById('projects-grid');
  if (!container || !projects) return;
  container.innerHTML = projects.map(project => `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col group">
      <div class="relative h-56 bg-slate-100">
        <img src="${project.image}" alt="${project.title}" class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
      <div class="p-6 flex-grow flex flex-col">
        <h3 class="font-bold text-xl mb-3 text-slate-800 group-hover:text-blue-600 transition">${project.title}</h3>
        <p class="text-slate-600 text-sm mb-6 leading-relaxed flex-grow">${project.summary}</p>
        <div class="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          ${project.tags.map(tag => `<span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">${tag}</span>`).join('')}
        </div>
        <div class="pt-4 flex gap-3">
          <a href="project.html?id=${project.slug}" class="text-blue-700 font-semibold text-sm hover:underline">Voir le détail</a>
        </div>
      </div>
    </div>`).join('');
}

function renderParcours(items) {
  const container = document.getElementById('parcours-content');
  if (!container || !items) return;
  container.innerHTML = items.map(it => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-slate-900">${it.title}</h3>
        <span class="badge bg-blue-50 border-blue-200 text-blue-800">${it.period}</span>
      </div>
      <p class="text-slate-600 mt-2 text-sm leading-relaxed">${it.description}</p>
    </div>`).join('');
}

function renderCV(cv) {
  if (!cv) return;
  const profile = document.getElementById('cv-profile');
  const formation = document.getElementById('cv-formation');
  const skills = document.getElementById('cv-skills');
  const certs = document.getElementById('cv-certs');
  const langs = document.getElementById('cv-langs');
  const interests = document.getElementById('cv-interests');
  if (profile) profile.textContent = cv.profile;
  if (formation) formation.innerHTML = cv.formation.map(f => `
    <li>
      <div class="font-semibold text-slate-900">${f.title}</div>
      <div class="text-slate-600">${f.place} — ${f.period}${f.note ? ` • ${f.note}` : ''}</div>
    </li>`).join('');
  if (skills) skills.innerHTML = `
    <div><div class="font-semibold text-slate-900">SIG & Cartographie</div><div>${cv.skills.sig}</div></div>
    <div><div class="font-semibold text-slate-900">Bases de données</div><div>${cv.skills.db}</div></div>
    <div><div class="font-semibold text-slate-900">Développement</div><div>${cv.skills.dev}</div></div>
    <div><div class="font-semibold text-slate-900">Analyse</div><div>${cv.skills.analysis}</div></div>
    <div class="flex flex-wrap gap-2 pt-2">
      <span class="chip"><i class="fas fa-route text-blue-600"></i> Cartographie thématique</span>
      <span class="chip"><i class="fas fa-database text-emerald-600"></i> Modélisation PostGIS</span>
      <span class="chip"><i class="fas fa-chart-line text-indigo-600"></i> KPI géo</span>
    </div>`;
  if (certs) certs.innerHTML = cv.certifications.map(c => `<li>${c}</li>`).join('');
  if (langs) langs.innerHTML = cv.languages.map(l => `<li>${l}</li>`).join('');
  if (interests) interests.textContent = cv.interests;
}

function renderContact(contact, meta) {
  if (!contact) return;
  const email = document.getElementById('contact-email');
  const phone = document.getElementById('contact-phone');
  const headline = document.getElementById('contact-headline');
  const footerMeta = document.getElementById('footer-meta');
  if (headline) headline.textContent = contact.headline;
  if (email) email.href = `mailto:${contact.email}`;
  if (email) email.querySelector('span').textContent = contact.email;
  if (phone) phone.href = `tel:${contact.phone.replace(/\s+/g, '')}`;
  if (phone) phone.querySelector('span').textContent = contact.phone;
  if (footerMeta) footerMeta.textContent = `© 2025 ${meta?.title || 'Portfolio'}. Tous droits réservés.`;
}

function initMenu() {
  const menuButton = document.getElementById('menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuButton || !mobileMenu) return;
  const iconOpen = menuButton.querySelector('.icon-open');
  const iconClose = menuButton.querySelector('.icon-close');
  menuButton.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.toggle('hidden');
    menuButton.setAttribute('aria-expanded', (!isHidden).toString());
    iconOpen?.classList.toggle('hidden');
    iconClose?.classList.toggle('hidden');
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      iconOpen?.classList.remove('hidden');
      iconClose?.classList.add('hidden');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

function initMaps(aboutMapCfg, dashMapCfg) {
  const aboutEl = document.getElementById('about-map');
  if (aboutMapCfg && aboutEl) {
    const aboutMap = L.map('about-map', { zoomControl: false }).setView([aboutMapCfg.lat, aboutMapCfg.lng], aboutMapCfg.zoom || 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(aboutMap);
    L.marker([aboutMapCfg.lat, aboutMapCfg.lng]).addTo(aboutMap).bindPopup(`<b>${aboutMapCfg.label || 'Base opérationnelle'}</b>`).openPopup();
  }
  const dashEl = document.getElementById('dash-map');
  if (dashMapCfg && dashEl) {
    const dashMap = L.map('dash-map', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false }).setView(dashMapCfg.center, 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(dashMap);
    dashMapCfg.points.forEach(pt => {
      L.circle([pt.lat, pt.lon], {
        color: pt.color,
        fillColor: pt.color,
        fillOpacity: 0.6,
        radius: pt.rad,
        weight: 0
      }).addTo(dashMap);
    });
  }
}

function initChart(chartCfg) {
  const canvas = document.getElementById('revenueChart');
  if (!canvas || !chartCfg) return;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
  new Chart(ctx, {
    type: 'bar',
    data: { labels: chartCfg.labels, datasets: [{ label: 'Recettes (M FCFA)', data: chartCfg.data, backgroundColor: '#3b82f6', hoverBackgroundColor: '#60a5fa', borderRadius: 6, borderSkipped: false }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8', font: {family: 'Space Grotesk, sans-serif'} }, border: {display: false} },
        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: {family: 'Space Grotesk, sans-serif'} }, border: {display: false} }
      },
      animation: { duration: 2000, easing: 'easeOutQuart' }
    }
  });
}

function initSwiper() {
  document.querySelectorAll('.mySwiper').forEach(swiperEl => {
    new Swiper(swiperEl, {
      spaceBetween: 0,
      centeredSlides: true,
      loop: true,
      speed: 800,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: swiperEl.querySelector('.swiper-pagination'), clickable: true },
      navigation: { nextEl: swiperEl.querySelector('.swiper-button-next'), prevEl: swiperEl.querySelector('.swiper-button-prev') }
    });
  });
}

function renderProjectDetail(projects) {
  const detailWrapper = document.getElementById('project-detail');
  if (!detailWrapper || !projects) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('id');
  const project = projects.find(p => p.slug === slug) || projects[0];
  if (!project) return;
  detailWrapper.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <div class="mb-6 flex items-center gap-3 text-sm text-slate-600">
        <a href="index.html#projects" class="text-blue-700 font-semibold hover:underline">← Retour aux projets</a>
        <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">${project.details.period}</span>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3">${project.title}</h1>
      <p class="text-slate-600 mb-6">${project.summary}</p>
      <div class="flex flex-wrap gap-2 mb-6">${project.tags.map(t => `<span class="badge">${t}</span>`).join('')}</div>
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <img src="${project.image}" alt="${project.title}" class="w-full h-72 object-cover rounded-xl shadow" loading="lazy" />
        <div class="glass-card p-6 space-y-2">
          <div><span class="font-semibold">Client :</span> ${project.details.client}</div>
          <div><span class="font-semibold">Rôle :</span> ${project.details.role}</div>
          <div><span class="font-semibold">Période :</span> ${project.details.period}</div>
          <ul class="list-disc list-inside text-sm text-slate-700 space-y-2 pt-2">
            ${project.details.bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
      </div>
      <div class="swiper mySwiper h-80 bg-slate-100 rounded-2xl overflow-hidden">
        <div class="swiper-wrapper">
          ${project.carousel.map(src => `<div class="swiper-slide"><img src="${src}" alt="${project.title}" class="w-full h-full object-cover" loading="lazy" /></div>`).join('')}
        </div>
        <div class="swiper-button-next text-white drop-shadow-md scale-75"></div>
        <div class="swiper-button-prev text-white drop-shadow-md scale-75"></div>
        <div class="swiper-pagination"></div>
      </div>
    </div>`;
}

(async function init() {
  const site = await fetchJSON('data/site.json');
  const projects = await fetchJSON('data/projects.json');
  if (site) {
    renderNav(site.nav);
    renderHero(site.hero, site.nav);
    renderServices(site.services);
    renderAbout(site.about);
    renderDashboard(site.dashboard);
    renderParcours(site.parcours);
    renderCV(site.cv);
    renderContact(site.contact, site.meta);
    initMaps(site.about?.map, site.dashboard?.map);
    initChart(site.dashboard?.chart);
  }
  if (projects) {
    renderProjects(projects);
    renderProjectDetail(projects);
  }
  initMenu();
  initSwiper();
})();

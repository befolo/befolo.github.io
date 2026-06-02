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
      <div class="inline-flex items-center gap-2 px-4 py-2 mb-7 border border-blue-300/30 rounded-full bg-slate-900/40 text-blue-100 text-sm backdrop-blur-md shadow-lg">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        ${nav?.availability || ''}
      </div>
      <h1 class="hero-title font-extrabold mb-8 tracking-tight text-shadow-lg">
        ${data.title}<br/>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 drop-shadow-sm">${data.accent}</span>
      </h1>
      <p class="hero-subtitle mb-12 text-slate-200 font-light max-w-3xl mx-auto leading-relaxed text-shadow-lg">${data.subtitle}</p>
      <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
        <a href="#dashboard-demo" class="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-3 hover:scale-105 duration-200">
          <i class="fas fa-chart-pie text-lg"></i> ${data.primaryCta}
        </a>
        <a href="#projects" class="w-full sm:w-auto bg-white/10 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-900 transition-all flex items-center justify-center gap-3 shadow-lg duration-200">
          <i class="fas fa-project-diagram text-lg"></i> ${data.secondaryCta}
        </a>
      </div>
    </div>
    <a href="#services" class="scroll-indicator" aria-label="Défiler vers le bas">
      <span></span>
      <i class="fas fa-chevron-down"></i>
    </a>`;
}

function renderServices(data) {
  const container = document.getElementById('services');
  if (!container || !data) return;
  const colorConfig = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    css: 'color-blue' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', css: 'color-emerald' },
    purple:  { bg: 'bg-purple-50',  text: 'text-purple-700',  css: 'color-purple' }
  };
  container.querySelector('.section-header').innerHTML = `
    <span class="section-kicker text-blue-700 text-xs font-semibold uppercase">Expertises clés</span>
    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mt-3">${data.heading}</h2>
    <p class="text-slate-600 mt-4">${data.intro}</p>`;
  const grid = container.querySelector('.services-grid');
  grid.innerHTML = data.items.map((item, i) => {
    const c = colorConfig[item.color] || colorConfig.blue;
    const icon = item.icon || 'fa-drafting-compass';
    return `
      <div class="service-card ${c.css} reveal reveal-delay-${i + 1}">
        <div class="flex items-start gap-4">
          <span class="service-icon ${c.bg} ${c.text}"><i class="fas ${icon}"></i></span>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-1">${item.title}</h3>
            <p class="text-slate-600 text-sm leading-relaxed">${item.description}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 pt-1">
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
  skills.innerHTML = data.skills.map((skill, i) => `
    <div class="flex items-center p-4 bg-white shadow-sm hover:shadow-md transition-all rounded-xl border border-slate-100 group reveal reveal-delay-${i + 1}">
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
    kpis.innerHTML = data.kpis.map((kpi, i) => {
      const colorMap = { green: 'green', blue: 'blue', red: 'red', purple: 'purple' };
      const c = colorMap[kpi.color] || 'blue';
      const icon = kpi.trend === 'up' ? 'fa-arrow-trend-up' : kpi.trend === 'plus' ? 'fa-plus' : kpi.trend === 'alert' ? 'fa-triangle-exclamation' : 'fa-coins';
      return `
        <div class="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/60 dash-card hover:border-${c}-500/40 transition-all shadow-lg reveal reveal-delay-${i + 1}">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">${kpi.label}</p>
              <h3 class="text-4xl font-extrabold text-white tracking-tight">${kpi.value}</h3>
            </div>
            <span class="bg-${c}-500/15 text-${c}-400 w-11 h-11 flex items-center justify-center rounded-xl border border-${c}-500/20">
              <i class="fas ${icon}"></i>
            </span>
          </div>
          ${kpi.progress ? `<div class="w-full bg-slate-700/80 h-1.5 rounded-full overflow-hidden"><div class="bg-gradient-to-r from-${c}-500 to-${c}-300 h-full rounded-full transition-all duration-1000" style="width:${kpi.progress}%"></div></div>` : ''}
          ${kpi.note ? `<p class="text-xs text-slate-400 mt-2">${kpi.note}</p>` : ''}
        </div>`;
    }).join('');
  }
}

function renderProjects(projects) {
  const container = document.getElementById('projects-grid');
  if (!container || !projects) return;
  container.innerHTML = projects.map((project, i) => `
    <div class="project-card reveal reveal-delay-${i + 1}">
      <div class="project-img-wrapper">
        <img src="${project.image}" alt="${project.title}" loading="lazy" />
        <div class="project-overlay">
          <div class="overlay-btn">
            <i class="fas fa-arrow-right text-xs"></i> Voir le projet
          </div>
        </div>
      </div>
      <div class="p-6 flex-grow flex flex-col">
        <h3 class="font-bold text-xl mb-2 text-slate-800 group-hover:text-blue-600 transition">${project.title}</h3>
        <p class="text-slate-500 text-sm mb-5 leading-relaxed flex-grow">${project.summary}</p>
        <div class="flex flex-wrap gap-2 pt-4 border-t border-slate-100 mb-4">
          ${project.tags.map(tag => `<span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">${tag}</span>`).join('')}
        </div>
        <a href="project.html?id=${project.slug}" class="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 transition group/link">
          Voir le détail
          <i class="fas fa-arrow-right text-xs transform group-hover/link:translate-x-1 transition-transform"></i>
        </a>
      </div>
    </div>`).join('');

  // Make project cards clickable
  container.querySelectorAll('.project-card').forEach((card, i) => {
    const slug = projects[i]?.slug;
    if (slug) card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        window.location.href = `project.html?id=${slug}`;
      }
    });
  });
}

function renderParcours(items) {
  const container = document.getElementById('parcours-content');
  if (!container || !items) return;
  container.innerHTML = items.map((it, i) => `
    <div class="timeline-item reveal reveal-delay-${i + 1}">
      <div class="timeline-dot"></div>
      <div class="flex items-center justify-between flex-wrap gap-2 mb-1">
        <h3 class="text-lg font-bold text-slate-900">${it.title}</h3>
        <span class="badge bg-blue-50 border-blue-200 text-blue-800">${it.period}</span>
      </div>
      <p class="text-slate-600 text-sm leading-relaxed">${it.description}</p>
    </div>`).join('');
}

function renderCV(cv) {
  if (!cv) return;
  const profile   = document.getElementById('cv-profile');
  const formation = document.getElementById('cv-formation');
  const skills    = document.getElementById('cv-skills');
  const certs     = document.getElementById('cv-certs');
  const langs     = document.getElementById('cv-langs');
  const interests = document.getElementById('cv-interests');
  if (profile)   profile.textContent = cv.profile;
  if (formation) formation.innerHTML = cv.formation.map(f => `
    <li class="flex gap-3">
      <span class="mt-1.5 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
      <div>
        <div class="font-semibold text-slate-900">${f.title}</div>
        <div class="text-slate-500 text-xs mt-0.5">${f.place} — ${f.period}${f.note ? ` • ${f.note}` : ''}</div>
      </div>
    </li>`).join('');
  if (skills) skills.innerHTML = `
    <div class="space-y-2">
      ${[
        { label: 'SIG & Cartographie', value: cv.skills.sig },
        { label: 'Bases de données',   value: cv.skills.db },
        { label: 'Développement',      value: cv.skills.dev },
        { label: 'Analyse',            value: cv.skills.analysis }
      ].map(s => `
        <div class="bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
          <div class="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-1">${s.label}</div>
          <div class="text-slate-600 text-sm">${s.value}</div>
        </div>`).join('')}
    </div>
    <div class="flex flex-wrap gap-2 pt-1">
      <span class="chip"><i class="fas fa-route text-blue-600"></i> Cartographie thématique</span>
      <span class="chip"><i class="fas fa-database text-emerald-600"></i> Modélisation PostGIS</span>
      <span class="chip"><i class="fas fa-chart-line text-indigo-600"></i> KPI géo</span>
    </div>`;
  if (certs) certs.innerHTML = cv.certifications.map(c => `
    <li class="flex gap-3">
      <span class="mt-1 text-purple-500 text-xs"><i class="fas fa-certificate"></i></span>
      <span>${c}</span>
    </li>`).join('');
  if (langs) langs.innerHTML = cv.languages.map(l => `
    <li class="flex gap-3">
      <span class="mt-1 text-blue-500 text-xs"><i class="fas fa-globe"></i></span>
      <span>${l}</span>
    </li>`).join('');
  if (interests) interests.textContent = cv.interests;
}

function renderContact(contact, meta) {
  if (!contact) return;
  const email     = document.getElementById('contact-email');
  const phone     = document.getElementById('contact-phone');
  const headline  = document.getElementById('contact-headline');
  const footerMeta= document.getElementById('footer-meta');
  const socialDiv = document.getElementById('social-links');
  if (headline)   headline.textContent = contact.headline;
  if (email) {
    email.href = `mailto:${contact.email}`;
    email.querySelector('span').textContent = contact.email;
  }
  if (phone) {
    phone.href = `tel:${contact.phone.replace(/\s+/g, '')}`;
    phone.querySelector('span').textContent = contact.phone;
  }
  if (footerMeta) footerMeta.textContent = `© ${new Date().getFullYear()} ${meta?.title?.split(' - ')[0] || 'Portfolio'}. Tous droits réservés.`;
  if (socialDiv && contact.social) {
    const links = [];
    if (contact.social.linkedin) links.push(`<a href="${contact.social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn" class="w-11 h-11 rounded-full bg-white/10 hover:bg-blue-600 border border-white/15 flex items-center justify-center text-white transition-all hover:scale-110 hover:border-blue-500 duration-200"><i class="fab fa-linkedin-in"></i></a>`);
    if (contact.social.github)   links.push(`<a href="${contact.social.github}" target="_blank" rel="noopener" aria-label="GitHub" class="w-11 h-11 rounded-full bg-white/10 hover:bg-slate-700 border border-white/15 flex items-center justify-center text-white transition-all hover:scale-110 hover:border-slate-400 duration-200"><i class="fab fa-github"></i></a>`);
    if (contact.social.twitter)  links.push(`<a href="${contact.social.twitter}" target="_blank" rel="noopener" aria-label="Twitter/X" class="w-11 h-11 rounded-full bg-white/10 hover:bg-sky-600 border border-white/15 flex items-center justify-center text-white transition-all hover:scale-110 hover:border-sky-500 duration-200"><i class="fab fa-x-twitter"></i></a>`);
    socialDiv.innerHTML = links.join('');
  }
}

function initMenu() {
  const menuButton = document.getElementById('menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuButton || !mobileMenu) return;
  const iconOpen  = menuButton.querySelector('.icon-open');
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
      L.circle([pt.lat, pt.lon], { color: pt.color, fillColor: pt.color, fillOpacity: 0.6, radius: pt.rad, weight: 0 }).addTo(dashMap);
    });
  }
}

function initChart(chartCfg) {
  const canvas = document.getElementById('revenueChart');
  if (!canvas || !chartCfg) return;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 320);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.85)');
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0.25)');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartCfg.labels,
      datasets: [{
        label: 'Recettes (M FCFA)',
        data: chartCfg.data,
        backgroundColor: gradient,
        hoverBackgroundColor: 'rgba(96, 165, 250, 0.95)',
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
          ticks: { color: '#94a3b8', font: { family: 'Space Grotesk, sans-serif', size: 12 } },
          border: { display: false }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { family: 'Space Grotesk, sans-serif', size: 12 } },
          border: { display: false }
        }
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
      navigation: {
        nextEl: swiperEl.querySelector('.swiper-button-next'),
        prevEl: swiperEl.querySelector('.swiper-button-prev')
      }
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left').forEach(el => observer.observe(el));
}

function initActiveNav() {
  const sections  = document.querySelectorAll('section[id], header[id], footer[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('nav-active');
          if (link.getAttribute('href') === `#${id}`) link.classList.add('nav-active');
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
}

function renderProjectDetail(projects) {
  const detailWrapper = document.getElementById('project-detail');
  if (!detailWrapper || !projects) return;
  const params  = new URLSearchParams(window.location.search);
  const slug    = params.get('id');
  const project = projects.find(p => p.slug === slug) || projects[0];
  if (!project) return;
  detailWrapper.innerHTML = `
    <div class="max-w-5xl mx-auto">
      <div class="mb-6 flex items-center gap-3 text-sm text-slate-600">
        <a href="index.html#projects" class="text-blue-700 font-semibold hover:underline flex items-center gap-1"><i class="fas fa-arrow-left text-xs"></i> Retour aux projets</a>
        <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">${project.details.period}</span>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3">${project.title}</h1>
      <p class="text-slate-600 mb-6">${project.summary}</p>
      <div class="flex flex-wrap gap-2 mb-6">${project.tags.map(t => `<span class="badge">${t}</span>`).join('')}</div>
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <img src="${project.image}" alt="${project.title}" class="w-full h-72 object-cover rounded-xl shadow" loading="lazy" />
        <div class="glass-card p-6 space-y-3">
          <div><span class="font-semibold">Client :</span> ${project.details.client}</div>
          <div><span class="font-semibold">Rôle :</span> ${project.details.role}</div>
          <div><span class="font-semibold">Période :</span> ${project.details.period}</div>
          <ul class="list-none text-sm text-slate-700 space-y-2 pt-2">
            ${project.details.bullets.map(b => `<li class="flex gap-2"><span class="text-blue-500 mt-0.5"><i class="fas fa-check-circle text-xs"></i></span><span>${b}</span></li>`).join('')}
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
  const [site, projects] = await Promise.all([
    fetchJSON('data/site.json'),
    fetchJSON('data/projects.json')
  ]);
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
  initScrollAnimations();
  initActiveNav();
})();

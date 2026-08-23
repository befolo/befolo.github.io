/* ═══════════════════════════════════════════════════════════
   Landry Befolo — portfolio
   Rendu piloté par data/site.json et data/projects.json.
   Aucune étape de build : tout se fait côté client.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var LOCALES = ['fr', 'en'];
  var DEFAULT_LOCALE = 'fr';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var site = null;
  var projects = null;
  var locale = DEFAULT_LOCALE;
  var firstRender = true;

  var revealObserver = null;
  var navObserver = null;
  var loopTimer = null;
  var swipers = [];
  var obsMap = null;
  var obsTiles = null;

  /* ─────────── Stockage tolérant aux navigateurs verrouillés ─────────── */
  function remember(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* mode privé, cookies bloqués : on continue sans */ }
    return null;
  }

  /* ─────────── i18n ─────────── */
  /* Résout un champ traduit. Un champ non traduit (icône, couleur,
     coordonnée) traverse tel quel : le schéma reste rétrocompatible. */
  function t(field) {
    if (field && typeof field === 'object' && !Array.isArray(field)) {
      if (field[locale] !== undefined) return field[locale];
      if (field[DEFAULT_LOCALE] !== undefined) return field[DEFAULT_LOCALE];
    }
    return field;
  }

  function detectLocale() {
    var saved = remember('locale');
    if (LOCALES.indexOf(saved) > -1) return saved;
    var nav = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
    return LOCALES.indexOf(nav) > -1 ? nav : DEFAULT_LOCALE;
  }

  function setLocale(next) {
    if (LOCALES.indexOf(next) === -1 || next === locale) return;
    locale = next;
    remember('locale', next);
    document.documentElement.lang = next;
    mount();
  }

  /* ─────────── Thème ─────────── */
  function isDark() {
    var attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function syncThemeIcons() {
    var dark = isDark();
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      var sun = btn.querySelector('.icon-sun');
      var moon = btn.querySelector('.icon-moon');
      if (sun) sun.style.display = dark ? 'none' : '';
      if (moon) moon.style.display = dark ? '' : 'none';
      btn.setAttribute('aria-label', dark
        ? (locale === 'en' ? 'Switch to light theme' : 'Passer au thème clair')
        : (locale === 'en' ? 'Switch to dark theme' : 'Passer au thème sombre'));
    });
  }

  function applyTheme() {
    syncThemeIcons();
    if (window.heroViz) window.heroViz.refresh();
    swapMapTiles();
  }

  function initTheme() {
    var saved = remember('theme');
    if (saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved);
    syncThemeIcons();

    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.theme-toggle');
      if (!btn) return;
      var next = isDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      remember('theme', next);
      applyTheme();
    });

    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () {
      if (!document.documentElement.getAttribute('data-theme')) applyTheme();
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ─────────── Utilitaires ─────────── */
  function esc(value) {
    return String(value).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function toolsHTML(list, extraClass) {
    if (!list || !list.length) return '';
    return '<p class="tools' + (extraClass ? ' ' + extraClass : '') + '">'
      + list.map(function (item) { return '<span>' + esc(t(item)) + '</span>'; }).join('')
      + '</p>';
  }

  function arrowSVG() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  }

  function setMeta(selector, attr, value) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  /* ─────────── Rendu ─────────── */
  function renderMeta() {
    var meta = site.meta || {};
    var title = t(meta.title);
    var description = t(meta.description);
    if (title) {
      document.title = title;
      setMeta('meta[property="og:title"]', 'content', title);
      setMeta('meta[name="twitter:title"]', 'content', title);
    }
    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[name="twitter:description"]', 'content', description);
    }
    if (meta.keywords) setMeta('meta[name="keywords"]', 'content', t(meta.keywords));
    setMeta('meta[property="og:locale"]', 'content', locale === 'en' ? 'en_US' : 'fr_FR');
    setMeta('meta[property="og:locale:alternate"]', 'content', locale === 'en' ? 'fr_FR' : 'en_US');
  }

  function renderNav() {
    var nav = site.nav || {};
    document.querySelectorAll('[data-brand]').forEach(function (el) { el.textContent = nav.brand || ''; });

    /* Les ancres de section n'existent que sur l'accueil : depuis une
       page de détail, on les préfixe pour qu'elles restent cliquables. */
    var onHome = !!document.getElementById('hero');
    var links = (nav.links || []).map(function (link) {
      var href = onHome ? link.href : 'index.html' + link.href;
      return '<a href="' + esc(href) + '">' + esc(t(link.label)) + '</a>';
    }).join('');

    var desktop = document.getElementById('nav-links');
    if (desktop) desktop.innerHTML = links;

    var mobile = document.getElementById('mobile-menu');
    if (mobile) {
      mobile.innerHTML = links
        + '<a href="' + (onHome ? '#contact' : 'index.html#contact') + '">' + esc(t(nav.cta)) + '</a>';
    }

    document.querySelectorAll('[data-nav-cta]').forEach(function (el) {
      el.textContent = t(nav.cta) || '';
    });

    document.querySelectorAll('.lang button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.locale === locale));
    });
  }

  function renderHero() {
    var hero = site.hero;
    var host = document.getElementById('hero');
    if (!hero || !host) return;

    host.innerHTML = ''
      + '<canvas id="hero-viz" aria-hidden="true"></canvas>'
      + '<div class="hero-fade"></div>'
      + '<div class="wrap hero-in"><div class="hero-col">'
      +   '<p class="avail">' + esc(t(hero.availability)) + '</p>'
      +   '<h1>' + esc(t(hero.titlePrefix)) + '<br>'
      +     '<span class="loop"><span class="loop-in"></span><span class="loop-ghost" aria-hidden="true"></span></span>'
      +     '<span class="tagline">' + esc(t(hero.tagline)) + '</span>'
      +   '</h1>'
      +   '<p class="lede">' + esc(t(hero.lede)) + '</p>'
      +   '<div class="ctas">'
      +     '<a class="link" href="#projets">' + esc(t(hero.ctaPrimary)) + arrowSVG() + '</a>'
      +     '<a class="link muted" href="#contact">' + esc(t(hero.ctaSecondary)) + '</a>'
      +   '</div>'
      +   '<dl class="coords">' + (hero.coords || []).map(function (c) {
              return '<div><dt>' + esc(t(c.label)) + '</dt><dd>' + esc(t(c.value)) + '</dd></div>';
            }).join('') + '</dl>'
      + '</div></div>';

    if (window.heroViz) window.heroViz.init(document.getElementById('hero-viz'));
    initTextLoop(t(hero.loop) || []);
  }

  function renderAbout() {
    var about = site.about;
    var host = document.getElementById('about-content');
    if (!about || !host) return;

    var paragraphs = (t(about.paragraphs) || []).map(function (p) {
      return '<p>' + esc(p) + '</p>';
    }).join('');

    var facts = (about.facts || []).map(function (f) {
      return '<div><dt>' + esc(t(f.key)) + '</dt><dd>' + esc(t(f.value)) + '</dd></div>';
    }).join('');

    host.innerHTML = ''
      + '<div class="portrait reveal">'
      +   '<div class="portrait-frame">' + portraitHTML(about) + '</div>'
      +   '<p class="portrait-cap">' + esc(t(about.caption)) + '</p>'
      + '</div>'
      + '<div class="bio reveal">'
      +   '<span class="label">' + esc(t(about.label)) + '</span>'
      +   paragraphs
      +   '<dl class="facts">' + facts + '</dl>'
      + '</div>';
  }

  /* Le portrait est optionnel : tant que images/profile.webp n'existe
     pas, on affiche un emplacement neutre plutôt qu'une image cassée. */
  function portraitHTML(about) {
    if (!about.portrait) {
      return '<div class="portrait-ph"><span>LB</span><small>'
        + (locale === 'en' ? 'PORTRAIT' : 'PORTRAIT') + '</small></div>';
    }
    return '<img src="' + esc(about.portrait) + '" alt="' + esc(t(about.portraitAlt) || '') + '" '
      + 'width="800" height="1000" loading="lazy" decoding="async" '
      + 'onerror="this.parentNode.innerHTML=&quot;<div class=\'portrait-ph\'><span>LB</span><small>PORTRAIT</small></div>&quot;">';
  }

  function renderStack() {
    var stack = site.stack;
    var head = document.getElementById('stack-head');
    var grid = document.getElementById('stack-grid');
    if (!stack || !grid) return;

    if (head) {
      head.innerHTML = '<span class="label">' + esc(t(stack.label)) + '</span>'
        + '<h2>' + esc(t(stack.heading)) + '</h2>'
        + '<p>' + esc(t(stack.intro)) + '</p>';
    }

    grid.innerHTML = (stack.items || []).map(function (item) {
      return '<article class="bento-cell' + (item.wide ? ' wide' : '') + '">'
        + '<h3>' + esc(t(item.title)) + '</h3>'
        + '<p>' + esc(t(item.description)) + '</p>'
        + toolsHTML(item.tools)
        + '</article>';
    }).join('');
  }

  function renderCertifications() {
    var certs = site.certifications;
    var head = document.getElementById('certs-head');
    var list = document.getElementById('certs-list');
    var profile = document.getElementById('certs-profile');
    if (!certs || !list) return;

    if (head) {
      head.innerHTML = '<span class="label">' + esc(t(certs.label)) + '</span>'
        + '<h2>' + esc(t(certs.heading)) + '</h2>'
        + '<p>' + esc(t(certs.intro)) + '</p>';
    }

    var verify = t(certs.verifyLabel) || 'Vérifier';

    list.innerHTML = (certs.items || []).map(function (item) {
      var name = t(item.name);
      /* Un titre absent de Credly n'affiche pas de lien : mieux vaut
         rien qu'un renvoi vers un profil qui ne le contient pas. */
      var proof = item.url
        ? '<a class="link" href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">'
          + esc(verify) + externalSVG() + '</a>'
        : '';

      return '<article class="cert">'
        + '<span class="cert-badge">' + badgeHTML(item, name) + '</span>'
        + '<h3>' + esc(name) + '</h3>'
        + '<p class="cert-meta">' + esc(item.issuer) + ' · ' + esc(item.year) + '</p>'
        + proof
        + '</article>';
    }).join('');

    if (profile) {
      profile.innerHTML = certs.profileUrl
        ? '<a class="link" href="' + esc(certs.profileUrl) + '" target="_blank" rel="noopener noreferrer">'
          + esc(t(certs.profileLabel)) + externalSVG() + '</a>'
        : '';
    }
  }

  /* Une vignette absente ou cassée retombe sur les initiales de
     l'émetteur : la carte reste lisible dans tous les cas. */
  function badgeHTML(item, name) {
    var initials = String(item.issuer || name || '?').trim().slice(0, 2).toUpperCase();
    if (!item.image) return '<span>' + esc(initials) + '</span>';
    return '<img src="' + esc(item.image) + '" alt="' + esc(name) + ' — ' + esc(item.issuer) + '" '
      + 'width="86" height="86" loading="lazy" decoding="async" '
      + 'onerror="this.parentNode.innerHTML=&quot;<span>' + esc(initials) + '</span>&quot;">';
  }

  function externalSVG() {
    return '<svg class="ext" viewBox="0 0 24 24" aria-hidden="true">'
      + '<path d="M14 5h5v5M19 5l-8 8M18 14v4a1.5 1.5 0 01-1.5 1.5h-10A1.5 1.5 0 015 18V8a1.5 1.5 0 011.5-1.5H10"/></svg>';
  }

  function renderDashboard() {
    var dash = site.dashboard;
    if (!dash) return;

    var head = document.getElementById('obs-head');
    if (head) {
      head.innerHTML = '<span class="label">' + esc(t(dash.label)) + '</span>'
        + '<h2>' + esc(t(dash.heading)) + '</h2>'
        + '<p>' + esc(t(dash.intro)) + '</p>';
    }

    var kpis = document.getElementById('obs-kpis');
    if (kpis) {
      kpis.innerHTML = (dash.kpis || []).map(function (k) {
        return '<div><dt>' + esc(t(k.label)) + '</dt>'
          + '<dd><span class="ticker" data-value="' + k.value + '">0</span>'
          + (k.unit ? '<span class="ticker-unit">' + esc(k.unit) + '</span>' : '') + '</dd>'
          + '<small>' + esc(t(k.note)) + '</small></div>';
      }).join('');
    }

    var chart = dash.chart || {};
    var chartTitle = document.getElementById('obs-chart-title');
    if (chartTitle) chartTitle.textContent = t(chart.title) || '';

    var bars = document.getElementById('obs-bars');
    if (bars && chart.data) {
      var max = Math.max.apply(null, chart.data) || 1;
      bars.innerHTML = chart.data.map(function (value, i) {
        return '<figure><div class="bar" data-height="' + Math.round(value / max * 100) + '"></div>'
          + '<figcaption>' + esc(chart.labels[i]) + '</figcaption></figure>';
      }).join('');
    }

    var map = dash.map || {};
    var mapTitle = document.getElementById('obs-map-title');
    if (mapTitle) mapTitle.textContent = t(map.title) || '';
    var legend = document.getElementById('obs-legend');
    if (legend && map.legend) {
      legend.innerHTML = '<span><i></i>' + esc(t(map.legend.high)) + '</span>'
        + '<span class="low"><i></i>' + esc(t(map.legend.low)) + '</span>';
    }
  }

  function renderProjects() {
    var section = site.projectsSection || {};
    var head = document.getElementById('projects-head');
    var list = document.getElementById('projects-list');
    if (!list || !projects) return;

    if (head) {
      head.innerHTML = '<span class="label">' + esc(t(section.label)) + '</span>'
        + '<h2>' + esc(t(section.heading)) + '</h2>';
    }

    list.innerHTML = projects.map(function (p) {
      var d = p.details || {};
      return '<a class="project-row" href="project.html?id=' + encodeURIComponent(p.slug) + '">'
        + '<span class="project-meta"><b>' + esc(d.client) + '</b>' + esc(d.period)
        +   '<br>' + esc(t(d.role)) + '</span>'
        + '<span class="project-body"><h3>' + esc(t(p.title)) + '</h3>'
        +   '<p>' + esc(t(p.summary)) + '</p>' + toolsHTML(p.tags) + '</span>'
        + '<span class="project-arrow">' + arrowSVG() + '</span>'
        + '</a>';
    }).join('');
  }

  function renderParcours() {
    var parcours = site.parcours;
    var head = document.getElementById('parcours-head');
    var list = document.getElementById('parcours-list');
    if (!parcours || !list) return;

    if (head) {
      head.innerHTML = '<span class="label">' + esc(t(parcours.label)) + '</span>'
        + '<h2>' + esc(t(parcours.heading)) + '</h2>';
    }

    list.innerHTML = (parcours.items || []).map(function (item) {
      return '<div class="timeline-item">'
        + '<span class="timeline-period">' + esc(item.period) + '</span>'
        + '<div><h3>' + esc(t(item.title)) + '</h3>'
        +   '<p>' + esc(t(item.description)) + '</p></div>'
        + '</div>';
    }).join('');
  }

  function renderContact() {
    var contact = site.contact;
    var host = document.getElementById('contact-content');
    if (!contact || !host) return;

    var links = ['<a class="link" href="mailto:' + esc(contact.email) + '">' + esc(contact.email) + '</a>'];
    if (contact.phone) {
      links.push('<a class="link muted" href="tel:' + esc(contact.phone.replace(/\s+/g, '')) + '">'
        + esc(contact.phone) + '</a>');
    }
    var social = contact.social || {};
    if (social.github) links.push('<a class="link muted" href="' + esc(social.github) + '" rel="noopener">GitHub</a>');
    if (social.linkedin) links.push('<a class="link muted" href="' + esc(social.linkedin) + '" rel="noopener">LinkedIn</a>');

    var about = site.about || {};
    var avatarSrc = about.avatar || about.portrait;
    var avatar = avatarSrc
      ? '<img src="' + esc(avatarSrc) + '" alt="" width="56" height="56" loading="lazy" decoding="async" '
        + 'onerror="this.parentNode.textContent=&quot;LB&quot;">'
      : 'LB';

    host.innerHTML = ''
      + '<div class="foot-grid reveal">'
      +   '<h2>' + esc(t(contact.headline)) + '</h2>'
      +   '<div class="foot-links">' + links.join('') + '</div>'
      + '</div>'
      + '<div class="foot-card reveal">'
      +   '<span class="avatar">' + avatar + '</span>'
      +   '<span class="foot-id"><b>' + esc((site.nav || {}).brand || '') + '</b>'
      +     '<span>' + esc(t(contact.role)) + '</span></span>'
      + '</div>'
      + '<p class="foot-meta">© ' + new Date().getFullYear() + ' — '
      +   esc(t((site.meta || {}).location) || '') + '</p>';
  }

  function renderProjectDetail() {
    var host = document.getElementById('project-detail');
    if (!host || !projects) return;

    var slug = new URLSearchParams(window.location.search).get('id');
    var project = projects.filter(function (p) { return p.slug === slug; })[0];

    if (!project) {
      host.innerHTML = '<div class="wrap"><a class="detail-back" href="index.html#projets">'
        + backArrow() + esc(t((site.projectsSection || {}).back)) + '</a>'
        + '<h1>' + (locale === 'en' ? 'Project not found' : 'Projet introuvable') + '</h1></div>';
      return;
    }

    var d = project.details || {};
    var section = site.projectsSection || {};
    var bullets = (t(d.bullets) || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('');

    host.innerHTML = '<div class="wrap">'
      + '<a class="detail-back" href="index.html#projets">' + backArrow() + esc(t(section.back)) + '</a>'
      + '<h1>' + esc(t(project.title)) + '</h1>'
      + '<p class="detail-lede">' + esc(t(project.summary)) + '</p>'
      + '<dl class="detail-facts">'
      +   '<div><dt>' + (locale === 'en' ? 'Client' : 'Client') + '</dt><dd>' + esc(d.client) + '</dd></div>'
      +   '<div><dt>' + (locale === 'en' ? 'Role' : 'Rôle') + '</dt><dd>' + esc(t(d.role)) + '</dd></div>'
      +   '<div><dt>' + (locale === 'en' ? 'Period' : 'Période') + '</dt><dd>' + esc(d.period) + '</dd></div>'
      + '</dl>'
      + '<div class="detail-body">'
      +   '<ul class="detail-bullets">' + bullets + '</ul>'
      +   '<div class="detail-media"><div class="swiper project-swiper"><div class="swiper-wrapper">'
      +     (project.carousel || []).map(function (src) {
              return '<div class="swiper-slide"><img src="' + esc(src) + '" alt="'
                + esc(t(project.imageAlt) || t(project.title)) + '" loading="lazy" decoding="async"></div>';
            }).join('')
      +   '</div><div class="swiper-button-next"></div><div class="swiper-button-prev"></div>'
      +   '<div class="swiper-pagination"></div></div></div>'
      + '</div>'
      + toolsHTML(project.tags)
      + '</div>';

    var brand = (site.nav || {}).brand || '';
    var base = (site.meta || {}).url || '';
    var pageUrl = base + 'project.html?id=' + project.slug;

    document.title = t(project.title) + ' — ' + brand;
    setMeta('meta[name="description"]', 'content', t(project.summary));
    /* Chaque étude de cas est sa propre URL canonique : sans le
       paramètre, les trois pages seraient déclarées dupliquées. */
    setMeta('link[rel="canonical"]', 'href', pageUrl);
    setMeta('meta[property="og:url"]', 'content', pageUrl);
    setMeta('meta[property="og:title"]', 'content', t(project.title) + ' — ' + brand);
    setMeta('meta[property="og:description"]', 'content', t(project.summary));
    setMeta('meta[property="og:image"]', 'content', base + project.image);
    setMeta('meta[name="twitter:title"]', 'content', t(project.title) + ' — ' + brand);
    setMeta('meta[name="twitter:description"]', 'content', t(project.summary));
    setMeta('meta[name="twitter:image"]', 'content', base + project.image);
    injectProjectSchema(project);
    initSwiper();
  }

  function backArrow() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>';
  }

  function injectProjectSchema(project) {
    var old = document.getElementById('project-schema');
    if (old) old.remove();
    var d = project.details || {};
    var base = (site.meta || {}).url || '';
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'project-schema';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: t(project.title),
      description: t(project.summary),
      inLanguage: locale,
      image: base + project.image,
      dateCreated: d.period,
      creator: { '@type': 'Person', name: (site.nav || {}).brand },
      about: (project.tags || []).join(', ')
    });
    document.head.appendChild(script);
  }

  /* ─────────── Text Loop ─────────── */
  function initTextLoop(words) {
    clearInterval(loopTimer);
    var host = document.querySelector('.loop');
    if (!host || !words.length) return;
    var slot = host.querySelector('.loop-in');
    var ghost = host.querySelector('.loop-ghost');
    var index = 0;

    function apply(word, animate) {
      ghost.textContent = word;
      var width = ghost.offsetWidth;
      if (!animate) {
        slot.textContent = word;
        host.style.width = width + 'px';
        return;
      }
      slot.classList.add('out');
      setTimeout(function () {
        slot.textContent = word;
        host.style.width = width + 'px';
        slot.classList.remove('out');
      }, 300);
    }

    apply(words[0], false);
    /* Les largeurs mesurées avant le chargement des polices sont fausses. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { apply(words[index], false); });
    }
    if (reduced) return;
    loopTimer = setInterval(function () {
      index = (index + 1) % words.length;
      apply(words[index], true);
    }, 2600);
  }

  /* ─────────── Compteurs et barres ─────────── */
  function countUp(el) {
    var target = parseFloat(el.dataset.value);
    var format = function (n) { return n.toLocaleString(locale === 'en' ? 'en-US' : 'fr-FR'); };
    if (reduced || !firstRender) { el.textContent = format(target); return; }
    var start = null;
    function step(now) {
      if (!start) start = now;
      var k = Math.min((now - start) / 1600, 1);
      el.textContent = format(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initScrollAnimations() {
    if (revealObserver) revealObserver.disconnect();

    var elements = document.querySelectorAll('.reveal');
    if (!firstRender || reduced) {
      elements.forEach(function (el) {
        el.classList.add('visible');
        el.querySelectorAll('.ticker').forEach(countUp);
        el.querySelectorAll('.bar').forEach(function (bar) { bar.style.height = bar.dataset.height + '%'; });
      });
      document.querySelectorAll('.ticker').forEach(countUp);
      document.querySelectorAll('.bar').forEach(function (bar) { bar.style.height = bar.dataset.height + '%'; });
      return;
    }

    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('visible');
        el.querySelectorAll('.ticker').forEach(countUp);
        el.querySelectorAll('.bar').forEach(function (bar, i) {
          setTimeout(function () { bar.style.height = bar.dataset.height + '%'; }, i * 90);
        });
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -60px 0px' });

    elements.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ─────────── Navigation ─────────── */
  function initActiveNav() {
    if (navObserver) navObserver.disconnect();
    var links = document.querySelectorAll('#nav-links a');
    if (!links.length) return;

    navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle('nav-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { threshold: 0.25 });

    document.querySelectorAll('section[id]').forEach(function (s) { navObserver.observe(s); });
  }

  function initMenu() {
    var button = document.getElementById('menu-button');
    var menu = document.getElementById('mobile-menu');
    if (!button || !menu) return;

    button.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') return;
      menu.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    });

    var nav = document.querySelector('.nav');
    window.addEventListener('scroll', function () {
      if (nav) nav.classList.toggle('stuck', window.scrollY > 12);
    }, { passive: true });
  }

  function initLangToggle() {
    document.querySelectorAll('.lang button').forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', function () { setLocale(btn.dataset.locale); });
    });
  }

  /* ─────────── Carte de l'observatoire ─────────── */
  var TILES = {
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };

  function swapMapTiles() {
    if (!obsMap || !obsTiles) return;
    obsTiles.setUrl(isDark() ? TILES.dark : TILES.light);
  }

  function initMap() {
    var el = document.getElementById('obs-map');
    var config = (site.dashboard || {}).map;
    if (!el || !config || obsMap || typeof L === 'undefined') return;

    obsMap = L.map('obs-map', {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      keyboard: false
    }).setView(config.center, config.zoom || 12);

    obsTiles = L.tileLayer(isDark() ? TILES.dark : TILES.light, {
      attribution: '&copy; OpenStreetMap, &copy; CARTO'
    }).addTo(obsMap);

    var accent = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim();
    (config.points || []).forEach(function (point) {
      var high = point.level === 'high';
      L.circle([point.lat, point.lon], {
        radius: point.radius,
        weight: high ? 0 : 1,
        color: accent,
        fillColor: accent,
        fillOpacity: high ? 0.55 : 0.14
      }).addTo(obsMap);
    });
  }

  /* ─────────── Carrousels ─────────── */
  function initSwiper() {
    swipers.forEach(function (s) { try { s.destroy(true, true); } catch (e) {} });
    swipers = [];
    if (typeof Swiper === 'undefined') return;
    document.querySelectorAll('.project-swiper').forEach(function (el) {
      swipers.push(new Swiper(el, {
        loop: el.querySelectorAll('.swiper-slide').length > 1,
        speed: 700,
        autoplay: reduced ? false : { delay: 5000, disableOnInteraction: true },
        pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
        navigation: {
          nextEl: el.querySelector('.swiper-button-next'),
          prevEl: el.querySelector('.swiper-button-prev')
        }
      }));
    });
  }

  /* ─────────── Montage ─────────── */
  function mount() {
    renderMeta();
    renderNav();
    renderHero();
    renderAbout();
    renderStack();
    renderCertifications();
    renderDashboard();
    renderProjects();
    renderParcours();
    renderContact();
    renderProjectDetail();

    initLangToggle();
    initScrollAnimations();
    initActiveNav();
    initMap();
    syncThemeIcons();
    firstRender = false;
  }

  async function fetchJSON(path) {
    try {
      var res = await fetch(path);
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch (e) {
      console.error('Chargement impossible :', path, e);
      return null;
    }
  }

  (async function start() {
    initTheme();
    locale = detectLocale();
    document.documentElement.lang = locale;

    var loaded = await Promise.all([fetchJSON('data/site.json'), fetchJSON('data/projects.json')]);
    site = loaded[0] || {};
    projects = loaded[1] || [];

    mount();
    initMenu();
  })();
})();

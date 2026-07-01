const initSite = () => {
  const navLinks = [...document.querySelectorAll(".nav-link")];
  // Page transition setup: add classes for enter/exit and intercept internal links
  document.documentElement.classList.add('page-transition', 'page-enter');
  // Remove the enter class after the initial animation so subsequent navigations only use exit
  setTimeout(() => document.documentElement.classList.remove('page-enter'), 220);

  const isInternalLink = (url) => {
    try {
      const u = new URL(url, window.location.href);
      return u.origin === window.location.origin && !u.hash && !u.pathname.startsWith('mailto:') && !u.pathname.startsWith('tel:');
    } catch (err) {
      return false;
    }
  };

  // Intercept clicks on internal links (exclude anchors, downloads, external) to play exit animation
  document.querySelectorAll('a[href]').forEach((a) => {
    // skip if explicitly targeted to open in new tab or is an anchor link
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || a.target === '_blank' || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    a.addEventListener('click', (e) => {
      const hrefAbs = a.href;
      if (!isInternalLink(hrefAbs)) return;
      // If link points to the same page (clicking Home while on index), do an in-page smooth scroll
      try {
        const targetUrl = new URL(hrefAbs, window.location.href);
        const currentUrl = new URL(window.location.href);
        const samePath = targetUrl.pathname === currentUrl.pathname;
        if (samePath) {
          e.preventDefault();
          // If the link contains a hash target (in-page anchor), scroll to that element.
          const hash = targetUrl.hash;
          const headerH = document.querySelector('.site-header')?.offsetHeight || 0;
          if (hash) {
            const id = hash.slice(1);
            const el = document.getElementById(id);
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - headerH - 12;
              window.scrollTo({ top, behavior: 'smooth' });
              // brief visual feedback on the target element
              el.classList.add('link-click');
              setTimeout(() => el.classList.remove('link-click'), 520);
              return;
            }
          }

          // No hash or target not found â€” scroll to top.
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // small visual lift on hero title for feedback (if present)
          const heroTitle = document.querySelector('.hero-title');
          if (heroTitle) {
            heroTitle.classList.add('hero-click');
            setTimeout(() => heroTitle.classList.remove('hero-click'), 520);
          }
          return;
        }
      } catch (err) {
        // fallback to normal behavior below
      }

      e.preventDefault();
      // if already exiting, ignore
      if (document.documentElement.classList.contains('page-exit')) return;
      document.documentElement.classList.add('page-exit');
      // wait for the CSS transition then navigate
      const timeout = 220;
      setTimeout(() => { window.location.href = hrefAbs; }, timeout);
    });
  });

  const themeIconSVG = (theme) => {
    const moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    const sun = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    return theme === 'dark' ? sun : moon;
  };

  // Inject a single shared navigation template into any .navbar container
  const navbar = document.querySelector('.navbar');
  if (navbar) {
      // Ensure mobile controls exist even when a page provides its own header markup.
    // This avoids duplicate full-nav injection but guarantees a mobile toggle
    // and a mobile theme toggle are available.
    // 1) Add a nav-toggle button if missing
    if (!navbar.querySelector('.nav-toggle')) {
      const btn = document.createElement('button');
      btn.className = 'nav-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Toggle menu');
      btn.innerHTML = '<span class="hamb"></span>';
      // Insert toggle before the nav-links if possible, otherwise append
      const links = navbar.querySelector('.nav-links');
      if (links) navbar.insertBefore(btn, links);
      else navbar.appendChild(btn);
    }

    // 2) Ensure the nav has a mobile footer with a theme toggle
    const navLinksEl = navbar.querySelector('.nav-links');
    if (navLinksEl && !navLinksEl.querySelector('.nav-mobile-footer')) {
      const footer = document.createElement('div');
      footer.className = 'nav-mobile-footer';
      footer.innerHTML = `<button class="theme-toggle mobile-theme" type="button" aria-label="Toggle theme">${themeIconSVG('light')}</button>`;
      navLinksEl.appendChild(footer);
    }

    // 3) Normalize header actions: if a .nav-cta exists but no .header-actions container,
    // move the .nav-cta into a new .header-actions and ensure a single .theme-toggle exists.
    let headerActions = navbar.querySelector('.header-actions');
    const navCta = navbar.querySelector('.nav-cta');
    if (!headerActions) {
      headerActions = document.createElement('div');
      headerActions.className = 'header-actions';
      if (navCta) {
        navCta.parentNode.insertBefore(headerActions, navCta);
        headerActions.appendChild(navCta);
      } else {
        navbar.appendChild(headerActions);
      }
    }
    if (headerActions && !headerActions.querySelector('.theme-toggle')) {
      const t = document.createElement('button');
      t.className = 'theme-toggle';
      t.type = 'button';
      t.setAttribute('aria-label', 'Toggle theme');
      t.innerHTML = themeIconSVG('light');
      headerActions.insertBefore(t, headerActions.firstChild);
    }

    // Avoid reinjecting the full shared nav markup if already done once.
    if (navbar.dataset.injected === '1') {
      // noop - already injected on this page
    } else {
      const sharedNav = `
      <a href="index.html" class="brand"><img src="assets/logo.png" alt="Marajo Group" class="site-logo" /><span class="visually-hidden">Marajo Group</span></a>
      <button class="nav-toggle" aria-expanded="false" aria-label="Toggle menu"><span class="hamb"></span></button>
      <nav class="nav-links" role="navigation" aria-label="Main Navigation">
        <a class="nav-link" href="index.html" data-nav="home">Home</a>
        <a class="nav-link" href="about.html" data-nav="about">About Us</a>
        <a class="nav-link" href="properties.html" data-nav="properties">Properties</a>
        <a class="nav-link" href="news.html" data-nav="news">News</a>
        <a class="nav-link" href="parking.html" data-nav="parking">Parking</a>
        <a class="nav-link" href="workforce.html" data-nav="workforce">Workforce</a>
        <a class="nav-link" href="contact.html" data-nav="contact">Contact Us</a>
        <a class="nav-link cta-mobile" href="contact.html">Enquire Now</a>
        <div class="nav-mobile-footer">
          <button class="theme-toggle mobile-theme" type="button" aria-label="Toggle theme">${themeIconSVG('light')}</button>
        </div>
      </nav>
      <div class="header-actions">
        <button class="theme-toggle" type="button" aria-label="Toggle theme">${themeIconSVG('light')}</button>
        <a class="nav-cta" href="contact.html">ENQUIRE</a>
      </div>
    `;
      // Only replace inner HTML when no nav-links exist. If nav-links exist, we
      // have already added necessary mobile controls above.
      if (!navbar.querySelector('.nav-links')) {
        navbar.innerHTML = sharedNav;
      }
      navbar.dataset.injected = '1';
    }

    if (headerActions && !headerActions.querySelector('.header-search-form')) {
      const searchForm = document.createElement('form');
      searchForm.className = 'header-search-form';
      searchForm.action = 'search.html';
      searchForm.method = 'get';
      searchForm.innerHTML = `
        <label class="visually-hidden" for="header-search-input">Search properties</label>
        <div class="header-search-wrapper">
          <input class="header-search-input" id="header-search-input" name="search" type="search" placeholder="Search properties..." aria-label="Search properties" autocomplete="off" />
          <button class="header-search-button" type="submit" aria-label="Search properties">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>
      `;
      const referenceNode = headerActions.querySelector('.nav-cta') || headerActions.firstChild;
      if (referenceNode) {
        headerActions.insertBefore(searchForm, referenceNode);
      } else {
        headerActions.appendChild(searchForm);
      }
      const headerInputEl = searchForm.querySelector('.header-search-input');
      const headerButtonEl = searchForm.querySelector('.header-search-button');
      // On touch devices / direct clicks there's no CSS :hover, so the box
      // never visually expands and a click on the icon with an empty input
      // looked like it "did nothing". Expand + focus on first click instead.
      headerButtonEl?.addEventListener('click', (event) => {
        const query = headerInputEl?.value.trim() || '';
        if (!query) {
          event.preventDefault();
          searchForm.classList.add('is-active');
          headerInputEl?.focus();
        }
      });
      headerInputEl?.addEventListener('blur', () => {
        if (!headerInputEl.value.trim()) {
          searchForm.classList.remove('is-active');
        }
      });
      searchForm.addEventListener('submit', (event) => {
        const headerInput = searchForm.querySelector('.header-search-input');
        const query = headerInput?.value.trim() || '';
        event.preventDefault();
        if (!query) {
          searchForm.classList.add('is-active');
          headerInput?.focus();
          return;
        }
        const targetUrl = new URL('search.html', window.location.href);
        targetUrl.searchParams.set('search', query);
        window.location.href = targetUrl.toString();
      });
    }
  }


  // Add platform links to legacy headers that already ship their own nav markup.
  document.querySelectorAll('.navbar .nav-links').forEach((nav) => {
    if (!nav.querySelector('a[href="parking.html"]')) {
      const contact = nav.querySelector('a[href="contact.html"]');
      const parking = document.createElement('a');
      parking.className = 'nav-link';
      parking.href = 'parking.html';
      parking.textContent = 'Parking';
      const workforce = document.createElement('a');
      workforce.className = 'nav-link';
      workforce.href = 'workforce.html';
      workforce.textContent = 'Workforce';
      if (contact) {
        nav.insertBefore(parking, contact);
        nav.insertBefore(workforce, contact);
      } else {
        nav.appendChild(parking);
        nav.appendChild(workforce);
      }
    }
  });
  // Re-query nav links after injecting the shared nav
  const injectedNavLinks = [...document.querySelectorAll('.navbar .nav-link')];
  const navToggle = document.querySelector('.nav-toggle');
  const themeToggle = document.querySelector('.theme-toggle');
  const sections = [...document.querySelectorAll("section[id]")];
  const sticky = document.querySelector(".site-header");
  const filters = document.querySelectorAll(".gallery-filter");
  const galleryItems = [...document.querySelectorAll(".gallery-item")];
  const propertyGrid = document.querySelector("#property-grid");
  const searchInput = document.querySelector("#property-search");
  const headerSearchForm = document.querySelector('.header-search-form');
  const headerSearchInput = headerSearchForm?.querySelector('.header-search-input');
  const sortSelect = document.querySelector("#sort-select");
  const resultsCounter = document.querySelector("#results-counter");
  const noResults = document.querySelector("#no-results");
  const spaceCards = document.querySelectorAll(".space-card");
  const spaceDetails = document.querySelectorAll(".space-details");

  const getUrlSearchQuery = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('search') || '';
    } catch (err) {
      return '';
    }
  };

  const syncHeaderAndPageSearch = () => {
    const query = getUrlSearchQuery();
    if (headerSearchInput && query) {
      headerSearchInput.value = query;
    }
    if (searchInput) {
      if (query) {
        searchInput.value = query;
      }
      if (headerSearchInput) {
        headerSearchInput.value = searchInput.value;
      }
      headerSearchInput?.addEventListener('input', () => {
        searchInput.value = headerSearchInput.value;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      });
      searchInput.addEventListener('input', () => {
        if (headerSearchInput && headerSearchInput.value !== searchInput.value) {
          headerSearchInput.value = searchInput.value;
        }
      });
    }
  };

  const setActiveLink = () => {
    const scrollPos = window.scrollY + window.innerHeight / 3;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute("id");
      if (!id) return;
      const link = injectedNavLinks.find((item) => item.getAttribute("href") === `#${id}` || item.getAttribute('data-nav') === id);
      if (!link) return;
      if (scrollPos >= top && scrollPos < bottom) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  // Highlight the active page link based on the current pathname
  const getLinkKey = (link) => {
    if (link.dataset.nav) return link.dataset.nav;
    const href = (link.getAttribute('href') || '').split('/').pop().split('#')[0];
    if (/^(|index\.html)$/.test(href)) return 'home';
    if (href.includes('about')) return 'about';
    if (href.includes('news')) return 'news';
    if (href.includes('contact')) return 'contact';
    if (href.includes('properties')) return 'properties';
    if (href.includes('parking')) return 'parking';
    if (href.includes('workforce')) return 'workforce';
    return href.endsWith('.html') ? href.replace('.html', '') : '';
  };

  const updateActivePage = () => {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    let key = 'home';
    if (/^(|index\.html)$/.test(path)) key = 'home';
    else if (path.includes('about')) key = 'about';
    else if (path.includes('news')) key = 'news';
    else if (path.includes('contact')) key = 'contact';
    else if (path.includes('properties')) key = 'properties';
    else if (path.includes('parking')) key = 'parking';
    else if (path.includes('workforce')) key = 'workforce';
    else if (path.endsWith('.html')) key = path.replace('.html', '');
    injectedNavLinks.forEach((link) => {
      // Never mark the Services dropdown toggle as active — it's a parent
      // container, not a destination page.
      if (link.classList.contains('nav-dropdown-toggle')) {
        link.classList.remove('active');
        return;
      }
      if (!link.dataset.nav) link.dataset.nav = getLinkKey(link);
      link.classList.toggle('active', link.dataset.nav === key);
    });
  };

  // Mobile menu toggle behavior
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('mobile-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Bind theme toggle to all theme-toggle buttons (header + mobile) so both reflect state
  const themeToggles = [...document.querySelectorAll('.theme-toggle')];
  themeToggles.forEach((t) => {
    t.addEventListener('click', () => {
      const nextTheme = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  });

  injectedNavLinks.forEach((l) => l.addEventListener('click', () => {
    // Don't close the mobile menu when tapping the Services dropdown toggle —
    // that should open the sub-menu, not dismiss the whole nav panel.
    if (l.classList.contains('nav-dropdown-toggle')) return;
    if (document.body.classList.contains('mobile-open')) {
      document.body.classList.remove('mobile-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
  }));

  const toggleSticky = () => {
    if (!sticky) return;
    if (window.scrollY > 40) {
      sticky.classList.add("scrolled");
    } else {
      sticky.classList.remove("scrolled");
    }
  };

  const getPreferredTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (theme) => {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
    document.documentElement.dataset.theme = theme;
  };

  const updateThemeButtons = (theme) => {
    const buttons = [...document.querySelectorAll('.theme-toggle')];
    buttons.forEach((button) => {
      button.innerHTML = themeIconSVG(theme);
      button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  };

  const setTheme = (theme) => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
    updateThemeButtons(theme);
  };

  const initTheme = () => {
    setTheme(getPreferredTheme());
  };

  galleryItems.forEach((item, index) => {
    item.dataset.index = index.toString();
  });

  const getPropertyName = (item) => item.querySelector("h3")?.textContent.trim() || "";
  const getPropertyLocation = (item) => item.querySelector(".property-meta > span:last-child span")?.textContent.trim() || item.textContent.trim();

  const updatePropertyListing = () => {
    if (!galleryItems.length) return;

    const activeCategory = document.querySelector(".gallery-filter.active")?.dataset.category || "all";
    const query = searchInput?.value.trim().toLowerCase() || "";
    const sortValue = sortSelect?.value || "newest";

    const sortedItems = [...galleryItems].sort((a, b) => {
      if (sortValue === "name") return getPropertyName(a).localeCompare(getPropertyName(b));
      if (sortValue === "location") return getPropertyLocation(a).localeCompare(getPropertyLocation(b));
      return Number(a.dataset.index) - Number(b.dataset.index);
    });

    sortedItems.forEach((item) => propertyGrid?.appendChild(item));

    let visibleCount = 0;
    sortedItems.forEach((item) => {
      const matchesCategory = activeCategory === "all" || item.dataset.category === activeCategory;
      const matchesSearch = !query || item.textContent.toLowerCase().includes(query);
      const isVisible = matchesCategory && matchesSearch;
      item.style.display = isVisible ? "block" : "none";
      if (isVisible) visibleCount += 1;
    });

    if (resultsCounter) {
      resultsCounter.textContent = `Showing ${visibleCount} of ${galleryItems.length} properties`;
    }
    if (noResults) {
      noResults.style.display = visibleCount ? "none" : "block";
    }
  };

  const handleFilters = () => {
    filters.forEach((button) => {
      button.addEventListener("click", () => {
        filters.forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-selected", "false");
        });
        button.classList.add("active");
        button.setAttribute("aria-selected", "true");
        updatePropertyListing();
      });
    });
  };

  const handleSearch = () => {
    if (!searchInput) return;
    searchInput.addEventListener("input", updatePropertyListing);
  };

  const handleSort = () => {
    if (!sortSelect) return;
    sortSelect.addEventListener("change", updatePropertyListing);
  };
  const handleSpaces = () => {
    spaceCards.forEach((card) => {
      card.addEventListener("click", () => {
        const target = card.dataset.target;
        if (!target) return;
        spaceDetails.forEach((detail) => {
          detail.classList.toggle("active", detail.id === target);
        });
      });
    });
  };

  window.addEventListener("scroll", () => {
    toggleSticky();
  });

  toggleSticky();
  syncHeaderAndPageSearch();
  handleFilters();
  handleSearch();
  handleSort();
  updatePropertyListing();
  handleSpaces();
  updateActivePage();
  initTheme();

  // Interactive info cards open a concise detail modal.
  const interactiveCards = document.querySelectorAll('.interactive-card');
  const modal = document.getElementById('placeholder-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');

  const actionContent = {
    'floor-plans': { title: 'Residential Design â€” Floor Plans', body: 'Explore available layouts, unit options, and planning details with the Marajo team.' },
    'amenities': { title: 'Amenities â€” Explore Amenities', body: 'Review lifestyle amenities, shared spaces, and resident conveniences for this development.' },
    'investment': { title: 'Investment Appeal â€” Details', body: 'See location strengths, project positioning, and investment highlights for the property.' },
    'location': { title: 'Location â€” Map & Nearby', body: 'Review nearby business, lifestyle, transport, and neighborhood points of interest.' }
  };

  const openModal = (action) => {
    let content = actionContent[action];
    if (!content) {
      // fallback: use card's title and paragraph
      const card = document.querySelector(`.interactive-card[data-action="${action}"]`);
      if (card) {
        const title = card.querySelector('h4')?.textContent || 'Info';
        const body = card.querySelector('p')?.textContent || 'More details coming soon.';
        content = { title, body };
      } else {
        content = { title: 'Info', body: 'More details coming soon.' };
      }
    }
    modalTitle.textContent = content.title;
    modalBody.textContent = content.body;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  interactiveCards.forEach((card) => {
    card.addEventListener('click', () => {
      const action = card.dataset.action;
      openModal(action);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const action = card.dataset.action;
        openModal(action);
      }
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Scroll-reveal: fade/slide sections into view as they enter the viewport.
  const revealEls = [...document.querySelectorAll('.reveal-on-scroll')];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('in-view'));
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

      revealEls.forEach((el) => revealObserver.observe(el));
    }
  }

  // Subtle parallax on the homepage full-bleed visual band (skipped if reduced motion is preferred).
  const visualBandImg = document.querySelector('.home-visual-band img');
  if (visualBandImg && !prefersReducedMotion) {
    const updateParallax = () => {
      const rect = visualBandImg.parentElement.getBoundingClientRect();
      const viewportH = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewportH) return;
      const progress = (rect.top) / viewportH;
      const offset = progress * 30;
      visualBandImg.style.transform = `translateY(${offset.toFixed(1)}px) scale(1.08)`;
    };
    updateParallax();
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);
  }

  // ---------------------------------------------------------------
  // Premium polish layer: progress bar, count-up stats, staggered
  // reveals, magnetic CTAs, image tilt, fade-in-on-load.
  // Every piece guards itself so it's safe to load on any page,
  // and every motion effect respects prefers-reduced-motion.
  // ---------------------------------------------------------------

  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 1. Top-of-page scroll progress bar.
  const initProgressBar = () => {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, pct)).toFixed(2)}%`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  };
  initProgressBar();

  // 2. Count-up animation for stat numbers, triggered once each enters view.
  const animateCountUp = (el) => {
    const raw = el.textContent.trim();
    const match = raw.match(/[\d,]+/);
    if (!match) return;
    const target = parseInt(match[0].replace(/,/g, ''), 10);
    if (Number.isNaN(target)) return;
    const prefix = raw.slice(0, match.index);
    const suffix = raw.slice(match.index + match[0].length);
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased).toLocaleString('en-US');
      el.textContent = `${prefix}${current}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    };
    requestAnimationFrame(tick);
  };

  const statEls = [...document.querySelectorAll('.home-stat-grid strong, .story-stat-grid strong')];
  if (statEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      // Leave static â€” no animation needed when motion is reduced.
    } else {
      const statObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCountUp(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      statEls.forEach((el) => statObserver.observe(el));
    }
  }

  // 3. Staggered child reveals: once a .reveal-on-scroll section is in view,
  // cascade its grid/list children in with a small delay each, instead of
  // every item appearing at once.
  const staggerGroupSelectors = [
    '.home-stat-grid > div',
    '.home-check-list > li',
    '.home-timeline-item',
    '.home-feature-row',
    '.gallery-item',
  ];

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const staggerParents = new Set();
    staggerGroupSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((child) => {
        const parent = child.closest('.reveal-on-scroll') || child.parentElement;
        if (parent) staggerParents.add(parent);
        child.classList.add('stagger-child');
      });
    });

    staggerParents.forEach((parent) => {
      const children = [...parent.querySelectorAll(staggerGroupSelectors.join(','))];
      children.forEach((child, i) => {
        child.style.transitionDelay = `${Math.min(i * 70, 420)}ms`;
      });
    });

    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    staggerParents.forEach((parent) => staggerObserver.observe(parent));
  } else {
    document.querySelectorAll(staggerGroupSelectors.join(',')).forEach((child) => {
      child.classList.add('stagger-child', 'in-view');
    });
  }

  // 4. Magnetic CTA buttons: primary buttons drift slightly toward the cursor.
  if (supportsHover && !prefersReducedMotion) {
    document.querySelectorAll('.btn-primary').forEach((btn) => {
      let frame = null;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
        });
      });
      btn.addEventListener('mouseleave', () => {
        if (frame) cancelAnimationFrame(frame);
        btn.style.transform = '';
      });
    });
  }

  // 5. Subtle 3D tilt on large feature imagery, following the cursor.
  if (supportsHover && !prefersReducedMotion) {
    const tiltTargets = document.querySelectorAll(
      '.home-featured-image, .home-split-media, .property-card .card-media, .property-card img'
    );
    tiltTargets.forEach((el) => {
      let frame = null;
      el.classList.add('tilt-target');
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          el.style.transform = `rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        if (frame) cancelAnimationFrame(frame);
        el.style.transform = '';
      });
    });
  }

  // 6. Fade images in once loaded, instead of popping in abruptly.
  document.querySelectorAll('img').forEach((img) => {
    img.classList.add('img-fade');
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('img-loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('img-loaded'), { once: true });
    }
  });

  // 7. Smooth-scroll for in-page anchor links, offset for the sticky header.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const headerH = sticky ? sticky.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CONTACT FORM â†’ submits to api/submit_inquiry.php
// (data shows up live in dashboard.php > Inquiries)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const getInquiryContext = (trigger) => {
  const card = trigger?.closest?.('.property-card, .contact-panel, .hero, .section') || document.body;
  let title = card.querySelector('h3, h1, h2')?.textContent.trim()
    || document.querySelector('.hero-title')?.textContent.trim()
    || document.title.replace('| Marajo Group', '').trim();
  if (/^(inquire|inquiry|contact|send|schedule|request)/i.test(title)) {
    title = document.querySelector('.hero-title')?.textContent.trim()
      || document.title.replace('| Marajo Group', '').trim();
  }
  const meta = card.querySelector('.text-muted')?.textContent.trim() || '';
  const type = card.dataset.unitType || card.dataset.propertyType || meta.split('Â·')[0]?.trim() || '';
  const location = card.dataset.location || meta.split('Â·')[1]?.trim() || '';

  return {
    property_name: card.dataset.propertyName || title,
    property_id: card.dataset.propertyId || '',
    unit_name: card.dataset.unitName || '',
    unit_type: type,
    building: card.dataset.building || title,
    location,
    source_page_url: window.location.href,
    lead_source: 'Website',
  };
};

const submitInquiryData = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => formData.append(key, value ?? ''));
  const response = await fetch('api/submit_inquiry.php', {
    method: 'POST',
    body: formData
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Unable to submit inquiry.');
  }
  return result;
};

// Track engagement stats in localStorage for lead scoring
const trackEngagement = () => {
  try {
    let views = parseInt(localStorage.getItem('mg_views_count') || '0', 10);
    views += 1;
    localStorage.setItem('mg_views_count', views.toString());

    let returnVisits = parseInt(localStorage.getItem('mg_return_visits_count') || '0', 10);
    const lastVisit = localStorage.getItem('mg_last_visit_time');
    const now = Date.now();
    if (lastVisit) {
      const elapsed = now - parseInt(lastVisit, 10);
      // 30 minutes threshold for return visit
      if (elapsed > 1800000) {
        returnVisits += 1;
        localStorage.setItem('mg_return_visits_count', returnVisits.toString());
      }
    } else {
      localStorage.setItem('mg_return_visits_count', '0');
    }
    localStorage.setItem('mg_last_visit_time', now.toString());
  } catch (err) {
    console.error("Engagement tracking failed: ", err);
  }
};
trackEngagement();

const initContactForm = () => {
  const forms = [
    ...document.querySelectorAll('#contact-form, form[data-inquiry-form], .contact-panel form, .reservation-panel form')
  ];
  if (!forms.length) return;

  forms.forEach((form) => form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent || '';
    const statusBox = form.querySelector('#contact-form-status, [data-form-status]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      const formData = new FormData(form);
      const context = getInquiryContext(form);
      const textInputs = [...form.querySelectorAll('input[type="text"]')];
      const selects = [...form.querySelectorAll('select')];
      const inferredProperty = textInputs.slice(1).find((input) => input.value.trim())?.value.trim() || '';
      const inferredUnit = selects.length ? selects[selects.length - 1].value : '';
      
      const payload = {
        ...context,
        name: formData.get('name') || formData.get('customer_name') || form.querySelector('input[name="name"]')?.value || '',
        email: formData.get('email') || form.querySelector('input[name="email"]')?.value || '',
        phone: formData.get('phone') || formData.get('mobile') || formData.get('customer_phone') || form.querySelector('input[name="phone"]')?.value || '',
        
        preferred_contact_method: formData.get('preferred_contact_method') || form.querySelector('select[name="preferred_contact_method"]')?.value || '',
        budget_range: formData.get('budget_range') || form.querySelector('select[name="budget_range"]')?.value || '',
        preferred_payment_method: formData.get('preferred_payment_method') || form.querySelector('select[name="preferred_payment_method"]')?.value || '',
        intended_purpose: formData.get('intended_purpose') || form.querySelector('select[name="intended_purpose"]')?.value || '',
        purchase_timeline: formData.get('purchase_timeline') || form.querySelector('select[name="purchase_timeline"]')?.value || '',
        
        property_name: formData.get('property_name') || formData.get('project') || inferredProperty || context.property_name,
        unit_name: formData.get('unit_name') || formData.get('unit') || inferredUnit || '',
        unit_type: formData.get('unit_type') || formData.get('unit') || inferredUnit || context.unit_type,
        message: formData.get('message') || form.querySelector('textarea')?.value || '',
        action: formData.get('action') || submitBtn?.textContent || 'Inquiry',
        appointment_date: formData.get('appointment_date') || form.querySelector('input[name="appointment_date"]')?.value || '',
        appointment_time: formData.get('appointment_time') || form.querySelector('input[name="appointment_time"]')?.value || '',
        
        views_count: localStorage.getItem('mg_views_count') || '1',
        return_visits_count: localStorage.getItem('mg_return_visits_count') || '0',
      };
      
      const result = await submitInquiryData(payload);

      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.textContent = result.message;
        statusBox.style.color = 'var(--mg-green-bright)';
      } else {
        alert(result.message);
      }

      form.reset();
      
      // If inside backdrop modal, close it after 2 seconds
      const parentBackdrop = form.closest('.lead-modal-backdrop');
      if (parentBackdrop) {
        setTimeout(() => {
          parentBackdrop.classList.remove('is-open');
          if (statusBox) statusBox.style.display = 'none';
        }, 2000);
      }
    } catch (err) {
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.textContent = err.message || 'Something went wrong. Please try again.';
        statusBox.style.color = 'crimson';
      } else {
        alert(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }));
};

const initInquiryModal = () => {
  const labels = ['inquire now', 'contact agent', 'request viewing', 'book appointment', 'get details', 'reserve unit', 'schedule viewing', 'book site visit', 'request tour', 'enquire now', 'request quotation'];
  
  // Clean up any existing lead-modal-backdrop to prevent duplicates
  document.querySelectorAll('.lead-modal-backdrop').forEach(el => el.remove());
  
  const modal = document.createElement('div');
  modal.className = 'lead-modal-backdrop';
  modal.innerHTML = `
    <div class="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
      <button class="lead-modal-close" type="button" aria-label="Close inquiry form">&times;</button>
      <p class="lead-modal-label">Marajo Group Lead Portal</p>
      <h3 id="lead-modal-title">Send Inquiry</h3>
      <form data-inquiry-form class="form-grid">
        <div data-form-status class="field-full" style="display:none; font-weight:600; padding: 0.5rem; border-radius:4px; text-align:center; background: rgba(0,0,0,0.05);"></div>
        
        <!-- Personal Information Section -->
        <input name="name" class="form-control field-full" type="text" placeholder="Full Name" required />
        <input name="email" class="form-control" type="email" placeholder="Email Address" />
        <input name="phone" class="form-control" type="tel" placeholder="Mobile Number" />
        
        <div class="form-field field-full">
          <select name="preferred_contact_method" class="form-control" style="cursor:pointer;">
            <option value="" disabled selected>Preferred Contact Method</option>
            <option value="Call">Phone Call</option>
            <option value="SMS">SMS / Text Message</option>
            <option value="Email">Email</option>
            <option value="Messenger">Messenger</option>
          </select>
        </div>

        <!-- Property Interest Section -->
        <input name="property_name" class="form-control" type="text" placeholder="Property Name" readonly style="opacity:0.85;" />
        <input name="unit" class="form-control" type="text" placeholder="Unit Type Interested In" />
        
        <select name="budget_range" class="form-control" style="cursor:pointer;">
          <option value="" disabled selected>Budget Range</option>
          <option value="Under 3M">Under PHP 3M</option>
          <option value="3M to 6M">PHP 3M - 6M</option>
          <option value="6M to 10M">PHP 6M - 10M</option>
          <option value="10M to 15M">PHP 10M - 15M</option>
          <option value="Above 15M">Above PHP 15M</option>
        </select>
        
        <select name="preferred_payment_method" class="form-control" style="cursor:pointer;">
          <option value="" disabled selected>Preferred Payment Method</option>
          <option value="Cash">Cash</option>
          <option value="Bank Financing">Bank Financing</option>
          <option value="In-House Financing">In-House Financing</option>
        </select>

        <select name="intended_purpose" class="form-control field-full" style="cursor:pointer;">
          <option value="" disabled selected>Intended Purpose</option>
          <option value="Personal Use">Personal Use</option>
          <option value="Investment">Investment</option>
          <option value="Rental Business">Rental Business</option>
        </select>

        <!-- Customer Intent Section -->
        <select name="purchase_timeline" class="form-control field-full" style="cursor:pointer;">
          <option value="" disabled selected>How soon are you planning to purchase?</option>
          <option value="Immediately">Immediately</option>
          <option value="Within 1 Month">Within 1 Month</option>
          <option value="Within 3 Months">Within 3 Months</option>
          <option value="Within 6 Months">Within 6 Months</option>
          <option value="Just Exploring">Just Exploring</option>
        </select>

        <!-- Viewing Scheduler Section -->
        <div class="form-field" style="grid-column: span 1;">
          <label style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.25rem; display: block; text-transform:uppercase; letter-spacing:0.04em;">Preferred Viewing Date</label>
          <input name="appointment_date" class="form-control" type="date" />
        </div>
        <div class="form-field" style="grid-column: span 1;">
          <label style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.25rem; display: block; text-transform:uppercase; letter-spacing:0.04em;">Preferred Time</label>
          <input name="appointment_time" class="form-control" type="time" />
        </div>

        <textarea name="message" class="form-control field-full" rows="3" placeholder="Questions or Concerns"></textarea>
        <input name="action" type="hidden" value="Inquiry" />
        <button class="btn-primary field-full" type="submit">Submit Inquiry</button>
      </form>
    </div>`;
  document.body.appendChild(modal);

  const form = modal.querySelector('form');
  const close = () => modal.classList.remove('is-open');
  modal.querySelector('.lead-modal-close').addEventListener('click', close);
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });

  document.querySelectorAll('a, button').forEach((trigger) => {
    const text = trigger.textContent.trim().toLowerCase();
    if (!labels.some((label) => text.includes(label))) return;
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const context = getInquiryContext(trigger);
      form.dataset.propertyName = context.property_name;
      form.dataset.propertyId = context.property_id;
      form.dataset.unitType = context.unit_type;
      form.dataset.location = context.location;
      form.querySelector('[name="property_name"]').value = context.property_name;
      form.querySelector('[name="unit"]').value = context.unit_name || context.unit_type;
      form.querySelector('[name="action"]').value = trigger.textContent.trim();
      modal.querySelector('#lead-modal-title').textContent = trigger.textContent.trim();
      modal.classList.add('is-open');
      form.querySelector('[name="name"]').focus();
    });
  });

  initContactForm();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInquiryModal);
} else {
  initInquiryModal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite);
} else {
  initSite();
}

// â”€â”€â”€ CRM Lead Drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const openLeadProfile = (inquiryId) => {
  const backdrop = document.querySelector('.crm-backdrop');
  const drawer   = document.querySelector('.crm-drawer');
  if (!backdrop || !drawer) {
    console.warn('CRM drawer elements not found in DOM.');
    return;
  }

  // Show drawer with loading state
  backdrop.classList.add('open');
  drawer.classList.add('open');

  const body = drawer.querySelector('.crm-drawer-body');
  if (body) {
    body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:120px;gap:0.75rem;color:var(--text-muted);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          style="animation:spin 1s linear infinite;">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        Loading lead profileâ€¦
      </div>`;
  }

  fetch(`api/get_lead_timeline.php?inquiry_id=${encodeURIComponent(inquiryId)}`)
    .then(r => r.json())
    .then(data => {
      if (!data.success) throw new Error(data.message || 'Failed to load lead.');
      renderLeadDrawer(drawer, data.lead, data.timeline, data.agents);
    })
    .catch(err => {
      if (body) body.innerHTML = `<div class="empty-state" style="color:#EF4444;">âš  ${err.message}</div>`;
    });
};

const closeLeadProfile = () => {
  document.querySelector('.crm-backdrop')?.classList.remove('open');
  document.querySelector('.crm-drawer')?.classList.remove('open');
};

// Close on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('crm-backdrop')) closeLeadProfile();
});

// Score circle SVG helper
const renderScoreCircle = (score) => {
  const r = 28; const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? 'var(--mg-green)' : score >= 40 ? '#D97706' : '#0284C7';
  return `
    <div class="score-circle">
      <svg viewBox="0 0 72 72">
        <circle class="bg" cx="36" cy="36" r="${r}"/>
        <circle class="val" cx="36" cy="36" r="${r}"
          stroke="${color}"
          stroke-dasharray="${circ}"
          stroke-dashoffset="${offset}"/>
      </svg>
      <span class="text" style="color:${color};">${score}</span>
    </div>
    <div class="score-label">${score >= 70 ? 'ðŸ”¥ Hot Lead' : score >= 40 ? 'â˜€ Warm Lead' : 'â„ Cold Lead'}</div>`;
};

// Timeline icon helper
const timelineIcon = (type) => {
  const map = {
    status_change: 'status_change',
    note:          'note',
    call:          'call',
    visit_scheduled: 'visit_scheduled',
    transfer:      'transfer',
    assigned:      'status_change',
  };
  return map[type] || 'status_change';
};

const renderLeadDrawer = (drawer, lead, timeline, agents) => {
  const body = drawer.querySelector('.crm-drawer-body');
  if (!body) return;

  const score   = parseInt(lead.lead_score ?? 0, 10);
  const agentName = lead.agent_name || 'Unassigned';
  const agentRole = lead.agent_role || '';

  // Build agent transfer options
  const agentOptions = agents
    .map(a => `<option value="${a.id}" ${a.id == lead.assigned_staff_id ? 'selected' : ''}>${a.name} â€” ${a.role}</option>`)
    .join('');

  // Build timeline HTML
  const timelineHTML = timeline.length
    ? timeline.map(ev => `
        <div class="timeline-event">
          <div class="timeline-dot ${timelineIcon(ev.activity_type)}"></div>
          <div class="timeline-time">${ev.created_at}</div>
          <div class="timeline-desc">${ev.details}</div>
          <div class="timeline-user">by ${ev.staff_name}</div>
        </div>`).join('')
    : '<div class="empty-state">No activity recorded yet.</div>';

  body.innerHTML = `
    <!-- Lead Header -->
    <div style="display:flex;align-items:flex-start;gap:1rem;">
      <div class="staff-avatar" style="width:44px;height:44px;font-size:1rem;flex-shrink:0;background:var(--mg-green-dark);">
        ${lead.name.split(' ').slice(0,2).map(w => w[0].toUpperCase()).join('')}
      </div>
      <div style="flex:1;min-width:0;">
        <h4 style="font-size:1rem;font-weight:700;color:var(--text);margin:0 0 0.2rem;">${lead.name}</h4>
        <div style="font-size:0.8rem;color:var(--text-muted);">${lead.email || ''} ${lead.phone ? 'Â· ' + lead.phone : ''}</div>
        <div style="margin-top:0.35rem;">
          <span class="badge badge-${lead.status?.toLowerCase().replace(/\s+/g,'-') || 'new'}">${lead.status || 'New Lead'}</span>
        </div>
      </div>
    </div>

    <!-- Score + Quick Info -->
    <div class="crm-grid-cols">
      <div class="crm-card">
        <h4>Lead Score</h4>
        <div class="score-widget">${renderScoreCircle(score)}</div>
      </div>
      <div class="crm-card">
        <h4>Lead Details</h4>
        <div style="font-size:0.82rem;display:flex;flex-direction:column;gap:0.35rem;">
          <div><strong>Property:</strong> ${lead.project || 'â€”'}</div>
          <div><strong>Unit:</strong> ${lead.unit_name || lead.unit_type || 'â€”'}</div>
          <div><strong>Budget:</strong> ${lead.budget_range || 'â€”'}</div>
          <div><strong>Timeline:</strong> ${lead.purchase_timeline || 'â€”'}</div>
          <div><strong>Purpose:</strong> ${lead.intended_purpose || 'â€”'}</div>
          <div><strong>Payment:</strong> ${lead.preferred_payment_method || 'â€”'}</div>
          <div><strong>Contact via:</strong> ${lead.preferred_contact_method || 'â€”'}</div>
          <div><strong>Assigned to:</strong> ${agentName}${agentRole ? ' Â· ' + agentRole : ''}</div>
        </div>
      </div>
    </div>

    <!-- Tabs: Timeline / Actions -->
    <div>
      <div class="crm-tabs">
        <button class="crm-tab active" data-tab="timeline">Timeline</button>
        <button class="crm-tab" data-tab="actions">Add Activity</button>
        <button class="crm-tab" data-tab="transfer">Transfer Lead</button>
      </div>

      <!-- Timeline tab -->
      <div class="crm-tab-pane active" data-pane="timeline">
        <div class="timeline-container" style="margin-top:1rem;">${timelineHTML}</div>
      </div>

      <!-- Actions tab -->
      <div class="crm-tab-pane" data-pane="actions">
        <div style="display:flex;flex-direction:column;gap:0.75rem;margin-top:1rem;">
          <select id="crmActivityType" class="form-control" style="cursor:pointer;">
            <option value="note">ðŸ“ Add Note</option>
            <option value="call">ðŸ“ž Log Call</option>
            <option value="visit_scheduled">ðŸ“… Schedule Site Visit</option>
          </select>
          <textarea id="crmActivityDetails" class="form-control" rows="3"
            placeholder="Enter detailsâ€¦" style="resize:vertical;"></textarea>

          <div style="display:flex;gap:0.5rem;align-items:center;">
            <span style="font-size:0.78rem;color:var(--text-muted);font-weight:600;">Update Status:</span>
            <select id="crmStatusSelect" class="form-control" style="cursor:pointer;flex:1;">
              ${['New Lead','Contacted','Interested','Qualified','Site Visit Scheduled','Negotiating','Reserved','Closed Sale','Lost Lead']
                .map(s => `<option value="${s}" ${s === lead.status ? 'selected' : ''}>${s}</option>`)
                .join('')}
            </select>
          </div>

          <button class="btn btn-primary btn-sm" id="crmSaveActivity"
            style="align-self:flex-start;"
            onclick="saveCrmActivity(${lead.id})">
            Save Activity
          </button>
          <div id="crmActivityMsg" style="font-size:0.8rem;display:none;"></div>
        </div>
      </div>

      <!-- Transfer tab -->
      <div class="crm-tab-pane" data-pane="transfer">
        <div style="display:flex;flex-direction:column;gap:0.75rem;margin-top:1rem;">
          <p style="font-size:0.82rem;color:var(--text-muted);">
            Currently assigned to <strong>${agentName}</strong>. Transfer to:
          </p>
          <select id="crmTransferTarget" class="form-control" style="cursor:pointer;">${agentOptions}</select>
          <textarea id="crmTransferNote" class="form-control" rows="2"
            placeholder="Transfer note (optional)â€¦" style="resize:vertical;"></textarea>
          <button class="btn btn-primary btn-sm" style="align-self:flex-start;"
            onclick="saveCrmTransfer(${lead.id})">
            Confirm Transfer
          </button>
          <div id="crmTransferMsg" style="font-size:0.8rem;display:none;"></div>
        </div>
      </div>
    </div>`;

  // Tab switching
  body.querySelectorAll('.crm-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      body.querySelectorAll('.crm-tab').forEach(t => t.classList.remove('active'));
      body.querySelectorAll('.crm-tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      body.querySelector(`.crm-tab-pane[data-pane="${tab.dataset.tab}"]`)?.classList.add('active');
    });
  });
};

// Save activity (note / call / visit)
const saveCrmActivity = (inquiryId) => {
  const type    = document.getElementById('crmActivityType')?.value;
  const details = document.getElementById('crmActivityDetails')?.value?.trim();
  const status  = document.getElementById('crmStatusSelect')?.value;
  const msgEl   = document.getElementById('crmActivityMsg');

  if (!details) {
    if (msgEl) { msgEl.style.display='block'; msgEl.style.color='#EF4444'; msgEl.textContent='Please enter activity details.'; }
    return;
  }

  const btn = document.getElementById('crmSaveActivity');
  if (btn) btn.disabled = true;

  // Log activity
  fetch('api/log_lead_activity.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inquiry_id: inquiryId, activity_type: type, details })
  })
  .then(r => r.json())
  .then(() => {
    // Update status if changed
    return fetch('api/update_inquiry_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: inquiryId, status, note: '' })
    }).then(r => r.json());
  })
  .then(res => {
    if (msgEl) {
      msgEl.style.display = 'block';
      msgEl.style.color = res.success ? 'var(--mg-green-bright)' : '#EF4444';
      msgEl.textContent = res.success ? 'âœ“ Activity saved.' : (res.message || 'Error saving.');
    }
    if (res.success) setTimeout(() => openLeadProfile(inquiryId), 1200);
  })
  .catch(() => {
    if (msgEl) { msgEl.style.display='block'; msgEl.style.color='#EF4444'; msgEl.textContent='Network error. Try again.'; }
  })
  .finally(() => { if (btn) btn.disabled = false; });
};

// Save transfer
const saveCrmTransfer = (inquiryId) => {
  const targetId = parseInt(document.getElementById('crmTransferTarget')?.value ?? '0', 10);
  const note     = document.getElementById('crmTransferNote')?.value?.trim() || '';
  const msgEl    = document.getElementById('crmTransferMsg');

  if (!targetId) {
    if (msgEl) { msgEl.style.display='block'; msgEl.style.color='#EF4444'; msgEl.textContent='Please select an agent.'; }
    return;
  }

  fetch('api/log_lead_activity.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inquiry_id: inquiryId, activity_type: 'transfer', details: note, target_staff_id: targetId })
  })
  .then(r => r.json())
  .then(res => {
    if (msgEl) {
      msgEl.style.display = 'block';
      msgEl.style.color = res.success ? 'var(--mg-green-bright)' : '#EF4444';
      msgEl.textContent = res.success ? 'âœ“ Lead transferred.' : (res.message || 'Transfer failed.');
    }
    if (res.success) setTimeout(() => openLeadProfile(inquiryId), 1200);
  })
  .catch(() => {
    if (msgEl) { msgEl.style.display='block'; msgEl.style.color='#EF4444'; msgEl.textContent='Network error. Try again.'; }
  });
};

/* ── Services Dropdown Navigation ─────────────────────────────── */
(function () {
  function initDropdowns() {
    document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
      var toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (!toggle) return;
      var closeTimer = null;

      function open() {
        clearTimeout(closeTimer);
        document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
          if (d !== dropdown) {
            d.classList.remove('open');
            var t = d.querySelector('.nav-dropdown-toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });
        dropdown.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }

      function scheduleClose() {
        closeTimer = setTimeout(function () {
          dropdown.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }, 200); // 200ms grace period to move cursor to menu
      }

      function cancelClose() {
        clearTimeout(closeTimer);
      }

      // Hover: open on enter, delayed close on leave
      dropdown.addEventListener('mouseenter', open);
      dropdown.addEventListener('mouseleave', scheduleClose);

      // Click: toggle (works on both desktop + mobile)
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        cancelClose();
        if (dropdown.classList.contains('open')) {
          dropdown.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          open();
        }
      });

      // Prevent clicks inside the open menu from bubbling to the doc close-all handler
      var menu = dropdown.querySelector('.nav-dropdown-menu');
      if (menu) {
        menu.addEventListener('click', function (e) {
          e.stopPropagation();
          // Still close the mobile menu when a real link inside is tapped
          var target = e.target.closest('.nav-dropdown-item');
          if (target && target.href) {
            dropdown.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            if (document.body.classList.contains('mobile-open')) {
              document.body.classList.remove('mobile-open');
              var navToggleEl = document.querySelector('.nav-toggle');
              if (navToggleEl) navToggleEl.setAttribute('aria-expanded', 'false');
            }
          }
        });
      }

      // Keyboard: Escape closes
      toggle.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          dropdown.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Click outside closes all
    document.addEventListener('click', function () {
      document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
        d.classList.remove('open');
        var t = d.querySelector('.nav-dropdown-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
  } else {
    initDropdowns();
  }
})();
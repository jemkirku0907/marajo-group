(() => {
  const tokenKey = 'marajo_access_token';
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = (v) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v || 0));

  // ── fetch wrapper ─────────────────────────────────────────
  const api = async (url, options = {}) => {
    const token = localStorage.getItem(tokenKey);
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({ success: false, message: 'Invalid server response' }));
    if (!res.ok && !data.message) data.message = `Request failed (${res.status})`;
    return { ...data, _status: res.status };
  };

  // ── message helper ────────────────────────────────────────
  const show = (el, message, ok = true) => {
    if (!el) return;
    el.textContent = message;
    el.style.background = ok ? '#edf7e7' : '#ffe5e0';
    el.style.color      = ok ? '#315820' : '#96301e';
    el.classList.add('is-visible');
  };

  const userState = { profile: null };
  let headerDropdownListener = false;

  const getHeaderActions = () => document.querySelector('.header-actions');
  const getInitials = (name) => {
    if (!name) return 'MG';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const closeAllUserDropdowns = () => {
    document.querySelectorAll('.user-dropdown.open').forEach((dropdown) => dropdown.classList.remove('open'));
  };

  const closeAccountModal = () => {
    const existing = document.getElementById('marajo-account-modal');
    if (existing) existing.remove();
  };

  const openAccountModal = async (initialTab = 'profile') => {
    const modal = document.createElement('div');
    modal.id = 'marajo-account-modal';
    modal.className = 'account-modal';
    modal.innerHTML = `
      <div class="account-card" role="dialog" aria-modal="true" aria-labelledby="accountModalTitle">
        <div class="account-card-header">
          <div>
            <h2 id="accountModalTitle">My Account</h2>
            <p class="account-intro">Review your profile and recent booking activity.</p>
          </div>
          <button type="button" class="account-close" aria-label="Close account details">×</button>
        </div>
        <div class="account-tab-bar">
          <button type="button" class="account-tab active" data-tab="profile">Profile</button>
          <button type="button" class="account-tab" data-tab="history">History</button>
        </div>
        <div class="account-body">
          <div class="account-section account-profile active" data-tab-content="profile">
            <div class="profile-grid">
              <div><strong>Name</strong><span id="account-name">—</span></div>
              <div><strong>Email</strong><span id="account-email">—</span></div>
              <div><strong>Phone</strong><span id="account-phone">—</span></div>
              <div><strong>Member since</strong><span id="account-created">—</span></div>
            </div>
          </div>
          <div class="account-section account-history" data-tab-content="history">
            <div class="account-history-header">
              <h3>Booking History</h3>
              <span id="account-history-count" class="badge">0 records</span>
            </div>
            <div id="account-history-list" class="history-list">
              <p class="history-empty">Loading your history…</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    modal.querySelector('.account-close')?.addEventListener('click', () => {
      closeAccountModal();
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeAccountModal();
        document.body.style.overflow = '';
      }
    });

    const profile = userState.profile || await fetchUserProfile();
    if (profile) {
      const formatDate = (value) => {
        try { return new Date(value).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' }); } catch (err) { return value || '—'; }
      };
      document.getElementById('account-name').textContent = profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || '—';
      document.getElementById('account-email').textContent = profile.email || '—';
      document.getElementById('account-phone').textContent = profile.phone || '—';
      document.getElementById('account-created').textContent = formatDate(profile.created_at || profile.createdAt || '—');
    }

    const historyList = document.getElementById('account-history-list');
    const historyCount = document.getElementById('account-history-count');
    if (!historyList || !historyCount) return;

    const setActiveTab = (tabName) => {
      modal.querySelectorAll('.account-tab').forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === tabName);
      });
      modal.querySelectorAll('[data-tab-content]').forEach((section) => {
        section.classList.toggle('active', section.dataset.tabContent === tabName);
      });
    };

    modal.querySelectorAll('.account-tab').forEach((button) => {
      button.addEventListener('click', () => setActiveTab(button.dataset.tab));
    });

    setActiveTab(initialTab);

    const history = await fetchUserHistory();
    if (!Array.isArray(history) || !history.length) {
      historyList.innerHTML = '<p class="history-empty">No booking history found yet.</p>';
      historyCount.textContent = '0 records';
      return;
    }

    historyCount.textContent = `${history.length} record${history.length === 1 ? '' : 's'}`;
    historyList.innerHTML = history.map((item) => {
      const badge = `<span class="history-badge history-badge-${item.type}">${item.type_label}</span>`;
      const status = `<span class="history-status">${item.status || 'Unknown'}</span>`;
      const payment = item.payment_status ? `<span class="history-meta">Payment: ${item.payment_status}</span>` : '';
      const total = item.total !== null ? `<strong>${money(item.total)}</strong>` : '';
      const range = item.meta?.start_time && item.meta?.end_time ? `${item.meta.start_time} – ${item.meta.end_time}` : '';
      return `
        <article class="history-item">
          <div class="history-item-top">
            <div>
              ${badge}
              <h4>${item.reference || 'No reference'}</h4>
            </div>
            <div class="history-item-meta">
              <span>${item.date || '—'}</span>
              ${total}
            </div>
          </div>
          <p class="history-detail">${item.details || '—'}</p>
          <div class="history-meta-row">
            <span>${range}</span>
            ${payment}
          </div>
        </article>`;
    }).join('');
  };

  const fetchUserProfile = async () => {
    const result = await api('api/user.php?action=profile', { method: 'GET' });
    if (result.success && result.user) {
      userState.profile = result.user;
      return result.user;
    }
    return null;
  };

  const fetchUserHistory = async () => {
    const result = await api('api/user.php?action=history', { method: 'GET' });
    if (result.success && Array.isArray(result.history)) {
      return result.history;
    }
    return [];
  };

  const logout = async () => {
    await api('api/auth.php?action=logout', { method: 'POST' });
    localStorage.removeItem(tokenKey);
    userState.profile = null;
    await renderAuthHeader();
  };

  const renderAuthHeader = async () => {
    const header = getHeaderActions();
    if (!header) return;

    const existingMenu = header.querySelector('#marajo-user-menu');
    const existingCta = header.querySelector('.auth-cta');
    if (existingMenu) existingMenu.remove();
    if (existingCta) existingCta.remove();

    const token = localStorage.getItem(tokenKey);
    if (!token) {
      const signin = document.createElement('button');
      signin.type = 'button';
      signin.className = 'btn btn-primary auth-cta';
      signin.textContent = 'Sign in';
      signin.addEventListener('click', async () => {
        const loggedIn = await requireLogin();
        if (loggedIn) await renderAuthHeader();
      });
      header.appendChild(signin);
      return;
    }

    const profile = userState.profile || await fetchUserProfile();
    if (!profile) {
      localStorage.removeItem(tokenKey);
      userState.profile = null;
      return renderAuthHeader();
    }

    const menu = document.createElement('div');
    menu.id = 'marajo-user-menu';
    menu.className = 'user-menu';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'user-button';
    button.setAttribute('aria-label', 'Open account menu');
    button.innerHTML = `
      <span class="user-avatar">${getInitials(profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`)}</span>
    `;

    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML = `
      <button type="button" class="user-dropdown-link" id="user-account-link">My Account</button>
      <button type="button" class="user-dropdown-link" id="user-history-link">Booking History</button>
      <button type="button" class="user-dropdown-link" id="user-logout-link">Sign Out</button>
    `;

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      dropdown.classList.toggle('open');
    });

    dropdown.querySelector('#user-account-link')?.addEventListener('click', async () => {
      dropdown.classList.remove('open');
      closeAllUserDropdowns();
      await openAccountModal('profile');
    });
    dropdown.querySelector('#user-history-link')?.addEventListener('click', async () => {
      dropdown.classList.remove('open');
      closeAllUserDropdowns();
      await openAccountModal('history');
    });
    dropdown.querySelector('#user-logout-link')?.addEventListener('click', async () => {
      dropdown.classList.remove('open');
      await logout();
    });

    menu.appendChild(button);
    menu.appendChild(dropdown);
    header.appendChild(menu);

    if (!headerDropdownListener) {
      document.addEventListener('click', () => closeAllUserDropdowns());
      headerDropdownListener = true;
    }
  };

  const openPrintableReceipt = (title, entries, summary, note = '') => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      window.alert('Please allow popups for this site to download your receipt.');
      return;
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1, h2, h3, h4, p { margin: 0; }
            .receipt-header { margin-bottom: 20px; }
            .receipt-header h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            .receipt-meta { margin-bottom: 1.5rem; font-size: 0.95rem; color: #555; }
            .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
            .receipt-table th, .receipt-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .receipt-table th { background: #f7f7f7; }
            .receipt-summary { margin-top: 0.75rem; }
            .receipt-summary p { margin-bottom: 0.35rem; }
            .receipt-note { margin-top: 1.25rem; font-size: 0.95rem; color: #444; }
            .footer { margin-top: 2rem; font-size: 0.9rem; color: #666; }
            @media print { body { padding: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <h1>${title}</h1>
            <div class="receipt-meta">Generated on ${new Date().toLocaleString('en-PH')}</div>
          </div>
          <table class="receipt-table">
            <thead>
              <tr><th>Description</th><th>Value</th></tr>
            </thead>
            <tbody>
              ${entries.map(item => `
                <tr>
                  <td>${item.label}</td>
                  <td>${item.value}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="receipt-summary">
            ${summary.map(item => `<p><strong>${item.label}</strong> ${item.value}</p>`).join('')}
          </div>
          ${note ? `<div class="receipt-note">${note}</div>` : ''}
          <div class="footer no-print">Click the browser print button to save as PDF.</div>
        </body>
      </html>
    `;
    receiptWindow.document.write(receiptHtml);
    receiptWindow.document.close();
    receiptWindow.focus();
    setTimeout(() => receiptWindow.print(), 300);
  };

  const initReceiptButtons = () => {
    const attach = (selector, builder) => {
      const btn = document.querySelector(selector);
      if (!btn) return;
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        const payload = builder();
        if (!payload) return;
        openPrintableReceipt(payload.title, payload.entries, payload.summary, payload.note);
      });
    };

    attach('#park-download-receipt', () => {
      const format = (value) => value || '—';
      return {
        title: 'Parking Receipt',
        entries: [
          { label: 'Reference', value: document.getElementById('park-confirm-ref')?.textContent.replace('Reference: #', '') || '—' },
          { label: 'Slot', value: document.getElementById('park-confirm-slot')?.textContent || '—' },
          { label: 'Date', value: document.getElementById('park-confirm-date')?.textContent || '—' },
          { label: 'Time', value: document.getElementById('park-confirm-time')?.textContent || '—' },
          { label: 'Driver', value: document.getElementById('park-confirm-driver')?.textContent || '—' },
          { label: 'Vehicle', value: document.getElementById('park-confirm-vehicle')?.textContent || '—' },
        ],
        summary: [
          { label: 'Base Fee:', value: document.getElementById('park-confirm-base')?.textContent || '—' },
          { label: 'VAT:', value: document.getElementById('park-confirm-vat')?.textContent || '—' },
          { label: 'Service Fee:', value: document.getElementById('park-confirm-service')?.textContent || '—' },
          { label: 'Total:', value: document.getElementById('park-confirm-total')?.textContent || '—' },
        ],
        note: 'A receipt has been emailed to you. Please present your reference number at the parking entrance.',
      };
    });

    attach('#wf-download-receipt', () => {
      return {
        title: 'Workforce Booking Receipt',
        entries: [
          { label: 'Reference', value: document.getElementById('wf-confirm-ref')?.textContent.replace('Reference: #', '') || '—' },
          { label: 'Client', value: document.getElementById('wf-confirm-client')?.textContent || '—' },
          { label: 'Contact', value: document.getElementById('wf-confirm-contact')?.textContent || '—' },
          { label: 'Email', value: document.getElementById('wf-confirm-email')?.textContent || '—' },
          { label: 'Role', value: document.getElementById('wf-confirm-role')?.textContent || '—' },
          { label: 'Workers', value: document.getElementById('wf-confirm-count')?.textContent || '—' },
          { label: 'Date', value: document.getElementById('wf-confirm-date')?.textContent || '—' },
          { label: 'Hours', value: document.getElementById('wf-confirm-hours')?.textContent || '—' },
        ],
        summary: [],
        note: 'Your request has been submitted. The Marajo team will contact you with next steps.',
      };
    });

    attach('#court-download-receipt', () => {
      return {
        title: 'Court Booking Receipt',
        entries: [
          { label: 'Reference', value: document.getElementById('confirm-ref')?.textContent.replace('Reference: ', '') || '—' },
          { label: 'Date', value: document.getElementById('confirm-date')?.textContent || '—' },
          { label: 'Time', value: document.getElementById('confirm-time')?.textContent || '—' },
          { label: 'Total', value: document.getElementById('confirm-total')?.textContent || '—' },
        ],
        summary: [],
        note: 'Your court booking has been confirmed. Please present this receipt at the facility.',
      };
    });
  };

  // ── auto-advance step ─────────────────────────────────────
  const goToStep = (idx, pagePrefix) => {
    const fnName = pagePrefix + 'GoTo';
    if (typeof window[fnName] === 'function') { window[fnName](idx); return; }
    if (typeof window.parkingGoTo === 'function') { window.parkingGoTo(idx); return; }
    const tabs = document.querySelectorAll('.booking-step-btn');
    if (tabs[idx]) tabs[idx].click();
  };

  // ══════════════════════════════════════════════════════════
  // LOGIN MODAL
  // ══════════════════════════════════════════════════════════
  let loginResolve = null;
  let turnstileConfigPromise = null;
  let turnstileScriptPromise = null;
  let turnstileWidgetId = null;
  let turnstileToken = '';

  const getTurnstileConfig = async () => {
    if (!turnstileConfigPromise) {
      turnstileConfigPromise = api('api/auth.php?action=turnstile-site-key', { method: 'GET' })
        .catch(() => ({ success: false, turnstile_enabled: false, site_key: '' }));
    }
    return turnstileConfigPromise;
  };

  const loadTurnstileScript = () => {
    if (window.turnstile) return Promise.resolve();
    if (turnstileScriptPromise) return turnstileScriptPromise;
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-turnstile-api]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.turnstileApi = 'true';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return turnstileScriptPromise;
  };

  const renderTurnstile = async (modal) => {
    const host = qs('#mlm-turnstile', modal);
    if (!host) return;
    const config = await getTurnstileConfig();
    if (!config.turnstile_enabled || !config.site_key) {
      host.hidden = true;
      return;
    }

    host.hidden = false;
    await loadTurnstileScript();
    if (!window.turnstile) return;
    turnstileToken = '';
    turnstileWidgetId = window.turnstile.render(host, {
      sitekey: config.site_key,
      callback: (token) => { turnstileToken = token; },
      'expired-callback': () => { turnstileToken = ''; },
      'error-callback': () => { turnstileToken = ''; },
    });
  };

  const resetTurnstile = () => {
    if (window.turnstile && turnstileWidgetId !== null) {
      try { window.turnstile.reset(turnstileWidgetId); } catch (err) { /* ignore */ }
    }
    turnstileToken = '';
  };

  const verifyStoredToken = async () => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return false;
    const result = await api('api/auth.php?action=verify-token', { method: 'GET' });
    if (!result.success) {
      localStorage.removeItem(tokenKey);
      return false;
    }
    return true;
  };

  let authMode = 'login';

  const setAuthMode = (modal, mode) => {
    authMode = mode === 'register' ? 'register' : 'login';
    const title  = qs('#mlm-title', modal);
    const sub    = qs('#mlm-sub', modal);
    const btn    = qs('#mlm-submit', modal);
    const extra  = qs('#mlm-extra-fields', modal);
    const toggle = qs('#mlm-toggle', modal);

    const error = qs('#mlm-error', modal);
    if (error) {
      error.textContent = '';
      error.style.display = 'none';
    }

    if (authMode === 'register') {
      title.textContent = 'Create your account';
      sub.textContent   = 'Register with a real email to continue booking securely.';
      btn.textContent   = 'Create account';
      toggle.textContent = 'Already have an account? Sign in';
      extra.hidden = false;
      extra.style.display = 'block';
    } else {
      title.textContent = 'Sign In to Continue';
      sub.textContent   = 'You need to be logged in to use this feature.';
      btn.textContent = 'Sign In';
      toggle.textContent = 'Create an account';
      extra.hidden = true;
      extra.style.display = 'none';
    }
  };

  const injectLoginModal = () => {
    if (document.getElementById('marajo-login-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'marajo-login-modal';
    modal.innerHTML = `
      <div class="mlm-backdrop"></div>
      <div class="mlm-card" role="dialog" aria-modal="true" aria-labelledby="mlm-title">
        <form id="mlm-form" class="mlm-form" novalidate>
          <h2 id="mlm-title">Sign In to Continue</h2>
          <p class="mlm-sub">You need to be logged in to use this feature.</p>
          <div id="mlm-error" class="mlm-error" style="display:none"></div>
          <div class="mlm-field">
            <label for="mlm-email">Email</label>
            <input id="mlm-email" type="email" placeholder="you@example.com" autocomplete="email" />
          </div>
          <div class="mlm-field">
            <label for="mlm-pass">Password</label>
            <input id="mlm-pass" type="password" placeholder="••••••••" autocomplete="current-password" />
          </div>
          <div id="mlm-extra-fields" hidden>
            <div class="mlm-field">
              <label for="mlm-first-name">First name</label>
              <input id="mlm-first-name" type="text" placeholder="John" autocomplete="given-name" />
            </div>
            <div class="mlm-field">
              <label for="mlm-last-name">Last name</label>
              <input id="mlm-last-name" type="text" placeholder="Doe" autocomplete="family-name" />
            </div>
            <div class="mlm-field">
              <label for="mlm-phone">Phone</label>
              <input id="mlm-phone" type="tel" placeholder="0912 345 6789" autocomplete="tel" />
            </div>
            <div class="mlm-field">
              <label for="mlm-pass-confirm">Confirm password</label>
              <input id="mlm-pass-confirm" type="password" placeholder="••••••••" autocomplete="new-password" />
            </div>
          </div>
          <div id="mlm-turnstile" class="mlm-turnstile" hidden></div>
          <button id="mlm-submit" type="submit" class="mlm-btn-primary">Sign In</button>
          <button id="mlm-toggle" type="button" class="mlm-btn-link">Create an account</button>
          <button id="mlm-cancel" type="button" class="mlm-btn-ghost">Cancel</button>
        </form>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #marajo-login-modal { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; }
      .mlm-backdrop { position:absolute; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(3px); }
      .mlm-card { position:relative; background:#fff; border-radius:16px; padding:2rem 2rem 1.5rem; width:min(420px,90vw); box-shadow:0 20px 60px rgba(0,0,0,.25); }
      .mlm-card h2 { margin:0 0 .25rem; font-size:1.35rem; color:#1a1a1a; }
      .mlm-sub { margin:0 0 1.25rem; font-size:.9rem; color:#666; }
      .mlm-error { background:#ffe5e0; color:#96301e; padding:.65rem 1rem; border-radius:8px; font-size:.875rem; margin-bottom:1rem; }
      .mlm-field { display:flex; flex-direction:column; gap:.35rem; margin-bottom:1rem; }
      .mlm-field label { font-size:.85rem; font-weight:600; color:#333; }
      .mlm-field input { padding:.65rem .9rem; border:1.5px solid #ddd; border-radius:8px; font-size:.95rem; outline:none; transition:border .2s; }
      .mlm-field input:focus { border-color:#2e7d32; }
      .mlm-turnstile { display:flex; justify-content:center; min-height:65px; margin:.25rem 0 .85rem; }
      .mlm-turnstile[hidden] { display:none; }
      .mlm-btn-primary { width:100%; padding:.75rem; background:#2e7d32; color:#fff; border:none; border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer; margin-top:.25rem; transition:background .2s; }
      .mlm-btn-primary:hover { background:#1b5e20; }
      .mlm-btn-primary:disabled { background:#aaa; cursor:not-allowed; }
      .mlm-btn-link { width:100%; padding:.75rem 0; background:transparent; color:#2e7d32; border:none; font-weight:600; font-size:.95rem; cursor:pointer; margin-top:.35rem; }
      .mlm-btn-link:hover { color:#1b5e20; }
      .mlm-btn-ghost { width:100%; padding:.6rem; background:transparent; color:#888; border:none; font-size:.9rem; cursor:pointer; margin-top:.4rem; }
      .mlm-btn-ghost:hover { color:#333; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modal);
    renderTurnstile(modal).catch(() => {});

    const closeModal = (success) => {
      modal.remove();
      if (loginResolve) { loginResolve(success); loginResolve = null; }
    };

    const setMode = (mode) => {
      setAuthMode(modal, mode);
      resetTurnstile();
      renderTurnstile(modal).catch(() => {});
    };

    qs('#mlm-cancel', modal).addEventListener('click', () => closeModal(false));
    qs('.mlm-backdrop', modal).addEventListener('click', () => closeModal(false));
    qs('#mlm-toggle', modal).addEventListener('click', () => setMode(authMode === 'login' ? 'register' : 'login'));

    const showError = (message) => {
      const errEl = qs('#mlm-error', modal);
      errEl.textContent = message;
      errEl.style.display = 'block';
    };

    const disableButton = (disabled, label) => {
      const btn = qs('#mlm-submit', modal);
      btn.disabled = disabled;
      if (label) btn.textContent = label;
    };

    const doLogin = async () => {
      const email = qs('#mlm-email', modal).value.trim();
      const pass  = qs('#mlm-pass', modal).value;
      const errEl = qs('#mlm-error', modal);

      if (!email || !pass) {
        showError('Please enter your email and password.');
        return;
      }

      if (!turnstileToken) {
        const config = await getTurnstileConfig();
        if (config.turnstile_enabled && config.site_key) {
          showError('Please complete the security check.');
          renderTurnstile(modal).catch(() => {});
          return;
        }
      }

      disableButton(true, 'Signing in…');
      errEl.style.display = 'none';

      const result = await api('api/auth.php?action=login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass, turnstile_token: turnstileToken }),
      });

      if (result.success && result.token) {
        localStorage.setItem(tokenKey, result.token);
        closeModal(true);
      } else {
        resetTurnstile();
        showError(result.message || 'Invalid email or password.');
        disableButton(false, 'Sign In');
      }
    };

    const doRegister = async () => {
      const email      = qs('#mlm-email', modal).value.trim();
      const firstName  = qs('#mlm-first-name', modal).value.trim();
      const lastName   = qs('#mlm-last-name', modal).value.trim();
      const phone      = qs('#mlm-phone', modal).value.trim();
      const pass       = qs('#mlm-pass', modal).value;
      const confirm    = qs('#mlm-pass-confirm', modal).value;
      const errEl      = qs('#mlm-error', modal);

      if (!email || !pass) {
        showError('Please enter your email and password.');
        return;
      }

      if (pass.length < 8) {
        showError('Password must be at least 8 characters.');
        return;
      }

      if (confirm && pass !== confirm) {
        showError('Passwords do not match.');
        return;
      }

      if (!turnstileToken) {
        const config = await getTurnstileConfig();
        if (config.turnstile_enabled && config.site_key) {
          showError('Please complete the security check.');
          renderTurnstile(modal).catch(() => {});
          return;
        }
      }

      disableButton(true, 'Creating account…');
      errEl.style.display = 'none';

      const result = await api('api/auth.php?action=register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: pass,
          first_name: firstName,
          last_name: lastName,
          phone,
          turnstile_token: turnstileToken,
        }),
      });

      if (result.success && result.token) {
        localStorage.setItem(tokenKey, result.token);
        closeModal(true);
      } else {
        resetTurnstile();
        showError(result.message || 'Registration failed.');
        disableButton(false, 'Create account');
      }
    };

    const onSubmit = async (event) => {
      if (event) event.preventDefault();
      if (authMode === 'register') {
        await doRegister();
      } else {
        await doLogin();
      }
    };

    const form = qs('#mlm-form', modal);
    if (form) {
      form.addEventListener('submit', onSubmit);
    }
    setMode('login');
    setTimeout(() => qs('#mlm-email', modal)?.focus(), 50);
  };

  // Returns true if already logged in, or shows modal and waits for login
  const requireLogin = async () => {
    const valid = await verifyStoredToken();
    if (valid) {
      await renderAuthHeader();
      return true;
    }
    return new Promise((resolve) => {
      loginResolve = async (success) => {
        if (success) await renderAuthHeader();
        resolve(success);
      };
      injectLoginModal();
    });
  };

  // ══════════════════════════════════════════════════
  // PARKING BOOKING FLOW
  // ══════════════════════════════════════════════════════════
  const initParking = () => {
    const root = qs('[data-parking-page]');
    if (!root) return;

    const availabilityForm  = qs('#parking-availability-form');
    const reservationForm   = qs('#parking-reservation-form');
    const slotBoard         = qs('#slot-board');
    const msg               = qs('#parking-message');
    const selectedSlotInput = qs('[name="slot_id"]', reservationForm);

    // ── fee preview ───────────────────────────────────────
    const calculatePreviewFee = () => {
      const entry = qs('[name="entry_time"]', availabilityForm)?.value || '08:00';
      const exit  = qs('[name="exit_time"]',  availabilityForm)?.value || '17:00';
      const start = new Date(`2026-01-01T${entry}`);
      let   end   = new Date(`2026-01-01T${exit}`);
      if (end <= start) end = new Date(end.getTime() + 86400000);
      const hours   = Math.max(1, Math.round(((end - start) / 3600000) * 100) / 100);
      const base    = hours * 50;
      const vat     = 0;
      const service = 0;
      const set = (sel, val) => qsa(sel).forEach(el => { if (el) el.textContent = val; });
      set('[data-fee-duration]', `${hours} hour${hours === 1 ? '' : 's'}`);
      set('[data-fee-base]',     money(base));
      set('[data-fee-vat]',      money(vat));
      set('[data-fee-service]',  money(service));
      set('[data-fee-total]',    money(base + vat + service));
    };

    // ── render slot tiles ─────────────────────────────────
    const renderSlots = (slots) => {
      if (!slotBoard) return;
      slotBoard.innerHTML = '';
      if (!slots.length) {
        slotBoard.innerHTML = '<p style="padding:1rem;color:var(--text-muted)">No available slots for the selected time. Try a different date or time.</p>';
        return;
      }
      slots.forEach((slot) => {
        const btn = document.createElement('button');
        btn.type      = 'button';
        btn.className = 'slot-tile';
        btn.innerHTML = `<strong>${slot.slot_number}</strong><span>${slot.slot_type || 'standard'} · L${slot.floor_level || 1}</span>`;
        btn.addEventListener('click', () => {
          qsa('.slot-tile', slotBoard).forEach(t => t.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          if (selectedSlotInput) selectedSlotInput.value = slot.id;
          qsa('[data-selected-slot]').forEach(el => el.textContent = slot.slot_number);
          setTimeout(() => goToStep(2, 'parking'), 350);
        });
        slotBoard.appendChild(btn);
      });
    };

    // ── Step 1: Check Availability — requires login ───────
    availabilityForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      calculatePreviewFee();

      const loggedIn = await requireLogin();
      if (!loggedIn) return;

      const btn = qs('[type="submit"]', availabilityForm);
      if (btn) { btn.disabled = true; btn.textContent = 'Checking…'; }

      const params = new URLSearchParams(new FormData(availabilityForm));
      params.set('action', 'availability');
      const result = await api(`api/parking.php?${params.toString()}`, { method: 'GET' });

      if (btn) { btn.disabled = false; btn.innerHTML = '🔍 Check Available Slots'; }

      if (result.success) {
        renderSlots(result.available_slots || []);
        show(msg, `${result.count || 0} slot(s) available. Pick one below.`);
        setTimeout(() => goToStep(1, 'parking'), 400);
      } else {
        renderSlots([]);
        show(msg, result.message || 'Unable to check availability.', false);
      }
    });

    // ── Step 3: Submit Reservation ────────────────────────
    reservationForm?.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!selectedSlotInput?.value) {
        show(msg, 'Please select a parking slot first (Step 2).', false);
        goToStep(1, 'parking');
        return;
      }

      const loggedIn = await requireLogin();
      if (!loggedIn) return;

      const btn = qs('[type="submit"]', reservationForm);
      if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

      const availability = Object.fromEntries(new FormData(availabilityForm).entries());
      const details      = Object.fromEntries(new FormData(reservationForm).entries());
      const result = await api('api/parking.php?action=reserve', {
        method: 'POST',
        body: JSON.stringify({
          ...availability,
          ...details,
          facility_id: Number(availability.facility_id),
          slot_id:     Number(details.slot_id),
        }),
      });

      if (btn) { btn.disabled = false; btn.textContent = 'Confirm Reservation'; }

      const resMsg = qs('#parking-reservation-msg') || msg;
      if (result.success) {
        show(resMsg, `Booking confirmed! Reference #${result.reservation_id}`);
        const bd = result.fee_breakdown || {};
        const avail = Object.fromEntries(new FormData(availabilityForm).entries());
        const det   = Object.fromEntries(new FormData(reservationForm).entries());
        const slotLabel = qsa('[data-selected-slot]')[0]?.textContent || '—';
        const setText = (id, val) => { const el = qs('#' + id); if (el) el.textContent = val; };
        setText('park-confirm-ref',     'Reference: #' + result.reservation_id);
        setText('park-confirm-slot',    slotLabel);
        setText('park-confirm-date',    avail.reservation_date || '—');
        setText('park-confirm-time',    (avail.entry_time || '—') + ' – ' + (avail.exit_time || '—'));
        setText('park-confirm-driver',  det.full_name || '—');
        setText('park-confirm-vehicle', (det.vehicle_type || '') + ' · ' + (det.plate_number || ''));
        setText('park-confirm-base',    money(bd.base ?? result.fee));
        setText('park-confirm-vat',     money(bd.vat ?? 0));
        setText('park-confirm-service', money(bd.service ?? 0));
        setText('park-confirm-total',   money(result.fee));
        setTimeout(() => goToStep(3, 'parking'), 400);
      } else {
        show(resMsg, result.message || 'Reservation could not be created.', false);
      }
    });

    ['entry_time', 'exit_time'].forEach((name) => {
      qs(`[name="${name}"]`, availabilityForm)?.addEventListener('change', calculatePreviewFee);
    });
    calculatePreviewFee();
  };

  // ══════════════════════════════════════════════════════════
  // WORKFORCE BOOKING FLOW
  // ══════════════════════════════════════════════════════════
  const initWorkforce = () => {
    const root = qs('[data-workforce-page]');
    if (!root) return;

    const filterForm   = qs('#workers-filter-form');
    const workersTable = qs('#workers-table tbody');
    const bookingForm  = qs('#workforce-booking-form');
    const msg          = qs('#workforce-message');

    // Step 1: Browse workers — requires login
    filterForm?.addEventListener('submit', async (event) => {
      event.preventDefault();

      const loggedIn = await requireLogin();
      if (!loggedIn) return;

      const btn = qs('[type="submit"]', filterForm);
      if (btn) { btn.disabled = true; btn.textContent = 'Searching…'; }

      const params = new URLSearchParams(new FormData(filterForm));
      params.set('action', 'available-workers');
      const result = await api(`api/workers.php?${params.toString()}`, { method: 'GET' });

      if (btn) { btn.disabled = false; btn.innerHTML = '🔍 Find Available Workers'; }

      const workers = result.workers || [];
      if (!workersTable) return;
      workersTable.innerHTML = workers.length
        ? workers.map((w) => `
            <tr>
              <td>${w.name || 'Assigned staff'}</td>
              <td>${w.position}</td>
              <td>${w.experience_years ?? '—'} yr${w.experience_years === 1 ? '' : 's'}</td>
              <td>${Array.isArray(w.skills) ? w.skills.join(', ') : (w.skills || '—')}</td>
              <td>${w.rating ? `${Number(w.rating).toFixed(1)} ★` : '—'}</td>
              <td><span class="status-pill">${w.verification_status || 'Verified'}</span></td>
            </tr>`).join('')
        : '<tr><td colspan="5" style="text-align:center;padding:1.5rem 0;color:var(--text-muted)">No available workers found for that role and date.</td></tr>';

      if (workers.length > 0) {
        setTimeout(() => goToStep(1, 'wf'), 500);
      }
    });

    // Step 2: Book a worker — requires login
    bookingForm?.addEventListener('submit', async (event) => {
      event.preventDefault();

      const loggedIn = await requireLogin();
      if (!loggedIn) return;

      const btn = qs('[type="submit"]', bookingForm);
      if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

      const data   = Object.fromEntries(new FormData(bookingForm).entries());
      const result = await api('api/workers.php?action=book', {
        method: 'POST',
        body: JSON.stringify({
          client_name:    data.client_name,
          contact_number: data.contact_number,
          email:          data.email,
          position:       data.position,
          slots_needed:   Number(data.slots_needed || 1),
          job_date:       data.job_date,
          shift_start:    data.shift_start,
          shift_end:      data.shift_end,
          notes:          data.notes || '',
        }),
      });

      if (btn) { btn.disabled = false; btn.textContent = 'Request Booking'; }

      if (result.success) {
        const roleEl = bookingForm.querySelector('[name="position"]');
        const roleText = roleEl?.selectedIndex > 0 ? roleEl.options[roleEl.selectedIndex].text : data.position;
        const setText = (id, val) => { const el = qs('#' + id); if (el) el.textContent = val; };
        setText('wf-confirm-ref',     'Reference: #' + (result.booking_id || 'PENDING'));
        setText('wf-confirm-client',  data.client_name || '—');
        setText('wf-confirm-contact', data.contact_number || '—');
        setText('wf-confirm-email',   data.email || '—');
        setText('wf-confirm-role',    roleText || '—');
        setText('wf-confirm-count',   data.slots_needed || '1');
        setText('wf-confirm-date',    data.job_date || '—');
        setText('wf-confirm-hours',   (data.shift_start || '—') + ' – ' + (data.shift_end || '—'));
        show(msg, `Booking submitted! Reference: #${result.booking_id || 'pending'}.`);
        setTimeout(() => goToStep(2, 'wf'), 400);
        bookingForm.reset();
      } else {
        show(msg, result.message || 'Unable to submit booking.', false);
      }
    });

    if (bookingForm) {
      const updateSummary = () => {
        const role   = bookingForm.querySelector('[name="position"]');
        const count  = bookingForm.querySelector('[name="slots_needed"]');
        const date   = bookingForm.querySelector('[name="job_date"]');
        const start  = bookingForm.querySelector('[name="shift_start"]');
        const end    = bookingForm.querySelector('[name="shift_end"]');
        const roleText = role?.selectedIndex > 0 ? role.options[role.selectedIndex].text : '—';
        const elRole  = qs('#sum-role');
        const elCount = qs('#sum-count');
        const elDate  = qs('#sum-date');
        const elHours = qs('#sum-hours');
        const elHead  = qs('#sum-worker-role');
        if (elRole)  elRole.textContent  = roleText;
        if (elHead)  elHead.textContent  = roleText !== '—' ? roleText : 'Selected Worker';
        if (elCount) elCount.textContent = count?.value || '1';
        if (elDate)  elDate.textContent  = date?.value  || '—';
        if (elHours) elHours.textContent = `${start?.value || '08:00'} – ${end?.value || '17:00'}`;
      };
      bookingForm.addEventListener('input',  updateSummary);
      bookingForm.addEventListener('change', updateSummary);
    }
  };

  window.requireLogin = requireLogin;
  window.getMarajoAccessToken = () => localStorage.getItem(tokenKey);

  document.addEventListener('DOMContentLoaded', () => {
    initParking();
    initWorkforce();
    initReceiptButtons();
    renderAuthHeader();
  });
})();

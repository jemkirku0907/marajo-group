(() => {
  const getQuery = () => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('search') || params.get('q') || '').trim();
  };

  const index = Array.isArray(window.MARAJO_SEARCH_INDEX) ? window.MARAJO_SEARCH_INDEX : [];

  const scoreEntry = (entry, query) => {
    const q = query.toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    if (!terms.length) return 0;
    const haystacks = {
      title: entry.title.toLowerCase(),
      category: (entry.category || '').toLowerCase(),
      keywords: (entry.keywords || '').toLowerCase(),
      excerpt: (entry.excerpt || '').toLowerCase()
    };
    let score = 0;
    terms.forEach((term) => {
      if (haystacks.title === term) score += 12;
      else if (haystacks.title.startsWith(term)) score += 8;
      else if (haystacks.title.includes(term)) score += 6;
      if (haystacks.keywords.includes(term)) score += 3;
      if (haystacks.category.includes(term)) score += 2;
      if (haystacks.excerpt.includes(term)) score += 1;
    });
    return score;
  };

  const runSearch = (query) => {
    if (!query) return [];
    return index
      .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.entry);
  };

  const init = () => {
    const query = getQuery();
    const queryDisplay = document.getElementById('search-query-display');
    const pageInput = document.getElementById('search-page-input');
    const pageForm = document.getElementById('search-page-form');
    const resultsList = document.getElementById('search-results-list');
    const resultsCounter = document.getElementById('search-results-counter');
    const noResults = document.getElementById('search-no-results');
    const filterButtons = document.querySelectorAll('.search-filter-pill');

    if (queryDisplay) queryDisplay.textContent = query;
    if (pageInput) pageInput.value = query;

    if (pageForm) {
      pageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newQuery = pageInput?.value.trim() || '';
        const url = new URL('search.html', window.location.href);
        if (newQuery) url.searchParams.set('search', newQuery);
        window.location.href = url.toString();
      });
    }

    const allResults = runSearch(query);

    const counts = { all: allResults.length, Pages: 0, Properties: 0, Services: 0 };
    allResults.forEach((r) => {
      if (counts[r.category] !== undefined) counts[r.category] += 1;
    });
    const countAllEl = document.getElementById('count-all');
    const countPagesEl = document.getElementById('count-pages');
    const countPropsEl = document.getElementById('count-properties');
    const countServicesEl = document.getElementById('count-services');
    if (countAllEl) countAllEl.textContent = counts.all;
    if (countPagesEl) countPagesEl.textContent = counts.Pages;
    if (countPropsEl) countPropsEl.textContent = counts.Properties;
    if (countServicesEl) countServicesEl.textContent = counts.Services;

    let activeCategory = 'all';

    const render = () => {
      if (!resultsList) return;
      resultsList.innerHTML = '';

      if (!query) {
        if (resultsCounter) resultsCounter.textContent = 'Type something above to search the whole site.';
        if (noResults) noResults.style.display = 'none';
        return;
      }

      const filtered = activeCategory === 'all'
        ? allResults
        : allResults.filter((r) => r.category === activeCategory);

      if (resultsCounter) {
        resultsCounter.textContent = query
          ? `${filtered.length} result${filtered.length === 1 ? '' : 's'} for "${query}"`
          : '';
      }

      if (noResults) noResults.style.display = filtered.length ? 'none' : 'block';

      filtered.forEach((entry) => {
        const card = document.createElement('a');
        card.className = 'search-result-card';
        card.href = entry.url;
        card.innerHTML = `
          <span class="search-result-category">${entry.category}</span>
          <h3>${entry.title}</h3>
          <p>${entry.excerpt || ''}</p>
        `;
        resultsList.appendChild(card);
      });
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.category;
        render();
      });
    });

    render();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

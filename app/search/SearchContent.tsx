"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { runSearch, SearchEntry } from "@/lib/searchIndex";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "Pages", label: "Pages" },
  { key: "Properties", label: "Properties" },
  { key: "Services", label: "Services" },
] as const;

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || searchParams.get("search") || "";
  const [inputValue, setInputValue] = useState(query);
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]["key"]>("all");

  const allResults = useMemo(() => runSearch(query), [query]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allResults.length, Pages: 0, Properties: 0, Services: 0 };
    allResults.forEach((r) => (c[r.category] = (c[r.category] || 0) + 1));
    return c;
  }, [allResults]);

  const filtered = activeCategory === "all" ? allResults : allResults.filter((r) => r.category === activeCategory);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newQuery = inputValue.trim();
    router.push(newQuery ? `/search?search=${encodeURIComponent(newQuery)}` : "/search");
  }

  return (
    <main className="search-page">
      <section className="search-hero">
        <div className="container">
          <span className="hero-label">Search</span>
          <h1 id="search-page-title">Results for &quot;<span id="search-query-display">{query}</span>&quot;</h1>
          <form className="search-page-form" onSubmit={handleSubmit} role="search">
            <input
              type="search"
              id="search-page-input"
              placeholder="Search pages, properties, services..."
              aria-label="Search Marajo Group"
              autoComplete="off"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </button>
          </form>
        </div>
      </section>

      <section className="search-results-section">
        <div className="container search-results-layout">
          <aside className="search-filters">
            <h3>Filter by</h3>
            <div className="search-filter-list">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className={`search-filter-pill${activeCategory === cat.key ? " active" : ""}`}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.label} <span className="count">{counts[cat.key] || 0}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="search-results-main">
            <p className="search-results-counter">
              {!query
                ? "Type something above to search the whole site."
                : `${filtered.length} result${filtered.length === 1 ? "" : "s"} for "${query}"`}
            </p>
            <div className="search-results-list">
              {filtered.map((entry: SearchEntry) => (
                <Link key={entry.url} href={entry.url} className="search-result-card">
                  <span className="search-result-category">{entry.category}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.excerpt || ""}</p>
                </Link>
              ))}
            </div>
            {query && filtered.length === 0 && (
              <div className="search-no-results">
                <p>No matches found. Try a different keyword, or browse our <Link href="/properties">properties</Link> or <Link href="/contact">contact us</Link> directly.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

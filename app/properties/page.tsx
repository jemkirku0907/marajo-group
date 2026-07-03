"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { properties as ALL_PROPERTIES } from "@/lib/properties";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "office", label: "Office" },
  { key: "mixed", label: "Mixed-Use" },
  { key: "hospitality", label: "Hospitality" },
] as const;

export default function PropertiesPage() {
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let list = ALL_PROPERTIES.filter((p) => category === "all" || p.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }
    list = [...list];
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "location") list.sort((a, b) => a.location.localeCompare(b.location));
    return list;
  }, [category, query, sort]);

  return (
    <>
      <section className="hero about-hero reveal-on-scroll">
        <div className="container about-hero-grid">
          <div className="about-hero-copy reveal-on-scroll">
            <span className="hero-label">Our Portfolio</span>
            <h1 className="hero-title">Premium properties built for people, business, and lasting value.</h1>
            <p className="hero-copy">
              Explore Marajo Group&apos;s residential, office, mixed-use, hospitality, and commercial portfolio across
              the Philippines&apos; most active growth districts.
            </p>
            <div className="hero-actions">
              <Link href="#properties-list" className="btn-primary">
                Browse Properties
              </Link>
              <Link href="/contact" className="btn-secondary">
                Inquire Now
              </Link>
            </div>
          </div>
          <div className="about-hero-media reveal-on-scroll" aria-label="Salcedo Towers portfolio preview">
            <Image src="/assets/SALCEDO-TOWERS.jpg" alt="Salcedo Towers" width={900} height={680} priority />
            <div className="hero-feature-panel">
              <span>{ALL_PROPERTIES.length} Properties</span>
              <strong>Portfolio</strong>
              <p>Across Makati, BGC, Siargao</p>
            </div>
          </div>
        </div>
      </section>
      <section id="properties-list" className="section properties-page">
      <div className="container">
        <div className="property-controls">
          <div className="property-tools">
            <div className="results-counter">
              Showing {filtered.length} of {ALL_PROPERTIES.length} properties
            </div>
            <div className="property-sort">
              <label htmlFor="sort-select">Sort by</label>
              <select id="sort-select" aria-label="Sort properties" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="name">Name A-Z</option>
                <option value="location">Location</option>
              </select>
            </div>
          </div>

          <div className="property-search-wrapper">
            <input
              className="form-control"
              type="search"
              placeholder="Search by name, type, location"
              aria-label="Search properties"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" aria-label="Search properties">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="gallery-filters" role="tablist" aria-label="Property categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`gallery-filter${category === c.key ? " active" : ""}`}
              role="tab"
              aria-selected={category === c.key}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="card-grid">
          {filtered.map((p) => (
            <Link key={p.slug} href={`/properties/${p.slug}`} className="property-card property-card-link gallery-item in-view" aria-label={`View details for ${p.name}`}>
              <div className="property-image">
                <Image src={p.image} alt={p.name} width={700} height={500} />
                <button className="favorite-btn" type="button" aria-label={`Save ${p.name}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.8 4.6a5.68 5.68 0 0 0-8 0L12 5.4l-0.8-0.8a5.68 5.68 0 0 0-8 8l0.8 0.8L12 21.5l8-8 0.8-0.8a5.68 5.68 0 0 0 0-8z"></path>
                  </svg>
                </button>
              </div>
              <div className="property-details">
                <p className="text-muted">
                  {p.categoryLabel} · {p.location}
                </p>
                <h3>{p.name}</h3>
                <p>{p.cardDescription}</p>
                <div className="property-meta">
                  <span>
                    Type<span>{p.categoryLabel}</span>
                  </span>
                  <span>
                    Location<span>{p.location}</span>
                  </span>
                </div>
                <span className="btn-link">
                  View Details
                </span>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && <div className="no-results">No properties match your search.</div>}
      </div>
      </section>
    </>
  );
}


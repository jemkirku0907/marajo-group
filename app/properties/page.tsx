"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { properties as ALL_PROPERTIES } from "@/lib/properties";

const FEATURED_PROPERTIES = ALL_PROPERTIES.filter((property) => property.hasDetailPage).slice(0, 4);

function getLocationTag(location: string) {
  const value = location.toLowerCase();
  if (value.includes("bgc") || value.includes("bonifacio")) return "BGC";
  if (value.includes("siargao")) return "Siargao";
  if (
    value.includes("makati") ||
    value.includes("salcedo") ||
    value.includes("burgos") ||
    value.includes("palma") ||
    value.includes("alfonso") ||
    value.includes("albert")
  ) {
    return "Makati";
  }
  return location;
}

function PropertiesContent() {
  const [activeFeature, setActiveFeature] = useState(0);

  const activeProperty = FEATURED_PROPERTIES[activeFeature];
  const propertyPreviews = FEATURED_PROPERTIES.slice(1).map((_, offset) => {
    const index = (activeFeature + offset + 1) % FEATURED_PROPERTIES.length;
    return { property: FEATURED_PROPERTIES[index], index };
  });

  return (
    <main className="properties-listing-page">
      <section className="properties-showcase" aria-labelledby="featured-property-title">
        <div className="properties-showcase-background" aria-hidden="true">
          {FEATURED_PROPERTIES.map((property, index) => (
            <Image
              key={property.slug}
              src={property.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className={index === activeFeature ? "is-active" : ""}
            />
          ))}
        </div>
        <div className="properties-showcase-overlay" aria-hidden="true" />

        <div className="container properties-showcase-inner">
          <div className="properties-showcase-copy" aria-live="polite">
            <span className="properties-showcase-kicker">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {activeProperty.location}
            </span>
            <p className="properties-showcase-type">{activeProperty.categoryLabel} Property</p>
            <h1 id="featured-property-title">{activeProperty.name}</h1>
            <p>{activeProperty.cardDescription}</p>
            <div className="properties-showcase-actions">
              <Link href={`/properties/${activeProperty.slug}`} className="btn-primary">
                View Property
              </Link>
              <Link href="#properties-list" className="btn-secondary">
                Browse All
              </Link>
            </div>
          </div>

          <div className="properties-showcase-browser">
            <div className="properties-showcase-count" aria-hidden="true">
              <span>{String(activeFeature + 1).padStart(2, "0")}</span>
              <i />
              <span>{String(FEATURED_PROPERTIES.length).padStart(2, "0")}</span>
            </div>
            <div className="properties-showcase-previews" aria-label="Choose a featured property">
              {propertyPreviews.map(({ property, index }) => (
                <button
                  key={property.slug}
                  type="button"
                  className="properties-showcase-preview"
                  aria-label={`Show ${property.name}`}
                  onClick={() => setActiveFeature(index)}
                >
                  <Image src={property.image} alt="" fill sizes="(max-width: 700px) 42vw, 180px" />
                  <span aria-hidden="true" />
                  <small>{getLocationTag(property.location)}</small>
                  <strong>{property.name}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="properties-list" className="section properties-page">
        <div className="container">
          <div className="section-title properties-index-heading">
            <span>Complete Portfolio</span>
            <h2>All Properties</h2>
            <p>Explore every Marajo Group property across office, residential, mixed-use, hospitality, and commercial destinations.</p>
          </div>

          <div className="card-grid">
            {ALL_PROPERTIES.map((p) => (
              <article key={p.slug} className="property-card property-listing-card in-view">
                <Link href={`/properties/${p.slug}`} className="property-card-hitbox" aria-label={`View details for ${p.name}`} />
                <div
                  className={`property-image${
                    p.slug === "salcedo-towers" || p.slug === "hightown-quarters-burgos"
                      ? " property-image--full-building"
                      : ""
                  }`}
                >
                  <Image
                    src={p.image}
                    alt={`${p.name} building exterior`}
                    width={700}
                    height={875}
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                  />
                  <button
                    className="favorite-btn"
                    type="button"
                    aria-label={`Save ${p.name}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.8 4.6a5.68 5.68 0 0 0-8 0L12 5.4l-0.8-0.8a5.68 5.68 0 0 0-8 8l0.8 0.8L12 21.5l8-8 0.8-0.8a5.68 5.68 0 0 0 0-8z"></path>
                    </svg>
                  </button>
                </div>
                <div className="property-details">
                  <p className="property-kicker">
                    {p.categoryLabel} {"\u00b7"} {getLocationTag(p.location)}
                  </p>
                  <h3>{p.name}</h3>
                  <p className="property-description">{p.cardDescription}</p>
                  <div className="property-meta">
                    <span>
                      Type<span>{p.categoryLabel}</span>
                    </span>
                    <span>
                      Location<span>{p.location}</span>
                    </span>
                  </div>
                  <Link href={`/properties/${p.slug}`} className="btn-link" aria-label={`View details for ${p.name}`}>
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PropertiesPage() {
  return <PropertiesContent />;
}

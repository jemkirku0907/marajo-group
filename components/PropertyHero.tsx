"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";

type HeroStat = {
  label: string;
  value: string;
};

type PropertyHeroProps = {
  name: string;
  tagline: string;
  category: string;
  meta: string;
  heroImage: string;
  heroImages?: string[];
  stat1?: HeroStat;
  stat2?: HeroStat;
  ctaHref: string;
};

function splitName(name: string) {
  return name.trim().split(/\s+/);
}

export default function PropertyHero({ name, tagline, category, meta, heroImage, heroImages, stat1, stat2, ctaHref }: PropertyHeroProps) {
  const titleLines = splitName(name);
  const stats = [stat1, stat2].filter(Boolean) as HeroStat[];
  const metaItems = meta.split("/").map((item) => item.trim()).filter(Boolean);
  const stripItems = [
    { label: "Location", value: metaItems.find((item) => item.toLowerCase().startsWith("location:"))?.replace(/^Location:\s*/i, "") || metaItems[0] || "Philippines" },
    { label: "Type", value: metaItems.find((item) => item.toLowerCase().startsWith("type:"))?.replace(/^Type:\s*/i, "") || category },
    { label: stats[0]?.label || "Portfolio", value: stats[0]?.value || "Marajo Group" },
    { label: stats[1]?.label || "Inquiries", value: stats[1]?.value || "By appointment" },
  ];
  const slides = useMemo(() => {
    const unique = [...new Set([...(heroImages ?? []), heroImage].filter(Boolean))];
    return unique.length > 0 ? unique : [heroImage];
  }, [heroImage, heroImages]);
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    if (!hasMultipleSlides) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [hasMultipleSlides, slides.length]);

  function goToSlide(index: number) {
    setActiveSlide((index + slides.length) % slides.length);
  }

  function handleTouchEnd(x: number) {
    if (touchStartX.current === null || !hasMultipleSlides) return;
    const delta = touchStartX.current - x;
    touchStartX.current = null;
    if (Math.abs(delta) < 36) return;
    goToSlide(activeSlide + (delta > 0 ? 1 : -1));
  }

  return (
    <section className="property-hero-frame" aria-label={`${name} hero`}>
      <div
        className="property-hero-card"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
      >
        <div className="property-hero-mini-nav" aria-label={`${name} quick navigation`}>
          <Link href="/" className="property-hero-brand" aria-label="Marajo Group home">
            <Image src="/assets/logo.png" alt="Marajo Group" width={72} height={72} priority />
          </Link>
          <nav className="property-hero-nav-links" aria-label="Property links">
            <Link href="/properties">Portfolio</Link>
            <Link href="#overview">Overview</Link>
            <Link href="#gallery">Gallery</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <Button href="/contact" className="property-hero-nav-cta">
            Inquire Now
            <svg className="property-hero-button-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 17 17 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 7h8v8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>

        <div className="property-hero-carousel" aria-label={`${name} image carousel`}>
          {slides.map((slide, index) => (
            <Image
              key={slide}
              src={slide}
              alt={`${name} ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 94vw"
              className={`property-hero-image${index === activeSlide ? " is-active" : ""}`}
              unoptimized={slide.startsWith("http")}
            />
          ))}
        </div>
        <div className="property-hero-scrim" aria-hidden="true" />
        <div className="property-hero-orb" aria-hidden="true" />
        <div className="property-hero-grain" aria-hidden="true" />

        <div className="property-hero-topline">
          <span className="property-hero-eyebrow">
            <span className="property-hero-status-dot" aria-hidden="true" />
            {category}
          </span>
          <span>{meta}</span>
        </div>

        <div className="property-hero-content">
          <h1 className="property-hero-wordmark" aria-label={name}>
            {titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p>{tagline}</p>
          <div className="property-hero-actions">
            <Button href={ctaHref} className="property-hero-button property-hero-button-primary">
              View Overview
              <svg className="property-hero-button-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17 17 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 7h8v8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
            <Button href="/contact" variant="secondary" className="property-hero-button property-hero-button-secondary">
              Inquire Now
            </Button>
          </div>
        </div>

        <div className="property-hero-bottom-strip" aria-label={`${name} quick facts`}>
          {stripItems.map((item) => (
            <div className="property-hero-strip-item" key={`${item.label}-${item.value}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        {hasMultipleSlides && (
          <div className="property-hero-carousel-controls" aria-label={`${name} carousel controls`}>
            <button type="button" aria-label="Previous image" onClick={() => goToSlide(activeSlide - 1)}>
              <span aria-hidden="true">‹</span>
            </button>
            <div className="property-hero-dots">
              {slides.map((slide, index) => (
                <button
                  key={`${slide}-dot`}
                  type="button"
                  className={index === activeSlide ? "is-active" : ""}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={index === activeSlide}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
            <button type="button" aria-label="Next image" onClick={() => goToSlide(activeSlide + 1)}>
              <span aria-hidden="true">›</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

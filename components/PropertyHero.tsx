import Image from "next/image";
import Button from "@/components/Button";
import StatCard from "@/components/StatCard";

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
  stat1?: HeroStat;
  stat2?: HeroStat;
  ctaHref: string;
};

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 2) return [name];
  const midpoint = Math.ceil(parts.length / 2);
  return [parts.slice(0, midpoint).join(" "), parts.slice(midpoint).join(" ")];
}

export default function PropertyHero({ name, tagline, category, meta, heroImage, stat1, stat2, ctaHref }: PropertyHeroProps) {
  const titleLines = splitName(name);
  const stats = [stat1, stat2].filter(Boolean) as HeroStat[];

  return (
    <section className="property-hero-frame" aria-label={`${name} hero`}>
      <div className="property-hero-card">
        <Image src={heroImage} alt={`${name} property image`} fill priority sizes="(max-width: 768px) 100vw, 94vw" className="property-hero-image" />
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

        <h1 className="property-hero-wordmark" aria-label={name}>
          {titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>

        <div className="property-hero-content">
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

        <StatCard items={stats} label={`${name} highlights`} className="property-hero-stat-card" />
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Property } from "@/lib/properties";
import Button from "@/components/Button";
import PropertyHero from "@/components/PropertyHero";
import PropertyGalleryCarousel from "@/components/PropertyGalleryCarousel";

const DETAIL_GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=600&fit=crop&auto=format",
    alt: "Tower exterior",
  },
  {
    src: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=900&h=600&fit=crop&auto=format",
    alt: "Lobby",
  },
  {
    src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&h=600&fit=crop&auto=format",
    alt: "Gym",
  },
  {
    src: "https://images.unsplash.com/photo-1462558813106-ae2d242f4ff8?w=900&h=600&fit=crop&auto=format",
    alt: "Rooftop lounge",
  },
];

const DEFAULT_INFO_CARDS = [
  {
    title: "Residential Design",
    text: "Smart floor plans, premium fixtures, and thoughtful living spaces designed for comfort and sophistication.",
    action: "floor-plans",
    ariaLabel: "Residential Design - View Floor Plans",
    icon: "home" as const,
  },
  {
    title: "Amenities",
    text: "Infinity pool, fitness center, sky lounge, garden terraces, and concierge services for a full-service lifestyle.",
    action: "amenities",
    ariaLabel: "Amenities - Explore Amenities",
    icon: "wave" as const,
  },
  {
    title: "Investment Appeal",
    text: "Strategic BGC location, premium construction, and strong rental-demand positioning make Marajo Tower a stable asset.",
    action: "investment",
    ariaLabel: "Investment Appeal - Investment Details",
    icon: "chart" as const,
  },
  {
    title: "Location",
    text: "Convenient access to retail, dining, offices, schools, and transport nodes in a high-value urban district.",
    action: "location",
    ariaLabel: "Location - View Map and Nearby Establishments",
    icon: "pin" as const,
  },
];

function CardIcon({ icon }: { icon: "home" | "wave" | "chart" | "pin" }) {
  if (icon === "wave") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12c2 0 2-2 5-2s3 2 6 2 3-2 6-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 16c2 0 2-2 5-2s3 2 6 2 3-2 6-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "chart") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 13l3-3 4 4 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "pin") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21s7-4.5 7-10a7 7 0 1 0-14 0c0 5.5 7 10 7 10z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PropertyDetail({ property }: { property: Property }) {
  const hero = property.hero ?? {
    label: property.categoryLabel,
    title: `${property.name} in ${property.location}`,
    copy: property.cardDescription,
  };
  const overview = property.overview ?? {
    eyebrow: property.name,
    heading: `${property.name} is part of Marajo Group's curated property portfolio.`,
    paragraph: property.cardDescription,
    image: property.image,
    specs: [
      { label: "Type", value: property.categoryLabel },
      { label: "Location", value: property.location },
      { label: "Inquiries", value: "Contact Marajo Group for availability, pricing, and site visits." },
    ],
  };
  const [stat1, stat2] = overview.specs;
  const heroImage = overview.image || property.image;
  const infoCards = property.facilities?.length ? property.facilities : property.infoCards?.length ? property.infoCards : DEFAULT_INFO_CARDS;

  return (
    <main className="property-detail-page">
      <PropertyHero
        name={property.name}
        tagline={hero.copy}
        category={hero.label}
        meta={`Location: ${property.location} / Type: ${property.categoryLabel}`}
        heroImage={heroImage}
        heroImages={property.heroImages}
        stat1={stat1}
        stat2={stat2}
        ctaHref="#overview"
      />

      <section id="overview" className="section">
        <div className="container split-grid">
          <div className="detail-copy">
            <div className="section-title">
              <span>{overview.eyebrow}</span>
              <h2>{overview.heading}</h2>
            </div>
            <p>{overview.paragraph}</p>
            <div className="list-grid property-spec-grid">
              {overview.specs.map((spec) => (
                <div className="list-item" key={spec.label}>
                  <h3>{spec.label}</h3>
                  <p>{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="property-detail-side">
            <div className="detail-image property-detail-image-frame">
              <Image src={overview.image} alt={property.name} width={1000} height={800} />
            </div>
            <div className="hero-actions property-detail-actions">
              <Button href="/contact" className="btn-primary">
                Inquire About {property.name}
              </Button>
              <Button href="/properties" variant="secondary" className="btn-secondary">
                Back to Properties
              </Button>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container info-grid">
          {infoCards.map((card, index) => (
            <Link className="interactive-card" data-action={card.action} aria-label={card.ariaLabel ?? card.title} key={card.action} href={`/properties/${property.slug}/facilities/${card.action}`}>
              <div className="card-head">
                <div className="card-icon" aria-hidden>
                  <CardIcon icon={card.icon ?? DEFAULT_INFO_CARDS[index % DEFAULT_INFO_CARDS.length].icon} />
                </div>
                <h4>{card.title}</h4>
                <span className="card-arrow">→</span>
              </div>
              <p>{card.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="gallery" className="section section-soft">
        <div className="container">
          <div className="section-title">
            <span>Gallery</span>
            <h2>Experience {property.name}&apos;s architecture, interiors, and community spaces.</h2>
          </div>
          <PropertyGalleryCarousel images={DETAIL_GALLERY_IMAGES} />
        </div>
      </section>

      <section className="section property-map-section">
        <div className="container">
          <div className="section-title">
            <span>Location</span>
            <h2>Find us on the map</h2>
          </div>
          <div className="property-map-frame">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${property.name} ${property.location} Philippines`)}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${property.name} map`}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

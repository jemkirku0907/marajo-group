import Image from "next/image";
import Link from "next/link";
import { Property } from "@/lib/properties";
import PropertyHero from "@/components/PropertyHero";

const galleryImages = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=900&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1462558813106-ae2d242f4ff8?w=900&h=600&fit=crop&auto=format",
];

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

  return (
    <main className="property-detail-page">
      <PropertyHero
        name={property.name}
        tagline={hero.copy}
        category={hero.label}
        meta={`Location: ${property.location} / Type: ${property.categoryLabel}`}
        heroImage={heroImage}
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
            <div className="list-grid" style={{ marginTop: "2rem" }}>
              {overview.specs.map((spec) => (
                <div className="list-item" key={spec.label}>
                  <h3>{spec.label}</h3>
                  <p>{spec.value}</p>
                </div>
              ))}
            </div>
            <div className="hero-actions" style={{ marginTop: "2rem" }}>
              <Link href="/contact" className="btn-primary">
                Inquire About {property.name}
              </Link>
              <Link href="/properties" className="btn-secondary">
                Back to Properties
              </Link>
            </div>
          </div>
          <div className="detail-image">
            <Image src={overview.image} alt={property.name} width={1000} height={800} />
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-title">
            <span>Gallery</span>
            <h2>Experience {property.name}&apos;s architecture, interiors, and community spaces.</h2>
          </div>
          <div className="gallery-grid">
            {galleryImages.map((src, index) => (
              <div className="gallery-item" key={src}>
                <Image src={src} alt={`${property.name} gallery ${index + 1}`} width={900} height={600} />
              </div>
            ))}
          </div>
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

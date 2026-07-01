import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { properties, getProperty } from "@/lib/properties";

export function generateStaticParams() {
  return properties.filter((p) => p.hasDetailPage).map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const property = getProperty(params.slug);
  if (!property) return {};
  return {
    title: `${property.name} | Marajo Group`,
    description: property.cardDescription,
  };
}

export default function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const property = getProperty(params.slug);
  if (!property || !property.hasDetailPage || !property.hero || !property.overview) notFound();

  return (
    <main>
      <section className="hero" style={{ minHeight: "70vh" }}>
        <div className="container hero-content">
          <span className="hero-label">{property.hero.label}</span>
          <h1 className="hero-title">{property.hero.title}</h1>
          <p className="hero-copy">{property.hero.copy}</p>
          <div className="hero-actions">
            <Link href="#overview" className="btn-primary">
              View Overview
            </Link>
            <Link href="/contact" className="btn-secondary">
              Connect with Us
            </Link>
          </div>
        </div>
      </section>

      <section id="overview" className="section">
        <div className="container split-grid">
          <div className="detail-copy">
            <div className="section-title">
              <span>{property.overview.eyebrow}</span>
              <h2>{property.overview.heading}</h2>
            </div>
            <p>{property.overview.paragraph}</p>
            <div className="list-grid" style={{ marginTop: "2rem" }}>
              {property.overview.specs.map((spec) => (
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
            <Image src={property.overview.image} alt={property.name} width={1000} height={800} />
          </div>
        </div>
      </section>
    </main>
  );
}

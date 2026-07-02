import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { properties, getProperty } from "@/lib/properties";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
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
  if (!property) notFound();
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

  return (
    <main>
      <section className="hero" style={{ minHeight: "70vh" }}>
        <div className="container hero-content">
          <span className="hero-label">{hero.label}</span>
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-copy">{hero.copy}</p>
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
    </main>
  );
}

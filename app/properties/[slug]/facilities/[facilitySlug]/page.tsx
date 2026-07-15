import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import { MEETING_ROOM_BOOKING_URL } from "@/lib/externalBooking";
import { getProperty, properties } from "@/lib/properties";

function facilityImage(propertySlug: string, facilitySlug: string) {
  const property = getProperty(propertySlug);
  const facility = property?.facilities?.find((item) => item.action === facilitySlug);
  const title = facility?.title.toLowerCase() || "";
  const bookable = property?.bookableFacilities?.find((item) => {
    const label = item.label.toLowerCase();
    if (title.includes("meeting") && item.type === "meeting-room") return true;
    if ((title.includes("conference") || title.includes("business") || title.includes("office support")) && item.type === "meeting-room") return true;
    if ((title.includes("storage") || title.includes("business support")) && item.type === "storage") return true;
    if ((title.includes("unit") || title.includes("suite") || title.includes("residence") || title.includes("stay")) && item.type === "overnight-stay") return true;
    return label.includes(title.split(" ")[0] || "");
  });

  return facility?.image || bookable?.image || property?.overview?.image || property?.image || "/assets/marajo-tower.jpg";
}

function facilitySpecs(propertySlug: string, facilitySlug: string) {
  const property = getProperty(propertySlug);
  const facility = property?.facilities?.find((item) => item.action === facilitySlug);
  const title = facility?.title.toLowerCase() || "";
  const bookable = property?.bookableFacilities?.find((item) => {
    if (title.includes("meeting") && item.type === "meeting-room") return true;
    if ((title.includes("conference") || title.includes("business") || title.includes("office support")) && item.type === "meeting-room") return true;
    if (title.includes("storage") && item.type === "storage") return true;
    if (title.includes("unit") || title.includes("suite") || title.includes("residence")) return item.type === "overnight-stay";
    return false;
  });

  return [
    ...(facility?.specs || []),
    { label: "Property", value: property?.name || "" },
    { label: "Location", value: property?.location || "" },
    ...(bookable ? [{ label: "Booking", value: bookable.rateLabel }] : []),
  ].filter((item) => item.value);
}

export function generateStaticParams() {
  return properties.flatMap((property) =>
    (property.facilities || []).map((facility) => ({
      slug: property.slug,
      facilitySlug: facility.action,
    })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; facilitySlug: string }> }) {
  const { slug, facilitySlug } = await params;
  const property = getProperty(slug);
  const facility = property?.facilities?.find((item) => item.action === facilitySlug);
  if (!property || !facility) return {};

  return {
    title: `${facility.title} | ${property.name}`,
    description: facility.text,
  };
}

export default async function FacilityDetailPage({ params }: { params: Promise<{ slug: string; facilitySlug: string }> }) {
  const { slug, facilitySlug } = await params;
  const property = getProperty(slug);
  const facility = property?.facilities?.find((item) => item.action === facilitySlug);

  if (!property || !facility) notFound();

  const image = facilityImage(slug, facilitySlug);
  const specs = facilitySpecs(slug, facilitySlug);
  const isRemoteImage = image.startsWith("http");

  return (
    <main className="facility-detail-page">
      <section className="section facility-detail-hero">
        <div className="container facility-detail-grid">
          <div className="facility-detail-copy">
            <Link href={`/properties/${property.slug}`} className="facility-back-link">
              ← Back to {property.name}
            </Link>
            <span className="hero-label">{property.categoryLabel} Facility</span>
            <h1 className="hero-title">{facility.title}</h1>
            <p className="hero-copy">{facility.text}</p>
            <div className="hero-actions">
              <Button href={MEETING_ROOM_BOOKING_URL} className="btn-primary">
                Check Booking Options
              </Button>
              <Button href="/contact" variant="secondary" className="btn-secondary">
                Ask About This Space
              </Button>
            </div>
          </div>
          <div className="facility-detail-media">
            <Image src={image} alt={`${facility.title} at ${property.name}`} width={980} height={680} unoptimized={isRemoteImage} />
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-title">
            <span>Details</span>
            <h2>{facility.title} information</h2>
          </div>
          <div className="list-grid property-spec-grid">
            {specs.map((spec) => (
              <div className="list-item" key={spec.label}>
                <h3>{spec.label}</h3>
                <p>{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import { getProperty, properties } from "@/lib/properties";
import { MEETING_ROOM_BOOKING_URL, MEETING_ROOM_INQUIRY_URL } from "@/lib/externalBooking";

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
  const isMeetingRoom = facilitySlug === "meeting-rooms";
  const isSalcedoUnavailable = property.slug === "salcedo-towers" && isMeetingRoom;

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
            {isSalcedoUnavailable && <span className="facility-availability-badge">Currently Unavailable</span>}
            <div className="hero-actions">
              {isMeetingRoom ? (
                isSalcedoUnavailable ? (
                  <Button href={MEETING_ROOM_INQUIRY_URL} className="btn-primary">Contact Us About Availability</Button>
                ) : (
                  <Button href={MEETING_ROOM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">Book a Meeting Room</Button>
                )
              ) : (
                <Button href="/contact" className="btn-primary">Ask About This Space</Button>
              )}
              <Button href={`/properties/${property.slug}`} variant="secondary" className="btn-secondary">
                Back to {property.name}
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

import { notFound } from "next/navigation";
import { properties, getProperty } from "@/lib/properties";
import PropertyDetail from "@/components/PropertyDetail";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) return {};
  return {
    title: property.name,
    description: property.cardDescription,
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) notFound();
  return <PropertyDetail property={property} />;
}

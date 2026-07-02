import { getProperty } from "@/lib/properties";
import PropertyDetail from "@/components/PropertyDetail";

export default function HightownQuartersBurgosLegacyPage() {
  return <PropertyDetail property={getProperty("hightown-quarters-burgos")!} />;
}

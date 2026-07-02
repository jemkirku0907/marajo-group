import { getProperty } from "@/lib/properties";
import PropertyDetail from "@/components/PropertyDetail";

export default function SalcedoLegacyPage() {
  return <PropertyDetail property={getProperty("salcedo-towers")!} />;
}

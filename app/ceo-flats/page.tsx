import { getProperty } from "@/lib/properties";
import PropertyDetail from "@/components/PropertyDetail";

export default function CEOFlatsLegacyPage() {
  return <PropertyDetail property={getProperty("ceo-flats")!} />;
}

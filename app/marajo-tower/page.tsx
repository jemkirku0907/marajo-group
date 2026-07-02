import { getProperty } from "@/lib/properties";
import PropertyDetail from "@/components/PropertyDetail";

export default function MarajoTowerLegacyPage() {
  return <PropertyDetail property={getProperty("marajo-tower")!} />;
}

import { getProperty } from "@/lib/properties";
import PropertyDetail from "@/components/PropertyDetail";

export default function MarajoTownCenterLegacyPage() {
  return <PropertyDetail property={getProperty("marajo-town-center")!} />;
}

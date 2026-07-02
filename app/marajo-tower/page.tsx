import { getProperty } from "@/lib/properties";
import PropertyDetail from "@/components/PropertyDetail";

export const metadata = {
  title: "Marajo Tower",
  description: getProperty("marajo-tower")?.cardDescription,
};

export default function MarajoTowerLegacyPage() {
  return <PropertyDetail property={getProperty("marajo-tower")!} />;
}

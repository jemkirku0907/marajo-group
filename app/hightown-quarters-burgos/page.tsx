import { getProperty } from "@/lib/properties";
import PropertyDetail from "@/components/PropertyDetail";

export const metadata = {
  title: "Hightown Quarters Burgos",
  description: getProperty("hightown-quarters-burgos")?.cardDescription,
};

export default function HightownQuartersBurgosLegacyPage() {
  return <PropertyDetail property={getProperty("hightown-quarters-burgos")!} />;
}

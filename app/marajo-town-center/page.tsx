import { getProperty } from "@/lib/properties";
import PropertyDetail from "@/components/PropertyDetail";

export const metadata = {
  title: "Marajo Town Center",
  description: getProperty("marajo-town-center")?.cardDescription,
};

export default function MarajoTownCenterLegacyPage() {
  return <PropertyDetail property={getProperty("marajo-town-center")!} />;
}

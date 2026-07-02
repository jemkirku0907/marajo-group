import { getProperty } from "@/lib/properties";
import PropertyDetail from "@/components/PropertyDetail";

export const metadata = {
  title: "CEO Flats",
  description: getProperty("ceo-flats")?.cardDescription,
};

export default function CEOFlatsLegacyPage() {
  return <PropertyDetail property={getProperty("ceo-flats")!} />;
}

import { getProperty } from "@/lib/properties";
import PropertyDetail from "@/components/PropertyDetail";

export const metadata = {
  title: "Salcedo Towers",
  description: getProperty("salcedo-towers")?.cardDescription,
};

export default function SalcedoLegacyPage() {
  return <PropertyDetail property={getProperty("salcedo-towers")!} />;
}

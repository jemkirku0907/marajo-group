import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Marajo Group pages, properties, services, and updates.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}

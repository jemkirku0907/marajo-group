import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties",
  description: "Browse Marajo Group residential, commercial, office, mixed-use, and hospitality properties.",
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Properties | Marajo Group",
    template: "%s | Marajo Group",
  },
  description: "Browse Marajo Group residential, commercial, office, mixed-use, and hospitality properties.",
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

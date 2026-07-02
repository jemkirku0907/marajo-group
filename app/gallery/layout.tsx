import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore Marajo Group's portfolio gallery across residential, commercial, office, hospitality, and storage properties.",
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

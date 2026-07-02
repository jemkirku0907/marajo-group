import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Marajo Group's property development history, values, milestones, and community work.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

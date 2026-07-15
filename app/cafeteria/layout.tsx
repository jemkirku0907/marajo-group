import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cafeteria | Marajo Group",
  description: "View the Marajo Group cafeteria space and prepare for online ordering",
};

export default function CafeteriaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
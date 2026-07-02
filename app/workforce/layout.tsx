import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workforce",
  description: "Book verified workforce support for Marajo Group property services and maintenance needs.",
};

export default function WorkforceLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facilities",
  description: "Reserve Marajo Group facilities and court bookings online.",
};

export default function FacilitiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

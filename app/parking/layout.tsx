import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parking",
  description: "Reserve parking spaces and manage Marajo Group parking reservations.",
};

export default function ParkingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import LayoutShell from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: "Marajo Group",
  description: "Marajo Group — Properties, Parking, Facilities & Workforce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-light h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}

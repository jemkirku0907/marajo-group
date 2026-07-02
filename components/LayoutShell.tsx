"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ScrollPolish from "@/components/ScrollPolish";
import ThemeController from "@/components/ThemeController";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar themeControl={<ThemeController />} />}
      <main className={isAdmin ? undefined : "flex-1"}>{children}</main>
      {!isAdmin && (
        <>
          <Link href="/contact" className="sticky-contact" title="Contact Sales" aria-label="Contact our sales team">
            <span className="sticky-contact-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <span className="sticky-contact-label">Inquire Now</span>
          </Link>
          <Footer />
          <AuthModal />
          <ScrollPolish />
        </>
      )}
    </>
  );
}

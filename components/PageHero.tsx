"use client";

import Link from "next/link";
import Container from "@/components/Container";

type Crumb = {
  href?: string;
  label: string;
};

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  crumbs,
  label,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  label?: string;
}) {
  return (
    <section className="page-hero">
      <Container className="page-hero-inner">
        <div className="page-hero-copy">
          {eyebrow && <span className="page-hero-eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {crumbs && crumbs.length > 0 && (
          <nav className="page-hero-crumbs" aria-label="Breadcrumb">
            {crumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`}>
                {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
              </span>
            ))}
          </nav>
        )}
        {label && <span className="page-hero-side-label">{label}</span>}
      </Container>
    </section>
  );
}

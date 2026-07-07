import Link from "next/link";
import { properties } from "@/lib/properties";

const featuredFooterProperties = properties.slice(0, 4);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-logo">
            <img src="/assets/logo.png" alt="Marajo Group" width={42} height={49} loading="lazy" />
          </p>
          <p className="footer-note">Premium developments, corporate living, and trusted real estate investments.</p>
          <div className="social-squares">
            <span className="square" />
            <span className="square" />
            <span className="square" />
          </div>
        </div>
        <div>
          <h4>Company</h4>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/news">News</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <h4>Properties</h4>
          <div className="footer-links">
            {featuredFooterProperties.map((property) => (
              <Link key={property.slug} href={`/properties/${property.slug}`}>
                {property.name}
              </Link>
            ))}
            <Link href="/properties">View All Properties</Link>
          </div>
        </div>
        <div>
          <h4>Services</h4>
          <div className="footer-links">
            <Link href="/properties">Properties</Link>
            <Link href="/parking">Parking</Link>
            <Link href="/workforce">Workforce</Link>
            <Link href="/facilities">Facilities</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p className="footer-note">© 2026 Marajo Group. All rights reserved.</p>
          <p className="footer-note">Designed &amp; Built by Marajo Group</p>
        </div>
      </div>
    </footer>
  );
}

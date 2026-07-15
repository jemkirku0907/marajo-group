import Image from "next/image";
import Link from "next/link";
import Button from "@/components/Button";
import VisitorCounter from "@/components/VisitorCounter";
import { MEETING_ROOM_BOOKING_URL, PARKING_BOOKING_URL } from "@/lib/externalBooking";

export const metadata = {
  title: "Home",
  description:
    "Marajo Group delivers premium real estate developments in the Philippines. Explore properties, amenities, and contact our sales team.",
};

export default function HomePage() {
  return (
    <main className="home-page">
      <section id="home" className="home-hero">
        <div className="container home-hero-grid">
          <div className="home-hero-copy reveal-on-scroll">
            <span className="hero-label">Premium Real Estate</span>
            <h1 className="hero-title">Quality spaces for people, business, and long term value.</h1>
            <p className="hero-copy">
              For over four decades, Marajo Group has transformed focused ideas into enduring real estate across
              Makati, BGC, and select Philippine growth districts.
            </p>
            <div className="hero-actions">
              <Button href="/properties" className="btn-primary">
                Explore Properties
              </Button>
              <Button href="/about" variant="secondary" className="btn-secondary">
                Our Story
              </Button>
            </div>
            <VisitorCounter variant="inline" />
          </div>
          <div className="home-hero-media reveal-on-scroll" aria-label="Featured Marajo development preview">
            <Image src="/assets/marajo-tower.jpg" alt="Marajo Tower exterior" width={900} height={1100} priority />
            <div className="hero-feature-panel">
              <span>Featured Development</span>
              <strong>Marajo Tower</strong>
              <p>PEZA-accredited office address in Bonifacio Global City.</p>
            </div>
          </div>
        </div>
        <div className="home-scroll-cue">
          <a href="#home-stats" aria-label="Scroll to company highlights">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </a>
        </div>
      </section>

      <section id="home-stats" className="home-stat-strip reveal-on-scroll" aria-labelledby="home-stats-title">
        <div className="container">
          <span id="home-stats-title" className="visually-hidden">Company Highlights</span>
          <div className="section-title home-stat-heading">
            <span>Company Highlights</span>
            <h2>Built through decades of steady development.</h2>
          </div>
          <div className="home-stat-grid">
            <div>
              <strong>45+</strong>
              <span>Years of development experience</span>
            </div>
            <div>
              <strong>9</strong>
              <span>Selected properties in the active showcase</span>
            </div>
            <div>
              <strong>3</strong>
              <span>Core districts across Makati, BGC, and growth corridors</span>
            </div>
            <div>
              <strong>1978</strong>
              <span>Founded with a focus on practical quality</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section home-mosaic reveal-on-scroll">
        <div className="container">
          <div className="home-mosaic-header">
            <div>
              <span className="section-kicker">Our Developments</span>
              <h2>Properties built to last and designed to perform.</h2>
            </div>
            <Link href="/properties" className="home-mosaic-all">
              Browse all properties{" "}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="home-mosaic-grid">
            <Link href="/properties/marajo-tower" className="home-mosaic-card home-mosaic-card--large">
              <Image src="/assets/marajo-tower.jpg" alt="Marajo Tower, BGC" width={900} height={700} loading="lazy" />
              <div className="home-mosaic-label">
                <span className="home-mosaic-tag">Office · BGC</span>
                <strong>Marajo Tower</strong>
                <p>23-storey PEZA-accredited office address in Bonifacio Global City.</p>
              </div>
            </Link>
            <Link href="/properties/ceo-flats" className="home-mosaic-card home-mosaic-card--tall">
              <Image src="/assets/ceoflats.jpg" alt="CEO Flats, Makati" width={700} height={900} loading="lazy" />
              <div className="home-mosaic-label">
                <span className="home-mosaic-tag">Residential · Makati</span>
                <strong>CEO Flats</strong>
                <p>55-unit serviced apartment in Bel-Air Village.</p>
              </div>
            </Link>
            <Link href="/properties/salcedo-towers" className="home-mosaic-card">
              <Image src="/assets/SALCEDO-TOWERS.jpg" alt="Salcedo Towers, Makati" width={700} height={500} loading="lazy" />
              <div className="home-mosaic-label">
                <span className="home-mosaic-tag">Mixed-use · Makati</span>
                <strong>Salcedo Towers</strong>
                <p>27-storey mixed-use address in the heart of the Makati CBD.</p>
              </div>
            </Link>
            <Link href="/properties/hightown-quarters-burgos" className="home-mosaic-card">
              <Image src="/assets/HQ-Burgos.jpg" alt="Hightown Quarters Burgos, Makati" width={700} height={500} loading="lazy" />
              <div className="home-mosaic-label">
                <span className="home-mosaic-tag">Residential · Makati</span>
                <strong>Hightown Quarters Burgos</strong>
                <p>11-storey residential condominium for efficient Poblacion living.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section home-services reveal-on-scroll">
        <div className="container">
          <div className="section-title">
            <span>Building Services</span>
            <h2>More than just properties.</h2>
          </div>
          <div className="home-services-grid">
            <a href={PARKING_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="home-service-card">
              <div className="home-service-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M9 16V9h3.5a2.5 2.5 0 0 1 0 5H9" />
                </svg>
              </div>
              <div>
                <strong>Parking Reservations</strong>
                <p>Reserve a slot online. Check live availability, pick your date and time, and get a full fee breakdown before you confirm.</p>
              </div>
              <span className="home-service-link">
                Reserve a slot{" "}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </a>
            <Link href="/workforce" className="home-service-card">
              <div className="home-service-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="7" r="4" />
                  <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
                </svg>
              </div>
              <div>
                <strong>Workforce Booking</strong>
                <p>Need janitors, maintenance staff, electricians, or security? Browse verified workers and book a shift directly online.</p>
              </div>
              <span className="home-service-link">
                Book a worker{" "}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <a href={MEETING_ROOM_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="home-service-card">
              <div className="home-service-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 36H44V12H4V36H24ZM24 36V28M24 12V20" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11 24C11 26.2091 9.20914 28 7 28H4V20H7C9.20914 20 11 21.7909 11 24Z" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M37 24C37 26.2091 38.7909 28 41 28H44V20H41C38.7909 20 37 21.7909 37 24Z" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <strong>Facilities</strong>
                <p>Reserve a facilities online. Check live availability, pick your date and time, and get a full fee breakdown before you confirm.</p>
              </div>
              <span className="home-service-link">
                Reserve a facilities{" "}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="section home-why reveal-on-scroll">
        <div className="container home-split">
          <div className="home-split-media">
            <Image src="/assets/HQ-Burgos.jpg" alt="Hightown Quarters Burgos facade" width={900} height={700} />
          </div>
          <div className="home-split-copy">
            <span className="section-kicker">Why Choose Marajo Group</span>
            <h2>Trusted delivery, practical locations, and spaces made to keep working.</h2>
            <ul className="home-check-list">
              <li>
                <span className="check-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2 4 6v6c0 5 4 8.5 8 10 4-1.5 8-5 8-10V6l-8-4z"></path>
                  </svg>
                </span>
                <div className="check-copy">
                  <strong>Trusted Developer</strong>
                  <span>Proven delivery record and transparent project conversations.</span>
                </div>
              </li>
              <li>
                <span className="check-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                  </svg>
                </span>
                <div className="check-copy">
                  <strong>Quality Construction</strong>
                  <span>Material choices and planning standards guided by long-term use.</span>
                </div>
              </li>
              <li>
                <span className="check-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21c-4.5-3-7-6.5-7-10a7 7 0 0 1 14 0c0 3.5-2.5 7-7 10z"></path>
                    <circle cx="12" cy="11" r="2.5"></circle>
                  </svg>
                </span>
                <div className="check-copy">
                  <strong>Prime Locations</strong>
                  <span>Projects placed near demand centers, transit, work, and lifestyle needs.</span>
                </div>
              </li>
              <li>
                <span className="check-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 17l5-5 4 4 8-9"></path>
                    <path d="M15 7h5v5"></path>
                  </svg>
                </span>
                <div className="check-copy">
                  <strong>Long-Term Value</strong>
                  <span>Investment-minded developments with durable everyday appeal.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section home-invest reveal-on-scroll">
        <div className="container">
          <div className="section-title">
            <span>Investment Opportunities</span>
            <h2>Three ways Marajo properties create value.</h2>
          </div>
          <div className="home-feature-row">
            <Image src="/assets/mrj.jpg" alt="MRJ Center exterior" width={900} height={600} />
            <div>
              <span>01</span>
              <h3>Stable urban demand</h3>
              <p>Addresses in active business districts support rental demand, tenant movement, and everyday accessibility.</p>
            </div>
          </div>
          <div className="home-feature-row home-feature-row-reverse">
            <Image src="/assets/ceoflats.jpg" alt="CEO Flats building exterior" width={900} height={600} />
            <div>
              <span>02</span>
              <h3>Managed living and work spaces</h3>
              <p>Residential, serviced, and office properties are planned with operations and client support in mind.</p>
            </div>
          </div>
          <div className="home-feature-row">
            <Image src="/assets/Space-Solution-A.jpg" alt="Space Solutions facility" width={900} height={600} />
            <div>
              <span>03</span>
              <h3>Curated portfolio range</h3>
              <p>From office towers to residences and commercial facilities, the portfolio gives clients practical entry points.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-visual-band reveal-on-scroll">
        <div className="home-visual-text">
          <span className="home-visual-kicker">Quality is the essence</span>
          <strong className="home-visual-headline">Spaces with purpose, presence, and staying power.</strong>
          <Link href="/about" className="home-visual-link">
            Our philosophy
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="home-visual-images">
          <Image src="/assets/QUACC.jpg" alt="Marajo Group quality and community project" width={1200} height={800} className="home-visual-img" />
        </div>
      </section>

      <section className="home-quote-section reveal-on-scroll">
        <div className="container home-quote">
          <div className="home-quote-mark" aria-hidden="true">
            MG
          </div>
          <blockquote>
            <p>
              Every project should answer a real need: a better address, a more useful space, and a development
              that still feels right years later.
            </p>
            <cite>Marajo Group development principle</cite>
          </blockquote>
        </div>
      </section>

      <section className="section home-timeline-section reveal-on-scroll">
        <div className="container">
          <div className="section-title">
            <span>Marajo Timeline</span>
            <h2>Milestones and achievements</h2>
          </div>
          <div className="home-timeline">
            <div className="home-timeline-item">
              <span>1978</span>
              <h3>Founded</h3>
              <p>Established in Makati with a focus on quality developments.</p>
            </div>
            <div className="home-timeline-item">
              <span>1996</span>
              <h3>Commercial growth</h3>
              <p>Expanded through key office and mixed-use developments.</p>
            </div>
            <div className="home-timeline-item">
              <span>2008</span>
              <h3>Marajo Tower</h3>
              <p>Delivered a signature BGC office address for modern teams.</p>
            </div>
            <div className="home-timeline-item">
              <span>2026</span>
              <h3>Modern portfolio</h3>
              <p>Continues growing around practical, investor-focused properties.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-cta reveal-on-scroll">
        <div className="container home-cta-grid">
          <div>
            <span className="section-kicker">Get In Touch</span>
            <h2>Schedule a site visit or request project information.</h2>
          </div>
          <div className="section-actions">
            <Button href="/contact" className="btn-primary">
              Contact Sales
            </Button>
            <Button href="/properties" variant="secondary" className="btn-outline">
              View Properties
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

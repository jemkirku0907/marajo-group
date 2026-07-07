"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const TIMELINE = [
  { year: "1978", title: "Aguirre", img: "https://www.marajogroup.com/wp-content/uploads/2023/12/aquirre.jpg", text: "Unit 6 State Condominium II at 117 Aguirre Street in Legaspi Village became the first acquisition where succeeding structures until 1998 were conceptualized, designed, and finalized." },
  { year: "1981", title: "La Mirada", img: "https://www.marajogroup.com/wp-content/uploads/2023/12/1981-LA-MIRADA.jpg", text: "La Mirada was constructed when the term condominium was not yet widely present in public consciousness, marking an early move into urban residential development." },
  { year: "1992", title: "Gabriel", img: "https://www.marajogroup.com/wp-content/uploads/2023/12/1992-GABRIEL.jpg", text: "A high-rise condominium complex was built in what was then an unpopulated Ortigas area in Pasig City, ahead of the district's continued growth." },
  { year: "1996", title: "Salcedo Towers", img: "https://www.marajogroup.com/wp-content/uploads/2024/01/Salcedo-Towers.jpg", text: "Salcedo Towers, a modern 27-storey e-building, rose in the very heart of the Makati Central Business District." },
  { year: "1996", title: "NOL Tower", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&h=640&fit=crop&auto=format", text: "Situated at the gateway of the hardly occupied Madrigal Park Business Center." },
  { year: "1998", title: "Libran House", img: "https://www.marajogroup.com/wp-content/uploads/2023/12/1998-LIBRAN-HOUSE.jpg", text: "An eight-storey office building was developed at 144 Legaspi Street corner V.A. Rufino Street in Legaspi Village, Makati City." },
  { year: "1998", title: "CEO Suites", img: "/assets/ceoflats.jpg", text: "A 26-room boutique hotel located in Bel-Air Village." },
  { year: "2008", title: "Marajo Tower", img: "/assets/marajo-tower.jpg", text: "A 23-storey PEZA-accredited office building was developed in Bonifacio Global City, Taguig." },
  { year: "2010", title: "CEO Flats", img: "https://www.marajogroup.com/wp-content/uploads/2023/12/ceo-flats-full.jpg", text: "A 55-unit serviced apartment opened in Bel-Air Village, expanding the company's hospitality and serviced-living portfolio." },
  { year: "2012", title: "HQ Alfonso", img: "/assets/HQ-Alfonso.jpg", text: "A 5-storey residential condominium building in Makati." },
  { year: "2012", title: "HQ Albert", img: "/assets/HQ-Albert.jpg", text: "A 5-storey residential condominium building in Makati." },
  { year: "2012", title: "Palma", img: "/assets/HQ-Palma.jpg", text: "A 5-storey residential condominium building in Makati." },
  { year: "2014", title: "HQ Burgos", img: "/assets/HQ-Burgos.jpg", text: "An 11-storey residential condominium building in Makati." },
  { year: "2015", title: "MRJ Center", img: "/assets/mrj.jpg", text: "A premium commercial and office building located in the fast developing vicinity of Makati Poblacion." },
  { year: "2017", title: "Space Solutions", img: "https://www.marajogroup.com/wp-content/uploads/2023/09/Space-solution-7.jpg", text: "A first-class modern storage facility opened in Makati, extending Marajo Group's reach into storage properties." },
];

const VALUES = [
  { title: "Quality Craftsmanship", text: "Materials, finishes, and construction are selected to deliver enduring quality." },
  { title: "Client Trust", text: "Transparent communication, dependable service, and responsible corporate practice." },
  { title: "Strategic Growth", text: "Deliberate project locations and development plans that support appreciation." },
  { title: "Premium Experiences", text: "Design and amenities built to elevate everyday living and working." },
];

const CSR_SLIDES = [
  { img: "/assets/QUACC.jpg", alt: "Queen of Angels Child Care Center" },
  { img: "/assets/TUTORIALKIDS.jpg", alt: "Children in classroom" },
  { img: "/assets/FEEDINGKIDS2.jpg", alt: "Feeding program" },
];

export default function AboutPage() {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  const [slide, setSlide] = useState(0);

  function toggleTimelineItem(index: number) {
    setOpenItems((items) => ({ ...items, [index]: !items[index] }));
  }

  return (
    <main>
      <section className="hero about-hero reveal-on-scroll">
        <Image
          src="/assets/marajo-tower.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="about-hero-bg"
          aria-hidden="true"
        />
        <div className="container about-hero-grid">
          <div className="about-hero-copy reveal-on-scroll">
            <span className="hero-label">About Marajo Group</span>
            <h1 className="hero-title">Quality is the essence and our dream.</h1>
            <p className="hero-copy">
             Marajo Group is a real estate developer spanning commercial, residential, hospitality, and storage properties, guided by a team that values discipline, imagination, personalized service, and care.
            </p>
            <div className="hero-actions">
              <Link href="/properties" className="btn-primary">
                Explore Properties
              </Link>
              <Link href="/contact" className="btn-secondary">
                Get in Touch
              </Link>
            </div>
          </div>
          <div className="about-hero-media reveal-on-scroll" aria-label="Salcedo Towers, a Marajo Group development">
            <Image src="/assets/SALCEDO-TOWERS.jpg" alt="Salcedo Towers, a Marajo Group development in Makati" width={900} height={680} />
            <div className="hero-feature-panel">
              <span>Operating Since 1978</span>
              <strong>45+ Years</strong>
              <p>Of development experience across Metro Manila&apos;s most active districts.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section reveal-on-scroll">
        <div className="container">
          <div className="section-title">
            <span>Company Story</span>
            <h2>Dedicated people, deliberate places, and a standard of quality built into every phase of development.</h2>
          </div>
          <div className="split-grid about-story-grid">
            <div className="story-copy">
              <p>
                Marajo Group is engaged in the full gamut of property development, from land acquisition and
                planning to architectural design, building construction, engineering, interior design, and property
                management. Its work is anchored on quality products and services across commercial, residential,
                hospitality, and storage properties.
              </p>
              <p>
                The company&apos;s philosophy is to dream big while staying exacting in the details. Attention to
                quality, stylish interiors, personalized service, loyalty, hard work, discipline, and creativity
                guide the way Marajo Group creates modern, distinct, and functional spaces for changing market
                needs.
              </p>
              <div className="story-stat-grid" aria-label="Marajo Group commitments">
                <div className="story-stat">
                  <span className="story-stat-circle">
                    <strong>45</strong>
                    <small>+</small>
                  </span>
                  <div className="story-stat-copy">
                    <strong>Years</strong>
                    <span>of development and operating experience</span>
                  </div>
                </div>
                <div className="story-stat">
                  <span className="story-stat-circle">
                    <strong>200K</strong>
                    <small>+</small>
                  </span>
                  <div className="story-stat-copy">
                    <strong>SQM</strong>
                    <span>of properties in strategic Metro Manila locations</span>
                  </div>
                </div>
              </div>
            </div>
            <Image
              src="https://www.marajogroup.com/wp-content/uploads/elementor/thumbs/Corporate-Profile-qu6obujcynyhksjyggjl2l7h485xdgfespujgbzbi8.jpg"
              alt="Marajo Group corporate profile"
              width={900}
              height={680}
              unoptimized
            />
          </div>
        </div>
      </section>

      <section className="section vision-mission-section reveal-on-scroll">
        <div className="container">
          <div className="section-title">
            <span>Vision &amp; Mission</span>
            <h2>A working culture shaped by discipline, integrity, teamwork, and service.</h2>
          </div>
          <div className="card-grid vision-mission-grid">
            <article className="info-card">
              <h4>Vision</h4>
              <p>
                To develop, nurture, and maintain an exceptional working system built on discipline, integrity,
                teamwork, and personal commitment from every individual in the organization.
              </p>
            </article>
            <article className="info-card">
              <h4>Mission</h4>
              <p>
                To lead through related products and services, deliver on time with no promises left unmet, and
                serve clients, employees, communities, and society with transparency, professionalism, dedication,
                prudence, and trust.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section timeline-section landmark-timeline reveal-on-scroll">
        <div className="container">
          <div className="section-title">
            <span>Company History</span>
            <h2>Landmark developments</h2>
          </div>
          <div className="timeline">
            {TIMELINE.map((item, i) => (
              <div
                key={`${item.title}-${i}`}
                className={`timeline-item${openItems[i] ? " is-open" : ""}`}
                tabIndex={0}
                role="button"
                aria-expanded={Boolean(openItems[i])}
                onClick={() => toggleTimelineItem(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleTimelineItem(i);
                  }
                }}
              >
                <Image src={item.img} alt={`${item.title} milestone`} width={400} height={280} className="timeline-image" unoptimized={item.img.startsWith("http")} />
                <span>{item.year}</span>
                <h3>{item.title}</h3>
                <p style={{ maxHeight: openItems[i] ? "240px" : "0px", opacity: openItems[i] ? 1 : 0, overflow: "hidden", transition: "max-height 0.3s ease, opacity 0.3s ease" }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          <div className="timeline-actions">
            <Link className="btn-primary" href="/gallery">
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-muted reveal-on-scroll">
        <div className="container">
          <div className="section-title">
            <span>Our Values</span>
            <h2>Premium design, trusted delivery, strategic thinking, and people-focused service.</h2>
          </div>
          <div className="card-grid compact">
            {VALUES.map((v) => (
              <div className="interactive-card" key={v.title}>
                <div className="card-head">
                  <h4>{v.title}</h4>
                </div>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section reveal-on-scroll">
        <div className="container">
          <div className="section-title">
            <span>Our Place - Tagaytay</span>
            <h2>A rest and recreation facility</h2>
          </div>
          <div className="feature-split">
            <div className="feature-copy">
              <h3>Space to pause, recharge, and build stronger relationships.</h3>
              <p>
                Our Place - Tagaytay serves as Marajo Group&apos;s rest and recreation facility for employees,
                partners, and stakeholders. Set within Tagaytay&apos;s cooler landscape, it gives the organization a
                dedicated setting for retreats, planning sessions, quiet recovery, and shared moments away from the
                pace of the city.
              </p>
              <p>
                The facility reflects the company&apos;s belief that quality is not limited to buildings; it also
                belongs in the environments where people restore energy, exchange ideas, and strengthen trust.
              </p>
            </div>
            <div className="photo-grid" aria-label="Our Place Tagaytay photo gallery">
              <Image src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=680&fit=crop&auto=format" alt="Tagaytay rest and recreation facility exterior" width={900} height={680} unoptimized />
              <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=680&fit=crop&auto=format" alt="Comfortable retreat house interior" width={900} height={680} unoptimized />
              <Image src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&h=680&fit=crop&auto=format" alt="Green landscape near Tagaytay" width={900} height={680} unoptimized />
            </div>
          </div>
        </div>
      </section>

      <section className="section csr-section reveal-on-scroll">
        <div className="container">
          <div className="section-title">
            <span>Corporate Social Responsibility</span>
            <h2>Queen of Angels Child Care Center</h2>
          </div>
          <div className="feature-split feature-split-reverse">
            <div className="csr-slider" role="region" aria-label="Child Care Center photos">
              <div className="csr-slider-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
                {CSR_SLIDES.map((s) => (
                  <div className="csr-slide" key={s.img}>
                    <Image src={s.img} alt={s.alt} width={900} height={680} />
                  </div>
                ))}
              </div>
              <button className="csr-arrow csr-arrow-prev" aria-label="Previous photo" onClick={() => setSlide((s) => (s - 1 + CSR_SLIDES.length) % CSR_SLIDES.length)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button className="csr-arrow csr-arrow-next" aria-label="Next photo" onClick={() => setSlide((s) => (s + 1) % CSR_SLIDES.length)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              <div className="csr-dots" aria-hidden="true">
                {CSR_SLIDES.map((s, i) => (
                  <button key={s.img} className={`csr-dot${i === slide ? " active" : ""}`} aria-label={`Photo ${i + 1}`} onClick={() => setSlide(i)} />
                ))}
              </div>
            </div>

            <div className="feature-copy">
              <h3>Supporting children with care, dignity, and opportunity.</h3>
              <p>
                With the full support of Marajo Group, the Child Care Center is housed in a building complete with
                classrooms, a kitchen, an eating area, and a chapel. It has grown beyond a feeding center into a
                safe haven where volunteers help bathe, teach, guide, and care for children.
              </p>
              <p>
                The program is Marajo Group&apos;s way of giving back, carrying the belief that lasting success is
                measured not only by what is built, but by what is shared with the communities it serves.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

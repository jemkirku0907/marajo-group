import Link from "next/link";

const cafeteriaImages = [
  {
    src: "/assets/cafeteria1.jpg",
    alt: "Marajo cafeteria dining area with tables and seating",
  },
  {
    src: "/assets/cafeteria%202.jpg",
    alt: "Marajo cafeteria serving counter with prepared food",
  },
  {
    src: "/assets/cafeteria3.jpg",
    alt: "Marajo cafeteria food counter and kitchen service area",
  },
];

export default function CafeteriaPage() {
  return (
    <main className="cafeteria-page">
      <section className="cafeteria-hero">
        <div className="container cafeteria-hero-grid">
          <div className="cafeteria-copy">
            <span className="hero-label">Marajo Cafeteria</span>
            <h1>Fresh meals and daily convenience inside the building.</h1>
            <p>
              A simple cafeteria preview for tenants, staff, and guests. Online ordering will connect to Enstack once the store link is ready.
            </p>
            <div className="hero-actions">
              <a className="btn-primary" href="#cafeteria-ordering">
                Order via Enstack
              </a>
              <Link className="btn-secondary" href="/contact">
                Ask About Cafeteria
              </Link>
            </div>
          </div>

          <div className="cafeteria-feature-photo">
            <img src="/assets/cafeteria1.jpg" alt="Marajo cafeteria dining area" />
            <div className="cafeteria-photo-chip">
              <span>Now Previewing</span>
              <strong>Cafeteria</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section cafeteria-gallery-section">
        <div className="container">
          <div className="section-heading">
            <span>Dining Space</span>
            <h2>Cafeteria photos</h2>
            <p>Current preview images while online ordering is being prepared.</p>
          </div>

          <div className="cafeteria-gallery">
            {cafeteriaImages.map((image) => (
              <figure className="cafeteria-card" key={image.src}>
                <img src={image.src} alt={image.alt} loading="lazy" />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="cafeteria-ordering">
        <div className="container cafeteria-order-panel">
          <div>
            <span className="hero-label">Ordering</span>
            <h2>Enstack ordering link coming soon.</h2>
            <p>
              This button is ready as the ordering entry point. Once the Enstack store URL is available, this will point directly to the cafeteria ordering page.
            </p>
          </div>
          <a className="btn-primary" href="#" aria-disabled="true">
            Order via Enstack
          </a>
        </div>
      </section>
    </main>
  );
}

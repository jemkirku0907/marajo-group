import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Marajo Journal | News, Updates & Market Insights",
};

const POST_IMG = "/assets/Post-New.jpg";

export default function NewsPage() {
  return (
    <main className="news-page">
      <section className="hero about-hero reveal-on-scroll">
        <div className="container about-hero-grid">
          <div className="about-hero-copy reveal-on-scroll">
            <span className="hero-label">Marajo Journal</span>
            <h1 className="hero-title">News, updates, and market insights from Marajo Group.</h1>
            <p className="hero-copy">
              Stay informed on property launches, company milestones, market notes, and community updates from the
              Marajo Group team.
            </p>
            <div className="hero-actions">
              <Link href="#latest-news" className="btn-primary">
                Read Latest
              </Link>
              <Link href="/contact" className="btn-secondary">
                Contact Us
              </Link>
            </div>
          </div>
          <div className="about-hero-media reveal-on-scroll" aria-label="Featured Marajo journal story">
            <Image src={POST_IMG} alt="Marajo journal featured story" width={900} height={680} priority unoptimized />
            <div className="hero-feature-panel">
              <span>October 18, 2023</span>
              <strong>Marajo Journal</strong>
              <p>Growing into one of the country&apos;s most trusted real estate companies</p>
            </div>
          </div>
        </div>
      </section>

      <section id="latest-news" className="section journal-full-article-section">
        <div className="container">
          <div className="section-title">
            <span>Full Feature</span>
            <h2>Read the published Marajo Journal feature</h2>
          </div>
          <div className="journal-full-article-card">
            <Image
              src={POST_IMG}
              alt="Full Philippine Daily Inquirer Marajo Group feature article"
              width={1264}
              height={2048}
              unoptimized
            />
          </div>
        </div>
      </section>
    </main>
  );
}

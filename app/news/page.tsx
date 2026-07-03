import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Marajo Journal | News, Updates & Market Insights",
};

const ARTICLES = [
  {
    tag: "Property Launch",
    tagClass: "journal-tag--launch",
    date: "April 2026",
    title: "Salcedo Towers expansion plan now available for inquiry",
    excerpt: "Residential floors and business-ready office suites are available for investors seeking strategic Makati exposure.",
    alt: "Salcedo Towers",
  },
  {
    tag: "Market Insight",
    tagClass: "journal-tag--insight",
    date: "March 2026",
    title: "Why premium Metro Manila real estate remains a smart long-term hold",
    excerpt: "Marajo Group shares the latest outlook for growth, value appreciation, and high-demand urban locations.",
    alt: "Metro Manila Market Insight",
  },
  {
    tag: "Community",
    tagClass: "journal-tag--community",
    date: "February 2026",
    title: "Marajo Group launches sustainability roadmap for new developments",
    excerpt: "The company outlined plans for lower environmental impact and greater community benefits across all future projects.",
    alt: "Sustainability Roadmap",
  },
];

const POST_IMG = "https://www.marajogroup.com/wp-content/uploads/2024/01/Post-New.jpg";

export default function NewsPage() {
  return (
    <main>
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
              <span>May 2026</span>
              <strong>Featured Story</strong>
              <p>Marajo Tower welcomes its first homeowners</p>
            </div>
          </div>
        </div>
      </section>

      <section id="latest-news" className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="section-title">
            <span>Latest</span>
            <h2>Featured Story</h2>
          </div>
          <a href="#" className="journal-featured">
            <div className="journal-featured-img">
              <Image src={POST_IMG} alt="Marajo Tower welcomes its first homeowners" width={900} height={600} unoptimized />
            </div>
            <div className="journal-featured-body">
              <div className="journal-meta">
                <span className="journal-tag">Company News</span>
                <span>May 2026</span>
              </div>
              <h2 className="journal-featured-title">Marajo Tower welcomes its first homeowners</h2>
              <p>
                Project delivery continues on schedule with premium amenities and customer care services now fully
                active. The handover marks a major milestone in Marajo Group&apos;s commitment to timely,
                high-quality residential development in the heart of Makati.
              </p>
              <span className="journal-read-more">Read Full Story →</span>
            </div>
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <span>Archives</span>
            <h2>More from the Journal</h2>
          </div>
          <div className="journal-grid">
            {ARTICLES.map((a) => (
              <a href="#" className="journal-card" key={a.title}>
                <div className="journal-card-img">
                  <Image src={POST_IMG} alt={a.alt} width={700} height={480} unoptimized />
                </div>
                <div className="journal-card-body">
                  <div className="journal-meta">
                    <span className={`journal-tag ${a.tagClass}`}>{a.tag}</span>
                    <span>{a.date}</span>
                  </div>
                  <h3>{a.title}</h3>
                  <p>{a.excerpt}</p>
                  <span className="journal-read-more">Read More →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { properties } from "@/lib/properties";

export const metadata = {
  title: "Marajo Journal | News, Updates & Market Insights",
};

const POST_IMG = "/assets/Post-New.jpg";
const MURO_IMG = properties.find((property) => property.slug === "muro-siargao")?.image || POST_IMG;
const TOWER_IMG = properties.find((property) => property.slug === "marajo-tower")?.image || POST_IMG;
const featuredPropertyCount = properties.filter((property) => property.overview).length;

const ARTICLES = [
  {
    tag: "Marajo Journal",
    tagClass: "journal-tag--launch",
    date: "October 18, 2023",
    title: "Growing into one of the country's most trusted real estate companies",
    excerpt: "Marajo Group has built a solid reputation across commercial, residential, hospitality, and storage developments through decades of quality-focused work.",
    alt: "Marajo Journal feature",
    image: POST_IMG,
  },
  {
    tag: "Land Development",
    tagClass: "journal-tag--insight",
    date: "Portfolio Update",
    title: "Muro Siargao planned community highlights island growth potential",
    excerpt: "Muro Siargao is envisioned as a residential and commercial subdivision shaped around Siargao's natural setting and rising appeal.",
    alt: "Muro Siargao",
    image: MURO_IMG,
  },
  {
    tag: "Portfolio",
    tagClass: "journal-tag--community",
    date: "Company Update",
    title: "Marajo Group portfolio spans office, residential, hospitality, and storage",
    excerpt: "The Group operates premium office space and prime residential properties while continuing to serve growing business and residential needs.",
    alt: "Marajo Group portfolio",
    image: TOWER_IMG,
  },
];

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

      <section id="latest-news" className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="section-title">
            <span>Latest</span>
            <h2>Featured Story</h2>
          </div>
          <a href="#" className="journal-featured">
            <div className="journal-featured-img">
              <Image src={POST_IMG} alt="Growing into one of the country's most trusted real estate companies" width={900} height={600} unoptimized />
            </div>
            <div className="journal-featured-body">
              <div className="journal-meta">
                <span className="journal-tag">Company News</span>
                <span>October 18, 2023</span>
              </div>
              <h2 className="journal-featured-title">Growing into one of the country&apos;s most trusted real estate companies</h2>
              <p>
                Since its inception four decades ago, Marajo Group has grown into one of the country&apos;s reliable
                real estate developers, focused on quality across commercial, residential, hospitality, and storage
                properties.
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
                  <Image src={a.image} alt={a.alt} width={700} height={480} unoptimized={a.image.startsWith("http")} />
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
          <p className="journal-source-note">
            Journal content is based on Marajo Group&apos;s published journal and current portfolio of {featuredPropertyCount} properties.
          </p>
        </div>
      </section>
    </main>
  );
}

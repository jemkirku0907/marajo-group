import Image from "next/image";
import Link from "next/link";
import { properties } from "@/lib/properties";

export const metadata = {
  title: "Marajo Journal | News, Updates & Market Insights",
};

const POST_IMG = "/assets/Post-New.jpg";
const featuredPropertyCount = properties.filter((property) => property.overview).length;

const BUSINESSMAN_IMG = "https://www.marajogroup.com/wp-content/uploads/2023/12/businessman_hires.jpg";
const BUSINESSWOMAN_IMG = "https://www.marajogroup.com/wp-content/uploads/2023/12/businesswoman_hires.jpg";

const KEY_PEOPLE = [
  ["Juan Dela Cruz", "President", BUSINESSMAN_IMG],
  ["Maria Santos", "Vice President", BUSINESSWOMAN_IMG],
  ["Andres Gonzales", "Financial Officer", BUSINESSMAN_IMG],
  ["Luz Reyes", "Technology Officer", BUSINESSWOMAN_IMG],
  ["Rosa Hernandez", "Marketing Officer", BUSINESSWOMAN_IMG],
  ["Diego Cruz", "Human Resources Officer", BUSINESSMAN_IMG],
  ["Elena Rivera", "Information Officer", BUSINESSWOMAN_IMG],
  ["Gabriel Fernandez", "Legal Officer", BUSINESSMAN_IMG],
];

const BOARD_DIRECTORS = [
  ["Santiago Cruz", "Chairman of the Board", BUSINESSMAN_IMG],
  ["Isabella Rodriguez", "Vice Chairman", BUSINESSWOMAN_IMG],
  ["Mateo Sanchez", "Independent Director", BUSINESSMAN_IMG],
  ["Luisa Ramirez", "Independent Director", BUSINESSWOMAN_IMG],
  ["Diego Herrera", "Non-Executive Director", BUSINESSMAN_IMG],
  ["Camila Torres", "Non-Executive Director", BUSINESSWOMAN_IMG],
  ["Marcela Gomez", "Director", BUSINESSWOMAN_IMG],
  ["Javier Martinez", "Director", BUSINESSMAN_IMG],
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
              <Image
                src={POST_IMG}
                alt="Growing into one of the country's most trusted real estate companies"
                width={900}
                height={600}
                unoptimized
              />
            </div>
            <div className="journal-featured-body">
              <div className="journal-meta">
                <span className="journal-tag">Company News</span>
                <span>October 18, 2023</span>
              </div>
              <h2 className="journal-featured-title">
                Growing into one of the country&apos;s most trusted real estate companies
              </h2>
              <p>
                Since its inception four decades ago, Marajo Group has grown into one of the country&apos;s reliable
                real estate developers, focused on quality across commercial, residential, hospitality, and storage
                properties.
              </p>
              <span className="journal-read-more">Read Full Story -&gt;</span>
            </div>
          </a>
        </div>
      </section>

      <section className="section journal-people-section">
        <div className="container">
          <div className="section-title">
            <span>Leadership</span>
            <h2>Key People</h2>
          </div>
          <div className="journal-people-grid">
            {KEY_PEOPLE.map(([name, role, image]) => (
              <article className="journal-person-card" key={name}>
                <div className="journal-person-img">
                  <Image src={image} alt={`${name}, ${role}`} width={520} height={390} unoptimized />
                </div>
                <div className="journal-person-body">
                  <h3>{name}</h3>
                  <p>{role}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="section-title journal-board-title">
            <span>Governance</span>
            <h2>Board of Directors</h2>
          </div>
          <div className="journal-people-grid">
            {BOARD_DIRECTORS.map(([name, role, image]) => (
              <article className="journal-person-card" key={name}>
                <div className="journal-person-img">
                  <Image src={image} alt={`${name}, ${role}`} width={520} height={390} unoptimized />
                </div>
                <div className="journal-person-body">
                  <h3>{name}</h3>
                  <p>{role}</p>
                </div>
              </article>
            ))}
          </div>

          <p className="journal-source-note">
            Journal content is based on Marajo Group&apos;s published journal and current portfolio of{" "}
            {featuredPropertyCount} properties.
          </p>
        </div>
      </section>
    </main>
  );
}

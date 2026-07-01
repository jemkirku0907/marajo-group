"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

interface GalleryItem {
  year: number;
  name: string;
  category: "residential" | "commercial" | "hospitality" | "storage";
  image: string;
  description: string;
}

const GALLERY_DATA: GalleryItem[] = [
  { year: 1978, name: "Aguirre", category: "residential", image: "https://www.marajogroup.com/wp-content/uploads/2023/12/aquirre.jpg", description: "Unit 6 State Condominium II at 117 Aguirre Street in Legaspi Village became the first acquisition where succeeding structures until 1998 were conceptualized, designed, and finalized." },
  { year: 1981, name: "La Mirada", category: "residential", image: "https://www.marajogroup.com/wp-content/uploads/2023/12/1981-LA-MIRADA.jpg", description: "La Mirada was constructed when the term condominium was not yet widely present in public consciousness, marking an early move into urban residential development." },
  { year: 1992, name: "Gabriel", category: "residential", image: "https://www.marajogroup.com/wp-content/uploads/2023/12/1992-GABRIEL.jpg", description: "A high-rise condominium complex was built in what was then an unpopulated Ortigas area in Pasig City, ahead of the district's continued growth." },
  { year: 1996, name: "Salcedo Towers", category: "commercial", image: "https://www.marajogroup.com/wp-content/uploads/2024/01/Salcedo-Towers.jpg", description: "Salcedo Towers, a modern 27-storey office building, rose in the very heart of the Makati Central Business District." },
  { year: 1996, name: "Neptune Orient Lines Building", category: "commercial", image: "https://www.marajogroup.com/wp-content/uploads/2023/12/1996-NOL-TOWER.jpg", description: "Situated at the gateway of the hardly occupied Madrigal Park Business Center." },
  { year: 1998, name: "Libran House", category: "commercial", image: "https://www.marajogroup.com/wp-content/uploads/2023/12/1998-LIBRAN-HOUSE.jpg", description: "An eight-storey office building was developed at 144 Legaspi Street corner V.A. Rufino Street in Legaspi Village, Makati City." },
  { year: 1998, name: "CEO Suites", category: "hospitality", image: "https://www.marajogroup.com/wp-content/uploads/2023/12/ceo-suites-fulll.jpg", description: "A 26-room boutique hotel located in Bel-Air Village." },
  { year: 2008, name: "Marajo Tower", category: "commercial", image: "https://www.marajogroup.com/wp-content/uploads/2023/12/marajo-tower-full.jpg", description: "A 23-storey PEZA-accredited office building was developed in Bonifacio Global City, Taguig." },
  { year: 2010, name: "CEO Flats", category: "hospitality", image: "https://www.marajogroup.com/wp-content/uploads/2023/12/ceo-flats-full.jpg", description: "A 55-unit serviced apartment opened in Bel-Air Village, expanding the company's hospitality and serviced-living portfolio." },
  { year: 2012, name: "HQ Alfonso", category: "residential", image: "https://www.marajogroup.com/wp-content/uploads/2023/12/alfonso-cover.jpg", description: "A 5-storey residential condominium building in Makati." },
  { year: 2012, name: "HQ Albert", category: "residential", image: "https://www.marajogroup.com/wp-content/uploads/2023/12/hq-albert-full.jpg", description: "A 5-storey residential condominium building in Makati." },
  { year: 2012, name: "HQ Palma", category: "residential", image: "https://www.marajogroup.com/wp-content/uploads/2023/12/hq-palma.jpg", description: "A 5-storey residential condominium building in Makati." },
  { year: 2014, name: "HQ Burgos", category: "residential", image: "https://www.marajogroup.com/wp-content/uploads/2023/09/HQ-Burgos.jpg", description: "An 11-storey residential condominium building in Makati." },
  { year: 2015, name: "MRJ Corporate Center", category: "commercial", image: "https://www.marajogroup.com/wp-content/uploads/2023/09/MRJ-Center.jpg", description: "A premium commercial and office building located in the fast developing vicinity of Makati Poblacion." },
  { year: 2017, name: "Space Solutions", category: "storage", image: "https://www.marajogroup.com/wp-content/uploads/2023/09/Space-solution-7.jpg", description: "A first-class modern storage facility opened in Makati, extending Marajo Group's reach into storage properties." },
  { year: 2003, name: "Urdaneta Village", category: "residential", image: "https://www.marajogroup.com/wp-content/uploads/2024/01/Urdaneta-Village.jpg", description: "A residential development offering modern living spaces in a strategic location." },
  { year: 2005, name: "United Coconut Planters Bank Executive Dining", category: "commercial", image: "https://www.marajogroup.com/wp-content/uploads/2024/01/United-Coconut-Planters-Bank-Executive-Dining.jpg", description: "An executive dining facility designed for premium corporate hospitality." },
  { year: 2006, name: "The Ritz", category: "hospitality", image: "https://www.marajogroup.com/wp-content/uploads/2024/01/The-Ritz.jpg", description: "A luxury hospitality space offering premium amenities and services." },
  { year: 2007, name: "The Hong Kong and Shanghai Banking Corporation", category: "commercial", image: "https://www.marajogroup.com/wp-content/uploads/2024/01/The-Hong-Kong-and-Shanghai-Banking-Corporation.jpg", description: "A modern commercial office space built to international banking standards." },
  { year: 2009, name: "The Alexandria", category: "residential", image: "https://www.marajogroup.com/wp-content/uploads/2024/01/The-Alexandria.jpg", description: "An elegant residential development with sophisticated design and finishes." },
  { year: 2011, name: "Sun Hung Kai", category: "commercial", image: "https://www.marajogroup.com/wp-content/uploads/2024/01/Sun-Hung-Kai.jpg", description: "A premium commercial property with strategic business location." },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "hospitality", label: "Hospitality" },
  { key: "storage", label: "Storage" },
] as const;

export default function GalleryPage() {
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<GalleryItem | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? GALLERY_DATA : GALLERY_DATA.filter((i) => i.category === filter)),
    [filter]
  );

  return (
    <main>
      <section className="hero about-hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-label">Project Gallery</span>
            <h1 className="hero-title">Our Full Gallery</h1>
            <p className="hero-copy">
              Explore Marajo Group&apos;s complete portfolio of landmark developments spanning decades of premium
              real estate across Metro Manila and beyond.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <span>All Developments</span>
            <h2>Premium properties across residential, commercial, hospitality, and storage categories.</h2>
          </div>

          <div className="gallery-filter-bar">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`filter-btn${filter === f.key ? " active" : ""}`}
                onClick={() => setFilter(f.key)}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="card-grid gallery-card-grid">
            {filtered.map((item) => (
              <button
                key={item.name}
                className="gallery-card"
                aria-label={`View details for ${item.name}`}
                onClick={() => setActive(item)}
                type="button"
              >
                <span className="gallery-card-image-wrap">
                  <Image src={item.image} alt={item.name} width={500} height={360} unoptimized />
                </span>
                <div className="gallery-card-body">
                  <div className="gallery-card-meta">
                    <span className="year-badge">{item.year}</span>
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.description.substring(0, 80)}...</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {active && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setActive(null)}>
          <div className="modal" role="document" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" aria-label="Close modal" onClick={() => setActive(null)}>
              &times;
            </button>
            <Image src={active.image} alt={active.name} width={900} height={600} className="modal-image" unoptimized />
            <h3>{active.name}</h3>
            <div className="modal-meta">
              <span>{active.year}</span>
              <span className="badge">{active.category.charAt(0).toUpperCase() + active.category.slice(1)}</span>
            </div>
            <div className="modal-body">{active.description}</div>
          </div>
        </div>
      )}
    </main>
  );
}

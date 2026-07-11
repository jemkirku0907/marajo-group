export type SearchEntry = {
  title: string;
  url: string;
  category: "Pages" | "Properties" | "Services";
  excerpt: string;
  keywords: string;
};

export const SEARCH_INDEX: SearchEntry[] = [
  { title: "Home", url: "/", category: "Pages", excerpt: "Marajo Group delivers premium real estate developments across Makati, BGC, and select Philippine growth districts.", keywords: "home main page marajo group real estate company overview" },
  { title: "About Us", url: "/about", category: "Pages", excerpt: "Marajo Group's story, mission, milestones, values, employee retreat facility, and CSR program.", keywords: "about company history mission values csr milestones story" },
  { title: "Properties", url: "/properties", category: "Pages", excerpt: "Browse all Marajo Group properties with filters, search, and premium project cards.", keywords: "properties listing all projects developments filter browse" },
  { title: "Gallery", url: "/gallery", category: "Pages", excerpt: "Complete portfolio of premium developments across residential, commercial, hospitality, and storage properties.", keywords: "gallery photos portfolio images projects" },
  { title: "News", url: "/news", category: "Pages", excerpt: "Latest news, company updates, and market insights from Marajo Group.", keywords: "news updates announcements articles press" },
  { title: "Contact Us", url: "/contact", category: "Pages", excerpt: "Contact Marajo Group for inquiries, site visits, brochure downloads, and property consultations.", keywords: "contact inquiry message email phone location address get in touch" },
  { title: "Parking Reservations", url: "/parking", category: "Services", excerpt: "Reserve Marajo Tower parking, check live availability, select vehicle details, and manage parking fees.", keywords: "parking reserve slot vehicle car booking marajo tower fees availability" },
  { title: "Workforce Booking", url: "/workforce", category: "Services", excerpt: "Book verified temporary building staff at Marajo Tower. Browse available workers by role and shift date.", keywords: "workforce staff workers booking hire labor manpower shift role" },
  { title: "Facilities", url: "/facilities", category: "Services", excerpt: "Reserve the Marajo Tower multi-purpose court by the hour. Check availability and get instant confirmation.", keywords: "court booking facilities sports gym reservation multi-purpose hourly" },
  { title: "Cafeteria", url: "/cafeteria", category: "Services", excerpt: "Preview the Marajo cafeteria and access the coming Enstack ordering entry point.", keywords: "cafeteria food meals dining canteen order enstack marajo tower" },
  { title: "Marajo Tower", url: "/properties/marajo-tower", category: "Properties", excerpt: "Premium residential development in BGC with luxury amenities and investment appeal.", keywords: "marajo tower bgc residential office condo property" },
  { title: "CEO Flats", url: "/properties/ceo-flats", category: "Properties", excerpt: "Luxury residential suites in Makati with premium amenities and strategic city access.", keywords: "ceo flats makati luxury residential suites serviced" },
  { title: "Salcedo Towers", url: "/properties/salcedo-towers", category: "Properties", excerpt: "Mixed-use development in Makati offering residential suites and office spaces.", keywords: "salcedo towers makati mixed-use office residential" },
  { title: "MRJ Center", url: "/properties/mrj-center", category: "Properties", excerpt: "Premium office destination in Makati Poblacion designed for modern business operations.", keywords: "mrj center makati poblacion office commercial business" },
  { title: "Hightown Quarters Burgos", url: "/properties/hightown-quarters-burgos", category: "Properties", excerpt: "An 11-storey residential condominium building in Poblacion, Makati City.", keywords: "hightown quarters burgos makati poblacion residential condominium" },
  { title: "Muro Siargao", url: "/properties/muro-siargao", category: "Properties", excerpt: "Coastal retreat offering boutique residences and resort-style amenities in Siargao Island.", keywords: "muro siargao coastal resort residences island beach" },
];

function scoreEntry(entry: SearchEntry, query: string): number {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return 0;
  const title = entry.title.toLowerCase();
  const category = (entry.category || "").toLowerCase();
  const keywords = (entry.keywords || "").toLowerCase();
  const excerpt = (entry.excerpt || "").toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (title === term) score += 12;
    else if (title.startsWith(term)) score += 8;
    else if (title.includes(term)) score += 6;
    if (keywords.includes(term)) score += 3;
    if (category.includes(term)) score += 2;
    if (excerpt.includes(term)) score += 1;
  }
  return score;
}

export function runSearch(query: string): SearchEntry[] {
  if (!query) return [];
  return SEARCH_INDEX.map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.entry);
}

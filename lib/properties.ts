export interface PropertySpec {
  label: string;
  value: string;
}

export interface Property {
  slug: string;
  name: string;
  category: "residential" | "commercial" | "office" | "mixed" | "hospitality";
  categoryLabel: string;
  location: string;
  image: string;
  cardDescription: string;
  /** Whether this property has a full dedicated detail page. */
  hasDetailPage: boolean;
  hero?: {
    label: string;
    title: string;
    copy: string;
  };
  overview?: {
    eyebrow: string;
    heading: string;
    paragraph: string;
    image: string;
    specs: PropertySpec[];
  };
}

export const properties: Property[] = [
  {
    slug: "marajo-tower",
    name: "Marajo Tower",
    category: "office",
    categoryLabel: "Office",
    location: "BGC, Taguig",
    image: "/assets/marajo-tower.jpg",
    cardDescription:
      "Contemporary office destination designed for agile teams, premium operations, and business growth.",
    hasDetailPage: true,
    hero: {
      label: "Premium Residence",
      title: "Marajo Tower — luxury living reimagined in Bonifacio Global City.",
      copy: "Premium residences with curated amenities, refined finishes, and city-edge access for executives, families, and investors.",
    },
    overview: {
      eyebrow: "Marajo Tower",
      heading: "Exceptional residential living with premium amenities and thoughtful planning.",
      paragraph:
        "Marajo Tower offers a refined collection of studio, one-bedroom, and two-bedroom suites with expansive city views, generous amenity spaces, and elevated finishes throughout.",
      image: "/assets/marajo-tower.jpg",
      specs: [
        { label: "Floors", value: "30 storeys" },
        { label: "Units", value: "220 premium residences" },
        { label: "Parking", value: "Dedicated basement parking with visitor bays" },
        { label: "Amenities", value: "Infinity pool, gym, sky lounge, and concierge services" },
      ],
    },
  },
  {
    slug: "salcedo-towers",
    name: "Salcedo Towers",
    category: "mixed",
    categoryLabel: "Mixed-Use",
    location: "Salcedo Village",
    image: "/assets/SALCEDO-TOWERS.jpg",
    cardDescription:
      "Elevated mixed-use development with residential suites and office spaces in a prime Makati address.",
    hasDetailPage: true,
    hero: {
      label: "Mixed-Use Living",
      title: "Salcedo Towers — Makati's premier address for living and corporate operations.",
      copy: "A mixed-use development with residential suites, office spaces, and premium community amenities in the heart of Makati.",
    },
    overview: {
      eyebrow: "Salcedo Towers",
      heading: "Designed for executives, professionals, and modern families seeking a central premium base.",
      paragraph:
        "Salcedo Towers provides a distinctive mixed-use environment with residential units, office-ready floors, amenity terraces, and immediate access to Makati's business and lifestyle districts.",
      image: "/assets/SALCEDO-TOWERS.jpg",
      specs: [
        { label: "Location", value: "Salcedo Village, Makati" },
        { label: "Type", value: "Mixed-use residential and office" },
        { label: "Amenities", value: "Garden terraces, lounge spaces, concierge, and secure access" },
        { label: "Parking", value: "Covered parking with visitor support" },
      ],
    },
  },
  {
    slug: "mrj-center",
    name: "MRJ Center",
    category: "office",
    categoryLabel: "Office",
    location: "Makati City",
    image: "/assets/mrj.jpg",
    cardDescription:
      "Luxury residential tower delivering elegant units, premium amenities, and a modern city lifestyle.",
    hasDetailPage: true,
    hero: {
      label: "Office Excellence",
      title: "MRJ Center — refined office spaces for premium teams in Makati.",
      copy: "A contemporary office destination designed for agile teams, executive operations, and flexible corporate environments.",
    },
    overview: {
      eyebrow: "MRJ Center",
      heading: "Premium office spaces with modern design, efficient operations, and elevated workplace experience.",
      paragraph:
        "MRJ Center offers a distinctive corporate environment with boutique office floors, premium lobby and reception areas, and strategic Makati access for teams and clients.",
      image: "/assets/mrj.jpg",
      specs: [
        { label: "Type", value: "Premium Office Development" },
        { label: "Location", value: "Makati City" },
        { label: "Space", value: "Flexible floor plates for teams of all sizes" },
        { label: "Design", value: "Contemporary workplace styling with premium finishes" },
      ],
    },
  },
  {
    slug: "ceo-flats",
    name: "CEO Flats",
    category: "residential",
    categoryLabel: "Residential",
    location: "Makati City",
    image: "/assets/ceoflats.jpg",
    cardDescription: "Executive residences offering privacy, premium interiors, and refined urban living.",
    hasDetailPage: true,
    hero: {
      label: "Executive Homes",
      title: "CEO Flats — executive residential suites crafted for discerning city living.",
      copy: "Luxury apartment residences with generous layouts, premium finishes, and elevated building services.",
    },
    overview: {
      eyebrow: "CEO Flats",
      heading: "Designed for executive comfort, premium finishes, and an elevated residential lifestyle with reliable service.",
      paragraph:
        "CEO Flats blends refined residential spaces with business-friendly amenities and a location that keeps you connected to the city's best neighborhoods.",
      image: "/assets/ceoflats.jpg",
      specs: [
        { label: "Type", value: "Luxury residential suites" },
        { label: "Floor Plans", value: "1–3 bedroom layouts with expansive living areas" },
        { label: "Amenities", value: "Rooftop lounge, fitness spaces, concierge, and private arrivals" },
        { label: "Privacy", value: "Security-first design with dedicated circulation and smart access." },
      ],
    },
  },
  {
    slug: "hightown-quarters-burgos",
    name: "Hightown Quarters Burgos",
    category: "residential",
    categoryLabel: "Residential",
    location: "Burgos, Makati",
    image: "/assets/HQ-Burgos.jpg",
    cardDescription:
      "Residential quarters designed for convenient city living near Makati's dining, work, and lifestyle destinations. The Burgos address offers practical layouts for professionals and long-stay residents.",
    hasDetailPage: true,
    hero: {
      label: "Residential · Makati City",
      title: "Hightown Quarters Burgos — city living at the heart of Poblacion.",
      copy: "An 11-storey residential condominium building designed for professionals and long-stay residents seeking efficient studio living in one of Makati's most active neighborhoods.",
    },
    overview: {
      eyebrow: "Hightown Quarters Burgos",
      heading: "Compact, flexible residences in a walkable Poblacion address.",
      paragraph:
        "Hightown Quarters Burgos is an 11-storey residential condominium building at 5093 P. Burgos corner San Agustin Streets, Poblacion, Makati City 1210. The property combines efficient studio layouts, loft options, and secure parking access for modern city living.",
      image: "/assets/HQ-Burgos.jpg",
      specs: [
        { label: "Land Area", value: "492 square meters" },
        { label: "Gross Floor Area", value: "5,128.38 square meters" },
        { label: "Total Units", value: "82 residential units" },
        { label: "Parking", value: "30 dedicated slots" },
        { label: "Studio Type", value: "65 units on the 6th–10th floors" },
        { label: "Studio with Loft", value: "10 units on the 5th floor and 7 biggest units on the 11th floor" },
      ],
    },
  },
  {
    slug: "muro-siargao",
    name: "Muro Siargao",
    category: "hospitality",
    categoryLabel: "Hospitality",
    location: "Siargao Island",
    image: "/assets/marajo-tower.jpg",
    cardDescription:
      "A refined coastal destination offering island-inspired homes, boutique hospitality, and exceptional natural surroundings.",
    hasDetailPage: true,
    hero: {
      label: "Coastal Retreat",
      title: "Muro Siargao — boutique island residences with resort-style living.",
      copy: "A refined coastal destination offering island-inspired homes, boutique hospitality, and exceptional natural surroundings.",
    },
    overview: {
      eyebrow: "Muro Siargao",
      heading: "Luxury residences curated to the island lifestyle with premium community spaces and coastal comforts.",
      paragraph:
        "Muro Siargao is a boutique coastal development designed for retreat living with modern comforts, landscape-rich courtyards, and direct access to the island's celebrated coast.",
      image: "/assets/marajo-tower.jpg",
      specs: [
        { label: "Location", value: "Siargao Island" },
        { label: "Type", value: "Boutique residential resort" },
        { label: "Units", value: "Limited luxury suites and beach-inspired residences" },
        { label: "Experience", value: "Relaxed coastal living with resort-style amenities" },
      ],
    },
  },
  {
    slug: "marajo-town-center",
    name: "Marajo Town Center",
    category: "mixed",
    categoryLabel: "Retail Destination",
    location: "Manila",
    image: "/assets/marajo-tower.jpg",
    cardDescription:
      "A luxury retail and community destination anchored by premium brands, high-quality food and beverage, and experiential hospitality.",
    hasDetailPage: true,
    hero: {
      label: "Retail Destination",
      title: "Marajo Town Center — the new benchmark for lifestyle retail and mixed-use gathering spaces.",
      copy: "A luxury retail and community destination anchored by premium brands, high-quality food and beverage, and experiential hospitality.",
    },
    overview: {
      eyebrow: "Marajo Town Center",
      heading: "Mixed-use retail destination designed for premium brands, curated dining, and dynamic community programming.",
      paragraph:
        "Marajo Town Center combines retail, dining, and lifestyle experiences in a cohesive environment anchored by elegant architecture and event-ready spaces.",
      image: "/assets/marajo-tower.jpg",
      specs: [
        { label: "Offerings", value: "Retail showrooms, restaurants, cultural spaces, and event venues" },
        { label: "Experience", value: "Curated brand environment with premium guest services" },
        { label: "Community", value: "Events, exhibitions, and lifestyle activations" },
        { label: "Design", value: "Timeless, contemporary finishes with generous public areas" },
      ],
    },
  },
  {
    slug: "hightown-quarters-palma",
    name: "Hightown Quarters Palma",
    category: "residential",
    categoryLabel: "Residential",
    location: "Palma, Makati",
    image: "/assets/HQ-Palma.jpg",
    cardDescription:
      "A compact residential address shaped around comfort, accessibility, and everyday city routines. Hightown Quarters Palma supports modern tenants seeking a well-connected Makati base.",
    hasDetailPage: false,
  },
  {
    slug: "space-solutions",
    name: "Space Solutions",
    category: "commercial",
    categoryLabel: "Commercial",
    location: "Makati City",
    image: "/assets/Space-Solution-A.jpg",
    cardDescription:
      "Flexible storage and business space in Makati for teams that need practical, secure, and accessible facilities. The development supports commercial operations with adaptable space planning.",
    hasDetailPage: false,
  },
  {
    slug: "hightown-quarters-alfonso",
    name: "Hightown Quarters Alfonso",
    category: "residential",
    categoryLabel: "Residential",
    location: "Alfonso, Makati",
    image: "/assets/HQ-Alfonso.jpg",
    cardDescription:
      "A residential property in the Hightown Quarters collection, positioned for residents who value Makati access and efficient city living. Alfonso adds another neighborhood option within the portfolio.",
    hasDetailPage: false,
  },
  {
    slug: "hightown-quarters-albert",
    name: "Hightown Quarters Albert",
    category: "residential",
    categoryLabel: "Residential",
    location: "Albert, Makati",
    image: "/assets/HQ-Albert.jpg",
    cardDescription:
      "Part of Marajo Group's Makati residential portfolio, Hightown Quarters Albert offers a straightforward urban address for long-stay renters and city professionals.",
    hasDetailPage: false,
  },
];

export function getProperty(slug: string): Property | undefined {
  return properties.find((p) => p.slug === slug);
}

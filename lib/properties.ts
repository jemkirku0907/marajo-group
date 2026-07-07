export interface PropertySpec {
  label: string;
  value: string;
}

export interface PropertyInfoCard {
  title: string;
  text: string;
  action: string;
  ariaLabel?: string;
  icon?: "home" | "wave" | "chart" | "pin";
  image?: string;
  specs?: PropertySpec[];
}

export type FacilityType = "meeting-room" | "overnight-stay" | "storage" | "court";

export interface PropertyBookableFacility {
  type: FacilityType;
  label: string;
  description: string;
  rateLabel: string;
  image: string;
}

export interface Property {
  slug: string;
  name: string;
  category: "residential" | "commercial" | "office" | "mixed" | "hospitality";
  categoryLabel: string;
  location: string;
  image: string;
  heroImages?: string[];
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
  facilities?: PropertyInfoCard[];
  bookableFacilities?: PropertyBookableFacility[];
  infoCards?: PropertyInfoCard[];
}

export const properties: Property[] = [
  {
    slug: "marajo-tower",
    name: "Marajo Tower",
    category: "office",
    categoryLabel: "Office",
    location: "BGC, Taguig",
    image: "/assets/marajo-tower.jpg",
    // Interior carousel photos are not yet available in the project bundle; using the verified property image as fallback.
    heroImages: ["/assets/marajo-tower.jpg"],
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
    facilities: [
      {
        title: "Meeting Rooms",
        text: "Professional rooms for tenant meetings, client briefings, and focused business sessions.",
        action: "meeting-rooms",
        ariaLabel: "Meeting Rooms - Marajo Tower facilities",
        icon: "home",
      },
      {
        title: "Conference Rooms",
        text: "Larger corporate rooms suited for presentations, planning sessions, and team gatherings.",
        action: "conference-rooms",
        ariaLabel: "Conference Rooms - Marajo Tower facilities",
        icon: "chart",
      },
      {
        title: "Business Lounge",
        text: "Shared tenant lounge areas that support informal work, waiting guests, and quick coordination.",
        action: "business-lounge",
        ariaLabel: "Business Lounge - Marajo Tower facilities",
        icon: "wave",
      },
      {
        title: "PEZA Office Support",
        text: "Office-oriented building services, secure access, parking support, and BGC connectivity.",
        action: "peza-office-support",
        ariaLabel: "PEZA Office Support - Marajo Tower facilities",
        icon: "pin",
      },
    ],
    bookableFacilities: [
      {
        type: "meeting-room",
        label: "Meeting Room",
        description: "Professional meeting space for tenant briefings, client sessions, and team planning.",
        rateLabel: "PHP 1,500 / hour",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&h=600&fit=crop&auto=format",
      },
      {
        type: "court",
        label: "Multi-Purpose Court",
        description: "Hourly court reservation at Marajo Tower with instant availability checking.",
        rateLabel: "PHP 1,000 / hour",
        image: "/assets/marajo-tower.jpg",
      },
    ],
  },
  {
    slug: "salcedo-towers",
    name: "Salcedo Towers",
    category: "mixed",
    categoryLabel: "Mixed-Use",
    location: "Salcedo Village",
    image: "/assets/SALCEDO-TOWERS.jpg",
    // Interior carousel photos are not yet available in the project bundle; using the verified property image as fallback.
    heroImages: ["/assets/SALCEDO-TOWERS.jpg"],
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
    facilities: [
      {
        title: "Residential Suites",
        text: "Private residential layouts for professionals and families who want a central Makati address.",
        action: "residential-suites",
        ariaLabel: "Residential Suites - Salcedo Towers facilities",
        icon: "home",
      },
      {
        title: "Office Spaces",
        text: "Office-ready spaces for teams that need a business address within a mixed-use environment.",
        action: "office-spaces",
        ariaLabel: "Office Spaces - Salcedo Towers facilities",
        icon: "chart",
      },
      {
        title: "Garden Terraces",
        text: "Shared terraces and lounge pockets that soften the urban setting for residents and tenants.",
        action: "garden-terraces",
        ariaLabel: "Garden Terraces - Salcedo Towers facilities",
        icon: "wave",
      },
      {
        title: "Secure Access",
        text: "Managed building access, concierge support, and covered parking for daily convenience.",
        action: "secure-access",
        ariaLabel: "Secure Access - Salcedo Towers facilities",
        icon: "pin",
      },
    ],
    bookableFacilities: [
      {
        type: "overnight-stay",
        label: "Residential Suite",
        description: "Overnight stay request for Salcedo Towers residential suites in Makati.",
        rateLabel: "Rate on request",
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=600&fit=crop&auto=format",
      },
    ],
  },
  {
    slug: "mrj-center",
    name: "MRJ Center",
    category: "office",
    categoryLabel: "Office",
    location: "Makati City",
    image: "/assets/mrj.jpg",
    // Interior carousel photos are not yet available in the project bundle; using the verified property image as fallback.
    heroImages: ["/assets/mrj.jpg"],
    cardDescription:
      "Office and commercial building in Makati Poblacion designed for business operations, service teams, and client-facing work.",
    hasDetailPage: true,
    hero: {
      label: "Office / Commercial",
      title: "MRJ Center — refined office spaces for premium teams in Makati.",
      copy: "A commercial building designed for office operations, service businesses, and teams that need practical Makati access.",
    },
    overview: {
      eyebrow: "MRJ Center",
      heading: "Office and commercial spaces built for practical business use in Makati.",
      paragraph:
        "MRJ Center is an office/commercial building in the developing vicinity of Makati Poblacion. It supports business operations with accessible commercial spaces, efficient floor planning, and a location suited for teams, tenants, and client-facing services.",
      image: "/assets/mrj.jpg",
      specs: [
        { label: "Category", value: "Office / Commercial Building" },
        { label: "Location", value: "Makati Poblacion" },
        { label: "Use", value: "Office operations, commercial tenants, and client-facing services" },
        { label: "Features", value: "Accessible business address, efficient spaces, and professional building environment" },
      ],
    },
    facilities: [
      {
        title: "Office Floors",
        text: "Efficient office spaces for service teams, operations groups, and client-facing businesses.",
        action: "office-floors",
        ariaLabel: "Office Floors - MRJ Center facilities",
        icon: "home",
      },
      {
        title: "Commercial Units",
        text: "Flexible commercial areas that can support professional services and tenant operations.",
        action: "commercial-units",
        ariaLabel: "Commercial Units - MRJ Center facilities",
        icon: "chart",
      },
      {
        title: "Shared Building Services",
        text: "Practical support areas and building services for day-to-day business continuity.",
        action: "building-services",
        ariaLabel: "Shared Building Services - MRJ Center facilities",
        icon: "wave",
      },
      {
        title: "Makati Access",
        text: "A Poblacion location with practical access for employees, clients, and suppliers.",
        action: "makati-access",
        ariaLabel: "Makati Access - MRJ Center facilities",
        icon: "pin",
      },
    ],
  },
  {
    slug: "ceo-flats",
    name: "CEO Flats",
    category: "residential",
    categoryLabel: "Residential",
    location: "Makati City",
    image: "/assets/ceoflats.jpg",
    // Interior carousel photos are not yet available in the project bundle; using the verified property image as fallback.
    heroImages: ["/assets/ceoflats.jpg"],
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
    facilities: [
      {
        title: "Studio Units",
        text: "Efficient private residences for city professionals who need comfort and practical Makati access.",
        action: "studio-units",
        ariaLabel: "Studio Units - CEO Flats facilities",
        icon: "home",
      },
      {
        title: "One-Bedroom Suites",
        text: "Residential layouts with more living space for executives, couples, and long-stay residents.",
        action: "one-bedroom-suites",
        ariaLabel: "One-Bedroom Suites - CEO Flats facilities",
        icon: "wave",
      },
      {
        title: "Residential Amenities",
        text: "Resident-focused amenities such as lounge, fitness, concierge, and secure arrival areas.",
        action: "residential-amenities",
        ariaLabel: "Residential Amenities - CEO Flats facilities",
        icon: "chart",
      },
      {
        title: "Private Access",
        text: "Security-first circulation, managed entry, and residential privacy for everyday peace of mind.",
        action: "private-access",
        ariaLabel: "Private Access - CEO Flats facilities",
        icon: "pin",
      },
    ],
    bookableFacilities: [
      {
        type: "overnight-stay",
        label: "Executive Studio / Suite",
        description: "Overnight stay request for CEO Flats residential units and executive suites.",
        rateLabel: "Rate on request",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&h=600&fit=crop&auto=format",
      },
    ],
  },
  {
    slug: "hightown-quarters-burgos",
    name: "Hightown Quarters Burgos",
    category: "residential",
    categoryLabel: "Residential",
    location: "Burgos, Makati",
    image: "/assets/HQ-Burgos.jpg",
    // Interior carousel photos are not yet available in the project bundle; using the verified property image as fallback.
    heroImages: ["/assets/HQ-Burgos.jpg"],
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
    facilities: [
      {
        title: "Studio Units",
        text: "Sixty-five studio units across the 6th to 10th floors for efficient city living.",
        action: "studio-units",
        ariaLabel: "Studio Units - Hightown Quarters Burgos facilities",
        icon: "home",
      },
      {
        title: "Studio with Loft",
        text: "Loft-style units on selected floors for residents who need a more flexible layout.",
        action: "studio-lofts",
        ariaLabel: "Studio with Loft - Hightown Quarters Burgos facilities",
        icon: "wave",
      },
      {
        title: "Residential Parking",
        text: "Dedicated parking support for residents in a dense, walkable Makati neighborhood.",
        action: "residential-parking",
        ariaLabel: "Residential Parking - Hightown Quarters Burgos facilities",
        icon: "chart",
      },
      {
        title: "Poblacion Access",
        text: "A residential base near dining, work, and lifestyle destinations in Makati.",
        action: "poblacion-access",
        ariaLabel: "Poblacion Access - Hightown Quarters Burgos facilities",
        icon: "pin",
      },
    ],
    bookableFacilities: [
      {
        type: "overnight-stay",
        label: "Studio Unit",
        description: "Overnight stay request for Hightown Quarters Burgos studio and loft-style units.",
        rateLabel: "Rate on request",
        image: "https://images.unsplash.com/photo-1462558813106-4a58a3287273?w=900&h=600&fit=crop&auto=format",
      },
    ],
  },
  {
    slug: "muro-siargao",
    name: "Muro Siargao",
    category: "hospitality",
    categoryLabel: "Hospitality",
    location: "Siargao Island",
    // Real Muro Siargao asset is not in the current project bundle; keep this distinct remote image until supplied.
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=900&fit=crop&auto=format",
    // Interior carousel photos are not yet available in the project bundle; using the current property image as fallback.
    heroImages: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=900&fit=crop&auto=format"],
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
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=900&fit=crop&auto=format",
      specs: [
        { label: "Location", value: "Siargao Island" },
        { label: "Type", value: "Boutique residential resort" },
        { label: "Units", value: "Limited luxury suites and beach-inspired residences" },
        { label: "Experience", value: "Relaxed coastal living with resort-style amenities" },
      ],
    },
    facilities: [
      {
        title: "Island Residences",
        text: "Beach-inspired residences and suites designed around relaxed coastal routines.",
        action: "island-residences",
        ariaLabel: "Island Residences - Muro Siargao facilities",
        icon: "home",
      },
      {
        title: "Boutique Hospitality",
        text: "Hospitality-oriented guest spaces shaped for stays, retreats, and island comfort.",
        action: "boutique-hospitality",
        ariaLabel: "Boutique Hospitality - Muro Siargao facilities",
        icon: "wave",
      },
      {
        title: "Outdoor Courtyards",
        text: "Landscape-rich community spaces that connect the development to the island setting.",
        action: "outdoor-courtyards",
        ariaLabel: "Outdoor Courtyards - Muro Siargao facilities",
        icon: "chart",
      },
      {
        title: "Coastal Access",
        text: "A Siargao location built around natural surroundings, leisure, and retreat living.",
        action: "coastal-access",
        ariaLabel: "Coastal Access - Muro Siargao facilities",
        icon: "pin",
      },
    ],
    bookableFacilities: [
      {
        type: "overnight-stay",
        label: "Island Suite",
        description: "Overnight stay request for Muro Siargao boutique hospitality suites.",
        rateLabel: "Rate on request",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=600&fit=crop&auto=format",
      },
    ],
  },
  {
    slug: "hightown-quarters-palma",
    name: "Hightown Quarters Palma",
    category: "residential",
    categoryLabel: "Residential",
    location: "Palma, Makati",
    image: "/assets/HQ-Palma.jpg",
    // Interior carousel photos are not yet available in the project bundle; using the verified property image as fallback.
    heroImages: ["/assets/HQ-Palma.jpg"],
    cardDescription:
      "A compact residential address shaped around comfort, accessibility, and everyday city routines. Hightown Quarters Palma supports modern tenants seeking a well-connected Makati base.",
    hasDetailPage: false,
    hero: {
      label: "Residential · Makati City",
      title: "Hightown Quarters Palma — compact residences for connected Makati living.",
      copy: "A compact residential address shaped around comfort, accessibility, and everyday city routines.",
    },
    overview: {
      eyebrow: "Hightown Quarters Palma",
      heading: "Practical city residences in a well-connected Makati location.",
      paragraph:
        "Hightown Quarters Palma is part of Marajo Group's Makati residential portfolio, offering efficient layouts and convenient access for long-stay residents and city professionals.",
      image: "/assets/HQ-Palma.jpg",
      specs: [
        { label: "Type", value: "Residential condominium" },
        { label: "Height", value: "5 storeys" },
        { label: "Location", value: "Palma, Makati" },
        { label: "Portfolio", value: "Hightown Quarters collection" },
      ],
    },
    facilities: [
      {
        title: "Compact Residences",
        text: "Efficient residential units for long-stay renters and city professionals.",
        action: "compact-residences",
        ariaLabel: "Compact Residences - Hightown Quarters Palma facilities",
        icon: "home",
      },
      {
        title: "Resident Support",
        text: "Practical resident services and secure access for everyday city routines.",
        action: "resident-support",
        ariaLabel: "Resident Support - Hightown Quarters Palma facilities",
        icon: "wave",
      },
      {
        title: "Neighborhood Access",
        text: "A Makati address connected to work, dining, and daily essentials.",
        action: "neighborhood-access",
        ariaLabel: "Neighborhood Access - Hightown Quarters Palma facilities",
        icon: "pin",
      },
      {
        title: "Hightown Living",
        text: "Part of the Hightown Quarters collection focused on practical residential convenience.",
        action: "hightown-living",
        ariaLabel: "Hightown Living - Hightown Quarters Palma facilities",
        icon: "chart",
      },
    ],
    bookableFacilities: [
      {
        type: "overnight-stay",
        label: "Compact Residence",
        description: "Overnight stay request for Hightown Quarters Palma residential units.",
        rateLabel: "Rate on request",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&h=600&fit=crop&auto=format",
      },
    ],
  },
  {
    slug: "space-solutions",
    name: "Space Solutions",
    category: "commercial",
    categoryLabel: "Commercial",
    location: "Makati City",
    image: "/assets/Space-Solution-A.jpg",
    // Interior carousel photos are not yet available in the project bundle; using the verified property image as fallback.
    heroImages: ["/assets/Space-Solution-A.jpg"],
    cardDescription:
      "Flexible storage and business space in Makati for teams that need practical, secure, and accessible facilities. The development supports commercial operations with adaptable space planning.",
    hasDetailPage: false,
    hero: {
      label: "Commercial Storage",
      title: "Space Solutions — first-class modern storage and business support facilities.",
      copy: "Flexible storage and business space in Makati for teams that need practical, secure, and accessible facilities.",
    },
    overview: {
      eyebrow: "Space Solutions",
      heading: "Modern storage facilities designed for practical commercial operations.",
      paragraph:
        "Space Solutions is a first-class modern storage facility in Makati, extending Marajo Group's portfolio into secure, adaptable space for commercial and operational needs.",
      image: "/assets/Space-Solution-A.jpg",
      specs: [
        { label: "Type", value: "Modern storage facility" },
        { label: "Location", value: "Makati City" },
        { label: "Use", value: "Commercial storage and business support" },
        { label: "Access", value: "Secure, practical, and adaptable spaces" },
      ],
    },
    facilities: [
      {
        title: "Storage Units",
        text: "Secure storage spaces for businesses that need flexible and practical capacity.",
        action: "storage-units",
        ariaLabel: "Storage Units - Space Solutions facilities",
        icon: "home",
      },
      {
        title: "Business Support Space",
        text: "Adaptable spaces for commercial operations, inventory handling, and support work.",
        action: "business-support-space",
        ariaLabel: "Business Support Space - Space Solutions facilities",
        icon: "chart",
      },
      {
        title: "Secure Access",
        text: "Controlled access and practical building systems for operational reliability.",
        action: "secure-access",
        ariaLabel: "Secure Access - Space Solutions facilities",
        icon: "pin",
      },
      {
        title: "Flexible Planning",
        text: "Space planning suited to changing storage and commercial support needs.",
        action: "flexible-planning",
        ariaLabel: "Flexible Planning - Space Solutions facilities",
        icon: "wave",
      },
    ],
    bookableFacilities: [
      {
        type: "storage",
        label: "Storage Unit",
        description: "Storage reservation request for secure commercial storage space.",
        rateLabel: "Rate on request",
        image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=900&h=600&fit=crop&auto=format",
      },
    ],
  },
  {
    slug: "hightown-quarters-alfonso",
    name: "Hightown Quarters Alfonso",
    category: "residential",
    categoryLabel: "Residential",
    location: "Alfonso, Makati",
    image: "/assets/HQ-Alfonso.jpg",
    // Interior carousel photos are not yet available in the project bundle; using the verified property image as fallback.
    heroImages: ["/assets/HQ-Alfonso.jpg"],
    cardDescription:
      "A residential property in the Hightown Quarters collection, positioned for residents who value Makati access and efficient city living. Alfonso adds another neighborhood option within the portfolio.",
    hasDetailPage: false,
    hero: {
      label: "Residential · Makati City",
      title: "Hightown Quarters Alfonso — efficient city living within the Hightown portfolio.",
      copy: "A residential property for residents who value Makati access and straightforward urban convenience.",
    },
    overview: {
      eyebrow: "Hightown Quarters Alfonso",
      heading: "Neighborhood residential access with efficient layouts and practical Makati connectivity.",
      paragraph:
        "Hightown Quarters Alfonso adds another Makati option within Marajo Group's Hightown Quarters collection, shaped around access, comfort, and everyday city routines.",
      image: "/assets/HQ-Alfonso.jpg",
      specs: [
        { label: "Type", value: "Residential condominium" },
        { label: "Height", value: "5 storeys" },
        { label: "Location", value: "Alfonso, Makati" },
        { label: "Portfolio", value: "Hightown Quarters collection" },
      ],
    },
    facilities: [
      {
        title: "Residential Units",
        text: "Efficient city residences for Makati renters and long-stay professionals.",
        action: "residential-units",
        ariaLabel: "Residential Units - Hightown Quarters Alfonso facilities",
        icon: "home",
      },
      {
        title: "Resident Essentials",
        text: "Practical building support for secure, straightforward daily living.",
        action: "resident-essentials",
        ariaLabel: "Resident Essentials - Hightown Quarters Alfonso facilities",
        icon: "wave",
      },
      {
        title: "Makati Connectivity",
        text: "Neighborhood access for work, errands, and regular city routines.",
        action: "makati-connectivity",
        ariaLabel: "Makati Connectivity - Hightown Quarters Alfonso facilities",
        icon: "pin",
      },
      {
        title: "Hightown Portfolio",
        text: "A residential option within the Hightown Quarters collection.",
        action: "hightown-portfolio",
        ariaLabel: "Hightown Portfolio - Hightown Quarters Alfonso facilities",
        icon: "chart",
      },
    ],
    bookableFacilities: [
      {
        type: "overnight-stay",
        label: "Residential Unit",
        description: "Overnight stay request for Hightown Quarters Alfonso residential units.",
        rateLabel: "Rate on request",
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=600&fit=crop&auto=format",
      },
    ],
  },
  {
    slug: "hightown-quarters-albert",
    name: "Hightown Quarters Albert",
    category: "residential",
    categoryLabel: "Residential",
    location: "Albert, Makati",
    image: "/assets/HQ-Albert.jpg",
    // Interior carousel photos are not yet available in the project bundle; using the verified property image as fallback.
    heroImages: ["/assets/HQ-Albert.jpg"],
    cardDescription:
      "Part of Marajo Group's Makati residential portfolio, Hightown Quarters Albert offers a straightforward urban address for long-stay renters and city professionals.",
    hasDetailPage: false,
    hero: {
      label: "Residential · Makati City",
      title: "Hightown Quarters Albert — a straightforward Makati address for city professionals.",
      copy: "Part of Marajo Group's Makati residential portfolio, built for long-stay renters and professionals.",
    },
    overview: {
      eyebrow: "Hightown Quarters Albert",
      heading: "Reliable urban residences for long-stay city routines.",
      paragraph:
        "Hightown Quarters Albert offers a practical residential address within the Marajo Group portfolio, supporting city professionals who need access, comfort, and dependable everyday space.",
      image: "/assets/HQ-Albert.jpg",
      specs: [
        { label: "Type", value: "Residential condominium" },
        { label: "Height", value: "5 storeys" },
        { label: "Location", value: "Albert, Makati" },
        { label: "Portfolio", value: "Hightown Quarters collection" },
      ],
    },
    facilities: [
      {
        title: "Residential Units",
        text: "Practical residences built for long-stay renters and city professionals.",
        action: "residential-units",
        ariaLabel: "Residential Units - Hightown Quarters Albert facilities",
        icon: "home",
      },
      {
        title: "Secure Entry",
        text: "Managed access and everyday building support for dependable city living.",
        action: "secure-entry",
        ariaLabel: "Secure Entry - Hightown Quarters Albert facilities",
        icon: "pin",
      },
      {
        title: "Urban Convenience",
        text: "A straightforward Makati address close to work, services, and daily needs.",
        action: "urban-convenience",
        ariaLabel: "Urban Convenience - Hightown Quarters Albert facilities",
        icon: "wave",
      },
      {
        title: "Hightown Living",
        text: "Part of Marajo Group's Hightown Quarters residential portfolio.",
        action: "hightown-living",
        ariaLabel: "Hightown Living - Hightown Quarters Albert facilities",
        icon: "chart",
      },
    ],
    bookableFacilities: [
      {
        type: "overnight-stay",
        label: "Residential Unit",
        description: "Overnight stay request for Hightown Quarters Albert residential units.",
        rateLabel: "Rate on request",
        image: "https://images.unsplash.com/photo-1494526585095-e8aeecc6e179?w=900&h=600&fit=crop&auto=format",
      },
    ],
  },
];

export function getProperty(slug: string): Property | undefined {
  return properties.find((p) => p.slug === slug);
}

export function getPropertyFacility(propertySlug: string, facilitySlug: string): PropertyInfoCard | undefined {
  const property = getProperty(propertySlug);
  return property?.facilities?.find((facility) => facility.action === facilitySlug);
}

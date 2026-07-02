import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.marajogroup.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/marajo-tower.html", destination: "/properties/marajo-tower", permanent: true },
      { source: "/marajo-tower", destination: "/properties/marajo-tower", permanent: true },
      { source: "/salcedo-towers.html", destination: "/properties/salcedo-towers", permanent: true },
      { source: "/salcedo-towers", destination: "/properties/salcedo-towers", permanent: true },
      { source: "/salcedo", destination: "/properties/salcedo-towers", permanent: true },
      { source: "/mrj-center.html", destination: "/properties/mrj-center", permanent: true },
      { source: "/mrj-center", destination: "/properties/mrj-center", permanent: true },
      { source: "/ceo-flats.html", destination: "/properties/ceo-flats", permanent: true },
      { source: "/ceo-flats", destination: "/properties/ceo-flats", permanent: true },
      { source: "/hightown-quarters-burgos.html", destination: "/properties/hightown-quarters-burgos", permanent: true },
      { source: "/hightown-quarters-burgos", destination: "/properties/hightown-quarters-burgos", permanent: true },
      { source: "/muro-siargao.html", destination: "/properties/muro-siargao", permanent: true },
      { source: "/muro-siargao", destination: "/properties/muro-siargao", permanent: true },
      { source: "/marajo-town-center.html", destination: "/properties/marajo-town-center", permanent: true },
      { source: "/marajo-town-center", destination: "/properties/marajo-town-center", permanent: true },
      { source: "/hightown-quarters-palma.html", destination: "/properties/hightown-quarters-palma", permanent: true },
      { source: "/hightown-quarters-palma", destination: "/properties/hightown-quarters-palma", permanent: true },
      { source: "/space-solutions.html", destination: "/properties/space-solutions", permanent: true },
      { source: "/space-solutions", destination: "/properties/space-solutions", permanent: true },
      { source: "/hightown-quarters-alfonso", destination: "/properties/hightown-quarters-alfonso", permanent: true },
      { source: "/hightown-quarters-albert", destination: "/properties/hightown-quarters-albert", permanent: true },
      { source: "/parking.html", destination: "/parking", permanent: true },
      { source: "/workforce.html", destination: "/workforce", permanent: true },
      { source: "/facilities.html", destination: "/facilities", permanent: true },
      { source: "/court.html", destination: "/facilities", permanent: true },
      { source: "/court", destination: "/facilities", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
      { source: "/news.html", destination: "/news", permanent: true },
      { source: "/gallery.html", destination: "/gallery", permanent: true },
      { source: "/search.html", destination: "/search", permanent: true },
    ];
  },
};

export default nextConfig;

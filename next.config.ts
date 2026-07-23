import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com https://www.google.com https://maps.google.com",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.marajogroup.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/marajo-tower.html", destination: "/properties/marajo-tower", permanent: true },
      { source: "/salcedo-towers.html", destination: "/properties/salcedo-towers", permanent: true },
      { source: "/mrj-center.html", destination: "/properties/mrj-center", permanent: true },
      { source: "/mrj-center", destination: "/properties/mrj-center", permanent: true },
      { source: "/ceo-flats.html", destination: "/properties/ceo-flats", permanent: true },
      { source: "/hightown-quarters-burgos.html", destination: "/properties/hightown-quarters-burgos", permanent: true },
      { source: "/muro-siargao.html", destination: "/properties/muro-siargao", permanent: true },
      { source: "/muro-siargao", destination: "/properties/muro-siargao", permanent: true },
      { source: "/marajo-town-center.html", destination: "/properties/marajo-town-center", permanent: true },
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

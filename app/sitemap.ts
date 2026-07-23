import type { MetadataRoute } from "next";
import { properties } from "@/lib/properties";

const SITE_URL = "https://marajogroup.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/properties`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/news`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/gallery`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/parking`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/workforce`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/cafeteria`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];

  const propertyPages: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${SITE_URL}/properties/${property.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...propertyPages];
}

import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/cadastro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://botvaultpro.com";
  const now = new Date();

  const staticPages = [
    { url: base, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${base}/pricing`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${base}/demo`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${base}/demo/sitebuilder`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/demo/clausecheck`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/demo/emailcoach`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/demo/invoiceforge`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/demo/weeklypulse`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/tools/free-contract-review`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/tools/ai-email-writer`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/tools/ai-invoice-generator`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/tools/weekly-business-report`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/blog`, priority: 0.7, changeFrequency: "weekly" as const },
    { url: `${base}/blog/best-ai-tools-for-small-business`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/blog/how-to-get-clients-as-a-freelancer`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/tools/ai-website-builder`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/blog/how-to-write-an-invoice`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/blog/how-to-review-a-contract`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/blog/ai-email-reply-tips`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/affiliate`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/launch`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${base}/privacy`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${base}/terms`, priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return staticPages.map(({ url, priority, changeFrequency }) => ({
    url,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}

import type { MetadataRoute } from "next";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = "https://kavachos.com";

	// Static pages
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
	];

	// Doc pages from fumadocs source
	const docPages: MetadataRoute.Sitemap = source
		.getPages()
		.map((page) => ({
			url: `${baseUrl}${page.url}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		}));

	return [...staticPages, ...docPages];
}

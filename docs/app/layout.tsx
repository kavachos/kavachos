import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Nav } from "@/components/nav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-heading",
	display: "swap",
	weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-body",
	display: "swap",
	weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "KavachOS | The Auth OS",
		template: "%s | KavachOS",
	},
	description:
		"Identity for humans and AI agents. Scoped permissions, delegation chains, and audit trails for every agent.",
	metadataBase: new URL("https://kavachos.com"),
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
			{ url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
			{ url: "/icon-192.png", type: "image/png", sizes: "192x192" },
			{ url: "/icon-512.png", type: "image/png", sizes: "512x512" },
		],
		apple: [{ url: "/apple-touch-icon-180.png", sizes: "180x180" }],
	},
	manifest: "/site.webmanifest",
	openGraph: {
		title: "KavachOS | The Auth OS",
		description:
			"Identity for humans and AI agents. Scoped permissions, delegation chains, and audit trails for every agent.",
		url: "https://kavachos.com",
		siteName: "KavachOS",
		type: "website",
		images: [{ url: "/og-logo.png" }],
	},
	twitter: {
		card: "summary_large_image",
		title: "KavachOS | The Auth OS",
		description:
			"Identity for humans and AI agents. Scoped permissions, delegation chains, and audit trails for every agent.",
		images: ["/og-logo.png"],
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: "KavachOS",
	description:
		"Open-source TypeScript auth SDK for AI agents. Identity, permissions, delegation, and audit.",
	url: "https://kavachos.com",
	applicationCategory: "DeveloperApplication",
	operatingSystem: "Any",
	offers: {
		"@type": "Offer",
		price: "0",
		priceCurrency: "USD",
	},
	author: {
		"@type": "Organization",
		name: "KavachOS",
		url: "https://kavachos.com",
	},
	license: "https://opensource.org/licenses/MIT",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={`${spaceGrotesk.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
			suppressHydrationWarning
		>
			<body className="flex min-h-screen flex-col font-body antialiased">
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				<RootProvider>
					<Nav />
					{children}
				</RootProvider>
			</body>
		</html>
	);
}

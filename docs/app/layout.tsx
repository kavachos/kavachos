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
	openGraph: {
		title: "KavachOS | The Auth OS",
		description:
			"Identity for humans and AI agents. Scoped permissions, delegation chains, and audit trails for every agent.",
		url: "https://kavachos.com",
		siteName: "KavachOS",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "KavachOS | The Auth OS",
		description:
			"Identity for humans and AI agents. Scoped permissions, delegation chains, and audit trails for every agent.",
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={`${spaceGrotesk.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
			suppressHydrationWarning
		>
			<body className="flex min-h-screen flex-col font-body antialiased">
				<RootProvider>
					<Nav />
					{children}
				</RootProvider>
			</body>
		</html>
	);
}

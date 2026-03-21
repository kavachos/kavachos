import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "KavachOS — The Auth OS",
		template: "%s — KavachOS",
	},
	description:
		"Auth for humans and AI agents. Identity, permissions, delegation, and audit for the agentic era.",
	metadataBase: new URL("https://kavachos.com"),
	openGraph: {
		title: "KavachOS — The Auth OS",
		description:
			"Auth for humans and AI agents. Identity, permissions, delegation, and audit for the agentic era.",
		url: "https://kavachos.com",
		siteName: "KavachOS",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "KavachOS — The Auth OS",
		description:
			"Auth for humans and AI agents. Identity, permissions, delegation, and audit for the agentic era.",
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${jetbrainsMono.variable}`}
			suppressHydrationWarning
		>
			<body className="flex min-h-screen flex-col font-sans antialiased">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}

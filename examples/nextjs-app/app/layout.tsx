import type { ReactNode } from "react";

export const metadata = {
	title: "KavachOS Dashboard",
	description: "KavachOS admin dashboard embedded in Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}

import type { ReactNode } from "react";
import { NavSpacer } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function ProductsLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<NavSpacer />
			<main className="flex-1">{children}</main>
			<Footer />
		</>
	);
}

import { loader } from "fumadocs-core/source";
import { docs } from "@/.source/server";
import {
	AlertTriangle,
	BookOpen,
	Bot,
	ChevronRight,
	Code,
	Database,
	FileText,
	Globe,
	Key,
	LayoutDashboard,
	Link2,
	Rocket,
	ScrollText,
	Settings,
	Shield,
	ShieldCheck,
} from "lucide-react";
import { createElement } from "react";
import {
	AstroIcon,
	ExpressIcon,
	FastifyIcon,
	HonoIcon,
	NextjsIcon,
	NuxtIcon,
	SvelteKitIcon,
} from "@/components/icons/frameworks";

const iconSize = { className: "size-4 shrink-0 opacity-70" };

export const source = loader({
	baseUrl: "/docs",
	source: docs.toFumadocsSource(),
	icon(icon) {
		const icons: Record<string, React.ReactNode> = {
			AlertTriangle: createElement(AlertTriangle, iconSize),
			BookOpen: createElement(BookOpen, iconSize),
			Bot: createElement(Bot, iconSize),
			ChevronRight: createElement(ChevronRight, iconSize),
			Code: createElement(Code, iconSize),
			Database: createElement(Database, iconSize),
			FileText: createElement(FileText, iconSize),
			Globe: createElement(Globe, iconSize),
			Key: createElement(Key, iconSize),
			LayoutDashboard: createElement(LayoutDashboard, iconSize),
			Link2: createElement(Link2, iconSize),
			Rocket: createElement(Rocket, iconSize),
			ScrollText: createElement(ScrollText, iconSize),
			Settings: createElement(Settings, iconSize),
			Shield: createElement(Shield, iconSize),
			ShieldCheck: createElement(ShieldCheck, iconSize),
			Hono: createElement(HonoIcon, iconSize),
			Express: createElement(ExpressIcon, iconSize),
			Nextjs: createElement(NextjsIcon, iconSize),
			Fastify: createElement(FastifyIcon, iconSize),
			Nuxt: createElement(NuxtIcon, iconSize),
			SvelteKit: createElement(SvelteKitIcon, iconSize),
			Astro: createElement(AstroIcon, iconSize),
		};
		if (icon && icon in icons) return icons[icon];
		return undefined;
	},
});

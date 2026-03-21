import { loader } from "fumadocs-core/source";
import { docs } from "@/.source/server";
import {
	BookOpen,
	Bot,
	ChevronRight,
	Code,
	FileText,
	Globe,
	Key,
	LayoutDashboard,
	Link2,
	Rocket,
	ScrollText,
	Shield,
	ShieldCheck,
} from "lucide-react";
import { createElement } from "react";

const iconSize = { className: "size-4 shrink-0 opacity-70" };

export const source = loader({
	baseUrl: "/docs",
	source: docs.toFumadocsSource(),
	icon(icon) {
		const icons: Record<string, React.ReactNode> = {
			BookOpen: createElement(BookOpen, iconSize),
			Bot: createElement(Bot, iconSize),
			ChevronRight: createElement(ChevronRight, iconSize),
			Code: createElement(Code, iconSize),
			FileText: createElement(FileText, iconSize),
			Globe: createElement(Globe, iconSize),
			Key: createElement(Key, iconSize),
			LayoutDashboard: createElement(LayoutDashboard, iconSize),
			Link2: createElement(Link2, iconSize),
			Rocket: createElement(Rocket, iconSize),
			ScrollText: createElement(ScrollText, iconSize),
			Shield: createElement(Shield, iconSize),
			ShieldCheck: createElement(ShieldCheck, iconSize),
		};
		if (icon && icon in icons) return icons[icon];
		return undefined;
	},
});

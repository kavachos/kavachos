import { loader } from "fumadocs-core/source";
import { docs } from "@/.source/server";
import {
	Activity,
	AlertTriangle,
	BarChart,
	BookOpen,
	Bot,
	Building,
	ChevronRight,
	Code,
	Database,
	DollarSign,
	FileText,
	Fingerprint,
	Globe,
	Key,
	LayoutDashboard,
	Link2,
	Rocket,
	ScanSearch,
	ScrollText,
	Search,
	Settings,
	Shield,
	ShieldCheck,
	UserCheck,
	Webhook,
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
import {
	GoogleIcon,
	GitHubIcon,
	AppleIcon,
	DiscordIcon,
	MicrosoftIcon,
	SlackIcon,
	GitLabIcon,
	LinkedInIcon,
	MailIcon,
	LinkIcon,
	HashIcon,
	FingerprintIcon,
} from "@/components/icons/social";

const iconSize = { className: "size-4 shrink-0 opacity-70" };

export const source = loader({
	baseUrl: "/docs",
	source: docs.toFumadocsSource(),
	icon(icon) {
		const icons: Record<string, React.ReactNode> = {
			// Lucide
			Activity: createElement(Activity, iconSize),
			AlertTriangle: createElement(AlertTriangle, iconSize),
			BarChart: createElement(BarChart, iconSize),
			BookOpen: createElement(BookOpen, iconSize),
			Bot: createElement(Bot, iconSize),
			Building: createElement(Building, iconSize),
			ChevronRight: createElement(ChevronRight, iconSize),
			Code: createElement(Code, iconSize),
			Database: createElement(Database, iconSize),
			DollarSign: createElement(DollarSign, iconSize),
			FileText: createElement(FileText, iconSize),
			Fingerprint: createElement(Fingerprint, iconSize),
			Globe: createElement(Globe, iconSize),
			Key: createElement(Key, iconSize),
			LayoutDashboard: createElement(LayoutDashboard, iconSize),
			Link2: createElement(Link2, iconSize),
			Rocket: createElement(Rocket, iconSize),
			ScanSearch: createElement(ScanSearch, iconSize),
			ScrollText: createElement(ScrollText, iconSize),
			Search: createElement(Search, iconSize),
			Settings: createElement(Settings, iconSize),
			Shield: createElement(Shield, iconSize),
			ShieldCheck: createElement(ShieldCheck, iconSize),
			UserCheck: createElement(UserCheck, iconSize),
			Webhook: createElement(Webhook, iconSize),
			// Framework icons
			Hono: createElement(HonoIcon, iconSize),
			Express: createElement(ExpressIcon, iconSize),
			Nextjs: createElement(NextjsIcon, iconSize),
			Fastify: createElement(FastifyIcon, iconSize),
			Nuxt: createElement(NuxtIcon, iconSize),
			SvelteKit: createElement(SvelteKitIcon, iconSize),
			Astro: createElement(AstroIcon, iconSize),
			// Social / provider icons
			Google: createElement(GoogleIcon, iconSize),
			GitHub: createElement(GitHubIcon, iconSize),
			Apple: createElement(AppleIcon, iconSize),
			Discord: createElement(DiscordIcon, iconSize),
			Microsoft: createElement(MicrosoftIcon, iconSize),
			Slack: createElement(SlackIcon, iconSize),
			GitLab: createElement(GitLabIcon, iconSize),
			LinkedIn: createElement(LinkedInIcon, iconSize),
			Mail: createElement(MailIcon, iconSize),
			Link: createElement(LinkIcon, iconSize),
			Hash: createElement(HashIcon, iconSize),
			FingerprintIcon: createElement(FingerprintIcon, iconSize),
		};
		if (icon && icon in icons) return icons[icon];
		return undefined;
	},
});

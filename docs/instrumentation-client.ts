import posthog from "posthog-js";

// Opt out: run `localStorage.setItem('ph_optout', '1')` in browser console
const optedOut = typeof window !== "undefined" && localStorage.getItem("ph_optout") === "1";

if (!optedOut && process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
		api_host: "/ingest",
		ui_host: "https://us.posthog.com",
		person_profiles: "identified_only",
		capture_pageview: true,
		capture_pageleave: true,
		capture_exceptions: true,
		autocapture: true,
	});
}

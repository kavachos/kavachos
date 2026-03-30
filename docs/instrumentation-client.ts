import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
	api_host: "/ingest",
	ui_host: "https://us.posthog.com",
	person_profiles: "identified_only",
	capture_pageview: true,
	capture_pageleave: true,
	capture_exceptions: true,
	autocapture: true,
});

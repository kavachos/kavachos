import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
	api_host: "/ingest",
	ui_host: "https://us.posthog.com",
	capture_exceptions: true,
	debug: process.env.NODE_ENV === "development",
});

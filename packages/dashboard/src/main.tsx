import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { KavachDashboard } from "./dashboard.js";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
	<StrictMode>
		<KavachDashboard
			apiUrl={import.meta.env.VITE_KAVACHOS_API_URL ?? "http://localhost:3000"}
			theme="dark"
		/>
	</StrictMode>,
);

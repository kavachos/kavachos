"use client";
import { KavachDashboard } from "@kavachos/dashboard";

export default function AdminPage() {
	return <KavachDashboard apiUrl="/api/kavach" theme="dark" />;
}

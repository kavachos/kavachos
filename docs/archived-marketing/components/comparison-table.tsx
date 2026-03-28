import { Check, Minus, X } from "lucide-react";

const features = [
	{
		name: "Agent-first data model",
		kavach: true,
		betterAuth: false,
		rollYourOwn: "depends",
	},
	{
		name: "Wildcard permission matching",
		kavach: true,
		betterAuth: false,
		rollYourOwn: "depends",
	},
	{
		name: "Delegation chains with depth limits",
		kavach: true,
		betterAuth: false,
		rollYourOwn: false,
	},
	{
		name: "MCP OAuth 2.1 compliant",
		kavach: true,
		betterAuth: false,
		rollYourOwn: false,
	},
	{
		name: "Immutable audit log",
		kavach: true,
		betterAuth: "partial",
		rollYourOwn: false,
	},
	{
		name: "Token rotation",
		kavach: true,
		betterAuth: false,
		rollYourOwn: false,
	},
	{
		name: "Framework-agnostic core",
		kavach: true,
		betterAuth: true,
		rollYourOwn: true,
	},
] as const;

type CellValue = boolean | "depends" | "partial";

function Cell({ value }: { value: CellValue }) {
	if (value === true) {
		return (
			<span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
				<Check className="h-4 w-4" />
				<span className="text-xs">Yes</span>
			</span>
		);
	}
	if (value === false) {
		return (
			<span className="inline-flex items-center gap-1 text-fd-muted-foreground/50">
				<X className="h-4 w-4" />
				<span className="text-xs">No</span>
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-1 text-amber-500">
			<Minus className="h-4 w-4" />
			<span className="text-xs capitalize">{value}</span>
		</span>
	);
}

export function ComparisonTable() {
	return (
		<div className="overflow-x-auto rounded-lg border border-fd-border">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-fd-border bg-fd-secondary/50">
						<th className="px-4 py-3 text-left font-medium text-fd-muted-foreground">Feature</th>
						<th className="px-4 py-3 text-center font-semibold gradient-gold-text">KavachOS</th>
						<th className="px-4 py-3 text-center font-medium text-fd-muted-foreground">
							better-auth
						</th>
						<th className="px-4 py-3 text-center font-medium text-fd-muted-foreground">
							Roll your own
						</th>
					</tr>
				</thead>
				<tbody>
					{features.map((f) => (
						<tr key={f.name} className="border-b border-fd-border last:border-b-0">
							<td className="px-4 py-3 font-medium">{f.name}</td>
							<td className="px-4 py-3 text-center">
								<Cell value={f.kavach} />
							</td>
							<td className="px-4 py-3 text-center">
								<Cell value={f.betterAuth} />
							</td>
							<td className="px-4 py-3 text-center">
								<Cell value={f.rollYourOwn} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

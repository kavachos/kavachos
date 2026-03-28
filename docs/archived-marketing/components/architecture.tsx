export function Architecture() {
	return (
		<div className="overflow-hidden rounded-lg border border-fd-border bg-fd-card">
			{/* Header */}
			<div className="border-b border-fd-border px-6 py-3">
				<span className="font-mono text-[10px] font-medium text-fd-muted-foreground/50">
					architecture.txt
				</span>
			</div>

			{/* Diagram */}
			<div className="p-6 sm:p-8">
				<pre className="font-mono text-xs leading-loose text-fd-muted-foreground sm:text-sm">
					<span className="text-fd-foreground">Traditional auth</span>
					{"\n"}
					{"  "}Human <Arrow /> App{"\n"}
					{"\n"}
					<span className="text-[var(--kavach-gold-primary)] font-medium">
						KavachOS
					</span>
					{"\n"}
					{"  "}Human <Arrow /> App{"\n"}
					{"  "}Human <Arrow /> Agent <Arrow />{" "}
					<Highlight>Tools</Highlight>{" "}
					<Dim>(scoped, audited, revocable)</Dim>
					{"\n"}
					{"  "}Agent <Arrow /> Agent{" "}
					<Dim>(delegation chains)</Dim>
					{"\n"}
					{"  "}Agent <Arrow />{" "}
					<Highlight>MCP Server</Highlight>{" "}
					<Dim>(OAuth 2.1, rate limits)</Dim>
				</pre>
			</div>
		</div>
	);
}

function Arrow() {
	return (
		<span className="text-fd-muted-foreground/30 mx-1">
			→
		</span>
	);
}

function Highlight({ children }: { children: React.ReactNode }) {
	return (
		<span className="text-[var(--kavach-gold-primary)] font-medium">
			{children}
		</span>
	);
}

function Dim({ children }: { children: React.ReactNode }) {
	return <span className="text-fd-muted-foreground/40">{children}</span>;
}

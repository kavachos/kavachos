export function CodePreview() {
	return (
		<div className="overflow-hidden rounded-lg border border-fd-border bg-fd-card">
			{/* Tab bar */}
			<div className="flex items-center gap-0 border-b border-fd-border bg-fd-secondary/50 px-4">
				<span className="border-b-2 border-[var(--kavach-gold-mid)] px-3 py-2.5 text-xs font-medium text-fd-foreground">
					quickstart.ts
				</span>
			</div>
			{/* Code */}
			<pre className="overflow-x-auto p-4 text-sm leading-relaxed">
				<code className="font-mono">
					<Line n={1}>
						<Kw>import</Kw> {"{ createKavach }"} <Kw>from</Kw> <Str>&apos;@kavachos/core&apos;</Str>
						;
					</Line>
					<Line n={2} />
					<Line n={3}>
						<Kw>const</Kw> kavach = <Fn>createKavach</Fn>({"{"}
					</Line>
					<Line n={4}>
						{"  "}database: {"{ "}provider: <Str>&apos;sqlite&apos;</Str>, url:{" "}
						<Str>&apos;:memory:&apos;</Str>
						{" }"},
					</Line>
					<Line n={5}>
						{"  "}agents: {"{ "}enabled: <Kw>true</Kw>, auditAll: <Kw>true</Kw>
						{" }"},
					</Line>
					<Line n={6}>{"}"});</Line>
					<Line n={7} />
					<Line n={8}>
						<Cm>// Create an agent with scoped permissions</Cm>
					</Line>
					<Line n={9}>
						<Kw>const</Kw> agent = <Kw>await</Kw> kavach.agent.
						<Fn>create</Fn>({"{"}
					</Line>
					<Line n={10}>
						{"  "}ownerId: <Str>&apos;user-123&apos;</Str>,
					</Line>
					<Line n={11}>
						{"  "}name: <Str>&apos;github-reader&apos;</Str>,
					</Line>
					<Line n={12}>
						{"  "}permissions: [{"{ "}resource: <Str>&apos;mcp:github:*&apos;</Str>, actions: [
						<Str>&apos;read&apos;</Str>]{" }"}],
					</Line>
					<Line n={13}>{"}"});</Line>
					<Line n={14} />
					<Line n={15}>
						<Cm>// Authorize before any sensitive operation</Cm>
					</Line>
					<Line n={16}>
						<Kw>const</Kw> result = <Kw>await</Kw> kavach.
						<Fn>authorize</Fn>(agent.id, {"{"}
					</Line>
					<Line n={17}>
						{"  "}action: <Str>&apos;read&apos;</Str>, resource:{" "}
						<Str>&apos;mcp:github:repos&apos;</Str>,
					</Line>
					<Line n={18}>{"}"});</Line>
					<Line n={19} />
					<Line n={20}>
						result.allowed; <Cm>// true — audit log entry created</Cm>
					</Line>
				</code>
			</pre>
		</div>
	);
}

function Line({ n, children }: { n: number; children?: React.ReactNode }) {
	return (
		<div className="flex">
			<span className="mr-6 inline-block w-5 select-none text-right text-fd-muted-foreground/40 text-xs leading-relaxed">
				{n}
			</span>
			<span className="leading-relaxed">{children}</span>
		</div>
	);
}

function Kw({ children }: { children: React.ReactNode }) {
	return <span className="text-purple-400">{children}</span>;
}

function Str({ children }: { children: React.ReactNode }) {
	return <span className="text-emerald-400">{children}</span>;
}

function Fn({ children }: { children: React.ReactNode }) {
	return <span className="text-amber-300">{children}</span>;
}

function Cm({ children }: { children: React.ReactNode }) {
	return <span className="text-fd-muted-foreground/60 italic">{children}</span>;
}

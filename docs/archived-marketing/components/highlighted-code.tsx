import { createHighlighter } from "shiki";
import { CodeBlock } from "./code-block";

// Cache the highlighter so it's only created once during build
let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: ["github-dark-default", "github-light-default"],
			langs: ["typescript", "tsx", "bash", "json", "javascript"],
		});
	}
	return highlighterPromise;
}

interface HighlightedCodeProps {
	code: string;
	lang?: string;
	filename?: string;
	/** Line numbers to highlight (1-indexed), e.g. [3, 4, 5] */
	highlight?: number[];
}

export async function HighlightedCode({
	code,
	lang = "typescript",
	filename,
	highlight,
}: HighlightedCodeProps) {
	const highlighter = await getHighlighter();

	const html = highlighter.codeToHtml(code.trim(), {
		lang,
		themes: {
			dark: "github-dark-default",
			light: "github-light-default",
		},
		defaultColor: false,
		transformers: highlight?.length
			? [
					{
						line(node, line) {
							if (highlight.includes(line)) {
								this.addClassToHast(node, "highlighted");
							}
						},
					},
				]
			: undefined,
	});

	return <CodeBlock html={html} code={code.trim()} filename={filename} />;
}

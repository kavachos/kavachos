import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Callout } from "fumadocs-ui/components/callout";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { File, Folder, Files } from "fumadocs-ui/components/files";
import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { TypeTable } from "fumadocs-ui/components/type-table";
import { Card, Cards } from "fumadocs-ui/components/card";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import { TocActions } from "@/components/toc-actions";

const mdxComponents = {
	...defaultMdxComponents,
	Callout,
	Tab,
	Tabs,
	Step,
	Steps,
	File,
	Folder,
	Files,
	Accordion,
	Accordions,
	TypeTable,
	Card,
	Cards,
};

interface Props {
	params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: Props) {
	const { slug } = await params;
	const page = source.getPage(slug);
	if (!page) notFound();

	const MDX = page.data.body;
	const slugPath = slug ? slug.join("/") : "index";

	return (
		<DocsPage
			toc={page.data.toc}
			full={page.data.full}
			tableOfContent={{ style: "clerk" }}
		>
			<div className="flex items-center justify-between gap-4">
				<DocsTitle className="mb-0">{page.data.title}</DocsTitle>
				<div className="flex items-center gap-2 not-prose shrink-0">
					<TocActions slug={slugPath} />
				</div>
			</div>
			<DocsDescription>{page.data.description}</DocsDescription>
			<DocsBody>
				<MDX components={mdxComponents} />
			</DocsBody>
		</DocsPage>
	);
}

export async function generateStaticParams() {
	return source.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const page = source.getPage(slug);
	if (!page) notFound();

	return {
		title: `${page.data.title} | KavachOS`,
		description: page.data.description,
	};
}

import { argv, exit, stdout } from "node:process";
import { startDashboardServer } from "./dashboard-server.js";

const VERSION = "0.0.1";

const HELP = `
kavachos - The Auth OS for AI Agents

Usage:
  kavachos <command> [options]

Commands:
  init          Initialize KavachOS in your project
  migrate       Run database migrations
  dashboard     Launch the admin dashboard
  version       Show version

Options:
  --help, -h    Show this help message
  --version     Show version number

Examples:
  kavachos init
  kavachos migrate
  kavachos dashboard --port 3100

Documentation: https://kavachos.com/docs
`;

function printVersion(): void {
	stdout.write(`kavachos v${VERSION}\n`);
}

function printHelp(): void {
	stdout.write(HELP);
}

async function handleInit(): Promise<void> {
	stdout.write("\nKavachOS Project Setup\n");
	stdout.write("=====================\n\n");
	stdout.write("1. Install the core package:\n");
	stdout.write("   npm install kavachos\n\n");
	stdout.write("2. Add to your project:\n\n");
	stdout.write('   import { createKavach } from "kavachos";\n\n');
	stdout.write("   const kavach = createKavach({\n");
	stdout.write('     database: { provider: "sqlite", url: "kavach.db" },\n');
	stdout.write("     agents: { enabled: true },\n");
	stdout.write("   });\n\n");
	stdout.write("3. Run migrations:\n");
	stdout.write("   kavachos migrate\n\n");
	stdout.write("4. (Optional) Install an adapter:\n");
	stdout.write("   npm install @kavachos/hono    # for Hono\n");
	stdout.write("   npm install @kavachos/express  # for Express\n");
	stdout.write("   npm install @kavachos/nextjs   # for Next.js\n\n");
	stdout.write("Documentation: https://kavachos.com/docs\n\n");
}

async function handleMigrate(): Promise<void> {
	stdout.write("\nKavachOS Database Migration\n");
	stdout.write("==========================\n\n");
	stdout.write("Migration support coming in v0.1.0.\n");
	stdout.write("For now, tables are auto-created on first run.\n\n");
	stdout.write("See: https://kavachos.com/docs/quickstart\n\n");
}

async function handleDashboard(): Promise<void> {
	const args = argv.slice(2);

	// --port or --port=3100
	const portFlag = args.find((a) => a === "--port" || a.startsWith("--port="));
	const portStr = portFlag
		? portFlag.includes("=")
			? portFlag.split("=")[1]
			: args[args.indexOf(portFlag) + 1]
		: undefined;
	const port = portStr !== undefined && portStr !== "" ? Number(portStr) : 3100;

	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		stdout.write(`Invalid port: ${portStr ?? ""}\n`);
		exit(1);
		return;
	}

	// --api or --api=http://localhost:3000
	const apiFlag = args.find((a) => a === "--api" || a.startsWith("--api="));
	const apiUrl = apiFlag
		? apiFlag.includes("=")
			? (apiFlag.split("=")[1] ?? "http://localhost:3000")
			: (args[args.indexOf(apiFlag) + 1] ?? "http://localhost:3000")
		: "http://localhost:3000";

	await startDashboardServer({ port, apiUrl });
}

async function main(): Promise<void> {
	const args = argv.slice(2);
	const command = args[0];

	if (!command || command === "--help" || command === "-h") {
		printHelp();
		return;
	}

	if (command === "--version" || command === "version") {
		printVersion();
		return;
	}

	switch (command) {
		case "init":
			await handleInit();
			break;
		case "migrate":
			await handleMigrate();
			break;
		case "dashboard":
			await handleDashboard();
			break;
		default:
			stdout.write(`Unknown command: ${command}\n\n`);
			printHelp();
			exit(1);
	}
}

main().catch((err: unknown) => {
	stdout.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
	exit(1);
});

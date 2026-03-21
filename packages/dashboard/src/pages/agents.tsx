import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Check, Copy, MoreHorizontal, Plus, RotateCw, ShieldOff } from "lucide-react";
import { useState } from "react";
import type { KavachApiClient } from "../api/client.js";
import type { Agent, AgentType, CreateAgentInput } from "../api/types.js";
import { Badge, StatusDot } from "../components/badge.js";
import { Button } from "../components/button.js";
import { FormGroup, Input, Label, Select } from "../components/input.js";
import { PageHeader } from "../components/layout.js";
import { Modal } from "../components/modal.js";
import { EmptyState, Table, TableBody, TableHead, Td, Th, Tr } from "../components/table.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusVariant(status: Agent["status"]) {
	switch (status) {
		case "active":
			return "green" as const;
		case "revoked":
			return "red" as const;
		case "expired":
			return "gray" as const;
	}
}

function formatDate(iso: string | null) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatRelative(iso: string | null) {
	if (!iso) return "Never";
	const diff = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diff / 60_000);
	if (mins < 1) return "Just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

const AGENT_TYPES: AgentType[] = ["llm", "workflow", "tool", "human-in-loop", "system"];

// ─── Create Agent Modal ───────────────────────────────────────────────────────

interface CreateAgentModalProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (input: CreateAgentInput) => void;
	loading: boolean;
}

function CreateAgentModal({ open, onClose, onSubmit, loading }: CreateAgentModalProps) {
	const [name, setName] = useState("");
	const [type, setType] = useState<AgentType>("llm");
	const [resource, setResource] = useState("");
	const [actions, setActions] = useState<string[]>([]);
	const [nameError, setNameError] = useState("");

	const COMMON_ACTIONS = ["read", "write", "delete", "execute", "list"];

	function toggleAction(action: string) {
		setActions((prev) =>
			prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action],
		);
	}

	function handleSubmit() {
		if (!name.trim()) {
			setNameError("Name is required");
			return;
		}
		setNameError("");

		const permissions =
			resource.trim() && actions.length > 0 ? [{ resource: resource.trim(), actions }] : [];

		onSubmit({ name: name.trim(), type, permissions });
	}

	function handleClose() {
		setName("");
		setType("llm");
		setResource("");
		setActions([]);
		setNameError("");
		onClose();
	}

	return (
		<Modal
			open={open}
			onClose={handleClose}
			title="Create Agent"
			footer={
				<>
					<Button variant="ghost" onClick={handleClose}>
						Cancel
					</Button>
					<Button variant="primary" onClick={handleSubmit} loading={loading}>
						Create Agent
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<FormGroup>
					<Label htmlFor="agent-name" required>
						Name
					</Label>
					<Input
						id="agent-name"
						placeholder="e.g. data-pipeline-agent"
						value={name}
						onChange={(e) => setName(e.target.value)}
						error={nameError}
						autoFocus
					/>
				</FormGroup>

				<FormGroup>
					<Label htmlFor="agent-type" required>
						Type
					</Label>
					<Select
						id="agent-type"
						value={type}
						onChange={(e) => setType(e.target.value as AgentType)}
					>
						{AGENT_TYPES.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</Select>
				</FormGroup>

				<div className="border-t border-zinc-800 pt-4">
					<p className="text-xs font-medium text-zinc-400 mb-3">Initial Permission (optional)</p>

					<FormGroup>
						<Label htmlFor="resource">Resource Pattern</Label>
						<Input
							id="resource"
							placeholder="e.g. documents:* or api/v1/users"
							value={resource}
							onChange={(e) => setResource(e.target.value)}
						/>
					</FormGroup>

					<div className="mt-3">
						<Label>Actions</Label>
						<div className="flex flex-wrap gap-2 mt-1.5">
							{COMMON_ACTIONS.map((action) => (
								<button
									key={action}
									type="button"
									onClick={() => toggleAction(action)}
									className={[
										"px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
										actions.includes(action)
											? "bg-indigo-600 border-indigo-500 text-white"
											: "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200",
									].join(" ")}
								>
									{action}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}

// ─── Token Display Modal ──────────────────────────────────────────────────────

interface TokenModalProps {
	open: boolean;
	onClose: () => void;
	token: string;
	agentName: string;
}

function TokenModal({ open, onClose, token, agentName }: TokenModalProps) {
	const [copied, setCopied] = useState(false);

	function copyToken() {
		void navigator.clipboard.writeText(token).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Agent Token"
			footer={
				<Button variant="primary" onClick={onClose}>
					Done
				</Button>
			}
		>
			<div className="space-y-4">
				<div className="bg-amber-950/50 border border-amber-800/50 rounded-lg px-4 py-3">
					<p className="text-xs text-amber-400 font-medium">
						Save this token now. It will not be shown again.
					</p>
				</div>
				<div>
					<Label>Agent</Label>
					<p className="text-sm text-zinc-300">{agentName}</p>
				</div>
				<div>
					<Label>Token</Label>
					<div className="flex items-center gap-2 mt-1.5">
						<code className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 font-mono break-all">
							{token}
						</code>
						<button
							type="button"
							onClick={copyToken}
							className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
							aria-label="Copy token"
						>
							{copied ? (
								<Check className="w-3.5 h-3.5 text-emerald-400" />
							) : (
								<Copy className="w-3.5 h-3.5" />
							)}
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
}

// ─── Agent Row Actions ────────────────────────────────────────────────────────

interface AgentActionsProps {
	agent: Agent;
	onRevoke: (id: string) => void;
	onRotate: (id: string) => void;
	revoking: boolean;
	rotating: boolean;
}

function AgentActions({ agent, onRevoke, onRotate, revoking, rotating }: AgentActionsProps) {
	const [open, setOpen] = useState(false);

	if (agent.status !== "active") return null;

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
				aria-label="Agent actions"
			>
				<MoreHorizontal className="w-4 h-4" />
			</button>

			{open && (
				<>
					<div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
					<div className="absolute right-0 top-8 z-20 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl py-1 min-w-[140px]">
						<button
							type="button"
							onClick={() => {
								onRotate(agent.id);
								setOpen(false);
							}}
							disabled={rotating}
							className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50"
						>
							<RotateCw className="w-3.5 h-3.5" />
							Rotate Token
						</button>
						<div className="border-t border-zinc-800 my-1" />
						<button
							type="button"
							onClick={() => {
								onRevoke(agent.id);
								setOpen(false);
							}}
							disabled={revoking}
							className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors disabled:opacity-50"
						>
							<ShieldOff className="w-3.5 h-3.5" />
							Revoke Agent
						</button>
					</div>
				</>
			)}
		</div>
	);
}

// ─── Agents Page ──────────────────────────────────────────────────────────────

interface AgentsPageProps {
	client: KavachApiClient;
}

export function AgentsPage({ client }: AgentsPageProps) {
	const queryClient = useQueryClient();
	const [createOpen, setCreateOpen] = useState(false);
	const [tokenModal, setTokenModal] = useState<{
		open: boolean;
		token: string;
		agentName: string;
	}>({ open: false, token: "", agentName: "" });

	const { data: agentsResult, isLoading } = useQuery({
		queryKey: ["agents"],
		queryFn: () => client.getAgents(),
	});

	const createMutation = useMutation({
		mutationFn: (input: CreateAgentInput) => client.createAgent(input),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["agents"] });
				setCreateOpen(false);
				setTokenModal({
					open: true,
					token: result.data.token,
					agentName: result.data.agent.name,
				});
			}
		},
	});

	const revokeMutation = useMutation({
		mutationFn: (agentId: string) => client.revokeAgent(agentId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["agents"] });
		},
	});

	const rotateMutation = useMutation({
		mutationFn: (agentId: string) => client.rotateAgentToken(agentId),
		onSuccess: (result, agentId) => {
			if (result.success) {
				const agents = agentsResult?.success ? agentsResult.data : [];
				const agent = agents.find((a) => a.id === agentId);
				setTokenModal({
					open: true,
					token: result.data.token,
					agentName: agent?.name ?? "Agent",
				});
			}
		},
	});

	const agents = agentsResult?.success ? agentsResult.data : [];

	return (
		<div>
			<PageHeader
				title="Agents"
				description="Manage AI agent identities, tokens, and permissions."
				actions={
					<Button variant="primary" onClick={() => setCreateOpen(true)}>
						<Plus className="w-3.5 h-3.5" />
						New Agent
					</Button>
				}
			/>

			{isLoading ? (
				<div className="flex items-center justify-center py-16">
					<div className="w-5 h-5 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
				</div>
			) : agents.length === 0 ? (
				<Table>
					<TableHead>
						<Th>Agent</Th>
						<Th>Type</Th>
						<Th>Status</Th>
						<Th>Permissions</Th>
						<Th>Last Active</Th>
						<Th>Created</Th>
						<Th />
					</TableHead>
					<TableBody>
						<tr>
							<td colSpan={7}>
								<EmptyState
									icon={<Bot className="w-6 h-6" />}
									title="No agents yet"
									description="Create your first agent to get started with KavachOS."
									action={
										<Button variant="primary" onClick={() => setCreateOpen(true)}>
											<Plus className="w-3.5 h-3.5" />
											Create Agent
										</Button>
									}
								/>
							</td>
						</tr>
					</TableBody>
				</Table>
			) : (
				<Table>
					<TableHead>
						<Th>Agent</Th>
						<Th>Type</Th>
						<Th>Status</Th>
						<Th>Permissions</Th>
						<Th>Last Active</Th>
						<Th>Created</Th>
						<Th />
					</TableHead>
					<TableBody>
						{agents.map((agent) => (
							<Tr key={agent.id}>
								<Td>
									<div>
										<p className="text-sm font-medium text-white">{agent.name}</p>
										<p className="text-xs text-zinc-500 font-mono mt-0.5">
											{agent.id.slice(0, 12)}…
										</p>
									</div>
								</Td>
								<Td>
									<span className="text-xs font-mono text-zinc-400">{agent.type}</span>
								</Td>
								<Td>
									<Badge variant={statusVariant(agent.status)}>
										<StatusDot variant={statusVariant(agent.status)} />
										{agent.status}
									</Badge>
								</Td>
								<Td>
									<span className="text-zinc-300">{agent.permissionsCount}</span>
								</Td>
								<Td>
									<span className="text-zinc-400 text-xs">
										{formatRelative(agent.lastActiveAt)}
									</span>
								</Td>
								<Td>
									<span className="text-zinc-400 text-xs">{formatDate(agent.createdAt)}</span>
								</Td>
								<Td className="text-right">
									<AgentActions
										agent={agent}
										onRevoke={(id) => revokeMutation.mutate(id)}
										onRotate={(id) => rotateMutation.mutate(id)}
										revoking={revokeMutation.isPending}
										rotating={rotateMutation.isPending}
									/>
								</Td>
							</Tr>
						))}
					</TableBody>
				</Table>
			)}

			<CreateAgentModal
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				onSubmit={(input) => createMutation.mutate(input)}
				loading={createMutation.isPending}
			/>

			<TokenModal
				open={tokenModal.open}
				onClose={() => setTokenModal({ open: false, token: "", agentName: "" })}
				token={tokenModal.token}
				agentName={tokenModal.agentName}
			/>
		</div>
	);
}

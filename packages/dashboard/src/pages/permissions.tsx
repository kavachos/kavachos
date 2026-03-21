import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import type { KavachApiClient } from "../api/client.js";
import type { CreatePermissionTemplateInput, PermissionTemplate } from "../api/types.js";
import { Button } from "../components/button.js";
import { FormGroup, Input, Label, Textarea } from "../components/input.js";
import { PageHeader } from "../components/layout.js";
import { Modal } from "../components/modal.js";
import { EmptyState, Table, TableBody, TableHead, Td, Th, Tr } from "../components/table.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COMMON_ACTIONS = ["read", "write", "delete", "execute", "list", "create", "update"];

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

// ─── Template Editor Modal ────────────────────────────────────────────────────

interface TemplateFormState {
	name: string;
	description: string;
	resource: string;
	actions: string[];
	constraintsJson: string;
}

interface TemplateEditorProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (input: CreatePermissionTemplateInput) => void;
	loading: boolean;
	initial?: PermissionTemplate;
}

function TemplateEditor({ open, onClose, onSubmit, loading, initial }: TemplateEditorProps) {
	const [form, setForm] = useState<TemplateFormState>({
		name: initial?.name ?? "",
		description: initial?.description ?? "",
		resource: initial?.resource ?? "",
		actions: initial?.actions ?? [],
		constraintsJson: initial?.constraints ? JSON.stringify(initial.constraints, null, 2) : "",
	});
	const [errors, setErrors] = useState<Partial<Record<keyof TemplateFormState, string>>>({});

	function toggleAction(action: string) {
		setForm((prev) => ({
			...prev,
			actions: prev.actions.includes(action)
				? prev.actions.filter((a) => a !== action)
				: [...prev.actions, action],
		}));
	}

	function validate(): boolean {
		const newErrors: Partial<Record<keyof TemplateFormState, string>> = {};
		if (!form.name.trim()) newErrors.name = "Name is required";
		if (!form.resource.trim()) newErrors.resource = "Resource pattern is required";
		if (form.actions.length === 0) newErrors.actions = "At least one action required";
		if (form.constraintsJson.trim()) {
			try {
				JSON.parse(form.constraintsJson);
			} catch {
				newErrors.constraintsJson = "Invalid JSON";
			}
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}

	function handleSubmit() {
		if (!validate()) return;

		let constraints: Record<string, unknown> = {};
		if (form.constraintsJson.trim()) {
			try {
				constraints = JSON.parse(form.constraintsJson) as Record<string, unknown>;
			} catch {
				// already validated above
			}
		}

		onSubmit({
			name: form.name.trim(),
			description: form.description.trim() || undefined,
			resource: form.resource.trim(),
			actions: form.actions,
			constraints,
		});
	}

	function handleClose() {
		setForm({
			name: initial?.name ?? "",
			description: initial?.description ?? "",
			resource: initial?.resource ?? "",
			actions: initial?.actions ?? [],
			constraintsJson: initial?.constraints ? JSON.stringify(initial.constraints, null, 2) : "",
		});
		setErrors({});
		onClose();
	}

	return (
		<Modal
			open={open}
			onClose={handleClose}
			title={initial ? "Edit Template" : "New Permission Template"}
			footer={
				<>
					<Button variant="ghost" onClick={handleClose}>
						Cancel
					</Button>
					<Button variant="primary" onClick={handleSubmit} loading={loading}>
						{initial ? "Save Changes" : "Create Template"}
					</Button>
				</>
			}
		>
			<div className="space-y-4">
				<FormGroup>
					<Label htmlFor="tpl-name" required>
						Name
					</Label>
					<Input
						id="tpl-name"
						placeholder="e.g. read-only-documents"
						value={form.name}
						onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
						error={errors.name}
						autoFocus
					/>
				</FormGroup>

				<FormGroup>
					<Label htmlFor="tpl-description">Description</Label>
					<Input
						id="tpl-description"
						placeholder="Brief description of what this template grants"
						value={form.description}
						onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
					/>
				</FormGroup>

				<FormGroup>
					<Label htmlFor="tpl-resource" required>
						Resource Pattern
					</Label>
					<Input
						id="tpl-resource"
						placeholder="e.g. documents:*, api/v1/users/:id"
						value={form.resource}
						onChange={(e) => setForm((p) => ({ ...p, resource: e.target.value }))}
						error={errors.resource}
					/>
					<p className="text-[11px] text-zinc-500 mt-1">
						Use <code className="text-zinc-400">*</code> for wildcard matching
					</p>
				</FormGroup>

				<div>
					<Label required>Actions</Label>
					{errors.actions && <p className="text-xs text-red-400 mb-1.5">{errors.actions}</p>}
					<div className="flex flex-wrap gap-2 mt-1.5">
						{COMMON_ACTIONS.map((action) => (
							<button
								key={action}
								type="button"
								onClick={() => toggleAction(action)}
								className={[
									"px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
									form.actions.includes(action)
										? "bg-indigo-600 border-indigo-500 text-white"
										: "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200",
								].join(" ")}
							>
								{action}
							</button>
						))}
					</div>
				</div>

				<FormGroup>
					<Label htmlFor="tpl-constraints">Constraints (JSON)</Label>
					<Textarea
						id="tpl-constraints"
						placeholder='{"maxRequests": 100, "allowedIPs": ["10.0.0.0/8"]}'
						value={form.constraintsJson}
						onChange={(e) => setForm((p) => ({ ...p, constraintsJson: e.target.value }))}
						rows={4}
						error={errors.constraintsJson}
						className="font-mono text-xs"
					/>
					<p className="text-[11px] text-zinc-500 mt-1">
						Optional. JSON object with additional constraints applied at check time.
					</p>
				</FormGroup>
			</div>
		</Modal>
	);
}

// ─── Permissions Page ─────────────────────────────────────────────────────────

interface PermissionsPageProps {
	client: KavachApiClient;
}

export function PermissionsPage({ client }: PermissionsPageProps) {
	const queryClient = useQueryClient();
	const [createOpen, setCreateOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<PermissionTemplate | null>(null);

	const { data: templatesResult, isLoading } = useQuery({
		queryKey: ["permission-templates"],
		queryFn: () => client.getPermissionTemplates(),
	});

	const createMutation = useMutation({
		mutationFn: (input: CreatePermissionTemplateInput) => client.createPermissionTemplate(input),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["permission-templates"] });
				setCreateOpen(false);
			}
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, input }: { id: string; input: Partial<CreatePermissionTemplateInput> }) =>
			client.updatePermissionTemplate(id, input),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["permission-templates"] });
				setEditTarget(null);
			}
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => client.deletePermissionTemplate(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["permission-templates"] });
		},
	});

	const templates = templatesResult?.success ? templatesResult.data : [];

	return (
		<div>
			<PageHeader
				title="Permissions"
				description="Reusable permission templates for agents. Define once, apply many times."
				actions={
					<Button variant="primary" onClick={() => setCreateOpen(true)}>
						<Plus className="w-3.5 h-3.5" />
						New Template
					</Button>
				}
			/>

			{isLoading ? (
				<div className="flex items-center justify-center py-16">
					<div className="w-5 h-5 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
				</div>
			) : templates.length === 0 ? (
				<Table>
					<TableHead>
						<Th>Name</Th>
						<Th>Resource</Th>
						<Th>Actions</Th>
						<Th>Constraints</Th>
						<Th>Updated</Th>
						<Th />
					</TableHead>
					<TableBody>
						<tr>
							<td colSpan={6}>
								<EmptyState
									icon={<ShieldCheck className="w-6 h-6" />}
									title="No permission templates"
									description="Create templates to define reusable permission sets for your agents."
									action={
										<Button variant="primary" onClick={() => setCreateOpen(true)}>
											<Plus className="w-3.5 h-3.5" />
											Create Template
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
						<Th>Name</Th>
						<Th>Resource</Th>
						<Th>Actions</Th>
						<Th>Constraints</Th>
						<Th>Updated</Th>
						<Th />
					</TableHead>
					<TableBody>
						{templates.map((tpl) => (
							<Tr key={tpl.id} onClick={() => setEditTarget(tpl)}>
								<Td>
									<div>
										<p className="text-sm font-medium text-white">{tpl.name}</p>
										{tpl.description && (
											<p className="text-xs text-zinc-500 mt-0.5 max-w-[200px] truncate">
												{tpl.description}
											</p>
										)}
									</div>
								</Td>
								<Td>
									<code className="text-xs font-mono text-indigo-400">{tpl.resource}</code>
								</Td>
								<Td>
									<div className="flex flex-wrap gap-1">
										{tpl.actions.map((action) => (
											<span
												key={action}
												className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400"
											>
												{action}
											</span>
										))}
									</div>
								</Td>
								<Td>
									{Object.keys(tpl.constraints).length > 0 ? (
										<span className="text-xs text-zinc-400">
											{Object.keys(tpl.constraints).length} rule
											{Object.keys(tpl.constraints).length !== 1 ? "s" : ""}
										</span>
									) : (
										<span className="text-xs text-zinc-600">None</span>
									)}
								</Td>
								<Td>
									<span className="text-xs text-zinc-500">{formatDate(tpl.updatedAt)}</span>
								</Td>
								<Td className="text-right">
									<div className="flex items-center justify-end gap-1">
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												setEditTarget(tpl);
											}}
											className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
											aria-label="Edit template"
										>
											<Pencil className="w-3.5 h-3.5" />
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												deleteMutation.mutate(tpl.id);
											}}
											disabled={deleteMutation.isPending}
											className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/50 transition-colors disabled:opacity-50"
											aria-label="Delete template"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
										<ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
									</div>
								</Td>
							</Tr>
						))}
					</TableBody>
				</Table>
			)}

			<TemplateEditor
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				onSubmit={(input) => createMutation.mutate(input)}
				loading={createMutation.isPending}
			/>

			<TemplateEditor
				open={editTarget !== null}
				onClose={() => setEditTarget(null)}
				onSubmit={(input) => {
					if (editTarget) {
						updateMutation.mutate({ id: editTarget.id, input });
					}
				}}
				loading={updateMutation.isPending}
				initial={editTarget ?? undefined}
			/>
		</div>
	);
}

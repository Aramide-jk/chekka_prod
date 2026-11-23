import "server-only";
import {
	Document,
	Page,
	renderToBuffer,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { IInspection } from "@/server/models/inspections";

const styles = StyleSheet.create({
	page: { padding: 40, fontSize: 10, color: "#1a1a1a", lineHeight: 1.4 },
	brand: { fontSize: 18, marginBottom: 2, color: "#9a7b2e" },
	sub: { fontSize: 9, color: "#666", marginBottom: 18 },
	reportCard: {
		marginBottom: 22,
		paddingBottom: 16,
		borderBottom: "1px solid #ddd",
	},
	carTitle: { fontSize: 14, marginBottom: 4 },
	meta: { fontSize: 9, color: "#666", marginBottom: 10 },
	row: { flexDirection: "row", flexWrap: "wrap" },
	specCell: { width: "50%", marginBottom: 3, flexDirection: "row" },
	specKey: { color: "#888", width: 90 },
	sectionTitle: {
		fontSize: 11,
		marginTop: 10,
		marginBottom: 4,
		color: "#9a7b2e",
	},
	checkRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "50%",
		paddingRight: 8,
		marginBottom: 2,
	},
	verdict: { marginTop: 8, fontSize: 12 },
	summary: { marginTop: 4, color: "#444" },
	// Single-report header
	docTitle: { fontSize: 22, color: "#1a1a1a", marginBottom: 4 },
	docSub: { fontSize: 10, color: "#666", marginBottom: 16 },
	inspectorBar: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 12,
		backgroundColor: "#faf6ec",
		border: "1px solid #ecdca8",
		borderRadius: 6,
		marginBottom: 18,
	},
	inspectorName: { fontSize: 12, marginBottom: 2 },
	inspectorMeta: { fontSize: 9, color: "#666" },
	badge: { fontSize: 9, color: "#9a7b2e" },
	comment: { fontSize: 8, color: "#888", width: "100%", marginBottom: 2 },
	fixRow: { flexDirection: "row", marginBottom: 2 },
});

const VERDICT_COPY: Record<string, string> = {
	good: "Worth Buying",
	caution: "Buy With Caution",
	danger: "Not Recommended",
};

const BADGE_COPY: Record<string, string> = {
	certified: "Certified Inspector",
	verified: "Verified Inspector",
};

// Overview keys → human labels, in display order. Matches the buyer "Vehicle
// Details" tab so the PDF and the on-screen report stay in sync.
const VEHICLE_FIELDS: Array<[string, string]> = [
	["make", "Make"],
	["model", "Model"],
	["year", "Year"],
	["mileage", "Mileage"],
	["transmission", "Transmission"],
	["vin", "VIN"],
	["interiorType", "Interior type"],
	["interiorColor", "Interior color"],
	["bodyColor", "Body color"],
	["engine", "Engine"],
	["driveType", "Drive type"],
	["fuelType", "Fuel type"],
];

function Checklist({
	title,
	items,
}: {
	title: string;
	items: Array<{ label: string; status: string; comment?: string }>;
}): ReactElement | null {
	if (!items || items.length === 0) return null;
	return (
		<View wrap={false}>
			<Text style={styles.sectionTitle}>{title}</Text>
			<View style={styles.row}>
				{items.map((c, i) => (
					<View key={`${c.label}-${i}`} style={styles.checkRow}>
						<Text>{c.label}</Text>
						<Text>{c.status}</Text>
					</View>
				))}
			</View>
			{items
				.filter((c) => c.comment)
				.map((c, i) => (
					<Text key={`cm-${c.label}-${i}`} style={styles.comment}>
						• {c.label}: {c.comment}
					</Text>
				))}
		</View>
	);
}

function ReportBlock({ ins }: { ins: IInspection }): ReactElement {
	const r = ins.report;
	const overview = (r?.overview ?? {}) as Record<string, unknown>;
	return (
		<View style={styles.reportCard} wrap={false}>
			<Text style={styles.carTitle}>
				{ins.car.make} {ins.car.model} {ins.car.year}
			</Text>
			<Text style={styles.meta}>
				{ins.car.city}
				{ins.completedAt
					? ` · Completed ${new Date(ins.completedAt).toLocaleDateString()}`
					: ""}
			</Text>

			{r ? (
				<>
					<View style={styles.row}>
						{Object.entries(overview)
							.filter(([, v]) => v != null && v !== "")
							.map(([k, v]) => (
								<View key={k} style={styles.specCell}>
									<Text style={styles.specKey}>{k}</Text>
									<Text>{String(v)}</Text>
								</View>
							))}
					</View>

					<Checklist title="Exterior" items={r.exterior ?? []} />
					<Checklist title="Interior" items={r.interior ?? []} />
					<Checklist title="Mechanical" items={r.mechanical ?? []} />
					<Checklist title="Road Test" items={r.roadTest ?? []} />

					<Text style={styles.verdict}>
						Verdict: {VERDICT_COPY[r.verdict] ?? r.verdict}
					</Text>
					{r.summary?.written ? (
						<Text style={styles.summary}>{r.summary.written}</Text>
					) : null}
				</>
			) : (
				<Text style={styles.summary}>
					Report not yet filed for this inspection.
				</Text>
			)}
		</View>
	);
}

export default async function buildReportsPdf(
	inspections: IInspection[],
): Promise<Buffer> {
	const generatedAt = new Date().toLocaleString();
	const doc = (
		<Document>
			<Page size="A4" style={styles.page} wrap>
				<Text style={styles.brand}>Chekka · Inspection Reports</Text>
				<Text style={styles.sub}>
					{inspections.length} report
					{inspections.length === 1 ? "" : "s"} · Generated{" "}
					{generatedAt}
				</Text>
				{inspections.length === 0 ? (
					<Text>No completed reports to export yet.</Text>
				) : (
					inspections.map((ins) => (
						<ReportBlock key={ins._id.toString()} ins={ins} />
					))
				)}
			</Page>
		</Document>
	);
	return renderToBuffer(doc);
}

// ── Single, well-structured report PDF ──────────────────────────────────────
// Used by the buyer report view's "Download Full Report" and "Download Current
// Section" actions. When `section` is given, only that category is rendered;
// otherwise the whole report is laid out section by section.

export interface IReportPdfInspector {
	fullName: string;
	badge?: "certified" | "verified" | null;
	city?: string;
	rating?: number;
	totalCompleted?: number;
}

// Canonical section keys the buyer tabs map onto.
export type ReportSection =
	| "Overview"
	| "Vehicle Details"
	| "Exterior"
	| "Interior"
	| "Mechanical"
	| "Road Test"
	| "Verdict";

function VehicleDetails({
	overview,
}: {
	overview: Record<string, unknown>;
}): ReactElement {
	const rows = VEHICLE_FIELDS.filter(
		([k]) => overview[k] != null && overview[k] !== "",
	);
	return (
		<View>
			<Text style={styles.sectionTitle}>Vehicle Details</Text>
			<View style={styles.row}>
				{rows.length === 0 ? (
					<Text style={styles.summary}>
						No vehicle details recorded.
					</Text>
				) : (
					rows.map(([k, label]) => (
						<View key={k} style={styles.specCell}>
							<Text style={styles.specKey}>{label}</Text>
							<Text>{String(overview[k])}</Text>
						</View>
					))
				)}
			</View>
		</View>
	);
}

function OverviewBlock({
	summary,
	verdict,
}: {
	summary?: {
		passed: number;
		minor: number;
		serious: number;
		written: string;
	};
	verdict: string;
}): ReactElement {
	return (
		<View>
			<Text style={styles.sectionTitle}>Overview</Text>
			{summary ? (
				<View style={styles.row}>
					<View style={styles.specCell}>
						<Text style={styles.specKey}>Passed</Text>
						<Text>{summary.passed}</Text>
					</View>
					<View style={styles.specCell}>
						<Text style={styles.specKey}>Minor issues</Text>
						<Text>{summary.minor}</Text>
					</View>
					<View style={styles.specCell}>
						<Text style={styles.specKey}>Serious issues</Text>
						<Text>{summary.serious}</Text>
					</View>
					<View style={styles.specCell}>
						<Text style={styles.specKey}>Verdict</Text>
						<Text>{VERDICT_COPY[verdict] ?? verdict}</Text>
					</View>
				</View>
			) : (
				<Text style={styles.summary}>Report not yet filed.</Text>
			)}
		</View>
	);
}

function VerdictBlock({
	verdict,
	summary,
}: {
	verdict: string;
	summary?: {
		written: string;
		fixes?: Array<{ label: string; priority: string }>;
	};
}): ReactElement {
	return (
		<View>
			<Text style={styles.sectionTitle}>Verdict</Text>
			<Text style={styles.verdict}>
				{VERDICT_COPY[verdict] ?? verdict}
			</Text>
			{summary?.written ? (
				<Text style={styles.summary}>{summary.written}</Text>
			) : null}
			{summary?.fixes && summary.fixes.length > 0 ? (
				<View style={{ marginTop: 6 }}>
					<Text style={styles.sectionTitle}>Recommended fixes</Text>
					{summary.fixes.map((f, i) => (
						<View key={`${f.label}-${i}`} style={styles.fixRow}>
							<Text>
								[{f.priority}] {f.label}
							</Text>
						</View>
					))}
				</View>
			) : null}
		</View>
	);
}

export async function buildInspectionReportPdf(
	ins: IInspection,
	opts: { inspector?: IReportPdfInspector; section?: string } = {},
): Promise<Buffer> {
	const r = ins.report;
	const overview = (r?.overview ?? {}) as Record<string, unknown>;
	const verdict = r?.verdict ?? "good";
	const insp = opts.inspector;
	const generatedAt = new Date().toLocaleString();
	const wanted = opts.section as ReportSection | undefined;
	const show = (s: ReportSection) => !wanted || wanted === s;

	const inspectorLine = insp
		? [
				insp.badge ? BADGE_COPY[insp.badge] : null,
				insp.city,
				insp.rating ? `★ ${insp.rating}` : null,
				insp.totalCompleted != null
					? `${insp.totalCompleted} inspections`
					: null,
			]
				.filter(Boolean)
				.join("  ·  ")
		: "";

	const doc = (
		<Document>
			<Page size="A4" style={styles.page} wrap>
				<Text style={styles.docTitle}>Vehicle Inspection Report</Text>
				<Text style={styles.docSub}>
					{ins.car.make} {ins.car.model} {ins.car.year} ·{" "}
					{ins.car.city}
					{ins.completedAt
						? ` · Completed ${new Date(ins.completedAt).toLocaleDateString()}`
						: ""}
					{wanted ? ` · Section: ${wanted}` : ""} · Generated{" "}
					{generatedAt}
				</Text>

				{insp ? (
					<View style={styles.inspectorBar}>
						<View>
							<Text style={styles.inspectorName}>
								{insp.fullName}
							</Text>
							<Text style={styles.inspectorMeta}>
								{inspectorLine}
							</Text>
						</View>
						{insp.badge ? (
							<Text style={styles.badge}>
								{BADGE_COPY[insp.badge]}
							</Text>
						) : null}
					</View>
				) : null}

				{!r ? (
					<Text style={styles.summary}>
						Report not yet filed for this inspection.
					</Text>
				) : (
					<>
						{show("Overview") && (
							<OverviewBlock
								summary={r.summary}
								verdict={verdict}
							/>
						)}
						{show("Vehicle Details") && (
							<VehicleDetails overview={overview} />
						)}
						{show("Exterior") && (
							<Checklist
								title="Exterior"
								items={r.exterior ?? []}
							/>
						)}
						{show("Interior") && (
							<Checklist
								title="Interior"
								items={r.interior ?? []}
							/>
						)}
						{show("Mechanical") && (
							<Checklist
								title="Mechanical"
								items={r.mechanical ?? []}
							/>
						)}
						{show("Road Test") && (
							<Checklist
								title="Road Test"
								items={r.roadTest ?? []}
							/>
						)}
						{show("Verdict") && (
							<VerdictBlock
								verdict={verdict}
								summary={r.summary}
							/>
						)}
					</>
				)}
			</Page>
		</Document>
	);
	return renderToBuffer(doc);
}

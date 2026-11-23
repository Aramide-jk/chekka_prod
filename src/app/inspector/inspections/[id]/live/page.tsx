import { LiveCaptureWrapper } from "@/libs/InspectorWrapper";
import { getSiteConfig } from "@/server/services/siteConfigs";

export const metadata = { title: "Live capture · Chekka" };

export default async function InspectorLivePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	// The minimum-photos rule is an admin-configurable inspection rule; resolve
	// it server-side (dual-layer cached, falls back to defaults) and pass it in.
	const config = await getSiteConfig();
	return (
		<LiveCaptureWrapper id={id} minPhotos={config.inspections.minPhotos} />
	);
}

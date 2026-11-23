import { redirect } from "next/navigation";

export default async function BookIndex(props: {
	searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
	const resolved = props.searchParams ? await props.searchParams : undefined;
	const params = new URLSearchParams();
	if (resolved) {
		for (const [key, value] of Object.entries(resolved)) {
			if (typeof value === "string") {
				params.set(key, value);
			} else if (Array.isArray(value)) {
				for (const v of value) {
					params.append(key, v);
				}
			}
		}
	}
	const qs = params.toString();
	redirect(`/book/1${qs ? `?${qs}` : ""}`);
}

import type { IEnv } from "@/types";

export default function defaultEnvOptions(): IEnv {
	return {
		NODE_ENV: process.env.NODE_ENV ?? "development",
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
		NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY:
			process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
		// EmailJS transport. The provided account values are baked in as defaults
		// (they're public-by-design keys) so email works without extra env setup;
		// override per-environment via NEXT_PUBLIC_EMAILJS_* if needed.
		NEXT_PUBLIC_EMAILJS_SERVICE_ID:
			process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "service_k68lgmt",
		NEXT_PUBLIC_EMAILJS_TEMPLATE_ID:
			process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "template_xd8ozt3",
		NEXT_PUBLIC_EMAILJS_PUBLIC_KEY:
			process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "xXCkV_QU6zBeDYl1e",
	};
}

import defaultEnvOptions from "./defaultEnvOptions";

// EmailJS REST endpoint — lets us send from the browser with just the public
// key, so no server-side mail provider (or extra SDK dependency) is required.
const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

export interface ISendEmailParams {
	toEmail: string;
	toName?: string;
	subject?: string;
	message: string;
	// Any extra fields are forwarded as EmailJS template params, so a template
	// can reference {{code}}, {{link}}, etc.
	[key: string]: string | undefined;
}

/**
 * Send a transactional email through EmailJS. Returns `true` on success and
 * `false` on any failure (misconfiguration, network, EmailJS error) — callers
 * decide whether a failure is fatal. Never throws.
 */
export default async function sendEmail(
	params: ISendEmailParams,
): Promise<boolean> {
	const env = defaultEnvOptions();
	const serviceId = env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
	const templateId = env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
	const publicKey = env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
	if (!serviceId || !templateId || !publicKey) return false;

	const { toEmail, toName, subject, message, ...rest } = params;
	try {
		const res = await fetch(EMAILJS_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				service_id: serviceId,
				template_id: templateId,
				user_id: publicKey,
				template_params: {
					to_email: toEmail,
					to_name: toName ?? "",
					subject: subject ?? "Chekka",
					message,
					...rest,
				},
			}),
		});
		return res.ok;
	} catch {
		return false;
	}
}

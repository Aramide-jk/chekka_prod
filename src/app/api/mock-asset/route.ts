import type { NextRequest } from "next/server";

export const runtime = "nodejs";

// Local-dev fallback for assets stored under a `mock://` key (i.e. when S3 is
// not configured). No real bytes were ever uploaded in that mode, so we serve a
// deterministic SVG placeholder keyed off the requested path — enough for the
// UI to render an actual <img> instead of a broken one. In production, S3 is
// configured and `s3GetFileLink` returns a presigned URL, so this route is
// never hit.
function hashToHue(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) {
		h = (h * 31 + s.charCodeAt(i)) % 360;
	}
	return h;
}

export async function GET(req: NextRequest) {
	const key = new URL(req.url).searchParams.get("key") ?? "asset";
	const hue = hashToHue(key);
	const label = (key.split("/").pop() ?? key).slice(0, 24);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue},38%,24%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 40) % 360},34%,14%)"/>
    </linearGradient>
  </defs>
  <rect width="640" height="480" fill="url(#g)"/>
  <g fill="none" stroke="hsl(${hue},40%,70%)" stroke-width="3" opacity="0.7">
    <rect x="250" y="190" width="140" height="100" rx="10"/>
    <circle cx="320" cy="245" r="28"/>
    <path d="M280 190l16-22h48l16 22"/>
  </g>
  <text x="320" y="350" fill="hsl(${hue},30%,82%)" font-family="sans-serif" font-size="20" text-anchor="middle">Inspection photo</text>
  <text x="320" y="378" fill="hsl(${hue},25%,68%)" font-family="monospace" font-size="13" text-anchor="middle">${label}</text>
</svg>`;
	return new Response(svg, {
		status: 200,
		headers: {
			"Content-Type": "image/svg+xml",
			"Cache-Control": "public, max-age=86400, immutable",
		},
	});
}

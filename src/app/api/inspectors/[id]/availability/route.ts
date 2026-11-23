import type { NextRequest } from "next/server";
import { ErrInvalidFields } from "@/server/constants/errors";
import { ok, withApiHandler, withAuth } from "@/server/lib";
import { getBookedSlots } from "@/server/services/inspections";
import { getByUserId } from "@/server/services/inspectorProfiles";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const FIXED_SLOTS = ["09:00", "11:00", "14:00", "16:00"];
const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

// Returns, for a given inspector and date, which of the fixed slots are
// bookable. A slot is unavailable when it's already booked, when the inspector
// has toggled it off in their weekly schedule, when the whole weekday is
// inactive, when the date is blocked, or when the date is in the past. The
// booking calendar (Step 4) uses this to grey out times and block past /
// unavailable days.
export const GET = withApiHandler<Ctx>(
	{
		route: "/api/inspectors/:id/availability",
		rateLimit: { windowMs: 60_000, maxRequests: 300 },
	},
	withAuth<Ctx>(async ({ req, context }) => {
		const { id } = await context.params;
		const url = new URL((req as NextRequest).url);
		const date = url.searchParams.get("date");
		if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw ErrInvalidFields;

		const from = new Date(`${date}T00:00:00.000Z`);
		const to = new Date(`${date}T23:59:59.999Z`);
		if (Number.isNaN(from.getTime())) throw ErrInvalidFields;

		// Reject dates earlier than today (UTC day boundary).
		const todayStart = new Date();
		todayStart.setUTCHours(0, 0, 0, 0);
		const isPast = from.getTime() < todayStart.getTime();

		const profile = await getByUserId({ userId: id });
		const weekday = WEEKDAYS[from.getUTCDay()];
		const daySchedule = profile?.schedule?.weekly?.[weekday];
		const dayActive = daySchedule ? daySchedule.active !== false : true;
		const blocked = (profile?.schedule?.blockedDates ?? []).some((d) => {
			const bd = new Date(d);
			return (
				bd.getUTCFullYear() === from.getUTCFullYear() &&
				bd.getUTCMonth() === from.getUTCMonth() &&
				bd.getUTCDate() === from.getUTCDate()
			);
		});

		const dayAvailable = !isPast && dayActive && !blocked;

		// Slots the inspector explicitly turned off for this weekday.
		const slotOff = new Set(
			(daySchedule?.slots ?? [])
				.filter((s) => s.on === false)
				.map((s) => s.time),
		);

		const booked = await getBookedSlots({ inspectorId: id, from, to });
		const takenFromBookings = booked.map((b) => b.slot).filter(Boolean);

		// Everything unbookable for this date collapses into `taken` so the
		// calendar greys it out uniformly.
		const taken = dayAvailable
			? Array.from(new Set([...takenFromBookings, ...Array.from(slotOff)]))
			: [...FIXED_SLOTS];

		return ok({
			date,
			isPast,
			dayAvailable,
			reason: isPast
				? "past"
				: blocked
					? "blocked"
					: !dayActive
						? "day_off"
						: null,
			slots: FIXED_SLOTS,
			taken,
			available: FIXED_SLOTS.filter((s) => !taken.includes(s)),
		});
	}),
);

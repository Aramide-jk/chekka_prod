export interface IDemoAccount {
	role: "buyer" | "inspector" | "admin" | "consultant";
	label: string;
	email: string;
	password: string;
	homePath: string;
	name: string;
	description: string;
	badge: string;
}

export const DEMO_PASSWORD = "password123";

export const DEMO_ACCOUNTS: IDemoAccount[] = [
	{
		role: "buyer",
		label: "Buyer",
		email: "buyer@test.local",
		password: DEMO_PASSWORD,
		homePath: "/dashboard",
		name: "Buyer One",
		description: "Car booking, escrow payment & live reports",
		badge: "Buyer",
	},
	{
		role: "inspector",
		label: "Inspector",
		email: "inspector@test.local",
		password: DEMO_PASSWORD,
		homePath: "/inspector/dashboard",
		name: "Tunde Adebayo",
		description: "Checklist inspections, photos & earnings",
		badge: "Inspector",
	},
	{
		role: "admin",
		label: "Admin",
		email: "admin@test.local",
		password: DEMO_PASSWORD,
		homePath: "/admin",
		name: "Admin Root",
		description: "Operations control, audit logs & dispute queues",
		badge: "Admin",
	},
	{
		role: "consultant",
		label: "Consultant",
		email: "consultant@test.local",
		password: DEMO_PASSWORD,
		homePath: "/consultant/chats",
		name: "Fola Consultant",
		description: "Buyer advisory chats & broker coordination",
		badge: "Consultant",
	},
];

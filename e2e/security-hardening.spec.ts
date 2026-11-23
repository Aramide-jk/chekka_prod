import { expect, test } from "@playwright/test";

const PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? "password123";

test.describe("Security hardening", () => {
	test("signup rejects missing, incorrect, and replayed verification codes", async ({ request }) => {
		const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
		const account = {
			fullName: "Security Test",
			username: `security_${suffix}`,
			email: `security_${suffix}@test.local`,
			phone: `+23480${suffix.slice(-8)}`,
			password: PASSWORD,
			role: "buyer",
		};

		expect((await request.post("/api/auth/signup", { data: account })).status()).toBe(400);
		expect((await request.post("/api/auth/signup/verification", {
			data: { email: account.email, fullName: account.fullName },
		})).status()).toBeLessThan(300);
		expect((await request.post("/api/auth/signup", {
			data: { ...account, verificationCode: "123456" },
		})).status()).toBe(400);
		expect((await request.post("/api/auth/signup", {
			data: { ...account, verificationCode: "000000" },
		})).status()).toBe(201);
		expect((await request.post("/api/auth/signup", {
			data: { ...account, verificationCode: "000000" },
		})).status()).toBe(400);
	});

	test("avatar upload rejects invalid type and size and accepts a valid image", async ({ request }) => {
		const login = await request.post("/api/auth/login", {
			data: { email: "buyer@test.local", password: PASSWORD },
		});
		test.skip(login.status() !== 200, "Seed buyer is required");

		expect((await request.post("/api/users/me/avatar", {
			multipart: { avatar: { name: "bad.txt", mimeType: "text/plain", buffer: Buffer.from("bad") } },
		})).status()).toBe(400);
		expect((await request.post("/api/users/me/avatar", {
			multipart: { avatar: {
				name: "large.jpg",
				mimeType: "image/jpeg",
				buffer: Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(5 * 1024 * 1024 + 1)]),
			} },
		})).status()).toBe(400);
		expect((await request.post("/api/users/me/avatar", {
			multipart: { avatar: {
				name: "valid.jpg",
				mimeType: "image/jpeg",
				buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
			} },
		})).status()).toBeLessThan(300);
	});

	test("pending inspectors cannot use approved-inspector APIs", async ({ request }) => {
		const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
		const account = {
			fullName: "Pending Inspector",
			username: `pending_${suffix}`,
			email: `pending_${suffix}@test.local`,
			phone: `+23481${suffix.slice(-8)}`,
			password: PASSWORD,
			role: "inspector",
		};
		await request.post("/api/auth/signup/verification", {
			data: { email: account.email, fullName: account.fullName },
		});
		const signup = await request.post("/api/auth/signup", {
			data: { ...account, verificationCode: "000000" },
		});
		expect(signup.status()).toBe(201);
		expect((await request.get("/api/dashboard/inspector")).status()).toBe(403);
		expect((await request.patch("/api/inspector-profiles/availability", {
			data: { toggleOn: true },
		})).status()).toBe(403);
	});
});

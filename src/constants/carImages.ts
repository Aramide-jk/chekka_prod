export interface ICarPhoto {
	_id: string;
	url: string;
	section: "exterior" | "interior" | "engine";
	caption: string;
	sequence: number;
	takenAt?: string;
}

export function getCarThumbnail(car?: { make?: string; model?: string }): string {
	const make = (car?.make ?? "").toLowerCase();
	const model = (car?.model ?? "").toLowerCase();

	if (make.includes("mercedes") || model.includes("c300")) {
		return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=400&q=80";
	}
	if (make.includes("honda") || model.includes("accord")) {
		return "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=400&q=80";
	}
	if (make.includes("lexus") || model.includes("rx")) {
		return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80";
	}
	if (make.includes("range") || make.includes("land") || model.includes("sport")) {
		return "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=400&q=80";
	}
	if (make.includes("bmw")) {
		return "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80";
	}
	// Default: Toyota Camry / High-quality Sedan
	return "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=400&q=80";
}

export const SAMPLE_INSPECTION_PHOTOS: ICarPhoto[] = [
	{
		_id: "photo_sample_1",
		url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80",
		section: "exterior",
		caption: "Front 3/4 profile — body alignment & bumper fitment clean",
		sequence: 1,
		takenAt: "2026-04-18T10:15:00Z",
	},
	{
		_id: "photo_sample_2",
		url: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=1200&q=80",
		section: "exterior",
		caption: "Rear quarter view — factory paint depth verified, no overspray",
		sequence: 2,
		takenAt: "2026-04-18T10:18:00Z",
	},
	{
		_id: "photo_sample_3",
		url: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80",
		section: "exterior",
		caption: "Side profile & door gap consistency",
		sequence: 3,
		takenAt: "2026-04-18T10:21:00Z",
	},
	{
		_id: "photo_sample_4",
		url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
		section: "exterior",
		caption: "Headlamp assembly & front grille check — no cracks or moisture",
		sequence: 4,
		takenAt: "2026-04-18T10:24:00Z",
	},
	{
		_id: "photo_sample_5",
		url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
		section: "interior",
		caption: "Steering wheel & driver cockpit controls",
		sequence: 5,
		takenAt: "2026-04-18T10:27:00Z",
	},
	{
		_id: "photo_sample_6",
		url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80",
		section: "interior",
		caption: "Center console infotainment & dual-zone climate functionality",
		sequence: 6,
		takenAt: "2026-04-18T10:30:00Z",
	},
	{
		_id: "photo_sample_7",
		url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
		section: "interior",
		caption: "Front seats & upholstery wear assessment",
		sequence: 7,
		takenAt: "2026-04-18T10:33:00Z",
	},
	{
		_id: "photo_sample_8",
		url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
		section: "interior",
		caption: "Odometer display & instrument cluster — 76,400 km confirmed",
		sequence: 8,
		takenAt: "2026-04-18T10:36:00Z",
	},
	{
		_id: "photo_sample_9",
		url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80",
		section: "engine",
		caption: "Engine compartment bay — dry, no oil seepage or fluid leaks",
		sequence: 9,
		takenAt: "2026-04-18T10:40:00Z",
	},
	{
		_id: "photo_sample_10",
		url: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80",
		section: "engine",
		caption: "Engine block detail & 12V battery terminal health check",
		sequence: 10,
		takenAt: "2026-04-18T10:44:00Z",
	},
	{
		_id: "photo_sample_11",
		url: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1200&q=80",
		section: "engine",
		caption: "Alloy wheel condition, brake disc rotor & tire tread depth (6.2mm)",
		sequence: 11,
		takenAt: "2026-04-18T10:48:00Z",
	},
	{
		_id: "photo_sample_12",
		url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
		section: "engine",
		caption: "OBD-II diagnostic scan — zero DTC fault codes in ECU memory",
		sequence: 12,
		takenAt: "2026-04-18T10:52:00Z",
	},
];

export const SEED_CAR_PHOTO_URLS: Record<string, string[]> = {
	toyota: [
		"https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80",
	],
	mercedes: [
		"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1000&q=80",
	],
	honda: [
		"https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=1000&q=80",
	],
	lexus: [
		"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80",
	],
};

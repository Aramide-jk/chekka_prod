export type { IEnv } from "@/types";

export { default as api } from "./api";
export { default as defaultEnvOptions } from "./defaultEnvOptions";
export { default as fetcher } from "./fetcher";
export { default as formatNumber, NAIRA } from "./formatNumber";
export { default as getErrorMessage } from "./getErrorMessage";
export { default as getSeoMetadata } from "./getSeoMetadata";
export {
	default as sendEmail,
	type ISendEmailParams,
} from "./sendEmail";
export {
	type SupportedImageMime,
	supportedImageMimeTypes,
} from "./supportedImageMimeTypes";
export { default as verifyUserLogin } from "./verifyUserLogin";
export { NIGERIAN_BANKS, type IBankOption } from "./banks";
export {
	DEMO_ACCOUNTS,
	DEMO_PASSWORD,
	type IDemoAccount,
} from "./demoAccounts";
export {
	getCarThumbnail,
	SAMPLE_INSPECTION_PHOTOS,
	SEED_CAR_PHOTO_URLS,
	type ICarPhoto,
} from "./carImages";

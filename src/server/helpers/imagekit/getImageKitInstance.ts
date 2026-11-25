import "server-only";
import ImageKit from "imagekit";
import {
	IMAGEKIT_PRIVATE_KEY,
	IMAGEKIT_PUBLIC_KEY,
	IMAGEKIT_URL_ENDPOINT,
} from "../../constants";

let _imagekit: ImageKit | null = null;

/**
 * Returns a singleton {@link ImageKit} instance, or `null` when ImageKit
 * credentials are absent (local dev without ImageKit — callers fall back to the mock pathway).
 */
export default function getImageKitInstance(): ImageKit | null {
	if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
		return null;
	}
	if (_imagekit) return _imagekit;

	_imagekit = new ImageKit({
		publicKey: IMAGEKIT_PUBLIC_KEY,
		privateKey: IMAGEKIT_PRIVATE_KEY,
		urlEndpoint: IMAGEKIT_URL_ENDPOINT,
	});

	return _imagekit;
}

export const SITE_URL = "https://hangeuloo.oppia.world";
export const SITE_NAME = "Hangeuloo";
export const DEFAULT_DESCRIPTION = "Cheerful Korean practice with bite-sized lessons and AI interview coaching.";

export function absoluteUrl(path: string) {
	return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type SeoMetaArgs = {
	title: string;
	description?: string;
	path?: string;
	index?: boolean;
	imagePath?: string;
};

export function buildSeoMeta({ title, description = DEFAULT_DESCRIPTION, path = "/", index = true, imagePath = "/hangeuloo-icon-small.png" }: SeoMetaArgs) {
	const url = absoluteUrl(path);
	const image = absoluteUrl(imagePath);
	return [
		{ title },
		{ name: "description", content: description },
		{ name: "robots", content: index ? "index,follow" : "noindex,nofollow" },
		{ rel: "canonical", href: url },
		{ property: "og:site_name", content: SITE_NAME },
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:url", content: url },
		{ property: "og:image", content: image },
		{ name: "twitter:card", content: "summary" },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: image },
	];
}

export function buildJsonLd(data: Record<string, unknown>) {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}

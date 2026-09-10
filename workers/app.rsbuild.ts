import { createRequestHandler } from "react-router";
import { handleAuth } from "./api/auth";

import * as serverBuild from "virtual/react-router/server-build";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(serverBuild, import.meta.env.MODE);

export default {
	fetch(request, env, ctx) {
		const url = new URL(request.url);
		if (url.pathname.startsWith("/api")) {
			return handleAuth(request, env).then(
				(res) => res ?? new Response("Not Found", { status: 404 }),
			);
		}
		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},
} satisfies ExportedHandler<Env>;

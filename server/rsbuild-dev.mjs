import express from "express";
import { createRequestHandler } from "@react-router/express";
import { createRsbuild, loadConfig } from "@rsbuild/core";
import {
	loadReactRouterServerBuild,
} from "rsbuild-plugin-react-router";
import { getPlatformProxy } from "wrangler";

const app = express();
const config = await loadConfig();
const rsbuild = await createRsbuild({ rsbuildConfig: config.content });
const devServer = await rsbuild.createDevServer();
const platform = await getPlatformProxy({
	configPath: "wrangler.json",
		remoteBindings: false,
});

app.use(devServer.middlewares);
app.use(
	createRequestHandler({
		build: () => loadReactRouterServerBuild(devServer),
		mode: "development",
		getLoadContext() {
			return {
				cloudflare: {
					env: platform.env,
					ctx: platform.ctx,
				},
			};
		},
	}),
);

const port = Number(process.env.PORT ?? 4175);
const server = app.listen(port, () => {
	console.log(`Rsbuild Cloudflare dev server: http://localhost:${port}`);
	devServer.afterListen();
});

devServer.connectWebSocket({ server });

const shutdown = async () => {
	await devServer.close();
	await platform.dispose();
	server.close();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

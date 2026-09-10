import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginReactRouter } from "rsbuild-plugin-react-router";

export default defineConfig({
	resolve: {
		alias: {
			"~": "./app",
		},
	},
	environments: {
		node: {
			performance: {
				chunkSplit: { strategy: "all-in-one" },
			},
			tools: {
				rspack: {
					externalsType: "module",
					output: {
						chunkFormat: "module",
						chunkLoading: "import",
						workerChunkLoading: "import",
						wasmLoading: "fetch",
						library: { type: "module" },
						module: true,
					},
					resolve: {
						conditionNames: ["workerd", "worker", "browser", "import", "require"],
					},
				},
			},
		},
	},
	plugins: [pluginReactRouter({ customServer: true }), pluginReact()],
});

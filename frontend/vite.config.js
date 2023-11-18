import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import PurgeCSS from "@fullhuman/postcss-purgecss"
export default defineConfig({
 base: "/",
 plugins: [react()],
 server: {
  port: 8081,
  strictPort: true,
  host: true,
  origin: "http://0.0.0.0:8081",
 },

 css: {
	postcss: {
		plugins: [
			PurgeCSS({
				content: ["index.html", "./src/**/*.jsx"],
			}),
		],
	},
},

build: {
	minify: "terser",
	terserOptions: {
		compress: {
			unsafe: true,
			reduce_vars: true,
			join_vars: true,
			dead_code: true,
			if_return: true,
			drop_console: true,
			booleans: true,
		},
		mangle: {
			//toplevel:true,
		},

		format: {
			comments: false,
			indent_level: 2,
		},
	},
},
});

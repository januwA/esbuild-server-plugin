import esbuild from "esbuild";
import path from "path";
import esbuildServerPlugin from "./plugin-dist/esbuild-server-plugin.js";

const __dirname = path.resolve();

esbuild
  .build({
    entryPoints: ["./src/index"],
    bundle: true,
    outdir: path.resolve(__dirname, "out"),
    watch: true,
    loader: {
      ".jpg": "file",
    },
    assetNames: 'asserts/[name]',
    plugins: [
      esbuildServerPlugin({
        title: "document",
        template: path.resolve(__dirname, "index.html"),
        js: ["/index.js"],
        css: ["/index.css"],
        server: {
          port: 3000,
          before() {},
          after() {},
        },
      }),
    ],
  })
  .catch(() => process.exit(1));

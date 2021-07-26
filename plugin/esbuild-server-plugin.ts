import esbuild from "esbuild";
import fs from "fs-extra";
import path from "path";
import ejs from "ejs";
import express, { Express } from "express";
import livereload from "livereload";
import connectLivereload from "connect-livereload";
import chokidar from "chokidar";

const defaultconfig = {
  title: undefined,
  filename: "index.html",
  template: undefined,
  server: undefined,
};

type Config = {
  title?: string;
  filename?: "index.html";
  template: string;
  server?: {
    port?: 300;
    before?: (app: Express, build: esbuild.PluginBuild, config: Config) => void;
    after?: (app: Express, build: esbuild.PluginBuild, config: Config) => void;
  };
};

async function renderHtmltemplate(build: esbuild.PluginBuild, config: Config) {
  if (!fs.existsSync(config.template)) return;

  try {
    //   https://ejs.co/#install
    const outhtmltemplate = await ejs.renderFile(config.template, { config });

    await fs.writeFile(
      path.join(build.initialOptions.outdir!, config.filename!),
      outhtmltemplate
    );
  } catch (error) {
    console.log("renderHtmltemplate error: ", error.message);
  }
}

// https://esbuild.github.io/plugins/#resolve-callbacks
export function esbuildServerPlugin(config: Config) {
  config = Object.assign({}, defaultconfig, config);

  return {
    name: "esbuildServerPlugin",
    async setup(build) {
      if (!build.initialOptions.outdir || !config.template) return;

      if (config.server) {
        await fs.ensureDir(build.initialOptions.outdir);
        renderHtmltemplate(build, config);

        const app = express();
        const staticpath = build.initialOptions.outdir;

        app.use(connectLivereload());

        // user hook
        if (config.server?.before) config.server?.before(app, build, config);
        app.use(express.static(staticpath));
        // user hook
        if (config.server?.after) config.server?.after(app, build, config);

        const port = config.server?.port ?? 3000;
        app.listen(port, () => {
          console.log(`Dev Server listening at http://localhost:${port}`);
        });

        const liveReloadServer = livereload.createServer();
        liveReloadServer.watch(staticpath);
      } else {
        build.onEnd(() => {
          renderHtmltemplate(build, config);
        });
      }

      // 监听template模板改变重新render
      chokidar.watch(config.template).on("all", (event, path) => {
        // console.log(event, path);
        renderHtmltemplate(build, config);
      });
    },
  } as esbuild.Plugin;
}

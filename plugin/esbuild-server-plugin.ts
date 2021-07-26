import esbuild from "esbuild";
import fs from "fs-extra";
import path from "path";
import ejs from "ejs";
import express, { Express } from "express";
import livereload from "livereload";
import connectLivereload from "connect-livereload";

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

function parseHtmltemplate(build: esbuild.PluginBuild, config: Config) {
  const template = fs.readFileSync(path.join(config.template), {
    encoding: "utf-8",
  });

  //   https://ejs.co/#install
  const outhtmltemplate = ejs.render(template, { config });

  fs.writeFileSync(
    path.join(build.initialOptions.outdir!, config.filename!),
    outhtmltemplate
  );
}

// https://esbuild.github.io/plugins/#resolve-callbacks
export default function esbuildServerPlugin(config: Config) {
  config = Object.assign({}, defaultconfig, config);

  return {
    name: "esbuildServerPlugin",
    async setup(build) {
      if (config.server) {
        if (!build.initialOptions.outdir) return;

        await fs.ensureDir(build.initialOptions.outdir);

        parseHtmltemplate(build, config);
        const app = express();
        const port = config.server?.port ?? 3000;

        // user hook
        if (config.server?.before) config.server?.before(app, build, config);

        const staticpath = build.initialOptions.outdir;
        app.use(express.static(staticpath));

        // user hook
        if (config.server?.after) config.server?.after(app, build, config);

        app.listen(port, () => {
          console.log(`Dev Server listening at http://localhost:${port}`);
        });

        const liveReloadServer = livereload.createServer();
        liveReloadServer.watch(staticpath);
        liveReloadServer.watch(config.template);
        app.use(connectLivereload());
        
      } else {
        build.onEnd((result) => {
          parseHtmltemplate(build, config);
        });
      }
    },
  } as esbuild.Plugin;
}

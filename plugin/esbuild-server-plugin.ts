import esbuild from "esbuild";
import fs from "fs-extra";
import path from "path";
import ejs from "ejs";
import express, { Express } from "express";
import livereload from "livereload";
import {
  connectLivereload,
  Options as ConnectLivereloadOptions,
} from "ajanuw-connect-livereload";
import chokidar from "chokidar";
import https from "https";
import { KeyObject } from "tls";

const defaultconfig = {
  filename: "index.html",
};

type Config = {
  /**
   * default: index.html
   */
  filename?: string;
  
  template: string;
  server?: {
    /**
     * default: 3000
     */
    port?: number;
    before?: (app: Express, build: esbuild.PluginBuild, config: Config) => void;
    after?: (app: Express, build: esbuild.PluginBuild, config: Config) => void;

    httpsOptions?: {
      /**
       * default: 443
       */
      port?: number;
      key?: string | Buffer | (Buffer | KeyObject)[];
      cert?: string | Buffer | (string | Buffer)[];
    };

    /**
     * connect-livereload options
     */
    connectLivereload?: ConnectLivereloadOptions;
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
        const port = config.server?.port ?? 3000;
        const staticpath = build.initialOptions.outdir;

        if (config.server?.before) config.server?.before(app, build, config);

        app.use(
          connectLivereload({
            protocol: config.server?.httpsOptions ? "https" : undefined,
            ...(config.server.connectLivereload ?? {}),
          })
        );
        app.use(express.static(staticpath));

        if (config.server?.httpsOptions) {
          const httpsport = config.server?.httpsOptions?.port ?? 443;
          https
            .createServer(
              {
                key: config.server?.httpsOptions?.key,
                cert: config.server?.httpsOptions?.cert,
              },
              app
            )
            .listen(httpsport, () => {
              console.log(
                `Dev Server listening at https://127.0.0.1:${httpsport}`
              );
            });
        }

        app.listen(port, () => {
          console.log(`Dev Server listening at http://127.0.0.1:${port}`);
        });

        // liveReload
        const lrserver = livereload.createServer({
          https: config.server?.httpsOptions,
        });
        lrserver.watch(staticpath);

        if (config.server?.after) config.server?.after(app, build, config);
      } else {
        build.onEnd(() => {
          renderHtmltemplate(build, config);
        });
      }

      // 监听template模板改变重新render
      chokidar.watch(config.template).on("all", (event, path) => {
        renderHtmltemplate(build, config);
      });
    },
  } as esbuild.Plugin;
}

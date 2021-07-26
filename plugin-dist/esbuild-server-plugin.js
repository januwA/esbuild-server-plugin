import fs from "fs-extra";
import path from "path";
import ejs from "ejs";
import express from "express";
import livereload from "livereload";
import connectLivereload from "connect-livereload";
const defaultconfig = {
    title: undefined,
    filename: "index.html",
    template: undefined,
    server: undefined,
};
function parseHtmltemplate(build, config) {
    const template = fs.readFileSync(path.join(config.template), {
        encoding: "utf-8",
    });
    //   https://ejs.co/#install
    const outhtmltemplate = ejs.render(template, { config });
    fs.writeFileSync(path.join(build.initialOptions.outdir, config.filename), outhtmltemplate);
}
// https://esbuild.github.io/plugins/#resolve-callbacks
export default function esbuildServerPlugin(config) {
    config = Object.assign({}, defaultconfig, config);
    return {
        name: "esbuildServerPlugin",
        async setup(build) {
            if (config.server) {
                if (!build.initialOptions.outdir)
                    return;
                await fs.ensureDir(build.initialOptions.outdir);
                parseHtmltemplate(build, config);
                const app = express();
                const port = config.server?.port ?? 3000;
                // user hook
                if (config.server?.before)
                    config.server?.before(app, build, config);
                const staticpath = build.initialOptions.outdir;
                const liveReloadServer = livereload.createServer();
                liveReloadServer.watch(staticpath);
                app.use(connectLivereload());
                app.use(express.static(staticpath));
                // user hook
                if (config.server?.after)
                    config.server?.after(app, build, config);
                app.listen(port, () => {
                    console.log(`Dev Server listening at http://localhost:${port}`);
                });
            }
            else {
                build.onEnd((result) => {
                    parseHtmltemplate(build, config);
                });
            }
        },
    };
}
//# sourceMappingURL=esbuild-server-plugin.js.map
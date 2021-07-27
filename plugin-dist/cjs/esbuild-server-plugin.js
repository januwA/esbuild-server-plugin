"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.esbuildServerPlugin = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const express_1 = __importDefault(require("express"));
const livereload_1 = __importDefault(require("livereload"));
const ajanuw_connect_livereload_1 = require("ajanuw-connect-livereload");
const chokidar_1 = __importDefault(require("chokidar"));
const https_1 = __importDefault(require("https"));
const defaultconfig = {
    filename: "index.html",
};
function renderHtmltemplate(build, config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_extra_1.default.existsSync(config.template))
            return;
        try {
            //   https://ejs.co/#install
            const outhtmltemplate = yield ejs_1.default.renderFile(config.template, { config });
            yield fs_extra_1.default.writeFile(path_1.default.join(build.initialOptions.outdir, config.filename), outhtmltemplate);
        }
        catch (error) {
            console.log("renderHtmltemplate error: ", error.message);
        }
    });
}
// https://esbuild.github.io/plugins/#resolve-callbacks
function esbuildServerPlugin(config) {
    config = Object.assign({}, defaultconfig, config);
    return {
        name: "esbuildServerPlugin",
        setup(build) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            return __awaiter(this, void 0, void 0, function* () {
                if (!build.initialOptions.outdir || !config.template)
                    return;
                if (config.server) {
                    yield fs_extra_1.default.ensureDir(build.initialOptions.outdir);
                    renderHtmltemplate(build, config);
                    const app = express_1.default();
                    const port = (_b = (_a = config.server) === null || _a === void 0 ? void 0 : _a.port) !== null && _b !== void 0 ? _b : 3000;
                    const staticpath = build.initialOptions.outdir;
                    if ((_c = config.server) === null || _c === void 0 ? void 0 : _c.before)
                        (_d = config.server) === null || _d === void 0 ? void 0 : _d.before(app, build, config);
                    app.use(ajanuw_connect_livereload_1.connectLivereload(Object.assign({ protocol: ((_e = config.server) === null || _e === void 0 ? void 0 : _e.httpsOptions) ? "https" : undefined }, ((_f = config.server.connectLivereload) !== null && _f !== void 0 ? _f : {}))));
                    app.use(express_1.default.static(staticpath));
                    if ((_g = config.server) === null || _g === void 0 ? void 0 : _g.httpsOptions) {
                        const httpsport = (_k = (_j = (_h = config.server) === null || _h === void 0 ? void 0 : _h.httpsOptions) === null || _j === void 0 ? void 0 : _j.port) !== null && _k !== void 0 ? _k : 443;
                        https_1.default
                            .createServer({
                            key: (_m = (_l = config.server) === null || _l === void 0 ? void 0 : _l.httpsOptions) === null || _m === void 0 ? void 0 : _m.key,
                            cert: (_p = (_o = config.server) === null || _o === void 0 ? void 0 : _o.httpsOptions) === null || _p === void 0 ? void 0 : _p.cert,
                        }, app)
                            .listen(httpsport, () => {
                            console.log(`Dev Server listening at https://127.0.0.1:${httpsport}`);
                        });
                    }
                    app.listen(port, () => {
                        console.log(`Dev Server listening at http://127.0.0.1:${port}`);
                    });
                    // liveReload
                    const lrserver = livereload_1.default.createServer({
                        https: (_q = config.server) === null || _q === void 0 ? void 0 : _q.httpsOptions,
                    });
                    lrserver.watch(staticpath);
                    if ((_r = config.server) === null || _r === void 0 ? void 0 : _r.after)
                        (_s = config.server) === null || _s === void 0 ? void 0 : _s.after(app, build, config);
                }
                else {
                    build.onEnd(() => {
                        renderHtmltemplate(build, config);
                    });
                }
                // 监听template模板改变重新render
                chokidar_1.default.watch(config.template).on("all", (event, path) => {
                    renderHtmltemplate(build, config);
                });
            });
        },
    };
}
exports.esbuildServerPlugin = esbuildServerPlugin;

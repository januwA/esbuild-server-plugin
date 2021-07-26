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
const connect_livereload_1 = __importDefault(require("connect-livereload"));
const chokidar_1 = __importDefault(require("chokidar"));
const defaultconfig = {
    title: undefined,
    filename: "index.html",
    template: undefined,
    server: undefined,
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
            var _a, _b, _c, _d, _e, _f;
            return __awaiter(this, void 0, void 0, function* () {
                if (!build.initialOptions.outdir || !config.template)
                    return;
                if (config.server) {
                    yield fs_extra_1.default.ensureDir(build.initialOptions.outdir);
                    renderHtmltemplate(build, config);
                    const app = express_1.default();
                    const staticpath = build.initialOptions.outdir;
                    app.use(connect_livereload_1.default());
                    // user hook
                    if ((_a = config.server) === null || _a === void 0 ? void 0 : _a.before)
                        (_b = config.server) === null || _b === void 0 ? void 0 : _b.before(app, build, config);
                    app.use(express_1.default.static(staticpath));
                    // user hook
                    if ((_c = config.server) === null || _c === void 0 ? void 0 : _c.after)
                        (_d = config.server) === null || _d === void 0 ? void 0 : _d.after(app, build, config);
                    const port = (_f = (_e = config.server) === null || _e === void 0 ? void 0 : _e.port) !== null && _f !== void 0 ? _f : 3000;
                    app.listen(port, () => {
                        console.log(`Dev Server listening at http://localhost:${port}`);
                    });
                    const liveReloadServer = livereload_1.default.createServer();
                    liveReloadServer.watch(staticpath);
                }
                else {
                    build.onEnd(() => {
                        renderHtmltemplate(build, config);
                    });
                }
                // 监听template模板改变重新render
                chokidar_1.default.watch(config.template).on("all", (event, path) => {
                    // console.log(event, path);
                    renderHtmltemplate(build, config);
                });
            });
        },
    };
}
exports.esbuildServerPlugin = esbuildServerPlugin;

import esbuild from "esbuild";
import { Express } from "express";
declare type Config = {
    title?: string;
    filename?: "index.html";
    template: string;
    server?: {
        port?: 300;
        before?: (app: Express, build: esbuild.PluginBuild, config: Config) => void;
        after?: (app: Express, build: esbuild.PluginBuild, config: Config) => void;
    };
};
export default function esbuildServerPlugin(config: Config): esbuild.Plugin;
export {};
//# sourceMappingURL=esbuild-server-plugin.d.ts.map
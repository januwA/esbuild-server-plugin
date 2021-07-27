/// <reference types="node" />
import esbuild from "esbuild";
import { Express } from "express";
import { Options as ConnectLivereloadOptions } from "ajanuw-connect-livereload";
import { KeyObject } from "tls";
declare type Config = {
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
export declare function esbuildServerPlugin(config: Config): esbuild.Plugin;
export {};
//# sourceMappingURL=esbuild-server-plugin.d.ts.map
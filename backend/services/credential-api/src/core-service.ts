"use strict";

import { CLogger, clog, levels } from "mxw-libs-clogger";
import { isUndefinedOrNull } from "mxw-libs-utils";
import AppService from "./app-service";

let { name, version } = require("../package.json");

export default class CoreService {
    private static self: CoreService;

    public static get Instance(): CoreService {
        return this.self || (this.self = new this());
    }

    public init(logLevel?: string): CoreService {
        CLogger.Instance.init(levels.NORMAL);

        if (isUndefinedOrNull(logLevel)) {
            for (const [index, argv] of process.argv.entries()) {
                if ("logLevel" == argv)
                    logLevel = process.argv[index + 1];
            }
        }

        if (!isUndefinedOrNull(levels[logLevel])) {
            CLogger.Instance.level = levels[logLevel];
        }
        return this;
    }

    public run() {
        clog(levels.WARNING, "Service", name, "(" + version + ") is starting...");

        // Initialize service
        return AppService.Instance.init().then((instance) => {
            return instance.run().then((url) => {
                clog(levels.WARNING, "Service is serving", url);
                return this;
            });
        }).catch(error => {
            clog(levels.CRITICAL, "Service failed to start:", error);
            throw error;
        });
    }

    public term() {
        clog(levels.WARNING, "Service is terminating...");

        // Initialize service
        return AppService.Instance.term().then(() => {
            clog(levels.WARNING, "Service is terminated");
        }).catch(error => {
            clog(levels.CRITICAL, "Service failed to terminate:", error);
            throw error;
        });
    }
}

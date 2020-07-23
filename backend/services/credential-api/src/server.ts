"use strict";

import { CLogger, clog, levels, names as logLevelNames } from "mxw-libs-clogger";
import CoreService from "./core-service"

CoreService.Instance.init().run().catch(error => {
    return CoreService.Instance.term().then(() => {
        process.exit();
    }).catch(error => {
        process.exit();
    });
});

function exitHandler(options, err) {
    if (process.stdout.writable) {
        process.stdout.write("Signal: " + options.signal + "\n");
    }

    if (err) {
        if (process.stdout.writable) {
            process.stdout.write("ERROR: " + err + "\n");
        }
    }

    if (options.exit) {
        return CoreService.Instance.term().then(() => {
            if (process.stdout.writable) {
                process.stdout.write("Shutting down gracefully\n");
            }
            process.exit();
        }).catch(error => {
            if (process.stdout.writable) {
                process.stdout.write("Shutting down forcefully\n");
            }
            process.exit();
        });
    }
}

//do something when app is closing
process.on("exit", exitHandler.bind(null, {
    signal: "exit",
    cleanup: true
}));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, {
    signal: "SIGINT",
    exit: true
}));

//catches SIGHUP (1) event to increase log depth (circled)
process.on("SIGHUP", () => {
    CLogger.Instance.depth = null;
    clog(levels.CRITICAL, "Logger depth:", CLogger.Instance.depth);
});

//catches SIGUSR1 (10) event to increase log width (circled)
process.on("SIGUSR1", () => {
    CLogger.Instance.width = null;
    clog(levels.CRITICAL, "Logger width:", CLogger.Instance.width);
});

//catches SIGUSR2 (12) event to increase log severity (circled)
process.on("SIGUSR2", () => {
    CLogger.Instance.level = null;
    clog(levels.CRITICAL, "Logger level:", logLevelNames[CLogger.Instance.level]);
});

//catches uncaught exceptions
process.on("uncaughtException", (error) => {
    exitHandler.bind(null, {
        signal: "uncaughtException",
        exit: true
    }, error);
});

//catches unhandled rejection
process.on("unhandledRejection", (reason, promise) => {
    clog(levels.EXCEPTION, "unhandledRejection:", reason);
});

// listen for TERM signal .e.g. kill 
process.on("SIGTERM", exitHandler.bind(null, {
    signal: "SIGTERM",
    exit: true
}));
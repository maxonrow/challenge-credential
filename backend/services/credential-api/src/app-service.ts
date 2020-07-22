"use strict";

import ElapsedTime from "elapsed-time";
import restify from "restify";
import restifyError from "restify-errors";
import corsMiddleware from "restify-cors-middleware";
import jwt from "jsonwebtoken";

import { isUndefinedOrNullOrEmpty } from "mxw-libs-utils";
import { clog, levels } from "mxw-libs-clogger";
import { errors } from "mxw-libs-errors";
import { ApiService } from "mxw-libs-api-token";

import transactionService from "./transaction-service";
import NftService from "./nft-service";

let { name, version } = require("../package.json");

enum AuthType {
    API = "API",
    JWT = "JWT",
    NIL = "NIL"
}

export { }

export default class AppService {
    private static self: AppService;

    private server: restify.Server;

    private maxRequest: number;
    private peakRequest: number;
    private activeRequest: number;

    private auths: {
        [path: string]: {
            authType: AuthType,
            logExcluded: boolean
        }
    } = {};

    private whitelist: { [walletAddress: string]: boolean } = {};

    constructor() {
        this.peakRequest = 0;
        this.activeRequest = 0;

        this.maxRequest = isUndefinedOrNullOrEmpty(process.env.MAX_REQUEST) ? 0 : Number(process.env.MAX_REQUEST);
    }

    /**
     * Create a singleton
     */
    public static get Instance(): AppService {
        return this.self || (this.self = new this());
    }

    private onCreateNft(req: restify.Request, res: restify.Response, next: restify.Next) {
        return Promise.resolve().then(() => {
            return NftService.Instance.createNft({
                ...req.body
            }).then((result) => {
                res.json({
                    ret: "0",
                    data: result
                })
            });
        });
    }

    private onApproveNft(req: restify.Request, res: restify.Response, next: restify.Next) {
        return Promise.resolve().then(() => {
            return NftService.Instance.approveNft({
                ...req.body
            }).then((result) => {
                res.json({
                    ret: "0",
                    data: result
                })
            });
        });
    }

    private onMintNftItem(req: restify.Request, res: restify.Response, next: restify.Next) {
        return Promise.resolve().then(() => {
            return NftService.Instance.mintNftItem({
                ...req.body
            }).then((result) => {
                res.json({
                    ret: "0",
                    data: result
                });
            });
        });
    }

    private onQueryNftItem(req: restify.Request, res: restify.Response, next: restify.Next) {
        return Promise.resolve().then(() => {
            return NftService.Instance.queryNftItem({
                ...req.query
            }).then((result) => {
                res.json({
                    ret: "0",
                    data: result
                })
            });
        });
    }

    /**
     * Serve the health probe
     * 
     * @param req Http request
     * @param res Http response
     * @param next The next route
     */
    private onLiveness(req: restify.Request, res: restify.Response, next: restify.Next) {
        return new Promise<any>((resolve, reject) => {
            res.json(200);
            return resolve();
        });
    }

    /**
     * Serve the readiness probe, let the load balancer control the traffic load
     *  
     * @param req Http request
     * @param res Http response
     * @param next The next route
     */
    private onReadiness(req: restify.Request, res: restify.Response, next: restify.Next) {
        return new Promise<any>((resolve, reject) => {
            if (0 < this.maxRequest) {
                if (this.activeRequest >= this.maxRequest)
                    return reject(new restifyError.TooManyRequestsError({ info: { code: "TooManyRequestsError" } }, "Not Ready"));
            }
            res.json(200);
            return resolve();
        });
    }

    /**
     * Serve the root probe for testing
     *  
     * @param req Http request
     * @param res Http response
     * @param next The next route
     */
    private onRoot(req: restify.Request, res: restify.Response, next: restify.Next) {
        return new Promise<any>((resolve, reject) => {
            res.json({
                message: "Welcome to the coolest API on earth - " + this.server.name + ":" + version + "!"
            });
            return resolve();
        });
    }

    /**
     * Initialize the service
     */
    public init() {
        return new Promise<AppService>((resolve, reject) => {
            let self = this;

            if (process.env.WHITELIST) {
                if ("*" == process.env.WHITELIST) {
                    this.whitelist["*"] = true;
                }
                else {
                    for (let walletAddress of process.env.WHITELIST.split(",")) {
                        this.whitelist[walletAddress.trim()] = true;
                    }
                }
            }

            // Initialize server
            this.server = restify.createServer({
                name,
                version
            });

            let origins: string[] = (!isUndefinedOrNullOrEmpty(process.env.CORS)) ? process.env.CORS.split(",") : ["*"];

            const cors = corsMiddleware({
                origins: origins,
                allowHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Lang", "Authorization", "Accept-Version"],
                exposeHeaders: ["GET", "POST", "PATCH", "HEAD", "OPTIONS"]
            });

            this.server.pre(cors.preflight);
            this.server.use(cors.actual);

            this.server.use(restify.plugins.acceptParser(this.server.acceptable));
            this.server.use(restify.plugins.queryParser());
            this.server.use(restify.plugins.bodyParser());
            this.server.use(restify.plugins.authorizationParser());

            this.server.pre(restify.pre.dedupeSlashes());
            this.server.pre(function (req: restify.Request, res: restify.Response, next: restify.Next) {
                req["et"] = ElapsedTime.new().start();

                let auth = self.auths[req.path().toLowerCase()];

                if (auth) {
                    if (!auth.logExcluded) {
                        clog(levels.NORMAL, "REQ:", req.method, req.url, "HTTP/" + req.httpVersion);
                    }
                }
                self.activeRequest++;

                if (self.activeRequest > self.peakRequest) {
                    self.peakRequest = self.activeRequest;
                }
                return next();
            });

            this.server.use(function (req: restify.Request, res: restify.Response, next: restify.Next) {
                let auth = self.auths[req.path().toLowerCase()];
                if (auth) {
                    if (AuthType.NIL == auth.authType) {
                        return next();
                    }
                    if (!isUndefinedOrNullOrEmpty(req.authorization) && !isUndefinedOrNullOrEmpty(req.authorization.credentials)) {
                        try {
                            switch (auth.authType) {
                                case AuthType.JWT:
                                    if (!isUndefinedOrNullOrEmpty(process.env.JWT_SECRET)) {
                                        try {
                                            let payload = jwt.verify(req.authorization.credentials, process.env.JWT_SECRET, {});
                                            if (!isUndefinedOrNullOrEmpty(payload)) {
                                                // TODO: Check any mandatory payload property
                                                //

                                                req.authorization["verified"] = true;
                                                req.authorization["payload"] = payload;
                                                return next();
                                            }
                                        } catch (error) {
                                            if ("TokenExpiredError" == error.name) {
                                                return next(new restifyError.ProxyAuthenticationRequiredError({
                                                    info: { code: errors.NOT_AVAILABLE }
                                                }, "Session Timeout"));
                                            }
                                        }
                                    }
                                    break;

                                case AuthType.API:
                                    let walletAddress = ApiService.Instance.verifyToken(req.authorization.credentials);
                                    if (walletAddress) {
                                        // Check whitelist
                                        if (self.whitelist["*"] || self.whitelist[walletAddress]) {
                                            req["walletAddress"] = walletAddress;
                                            return next();
                                        }
                                    }
                            }
                        } catch (error) {
                        }
                    }
                }

                return next(new restifyError.ForbiddenError({ info: { code: errors.UNAUTHORISED } }, "Unauthorised"));
            });

            this.server.on("after", function (req, res, route, err) {
                try {
                    let contentLength = res._headers["content-length"];

                    if (200 == res.statusCode) {
                        if (isUndefinedOrNullOrEmpty(res.ret) || "0" == res.ret) {
                            let auth = self.auths[req.path().toLowerCase()];

                            if (auth && !auth.logExcluded) {
                                clog(levels.WARNING, "RES:", req.method, req.url, "HTTP/" + req.httpVersion, "OK", (contentLength ? contentLength : "-") + ",",
                                    "elapsed:", req.et.getValue());
                            }
                        }
                        else {
                            clog(levels.ERROR, "RES:", req.method, req.url, "HTTP/" + req.httpVersion, res.ret, (contentLength ? contentLength : "-") + ",",
                                "elapsed:", req.et.getValue(), "ERROR:", (err) ? err.toString(true) : "Unknown error");
                        }
                    }
                    else {
                        clog(levels.ERROR, "RES:", req.method, req.url, "HTTP/" + req.httpVersion, res.statusCode, (contentLength ? contentLength : "-") + ",",
                            "elapsed:", req.et.getValue(), (err) ? err.toString() : "Unknown error");
                    }
                }
                catch (error) {
                    clog(levels.ERROR, "RES:", req.method, req.url, "HTTP/" + req.httpVersion, res.statusCode, "-,",
                        "elapsed:", req.et.getValue(), "Error:", error);
                }

                self.activeRequest--;
            });

            this.server.on("restifyError", function (req, res, err, callback) {
                let code: string;

                err.toJSON = () => {
                    return {
                        ret: code,
                        msg: (undefined != err && err.message) ? err.message : "[EMPTY]"
                    };
                };

                err.toString = (details?: boolean) => {
                    let message;
                    if (details && undefined != err && err.context && err.context.reason) {
                        message = err.context.reason;
                    }
                    if (!message) {
                        message = (undefined != err && err.message) ? err.message : "[EMPTY]";
                    }
                    return code + ": " + message;
                };

                if (undefined != err && err.context && err.context.code) {
                    code = err.context.code;
                }
                else {
                    code = (undefined != err && err.body && err.body.code) ? err.body.code : "-1";
                }

                // Forced to return 200 status code except for TooManyRequests error
                err.statusCode = ("TooManyRequests" == code) ? 429 : 200;
                res["ret"] = code;

                return callback();
            });

            return resolve(this);
        });
    }

    /**
     * Activate the service
     */
    public run() {
        return new Promise<string>((resolve, reject) => {
            // Initialize service token verifier
            return ApiService.Instance.init({
                domain: process.env.SERVICE_DOMAIN ? process.env.SERVICE_DOMAIN : "DEFAULT",
                sessionTimeout: process.env.SESSION_TIMEOUT ? Number(process.env.SESSION_TIMEOUT) : 60000
            }).then(() => {
                return NftService.Instance.init();
            }).then(() => {
                this.entryPoint(this.server, "/", this.onRoot, ["GET"], AuthType.NIL, true);
                this.entryPoint(this.server, "/liveness", this.onLiveness, ["GET", "HEAD", "OPTIONS"], AuthType.NIL, true);
                this.entryPoint(this.server, "/readiness", this.onReadiness, ["GET", "HEAD", "OPTIONS"], AuthType.NIL, true);

                this.entryPoint(this.server, "/createNft", this.onCreateNft, ["POST", "HEAD", "OPTIONS"], AuthType.NIL, true);
                this.entryPoint(this.server, "/approveNft", this.onApproveNft, ["POST", "HEAD", "OPTIONS"], AuthType.NIL, true);
                this.entryPoint(this.server, "/mintNftItem", this.onMintNftItem, ["POST", "HEAD", "OPTIONS"], AuthType.NIL, true);
                this.entryPoint(this.server, "/queryNftItem", this.onQueryNftItem, ["GET", "HEAD", "OPTIONS"], AuthType.NIL, true);

                return this.server.listen(8081, () => {
                    return resolve(this.server.url);
                });
            }).catch(error => {
                return reject(error);
            });
        });
    }

    public term() {
        return transactionService.Instance.term();
    }

    private entryPoint(server: restify.Server, uri: string, callback: any, methods: string[], authType: AuthType, logExcluded: boolean) {
        let self = this;

        this.auths[uri.toLowerCase()] = {
            authType,
            logExcluded
        };

        if (0 <= methods.indexOf("GET")) server.get(uri, function (req, res, next) { self.onRequest(callback, req, res, next) });
        if (0 <= methods.indexOf("POST")) server.post(uri, function (req, res, next) { self.onRequest(callback, req, res, next) });
        if (0 <= methods.indexOf("PATCH")) server.patch(uri, function (req, res, next) { self.onRequest(callback, req, res, next) });
        if (0 <= methods.indexOf("PUT")) server.put(uri, function (req, res, next) { self.onRequest(callback, req, res, next) });
        if (0 <= methods.indexOf("DELETE")) server.del(uri, function (req, res, next) { self.onRequest(callback, req, res, next) });

        if (0 <= methods.indexOf("HEAD")) server.head(uri, function (req, res, next) { self.onRequest(callback, req, res, next) });
        if (0 <= methods.indexOf("OPTIONS")) server.opts(uri, function (req, res, next) { self.onRequest(undefined, req, res, next) });
    }

    /**
     * The http request entry point
     * 
     * @param func The process function callback
     * @param req Http request
     * @param res Http response
     * @param next The next route
     */
    private onRequest(func, req: restify.Request, res: restify.Response, next: restify.Next) {
        switch (req.method) {
            case "GET":
            case "HEAD":
                break;

            case "POST":
            case "PUT":
            case "PATCH":
            case "DELETE":
                if (!req.is("json")) {
                    return next(new restifyError.BadRequestError({ info: { code: "ContentTypeNotSupported" } },
                        "Content type is not supported"));
                }

                break;

            case "OPTIONS":
                res.json(200);
                return next();
        }

        return func.call(this, req, res, next).then((nextContext) => {
            if (!isUndefinedOrNullOrEmpty(nextContext)) {
                throw nextContext;
            }

            return next();
        }).catch(error => {
            let { code, message, reason } = errors.describeError(error);

            if (errors.DATABASE_ERROR == code) {
                code = isUndefinedOrNullOrEmpty(error.ret) ? "SYSTEM_BUSY" : error.ret;
                if (!isUndefinedOrNullOrEmpty(error.msg)) {
                    message = error.msg;
                }
            }

            return next(error);

            /*return this.translateError(req.headers["content-language"], code, message).then((translated) => {
                errors.throwError(translated.code, translated.message, {});
            }).catch(error => {
                let { code, message } = errors.describeError(error);
                let e = new restifyError.InternalServerError({
                    info: {
                        code: isUndefinedOrNullOrEmpty(code) ? "InternalServerError" : code,
                        reason
                    }
                }, isUndefinedOrNullOrEmpty(message) ? "Something went wrong" : message);
                return next(e);
            });*/
        });
    }

    /*private translateError(language: string, code: string, message: string) {
        if (!language) {
            language = "en_US"; // Default language
        }

        let codeId = !isNaN(Number(code)) ? Number(code) : 0;
        clog(levels.DETAIL, "Translating error", language, "(", codeId, ")", code, ":", message);

        return DatabaseService.Instance.query(null, "CALL sp_cm_get_err_msg_sys(?,?,?,?,?)", [codeId, code, message, language, 1]).then((results) => {
            let translatedMessage = "";
            if (0 < results.recordsets.length && 0 < results.recordsets[0].length) {
                if (!isUndefinedOrNullOrEmpty(results.recordsets[0][0].msg)) {
                    translatedMessage = results.recordsets[0][0].msg;
                }
            }
            clog(levels.NORMAL, "Translated error", language, "(", codeId, ")", code, ":", translatedMessage);
            return { code, message: translatedMessage };
        }).catch(error => {
            if (errors.NOT_CONFIGURED != error.code) {
                clog(levels.ERROR, "Translate error message failed", language, "(", codeId, ")", code, ":", message, "ERROR:", JSON.stringify(error));
            }
            return errors.throwError("SYSTEM_BUSY", "System busy", {
                language,
                codeId,
                code,
                message,
                error
            });
        });
    }*/
}

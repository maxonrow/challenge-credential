"use strict";

import { errors, describeError, throwError } from "mxw-libs-errors";
import { isUndefinedOrNullOrEmpty, checkFormat, checkString, SafeBigNumber, checkNumber, checkSafeBigNumber, timeElapsed, timeNow, checkBigNumber } from "mxw-libs-utils";
import { Mysql } from "mxw-libs-database";
import { clog, levels } from "mxw-libs-clogger";

interface Record {
    id: number,
    someStringField: string,
    someBigNumberField: SafeBigNumber
}

export default class TransactionService {
    private static self: TransactionService;

    private config: {
        MYSQL_URL: string
    };

    /**
     * Create a singleton
     */
    public static get Instance(): TransactionService {
        return this.self || (this.self = new this());
    }

    public init() {
        try {
            this.config = checkFormat({
                MYSQL_URL: checkString
            }, {
                MYSQL_URL: process.env.MYSQL_URL
            });
        }
        catch (error) {
            let { message } = describeError(error);
            throwError(errors.NOT_CONFIGURED, "Environment: " + message, { error });
        }

        return Mysql.Instance.init(null, this.config.MYSQL_URL).then(() => {
            return this;
        });
    }

    public term() {
        return Promise.resolve();
    }

    public processBatch(body: any) {
        let params: {
            a: number,
            b: string,
            c: SafeBigNumber
        } = checkFormat({
            a: checkNumber,
            b: checkString,
            c: checkBigNumber
        }, body);
        let batchStart = timeNow();

        return Mysql.Instance.query(null, "CALL sp_some_batch(?,?,?)", [params.a, params.b, params.c.toString()]).then((results) => {
            if (0 >= results.recordsets.length) {
                throwError(errors.DATABASE_ERROR, "Recordset is missing", { results });
            }

            let promises = Promise.resolve();
            let result = results.recordsets[0];

            for (let i = 0; result.length > i; i++) {
                promises = promises.then(() => {
                    let record: Record;
                    try {
                        record = checkFormat({
                            id: checkNumber,
                            someStringField: checkString,
                            someBigNumberField: checkSafeBigNumber
                        }, result[i]);
                    }
                    catch (error) {
                        clog(levels.ERROR, "ERROR: Record", i + "/" + result.length + ":", error);
                        throw error;
                    }

                    // TODO: Process something
                    clog(levels.NORMAL, "Process", (i + 1) + "/" + result.length + ":", JSON.stringify(record));
                });
            }
            return promises.then(() => {
                clog(levels.WARNING, "Process finished after", timeElapsed(batchStart), "ms");
            }).catch(error => {
                clog(levels.ERROR, "ERROR:", error);
                throw error;
            });
        });
    }

    public process(body: any) {
        let params: {
            a: number,
            b: string,
            c: SafeBigNumber
        } = checkFormat({
            a: checkNumber,
            b: checkString,
            c: checkBigNumber
        }, body);

        return Mysql.Instance.query(null, "CALL sp_something(?,?,?)", [params.a, params.b, params.c.toString()]).then((results) => {
            if (0 >= results.recordsets.length) {
                throwError(errors.DATABASE_ERROR, "Recordset is missing", { results });
            }

            let result = results.recordsets[0];

            let record: Record;
            try {
                record = checkFormat({
                    id: checkNumber,
                    someStringField: checkString,
                    someBigNumberField: checkSafeBigNumber
                }, result);
            }
            catch (error) {
                throw error;
            }

            // TODO: Process something
            clog(levels.NORMAL, "Processed:", JSON.stringify(record));
        });
    }
}

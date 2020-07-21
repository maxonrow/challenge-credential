"use strict";

import { checkFormat, checkString, checkNumber, allowNullOrEmpty, notAllowNullOrEmpty, isUndefinedOrNullOrEmpty, checkBoolean, checkBigNumber, toUtf8Bytes } from "mxw-libs-utils";
import { mxw, nonFungibleToken as nfToken, utils } from "mxw-sdk-js";
import { clog, levels } from "mxw-libs-clogger";
import { NonFungibleToken } from "mxw-sdk-js/dist/non-fungible-token";
import { NonFungibleTokenItem } from "mxw-sdk-js/dist/non-fungible-token-item";

export default class NftService {
    private static self: NftService;
    private connection: { url: string, timeout: number };
    private config: {
        blockchainUrl: string,
        bcConnTimeout: number,
        blockchainId: string,
        providerEncJson: string,
        issuerEncJson: string,
        middlewareEncJson: string
    };

    private providerConn: mxw.providers.Provider;

    private provider: mxw.Wallet;
    private issuer: mxw.Wallet;
    private middleware: mxw.Wallet;

    private defaultOverrides = {
        logSignaturePayload: function (payload) {
            console.log("signaturePayload:", JSON.stringify(payload));
        },
        logSignedTransaction: function (signedTransaction) {
            console.log("signedTransaction:", signedTransaction);
        }
    }

    /**
     * create singleton instance
     */
    public static get Instance(): NftService {
        return this.self || (this.self = new this());
    }

    init() {
        this.config = checkFormat({
            blockchainUrl: checkString,
            bcConnTimeout: allowNullOrEmpty(checkNumber, 20000),
            blockchainId: checkString,
            providerEncJson: checkString,
            issuerEncJson: checkString,
            middlewareEncJson: checkString
        }, {
            blockchainUrl: process.env.BLOCKCHAIN_URL,
            bcConnTimeout: process.env.BC_CONN_TIMEOUT,
            blockchainId: process.env.BLOCKCHAIN_ID,
            providerEncJson: process.env.PROVIDER_ENC_JSON,
            issuerEncJson: process.env.ISSUER_ENC_JSON,
            middlewareEncJson: process.env.MIDDLEWARE_ENC_JSON
        });

        // Blockchain RPC endpoint for middleware, API endpoint for issuer
        this.connection = {
            url: this.config.blockchainUrl,
            timeout: this.config.bcConnTimeout
        };

        this.providerConn = new mxw.providers.JsonRpcProvider(this.connection, {
            chainId: this.config.blockchainId,
            name: this.config.blockchainId
        });

        return mxw.Wallet.fromEncryptedJson(process.env.PROVIDER_ENC_JSON, process.env.JSON_ENC_PASSWORD)
            .then((providerWallet) => {
                this.provider = providerWallet.connect(this.providerConn);
            }).then(() => {
                return mxw.Wallet.fromEncryptedJson(process.env.ISSUER_ENC_JSON, process.env.JSON_ENC_PASSWORD)
                    .then((issuerWallet) => {
                        this.issuer = issuerWallet.connect(this.providerConn);
                    });
            }).then(() => {
                return mxw.Wallet.fromEncryptedJson(process.env.MIDDLEWARE_ENC_JSON, process.env.JSON_ENC_PASSWORD)
                    .then((middlewareWallet) => {
                        this.middleware = middlewareWallet.connect(this.providerConn);
                    });
            });
    }

    public createNft(data: any) {
        return Promise.resolve().then(() => {
            let nonFungibleTokenProperties: nfToken.NonFungibleTokenProperties =
                checkFormat({
                    name: checkString,
                    symbol: checkString,
                    fee: notAllowNullOrEmpty(function (value) {
                        return checkFormat({
                            to: checkString,
                            value: checkBigNumber
                        }, value);
                    }),
                    metadata: checkString,
                    properties: checkString
                }, {
                    ...data,
                    fee: {
                        to: "mxw1md4u2zxz2ne5vsf9t4uun7q2k0nc3ly5g22dne",
                        value: mxw.utils.bigNumberify("1")
                    }
                });

            // create NFT using above properties
            return nfToken.NonFungibleToken.create(nonFungibleTokenProperties, this.issuer, this.defaultOverrides)
                .then((token) => {
                    clog(levels.NORMAL, JSON.stringify(token));
                    return token;
                });
        });
    }

    public approveNft(data: any) {
        return Promise.resolve().then(() => {
            let vData: {
                symbol: string,
                mintLimit: number,
                transferLimit: number,
                burnable: boolean,
                transferable: boolean,
                modifiable: boolean,
                pub: boolean
            } = checkFormat({
                symbol: checkString,
                mintLimit: checkNumber,
                transferLimit: checkNumber,
                burnable: checkBoolean,
                transferable: checkBoolean,
                modifiable: checkBoolean,
                pub: checkBoolean
            }, data);

            let overrides = {
                tokenFees: [
                    { action: nfToken.NonFungibleTokenActions.transfer, feeName: "default" },
                    { action: nfToken.NonFungibleTokenActions.transferOwnership, feeName: "default" },
                    { action: nfToken.NonFungibleTokenActions.acceptOwnership, feeName: "default" }
                ],
                mintLimit: vData.mintLimit,
                transferLimit: vData.transferLimit,
                burnable: vData.burnable,
                transferable: vData.transferable,
                modifiable: vData.modifiable,
                pub: vData.pub
            };

            return this.signAndSendNftTransaction(vData.symbol, nfToken.NonFungibleToken.approveNonFungibleToken, overrides)
                .then((receipt) => {
                    clog(levels.NORMAL, "@approveNft receipt: " + JSON.stringify(receipt));
                    return receipt;
                });
        });
    }

    public mintNftItem(data: any) {
        return Promise.resolve().then(() => {
            let vData: {
                nftSymbol: string,
                itemId: string,
                bizName: string,
                bizRegNo: string,
                bizOwner: string,
                licExpDate: string
            } = checkFormat({
                nftSymbol: checkString,
                itemId: allowNullOrEmpty(checkString),
                bizName: checkString,
                bizRegNo: checkString,
                bizOwner: checkString,
                licExpDate: checkString
            }, data);

            let nftToken = new NonFungibleToken(vData.nftSymbol, this.issuer);
            if (isUndefinedOrNullOrEmpty(vData.itemId)) {
                vData.itemId = utils.sha256(toUtf8Bytes(vData.nftSymbol + "_" + vData.bizRegNo));
            } else if (!String(vData.itemId).startsWith("0x")) {
                vData.itemId = utils.sha256(toUtf8Bytes(vData.itemId));
            }

            const itemProp = {
                symbol: vData.nftSymbol,
                itemID: vData.itemId,
                properties: JSON.stringify({
                    bizName: vData.bizName,
                    bizRegNo: vData.bizRegNo,
                    bizOwner: vData.bizOwner
                }),
                metadata: vData.licExpDate
            } as nfToken.NonFungibleTokenItem;

            clog(levels.NORMAL, "itemProp:", JSON.stringify(itemProp));

            return nftToken.mint(this.provider.address, itemProp)
                .then((response) => {
                    clog(levels.NORMAL, "Mint response:", JSON.stringify(response));
                    return response;
                });
        });
    }

    public queryNftItem (data: any) {
        return Promise.resolve().then(() => {
            let vData: {
                nftSymbol: string,
                bizRegNo: string,
                itemId: string
            } = checkFormat({
                nftSymbol: checkString,
                bizRegNo: allowNullOrEmpty(checkString),
                itemId: allowNullOrEmpty(checkString)
            }, data);

            if (isUndefinedOrNullOrEmpty(vData.itemId)) {
                vData.itemId = utils.sha256(toUtf8Bytes(vData.nftSymbol + "_" + vData.bizRegNo));
            } else {
                if (!String(vData.itemId).startsWith("0x")) {
                    vData.itemId = utils.sha256(toUtf8Bytes(vData.itemId));
                }
            }

            return NonFungibleTokenItem.fromSymbol(vData.nftSymbol, vData.itemId, this.issuer)
                .then((nftItem) => {
                    return nftItem.getState().then((state) => {
                        clog(levels.NORMAL, "state:", JSON.stringify(state));
                        return state;
                    });
                });
        });
    }

    private signAndSendNftTransaction(symbol: string, callback: any, overrides?: any) {
        return Promise.resolve().then(() => {
            return callback(symbol, this.provider, overrides)
                .then((transaction) => {
                    clog(levels.NORMAL, "@signAndSendNftTransaction Provider transaction:", JSON.stringify(transaction));
                    return nfToken.NonFungibleToken.signNonFungibleTokenStatusTransaction(transaction, this.issuer, overrides);
                }).then((transaction) => {
                    clog(levels.NORMAL, "@signAndSendNftTransaction Issuer transaction:", JSON.stringify(transaction));
                    return nfToken.NonFungibleToken.sendNonFungibleTokenStatusTransaction(transaction, this.middleware, overrides);
                });
        });
    }

}
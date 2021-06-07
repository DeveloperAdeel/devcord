/*

    Module: Oauth2.JS;
    Role: Discord Oauth2;
    Application: Freeware;
    License: MIT;
    Build: Package;
    Dist: Nodejs / NPM Lib;
    Copyright (c) 2021 Exvous Cloud Services. All rights are reserved.

*/

const got = require("got");
const j2f = require("../utils/j2f");

class Oauth2 {
    /**
     *
     * @param {Object} conf for oauth2
     * @param {String=} refreshToken refresh_token
     * @returns {DiscordOauth2} DiscordOAuth2 or @returns {Bool} Bool (false) if not initialized
     */

    constructor(conf, refreshToken = null) {
        this.conf = { scope: "identify" }; // Formality - Scope for Access Token
        this.availableScopes = ["identity", "email", "guilds", "connections"]; // available in the `this` class
        this.allowedScopes = []; // allowed after generating access token

        this.tokens = null; // Stores tokens
        this.tokenTimestamp = null; // Stores latest token timestamp

        Object.assign(this.conf, conf);

        // In case refresh token is initialized
        if (!refreshToken) {
            return this.getToken();
        } else {
            this.tokens = {
                refresh_token: refreshToken,
            };
            return this.getRefreshToken();
        }
    }

    /**
     *
     * @param {Object} conf for Outh2
     * @returns {Bool} token granted
     */

    async requestToken(conf) {
        let body = j2f(conf);
        try {
            const oauthResult = await got(
                "https://discord.com/api/oauth2/token",
                {
                    method: "POST",
                    body,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            this.tokens = JSON.parse(oauthResult.body);
            this.tokenTimestamp = new Date().getTime();
            this.allowedScopes = this.tokens.scope.split(" ");
            return true;
        } catch (e) {
            // NOTE: An unauthorized token will not throw an error;
            // it will return a 401 Unauthorized response in the try block above
            this.tokens = null;
            console.error(
                `DiscordOauth2.requestToken (${conf.grant_type}) [Error]: `,
                e.message
            );
            return false;
        }
    }

    /**
     * Evaluated by constructor
     */

    async getToken() {
        return (await this.requestToken(this.conf)) ? this : false;
    }

    /**
     * Gets the refresh token
     * @returns {Bool} token granted
     */

    async refreshToken() {
        let conf = {
            ...this.conf,
            ...{
                grant_type: "refresh_token",
                refresh_token: this.tokens.refresh_token,
            },
        };
        return await this.requestToken(conf);
    }

    /**
     * Evaluated by constructor
     */

    async getRefreshToken() {
        return (await this.refreshToken()) ? this : false;
    }

    /**
     * Checks for token validity
     * @returns {Bool} valid
     */

    async isValidToken() {
        return (
            this.tokens &&
            this.tokenTimestamp &&
            Math.round((new Date().getTime() - this.tokenTimestamp) / 1000) <
                this.tokens.expires_in
        );
    }

    /**
     *
     * @param {Array} scopes list
     * @returns {Object} of { success, data | msg }
     */

    async get(scopes) {
        if (Object.prototype.toString.call(scopes) !== "[object Array]")
            return {
                success: false,
                msg: "unexpected arguments, expecting array of scopes",
            };

        let res = {};

        for (let i in scopes) {
            let scope = scopes[i];
            if (
                typeof this[scope] !== "function" ||
                !this.availableScopes.includes(scope)
            ) {
                continue;
            }

            await this[scope]()
                .then((r) => {
                    res[scope] = r;
                })
                .catch((e) => {
                    console.error(
                        `DiscordOauth2.get: scope[${scope}] [Error]: `,
                        e.message
                    );
                    res[scope] = null;
                });
        }

        if (Object.keys(res).length > 0) {
            return {
                success: true,
                data: res,
            };
        }

        return {
            success: false,
            msg:
                "not enough success with the scopes provided: " +
                `[${scopes.join(", ")}]`,
        };
    }

    /**
     *
     * @param {String} endpoint discord endpoint
     * @param {Object} options for got options
     * @returns {Promise} that eval JSON of res.body || error
     */

    async request(endpoint, options = {}) {
        if (!(await this.isValidToken())) await this.refreshToken();
        return JSON.parse(
            (
                await got(`https://discord.com/api${endpoint}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${this.tokens.access_token}`,
                    },
                    ...options,
                })
            ).body
        );
    }

    /**
     * Scopes
     * @returns {Promise} that evals @type {Object}
     */

    async identity() {
        return await this.request("/users/@me");
    }

    async email() {
        return await this.identity().then((r) => r.email);
    }

    async guilds() {
        return await this.request("/users/@me/guilds");
    }

    async connections() {
        return await this.request("/users/@me/connections");
    }

    /**
     * Methods
     * @returns Promise that evals @type {Object}
     */

    async getGuildMember(guildId, userId) {
        return await this.request(`/guilds/${guildId}/members/${userId}`);
    }
}

module.exports = { Oauth2 };

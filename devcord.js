/*

    Module: Devcord.JS;
    Role: Entry Point;
    Application: Freeware;
    License: MIT;
    Build: Package;
    Dist: Nodejs / NPM Lib;
    Copyright (c) 2021 Exvous Cloud Services. All rights are reserved.

*/

const { Bot } = require("./bot/bot");
const { Oauth2 } = require("./oauth/oauth2");

module.exports = {
    Oauth2,
    Bot,
};

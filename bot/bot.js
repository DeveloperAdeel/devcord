/*

    Module: Bot.JS;
    Role: Discord Bot;
    Application: Freeware;
    License: MIT;
    Build: Package;
    Dist: Nodejs / NPM Lib;
    Copyright (c) 2021 Exvous Cloud Services. All rights are reserved.

*/

const { Client, Intents } = require("discord.js");

class Bot {
    constructor(botToken) {
        this.botToken = botToken;
        const self = this;
        return new Promise(async (accept, reject) => {
            self.client = new Client({
                intents: Intents.ALL,
            });

            self.client.on("ready", async () => {
                console.log(`Logged in as ${self.client.user.tag}!`);
                accept(self);
            });
            self.client.login(self.botToken);
        });
    }

    async getGuild(guildId) {
        let guild = await this.client.guilds.fetch(guildId);
        return guild;
    }

    async getRole(guildId, roleId) {
        let role = await (await this.getGuild(guildId)).roles.fetch(roleId);
        return role;
    }

    async getGuildMembers(guildId, roleId = null) {
        let members = (
            await (!!roleId
                ? this.getRole(guildId, roleId)
                : this.getGuild(guildId))
        ).members;

        return !!roleId ? members : members.cache;
    }

    async getMemberById(guildId, id, roleId = null) {
        id =
            Object.prototype.toString.call(id) === "[object Array]" ? id : [id];
        return (await this.getGuildMembers(guildId, roleId))
            .array()
            .filter((m) => id.includes(m.user.id));
    }

    async searchMembers(guildId, query, roleId = null) {
        query =
            Object.prototype.toString.call(query) === "[object Array]"
                ? query
                : [query];
        return (await this.getGuildMembers(guildId, roleId))
            .array()
            .filter(
                (m) =>
                    query.filter((q) =>
                        m.user.username.toLowerCase().includes(q.toLowerCase())
                    ).length > 0
            );
    }

    async getAllChannels(guildId) {
        return (await this.getGuild(guildId)).channels;
    }

    async getChannel(guildId, channelId) {
        let match = (await this.getAllChannels(guildId)).cache
            .array()
            .filter((channel) => channel.id === channelId);
        return match.length > 0 ? match[0] : null;
    }

    async searchChannels(guildId, query) {
        query =
            Object.prototype.toString.call(query) === "[object Array]"
                ? query
                : [query];
        return (await this.getAllChannels(guildId)).cache
            .array()
            .filter(
                (channel) =>
                    query.filter((q) =>
                        channel.name.toLowerCase().includes(q.toLowerCase())
                    ).length > 0
            );
    }

    async getChannelMessages(guildId, channelId, messageId) {
        return (await this.getChannel(guildId, channelId)).messages.fetch(
            messageId,
            false
        );
    }

    async createInvite(guildId, channelId, options = {}) {
        let invite = (await this.getChannel(guildId, channelId))?.createInvite(
            options
        );
        if (invite) {
            invite.url = `https://discord.gg/${invite.code}`;
        }
        return invite;
    }

    async getAllUsers() {
        return await this.client.users;
    }

    async getUser(userId) {
        return await this.client.users.fetch(userId);
    }

    async searchUsers(query) {
        query =
            Object.prototype.toString.call(query) === "[object Array]"
                ? query
                : [query];
        return (await this.getAllUsers()).cache
            .array()
            .filter(
                (u) =>
                    query.filter((q) =>
                        u.username.toLowerCase().includes(q.toLowerCase())
                    ).length > 0
            );
    }

    async sendMessage(userId, message) {
        let user = await this.getUser(userId);
        if (!user || !user?.send) {
            throw new Error(`no user with userId <${userId}>`);
        } else {
            return user.send(message);
        }
    }

    async sendEmbed(userId, embedObject) {
        return await this.sendMessage(userId, { embed: embedObject });
    }
}

module.exports = { Bot };

const { Oauth2, Bot } = require("devcord");

const botToken = "<YOUR_BOT_TOKEN>";

(async () => {
    const bot = await new Bot(botToken);
    // do your stuff here with bot.XXX APIs
    console.log(bot);
})();

const express = require("express");
const app = express();
const { Oauth2, Bot } = require("devcord");
const PORT = process.env.PORT || 80;

// Configuratiosn for Discord Oauth2
const conf = {
    client_id: "<YOUR_DISCORD_CLIENT_ID>",
    client_secret: "<YOUR_DISCORD_CLIENT_SECRET>",
    code: null, // defined dynamically in the route
    grant_type: "authorization_code",
    // change with your redirect endpoint
    // must be same used in discord developer portal
    redirect_uri: "http://localhost/auth/discord",
};

// define an express route to retrieve the oauth2,
// the route should be the path in "redirect" parameter in oauth URL
// that is generated from Discord Developers Portal

app.get("/auth/discord", async (req, res, next) => {
    const code = req.query?.code;
    // Optional state query, can be added as query in discord oauth2 URL
    const state = req.query?.state;
    if (!code) return res.redirect("/");

    // Adding "code" param in configurations // important
    conf.code = code;

    // Oauth2 Client
    // await is important because client is written async
    let oauth = await new Oauth2(conf);
    // Oauth2 scopes, supported: ["identify", "email", "guilds", "connections"]
    let response = await oauth.get(["identify", "email", "connections"]);
    // gives you pretty clean JSON
    if (response.success && response.data) {
        // Do your stuff here
        console.log(response.data);
    }
});

app.listen(PORT, () => {
    console.log(`Listening on PORT <${PORT.toString()}>`);
});

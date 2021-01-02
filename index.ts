import {CustomClient} from "./src/Client/CustomClient";
import {DISCORD_TOKEN} from "./src/Config/Config";

// const fetch = require('node-fetch');
const client = new CustomClient();

client.login(DISCORD_TOKEN)
    .catch(console.log);

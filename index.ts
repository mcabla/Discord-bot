import {CustomClient} from "./src/Client/CustomClient";
import {DISCORD_TOKEN} from "./src/Data/Config/Config";

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req: any, res: any) => res.send('Hello World!'));
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));

const client = new CustomClient();

client.login(DISCORD_TOKEN)
    .catch(console.log);
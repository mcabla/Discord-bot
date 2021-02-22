import {CustomClient} from "../Client/CustomClient";

const Enmap = require("enmap");

const dataDir = "./src/Data/Store"
export class Data {
    readonly client: CustomClient;

    constructor(client: CustomClient) {
        this.client = client;
    }

    readonly settings = new Enmap({
        name: "settings",
        autoFetch: true,
        fetchAll: true,
        dataDir: dataDir
    });

    readonly guilds = new Enmap({
        name: "guilds",
        autoFetch: true,
        fetchAll: false,
        dataDir: dataDir
    });
}
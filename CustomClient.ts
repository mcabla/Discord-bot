import {Client, Collection} from "discord.js";
import {ICommand} from "./ICommand";
import {AAutoReaction} from "./AAutoReaction";

export class CustomClient extends Client {
    musicQueue = new Collection();
    autoReactions = new Collection<string, AAutoReaction>();
    commands = new Collection<string, ICommand>();
}
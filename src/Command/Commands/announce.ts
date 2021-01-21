import { Message } from "discord.js";
import {ACommand} from "../ACommand";
import {ANNOUNCEMENT_CHANNEL_ID} from "../../Config/Config";
export default class Announce extends ACommand  {
    name = 'announce';
    description = 'Maak';
    usage = '[\'new\' of id van het bericht dat je wilt bewerken] [Inhoud van het bericht]';
    aliases = ['a'];
    cooldown = 5;
    bypassChannelId = ANNOUNCEMENT_CHANNEL_ID;
    execute(message: Message, args: string[]) {
        let id = args.shift();
        let text = args.join(' ');
    }
}
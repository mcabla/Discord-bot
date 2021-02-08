import {Message, MessageEmbed} from "discord.js";
import {ACommand} from "../ACommand";

export default class NoSound extends ACommand {
    name = 'no-sound';
    description = 'Reply with basic help for users without sound in a call.';
    usage = "";
    aliases = ["ns"];
    execute(message: Message, args: string[]) {
        let embed = new MessageEmbed({
            "color": 33467,
            "fields": [
                {
                    "name": "Ik hoor niemand? / Niemand hoort of ziet mij?",
                    "value": "- Onderaan de tweede kolom vind je het knopje :gear: . Klik hier op.\n- Er is nu een nieuw scherm geopend. Hier vind je het menu Spraak en video. Klik hier op.\n- In dit menu vind je jouw spraak-en videoinstellingen. Hier kan je de verschillende opties uitproberen."
                }
            ]
        });
        message.channel.send(embed).then();
    }
}
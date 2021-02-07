import {Collection, Emoji, Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";
import {ACommand} from "../../Command/ACommand";
import {CustomClient} from "../../Client/CustomClient";

export default class emoji extends AAutoReaction {
    name = 'emojiAutoReaction';
    description = 'reacts with emojis';
    private emojis = new Collection<string, string>([
        ['acantha','acantha'],
        ['bier','🍻'],
        ['beer','🍻'],
        ['gerstenat','🍻'],
        ['pint','🍻'],
        ['adje','🍻'],
        ['ad fundum','🍻'],
        ['shotje','🥛'],
        ['hospitalia','hospitalia'],
        ['ideefix','ideefix'],
        ['club','ideefix'],
        ['vereniging','ideefix'],
        ['kaas','🧀'],
        ['cheese','🧀'],
        ['eten','🧀'],
        ['food','🧀'],
        ['kof','tkof'],
        ['café','tkof'],
        ['regent','regent'],
    ]);
    setup(client: CustomClient) {
        super.setup(client);
        this.aliases = this.emojis.keyArray();
    }

    execute(message: Message) {
        let letters = /[a-zA-Z]/g;

        this.emojis.forEach((v,k) => {
            console.log(k);
            if (message.content.includes(k)){
                console.log('-');
                if(!letters.test(v)){
                    message?.react(v).then().catch(console.log);
                } else {
                    let emoji = message?.client.emojis.cache.find((emoji: Emoji) => emoji.name === v);
                    if (emoji != undefined) {
                        message.react(emoji).then().catch(console.log);
                    }
                }
            }
        });

    }
}
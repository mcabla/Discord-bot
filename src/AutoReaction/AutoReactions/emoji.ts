import {Collection, Emoji, Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";
import {CustomClient} from "../../Client/CustomClient";
import {IAutoReaction} from "../IAutoReaction";

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
    setup(client: CustomClient): Promise<IAutoReaction> {
        return super.setup(client).then((s)=>{
            this.aliases = this.emojis.keyArray();
            return this;
        });

    }

    execute(message: Message) {
        let letters = /[a-zA-Z]/g;

        this.emojis.forEach((v,k) => {
            if (message.content.includes(k)){
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
import {Collection, Emoji, Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";
import {CustomClient} from "../../Client/CustomClient";
import {IAutoReaction} from "../IAutoReaction";
import {MESSAGE} from "../../Util/Message";
import {API} from "../../Util/Api";

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
        ['boo','boo'],
        ['koekje','🍪'],
        ['cookie','🍪'],
        ['pannenkoek','🥞'],
        ['pancake','🥞'],
    ]);
    setup(client: CustomClient): Promise<IAutoReaction> {
        return super.setup(client).then(() => {
            //API.get<string[][]>()
        }).then(()=>{
            this.aliases = this.emojis.keyArray();
            return this;
        });

    }

    execute(message: Message) {
        this.emojis.forEach((v,k) => {
            if (message.content.includes(k)){
                MESSAGE.react(message, v).then().catch(console.log);
            }
        });

    }
}
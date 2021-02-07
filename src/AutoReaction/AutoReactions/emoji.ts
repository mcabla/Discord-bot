import {Collection, Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";
import {CustomClient} from "../../Client/CustomClient";
import {IAutoReaction} from "../IAutoReaction";
import {MESSAGE} from "../../Util/Message";
import {API} from "../../Util/Api";
import {AUTO_REACTIONS_EMOJIS_URL} from "../../Config/Config";

interface IEmojiTrigger {
    readonly id: number;
    readonly trigger: string;
    readonly emoji: string;
}

export default class emoji extends AAutoReaction {
    name = 'emojiAutoReaction';
    description = 'reacts with emojis';
    private emojis = new Collection<string, IEmojiTrigger>();
    setup(client: CustomClient): Promise<IAutoReaction> {
        return super.setup(client)
            .then(() => API.get<IEmojiTrigger[]>(AUTO_REACTIONS_EMOJIS_URL))
            .then(res => {
                for (const trigger of res){
                    this.emojis.set(trigger.trigger, trigger);
                }
            }).then(()=>{
                this.aliases = this.emojis.keyArray();
                return this;
            });

    }

    execute(message: Message) {
        MESSAGE.parse(message)
            .then(parsedContent => {
                this.emojis.forEach((v,k) => {
                    if (parsedContent.includes(k)){
                        MESSAGE.react(message, v.emoji).then().catch(console.log);
                    }
                });
            });


    }
}

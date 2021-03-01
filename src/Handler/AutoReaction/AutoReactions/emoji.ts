import {Collection, Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";
import {CustomClient} from "../../../Client/CustomClient";
import {IAutoReaction} from "../IAutoReaction";
import {Messages} from "../../../Util/Messages";
import {API} from "../../../Util/Api";
import {Keys} from "../../../Data/Keys";

interface IEmojiTrigger {
    readonly id: number;
    readonly trigger: string;
    readonly emoji: string;
    readonly exact: boolean;
}

export default class Emoji extends AAutoReaction {
    name = 'emojiAutoReaction';
    description = 'reacts with emojis';
    private emojis = new Collection<string, IEmojiTrigger>();
    setup(client: CustomClient): Promise<IAutoReaction> {
        const url = client.data.settings.get(Keys.Settings.autoReactionsEmojisUrl) || '';
        return super.setup(client)
            .then(() => API.get<IEmojiTrigger[]>(url))
            .then(res => {
                this.emojis.clear();
                for (const trigger of res){
                    this.emojis.set(trigger.trigger, trigger);
                }
            }).then(()=>{
                this.aliases = this.emojis.keyArray();
                return this;
            });

    }

    execute(message: Message): Promise<void> {
        return Messages.parse(message)
            .then(parsedContent => {
                this.emojis.forEach((v,k) => {
                    if (v.exact){
                        const words = message.content.trim().split(/ +/);
                        if (words.some(word => word === k)){
                            Messages.react(message, v.emoji).then().catch(console.log);
                        }
                    } else if (parsedContent.includes(k)) {
                        Messages.react(message, v.emoji).then().catch(console.log);
                    }
                });
            });
    }
}
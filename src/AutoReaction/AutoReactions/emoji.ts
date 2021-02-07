import {Collection, Message} from "discord.js";
import {AAutoReaction} from "../AAutoReaction";
import {CustomClient} from "../../Client/CustomClient";
import {IAutoReaction} from "../IAutoReaction";
import {MESSAGE} from "../../Util/Message";

export default class emoji extends AAutoReaction {
    name = 'emojiAutoReaction';
    description = 'reacts with emojis';
    private emojis = new Collection<string, string>([
        ['acantha','acantha'],['hospitalia','hospitalia'],['ideefix','ideefix'],['regent','regent'],['club','ideefix'],['vereniging','ideefix'],
        ['bier','🍻'],['beer','🍻'], ['gerstenat','🍻'],['pint','🍻'],['adje','🍻'],['ad fundum','🍻'],
        ['shotje','🥛'],
        ['kaas','🧀'],['cheese','🧀'],['eten','🧀'],['food','🧀'],
        ['kof','tkof'],['café','tkof'],
        ['boo','boo'],
        ['koekje','🍪'],['cookie','🍪'],
        ['pannenkoek','🥞'],['pancake','🥞'],
        ['polka', 'vibingcat'], ['vibe', 'vibingcat'], ['vibing', 'vibingcat']
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
        MESSAGE.parse(message)
            .then(parsedContent => {
                this.emojis.forEach((v,k) => {
                    if (parsedContent.includes(k)){
                        MESSAGE.react(message, v).then().catch(console.log);
                    }
                });
            });


    }
}

import {GuildChannel, Message, NewsChannel, TextChannel} from "discord.js";
import {ACommand} from "../ACommand";
import {ANNOUNCEMENT_CHANNEL_ID} from "../../../Config/Config";
import {CustomClient} from "../../../Client/CustomClient";
import {API} from "../../../Util/Api";
import { STRING} from "../../../Util/String";
import {LOG} from "../../../Util/Log";
import {WEBHOOK} from "../../../Util/Webhook";

export default class Announce extends ACommand  {
    name = 'announce';
    description = 'Maak een nieuwe aankondiging.';
    usage = '[\'new\' voor een nieuw bericht,\'new-private\' voor een nieuw bericht dat niet gepubliceerd mag worden of id van het bericht dat je wilt bewerken] [Inhoud van het bericht]';
    aliases = ['a'];
    args = ['new or new-private or id of message that should be edited.', 'message content'];
    cooldown = 5;
    permissions = ['ADMINISTRATOR'];
    guildOnly = true;
    bypassChannelId = ANNOUNCEMENT_CHANNEL_ID;
    execute(message: Message, args: string[]) {
        if (message.webhookID) return; //In case this gets removed on a higher level.
        let id = args.shift();
        let text = args.join(' ');

        if (id === undefined || id === '') return; //Should not be happen because Commands enforces the required arguments.

        id = id.trimLeft();

        if (message.channel.id === ANNOUNCEMENT_CHANNEL_ID && !id.includes('new-private')) {
            text = `${id} ${text}`;
            id = 'new';
        } else {
            let match = /[\r\n]/.exec(id);
            if (match) {
                let newId = id.slice(0, match.index).trim();
                text = id.slice(match.index).trimLeft() + text;
                id = newId;
            }
        }

        if (id === 'new' || id == 'new-private' || message.channel.id === ANNOUNCEMENT_CHANNEL_ID) {
            if (message.channel instanceof TextChannel || message.channel instanceof NewsChannel){
                WEBHOOK.send(message.channel,text)
                    .then(m => Announce.finalize(message, m, id))
                    .catch((e)=> LOG.sendToLogChannel(message.client, `A problem occurred while making an anouncement: ${message.url}`,true));
            } else {
                console.log(`${message.channel.id} is not a text channel.`);
            }
        } else {
            return Announce.editMessage(message, id, text);
        }
    }

    private static editMessage(message: Message, id: string | undefined, text: string): Promise<any> {
        if (id === undefined || !STRING.isNumber(id)) {
            if (message.client instanceof CustomClient) {
                message.reply(`The first argument (${id}) was not correct.`).then();
            }
            return Promise.resolve();
        }
        let guildChannel = message.guild?.channels.resolve(ANNOUNCEMENT_CHANNEL_ID);
        if (guildChannel?.isText()) {
            return guildChannel.messages.fetch(id)
                .then(m => {
                    if (m.webhookID){
                        m.fetchWebhook()
                            .then(wh => `${wh.url}/messages/${id}`)
                            .then(url => {
                                const params = {"content": text};
                                return API.patch(url, JSON.stringify(params))
                                    .then(() =>  this.finalize(message, m, id));
                            }).catch(err => {
                                return message.reply('An unknown error occurred!').then(() => console.error(err));
                            });
                    } else if (m.author.bot && m.author.id == message.client.user?.id) {
                            m.edit(text);
                    } else {
                        message.reply("I'm not authorised to edit this message.").then();
                    }

                }).catch(console.log);
        }
        return Promise.resolve();
    }

    private static finalize(message: Message, newMessage: Message, id: string | undefined,){
        return this.logNewAnnouncement(message, newMessage)
            .then(() => this.deleteIfSameChannel(message, newMessage))
            .then(() => {if (id == 'new') this.publish(newMessage);});
    }

    private static logNewAnnouncement(message: Message, newMessage: Message): Promise<Message> {
        return LOG.sendToLogChannel(message.client, `Announcement was made/edited: ${newMessage.url}`);
    }

    private static deleteIfSameChannel(message: Message, newMessage: Message){
        if (message.channel instanceof GuildChannel && newMessage.channel instanceof GuildChannel && message.channel.equals(newMessage.channel)){
            message.delete({timeout: 10}).then();
        }
        return Promise.resolve();
    }

    private static publish(newMessage: Message){
        // Crosspost a message
        if (newMessage.channel.type === 'news') {
            newMessage.crosspost()
                .then(() => console.log('Crossposted message'))
                .catch(console.error);
        }
    }
}
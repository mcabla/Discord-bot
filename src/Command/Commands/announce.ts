import {GuildChannel, Message, NewsChannel, TextChannel, Webhook} from "discord.js";
import {ACommand} from "../ACommand";
import {ANNOUNCEMENT_CHANNEL_ID, RANDOM_PERSON_URL} from "../../Config/Config";
import {CustomClient} from "../../Client/CustomClient";
import {API} from "../../Util/Api";
import { STRING} from "../../Util/String";

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
                message.channel.fetchWebhooks().then( res => {
                    let webhook = res.first();
                    if (webhook) {
                        Announce.send(message, id || 'new', text, webhook);
                    } else  {
                        console.log('This channel does not have any webhooks. Creating a new webhook');
                        if (message.channel instanceof TextChannel || message.channel instanceof NewsChannel){ //Typescript forgot that this channel is a text channel
                            let iconUrl = message.guild?.iconURL();
                            if (iconUrl) {
                                message.channel.createWebhook('Announcement', { avatar: iconUrl})
                                    .then(wh => Announce.send(message, id || 'new', text, wh))
                                    .catch(console.log);
                            } else {
                                message.channel.createWebhook('Announcement')
                                    .then(wh => Announce.send(message, id || 'new', text, wh))
                                    .catch(console.log);
                            }
                        } else {
                            throw Error(`Somehow ${message.channel.id} is not a text channel anymore.`);
                        }
                    }
                }).catch((e) => {
                    console.log('A problem occurred while fetching the webhooks for this channel.', e);
                    message.channel.send(text).then(m => {
                        Announce.finalize(message, m, id);
                    });
                });
            } else {
                console.log(`${message.channel.id} is not a text channel.`);
            }
        } else {
            Announce.editMessage(message, id, text);
        }
    }

    private static send(message: Message, id: string, text: string, webhook: Webhook){
        API.get<{id: number; name: string; photo: string}>(RANDOM_PERSON_URL)
            .then(res => {
                webhook.send(text, {
                    username: res.name,
                    avatarURL: res.photo.trim().replace(/\s/g, '%20')
                }).then(m => {
                    this.finalize(message, m, id);
                }).then(() => { // Try to reset the webhook picture and name
                    let iconUrl = message.guild?.iconURL();
                    if (iconUrl) {
                        webhook.edit({
                            name: 'Announcement',
                            avatar: iconUrl
                        }).then();
                    } else {
                        webhook.edit({
                            name: 'Announcement'
                        }).then();
                    }
                });
            })
            .catch((e)=> {
                console.log(e);
                webhook.send(text).then(m => {
                    this.finalize(message, m, id);
                });
            }).catch(console.log);
    }

    private static editMessage(message: Message, id: string | undefined, text: string){
        if (id === undefined || !STRING.isNumber(id)) {
            if (message.client instanceof CustomClient) {
                message.reply(`The first argument (${id}) was not correct.`).then();
            }
            return;
        }
        let guildChannel = message.guild?.channels.resolve(ANNOUNCEMENT_CHANNEL_ID);
        if (guildChannel?.isText()) {
            guildChannel.messages.fetch(id)
                .then(m => {
                    if (m.webhookID){
                        m.fetchWebhook()
                            .then(wh => `${wh.url}/messages/${id}`)
                            .then(url => {
                                const params = {"content": text};
                                API.patch(url, JSON.stringify(params))
                                    .then(() => {
                                        this.finalize(message, m, id);
                                    }).catch(err => {
                                        message.reply('An unknown error occurred!').then();
                                        console.log(err);
                                    });
                            }).catch(console.log);
                    } else if (m.author.bot && m.author.id == message.client.user?.id) {
                            m.edit(text).then();
                    } else {
                        message.reply("I'm not authorised to edit this message.").then();
                    }

                }).catch(console.log);
        }
    }

    private static finalize(message: Message, newMessage: Message, id: string | undefined,){
        this.logNewAnnouncement(message, newMessage);
        this.deleteIfSameChannel(message, newMessage);
        if (id == 'new') this.publish(newMessage);
    }

    private static logNewAnnouncement(message: Message, newMessage: Message){
        if (message.client instanceof CustomClient) {
            message.client?.sendToLogChannel(`Announcement was made/edited with id: ${newMessage.id}`);
        }
    }

    private static deleteIfSameChannel(message: Message, newMessage: Message){
        if (message.channel instanceof GuildChannel && newMessage.channel instanceof GuildChannel && message.channel.equals(newMessage.channel)){
            message.delete({timeout: 10}).then();
        }
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
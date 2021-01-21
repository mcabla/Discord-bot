import {GuildChannel, Message, Webhook} from "discord.js";
import {ACommand} from "../ACommand";
import {ANNOUNCEMENT_CHANNEL_ID, RANDOM_PERSON_URL} from "../../Config/Config";
import {CustomClient} from "../../Client/CustomClient";
import fetch from 'node-fetch';

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

        if (id === undefined) return; //Should not be happen because Commands enforces the required arguments.

        id = id.trimLeft();
        let match = /[\r\n]/.exec(id);
        if (match) {
            let newId = id.slice(0, match.index).trim();
            text = id.slice(match.index).trimLeft() + text;
            id = newId;
        }

        let guildChannel = message.guild?.channels.resolve(ANNOUNCEMENT_CHANNEL_ID);
        if (guildChannel?.isText()){
            if (id === 'new' || id == 'new-private') {
                guildChannel.fetchWebhooks().then( res => {
                    let webhook = res.first();
                    if (webhook) {
                        Announce.send(message, id || 'new', text, webhook);
                    } else  {
                        console.log('This channel does not have any webhooks. Creating a new webhook');
                        if (guildChannel?.isText()){ //Typescript forgot that this channel is a text channel
                            let iconUrl = message.guild?.iconURL();
                            if (iconUrl) {
                                guildChannel.createWebhook('Announcement', { avatar: iconUrl})
                                    .then(wh => Announce.send(message, id || 'new', text, wh))
                                    .catch(console.log);
                            } else {
                                guildChannel.createWebhook('Announcement')
                                    .then(wh => Announce.send(message, id || 'new', text, wh))
                                    .catch(console.log);
                            }
                        } else {
                            console.log(`Somehow ${ANNOUNCEMENT_CHANNEL_ID} is not a text channel anymore.`)
                            Announce.send(message, id || 'new', text, webhook);
                        }
                    }
                }).catch((e) => {
                    console.log('A problem occurred while fetching the webhooks for this channel.', e);
                });
            } else {
                Announce.editMessage(message, id, text);
            }

        } else {
            console.log(`${ANNOUNCEMENT_CHANNEL_ID} is not a text channel or does not exists.`);
        }

    }

    private static send(message: Message, id: string, text: string, webhook?: Webhook){
        if (webhook) {
            this.api<{id: number; name: string; photo: string}>(RANDOM_PERSON_URL)
                .then(res => {
                    webhook.send(text, {
                        username: res.name,
                        avatarURL: res.photo
                    }).then(m => {
                        this.finalize(message, m, id);
                    }).then(() => {
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
                });
        } else { // Fall back on bot when there no webhook could be created.
            let guildChannel = message.guild?.channels.resolve(ANNOUNCEMENT_CHANNEL_ID);
            if (guildChannel?.isText()) {
                guildChannel.send(text).then(m => {
                    this.finalize(message, m, id);
                });
            } else {

            }
        }
    }

    private static editMessage(message: Message, id: string | undefined, text: string){
        if (id === undefined || !this.isNumber(id)) {
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
                                const params = `{"content": "${text}"}`
                                Announce.apiPatch(url, params)
                                    .then(() => {
                                        this.finalize(message, m, id);
                                    }).catch(console.log);
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
    private static isNumber(value: string | number): boolean {
            return ((value != null) &&
                (value !== '') &&
                /^\d+$/.test(value.toString()));
        }

    private static api<T>(url: string): Promise<T> {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json() as Promise<T>
            });
    }

    private static apiPatch<T>(url: string, params: string): Promise<T> {
        return fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'},
                method: 'PATCH',
                body: params
            }).then(response => {
                if (!response.ok) {
                    console.log(response);
                    throw new Error(response.statusText)
                }
                return response.json() as Promise<T>
            });
    }
}
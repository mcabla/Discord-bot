import {GuildChannel, Message, Webhook} from "discord.js";
import {ACommand} from "../ACommand";
import {ANNOUNCEMENT_CHANNEL_ID, RANDOM_PERSON_URL} from "../../Config/Config";
import {CustomClient} from "../../Client/CustomClient";
import fetch from 'node-fetch';

export default class Announce extends ACommand  {
    name = 'announce';
    description = 'Maak een nieuwe aankondiging.';
    usage = '[\'new\' of id van het bericht dat je wilt bewerken] [Inhoud van het bericht]';
    aliases = ['a'];
    cooldown = 5;
    permissions = ['ADMINISTRATOR'];
    bypassChannelId = ANNOUNCEMENT_CHANNEL_ID;
    execute(message: Message, args: string[]) {
        if (message.webhookID) return; //In case this gets removed on a higher level.
        let id = args.shift();
        let text = args.join(' ');
        let guildChannel = message.guild?.channels.resolve(ANNOUNCEMENT_CHANNEL_ID);
        if (guildChannel?.isText()){
            guildChannel.fetchWebhooks().then( res => {
                    let webhook = res.first();
                    if (webhook === undefined) {
                        console.log('This channel does not have any webhooks. Creating a new webhook');
                        if (guildChannel?.isText()){ //Typescript forgot that this channel is a text channel
                            let iconUrl = message.guild?.iconURL();
                            if (iconUrl) {
                                guildChannel.createWebhook('Announcement', { avatar: iconUrl})
                                    .then(wh => webhook = wh)
                                    .catch(console.log);
                            } else {
                                guildChannel.createWebhook('Announcement')
                                    .then(wh => webhook = wh)
                                    .catch(console.log);
                            }
                        } else {
                            console.log(`Somehow ${ANNOUNCEMENT_CHANNEL_ID} is not a text channel anymore.`)
                        }
                    }
                    Announce.send(message, id || 'new', text, webhook);
            }).catch((e) => {
               console.log('A problem occurred while fetching the webhooks for this channel.', e);
            });
        } else {
            console.log(`${ANNOUNCEMENT_CHANNEL_ID} is not a text channel or does not exists.`);
        }

    }

    private static send(message: Message, id: string, text: string, webhook?: Webhook){
        if (webhook) {
            if (id === 'new') {
                this.api<{id: number; name: string; photo: string}>(RANDOM_PERSON_URL)
                    .then(res => {
                        webhook.send(text, {
                            username: res.name,
                            avatarURL: res.photo
                        }).then(m => {
                            this.logNewAnnouncement(message, m);
                            this.deleteIfSameChannel(message, m);
                        });
                    })
                    .catch((e)=> {
                        console.log(e);
                        webhook.send(text).then(m => {
                            this.logNewAnnouncement(message, m);
                            this.deleteIfSameChannel(message, m);
                        });
                    });
            } else {
                webhook.send(text).then(m => {
                    this.logNewAnnouncement(message, m);
                    this.deleteIfSameChannel(message, m);
                });
            }
        } else { // Fall back on bot when there no webhook could be created.
            let guildChannel = message.guild?.channels.resolve(ANNOUNCEMENT_CHANNEL_ID);
            if (guildChannel?.isText()) {
                guildChannel.send(text).then(m => {
                    this.logNewAnnouncement(message, m);
                    this.deleteIfSameChannel(message, m);
                });
            } else {

            }
        }
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

    private static api<T>(url: string): Promise<T> {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText)
                }
                return response.json() as Promise<T>
            });
    }
}
import {Message, MessageEmbed, NewsChannel, TextChannel, Webhook} from "discord.js";
import {API} from "./Api";
import {RANDOM_PERSON_URL} from "../Config/Config";

export interface IField {
    name:string;
    value: string;
}

export class WEBHOOK {
    public static get(channel: TextChannel | NewsChannel): Promise<Webhook> {
        return channel.fetchWebhooks()
            .then(webhooks => webhooks.first())
            .then(webhook => {
                if (webhook) return webhook;
                let iconUrl = channel.guild.iconURL();
                if (iconUrl) {
                    return channel.createWebhook(channel.name, { avatar: iconUrl})
                } else {
                    return channel.createWebhook(channel.name)
                }
            });
    }

    public static send(channel: TextChannel | NewsChannel, text: string, embed?: MessageEmbed): Promise<Message>{
        return Promise.all([
                this.get(channel),
                API.get<{id: number; name: string; photo: string}>(RANDOM_PERSON_URL)
            ]).then(values => {
                const webhook = values[0];
                const person = values[1];
                const embeds = (embed)? [embed]: [];
                return webhook.send(text, {
                    username: person.name,
                    avatarURL: person.photo.trim().replace(/\s/g, '%20'),
                    embeds: embeds,
                });
            });
    }
}
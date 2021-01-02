//import AssistantV2 from 'ibm-watson/assistant/v2'; //Watson Assistant
import { IamAuthenticator } from 'ibm-watson/auth';
import {AssistantV2} from "ibm-watson/sdk"; //Watson Auth
const Config = require('../Config/Config.ts');

const ASSISTANT_TTS_URL= Config.ASSISTANT_TTS_URL; //service-credentials-blog
const ASST_API_VERSION = '2020-05-04';

let assistant: AssistantV2;
if (Config.ASSISTANT_ID && Config.ASSISTANT_ID.length > 0) {
    let disableSSL = false;
    let auth: IamAuthenticator;

    try {
        auth = new IamAuthenticator({ apikey: Config.ASSISTANT_TTS_API_KEY });
        assistant = new AssistantV2({
            version: ASST_API_VERSION,
            authenticator: auth,
            url: ASSISTANT_TTS_URL,
            disableSslVerification: disableSSL,
        });
    } catch (e) {
        console.log(e.result.stringify);
    }
}

async function getMessage(request: string, sessionId: string) {
    return assistant.message(
        {
            input: { text: request },
            assistantId: Config.ASSISTANT_ID,
            sessionId: sessionId
        })
        .then(response => {
            console.log("successful call");
            let res: any = response; //TODO: clean up
            if (res.result){
                res = res.result;
                if (res.output){
                    res = res.output;
                    if (res.generic){
                        res = res.generic;
                        if (res[0]){
                            res = res[0];
                            if (res.text){
                                res = res.text;
                            }
                        }
                    }
                }
            }
            return JSON.stringify(res, null, 2);
        })
        .catch(err => {
            console.log("unsuccessful call");
            console.log(err);
            return err.stringify;
        });
}

export async function callAssistant(request: string) {
    try {
        const sessionId = (await assistant.createSession({ assistantId: Config.ASSISTANT_ID })).result.session_id;
        return await getMessage(request, sessionId).then(txt => txt.substr(1, txt.length-2));
    } catch (error) {
        console.error(error);
    }
}
import { IamAuthenticator } from 'ibm-watson/auth'; // Watson Auth
import {AssistantV2} from "ibm-watson/sdk";
import {ASSISTANT_ID, ASSISTANT_TTS_API_KEY, ASSISTANT_TTS_URL} from "../Config/Config"; // Watson Assistant

const ASST_API_VERSION = '2020-05-04';
const DISABLE_SSL = false;

let assistant: AssistantV2;
let session: Promise<AssistantV2.Response<AssistantV2.SessionResponse>>;
if (ASSISTANT_ID && ASSISTANT_ID.length > 0) {
    try {
        const auth = new IamAuthenticator({ apikey: ASSISTANT_TTS_API_KEY });
        assistant = new AssistantV2({
            version: ASST_API_VERSION,
            authenticator: auth,
            url: ASSISTANT_TTS_URL,
            disableSslVerification: DISABLE_SSL,
        });
        session = assistant.createSession({assistantId: ASSISTANT_ID});

        console.log("Watson has been initialised!");
    } catch (e) {
        console.log(e.result.stringify);
    }
} else {
    console.log("Watson was not initialised!");
}

async function getMessage(request: string, sessionId: string) {
    return assistant.message(
        {
            input: { text: request },
            assistantId: ASSISTANT_ID,
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

export function callAssistant(request: string) {
    try {
        return session
            .then(res => getMessage(request, res.result.session_id))
            .then(txt => txt.substr(1, txt.length-2));
    } catch (error) {
        console.error(error);
    }

    return new Promise<string>(() => "An error occurred. Please contact your administrator.");
}
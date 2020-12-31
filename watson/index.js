const AssistantV2 = require('ibm-watson/assistant/v2'); //Watson Assistant
const { IamAuthenticator } = require('ibm-watson/auth'); //Watson Auth
const Configuration = require('../config/index.ts');

const ASSISTANT_ID= Configuration.ASSISTANT_ID; //from UI
const ASSISTANT_TTS_URL= Configuration.ASSISTANT_TTS_URL; //service-credentials-blog
const ASSISTANT_TTS_API_KEY= Configuration.ASSISTANT_TTS_API_KEY; //service-credentials-blog
const ASST_API_VERSION = '2020-05-04';

const assistantId = ASSISTANT_ID;
let assistant = false;
if (assistantId) {
    let url;
    let disableSSL = false;
    let auth;

    try {
        auth = new IamAuthenticator({ apikey: ASSISTANT_TTS_API_KEY });
        url = ASSISTANT_TTS_URL;
    } catch (e) {
        console.log(e.result.stringify);
    }

    assistant = new AssistantV2({
        version: ASST_API_VERSION,
        authenticator: auth,
        url: url,
        disableSslVerification: disableSSL,
    });
}

async function getMessage(request, sessionId) {
    return assistant.message(
        {
            input: { text: request },
            assistantId: ASSISTANT_ID,
            sessionId: sessionId
        })
        .then(response => {
            console.log("successful call");
            return JSON.stringify(response.result.output.generic[0].text, null, 2);
        })
        .catch(err => {
            console.log("unsuccessful call");
            console.log(err);
            return error.stringify;
        });
}

async function callAssistant(request) {
    try {
        const sessionId = (await assistant.createSession({ assistantId: assistantId })).result.session_id;
        return await getMessage(request, sessionId).then(txt => txt.substr(1, txt.length-2));
    } catch (error) {
        console.error(error);
    }
}

module.exports = { callAssistant };
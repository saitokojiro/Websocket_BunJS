import { escapeHTML } from "bun";

import { ISMessageSend } from "../../interface/interfaceWS";

export let privateMesasge = (ws, message, sockets, mongoCustom) => {
    let messageJson = JSON.parse(message);

    if (messageJson.type == "private message") {
        mongoCustom.push(messageJson);
        sockets.some((el) => {
            console.log(el.data.user)
            /* console.log(messageJson.to);
             console.log(messageJson.sender);
             console.log(messageJson);*/
            if (el.data.id_User == messageJson.to) {
                //@ts-ignore
                let sendMessage: ISMessageSend = {
                    id: escapeHTML(messageJson.id),
                    type: escapeHTML(messageJson.type),
                    to: escapeHTML(messageJson.to),
                    sender: escapeHTML(messageJson.sender),
                    message: escapeHTML(messageJson.message),
                    isMedia: messageJson.isMedia,
                    typeMedia: escapeHTML(messageJson.typeMedia),
                    media: escapeHTML(messageJson.media),
                    date: escapeHTML(messageJson.date),
                    read: false
                };

                el.send(JSON.stringify(sendMessage));
                console.log("ok")
            }
        });
    }
}
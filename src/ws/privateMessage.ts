import { escapeHTML } from "bun";
export let privateMesasge = (ws, message, sockets, mongoCustom) => {
    let messageJson = JSON.parse(message);
    mongoCustom.push(messageJson);
    if (messageJson.type == "private message") {
        sockets.some(async (el) => {
            console.log(messageJson.to);
            console.log(messageJson.sender);
            console.log(messageJson);
            if (el.data.token == messageJson.to) {
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
                };

                el.send(JSON.stringify(sendMessage));
                console.log("ok")
            }
        });
    }
}
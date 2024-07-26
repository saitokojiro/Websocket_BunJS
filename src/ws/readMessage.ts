import { escapeHTML } from "bun";
import { ISPrivateMessageTyping } from "../../interface/interfaceWS";

export let ReadMessage = (ws, message, sockets, mongoCustom) => {
    let messageJson = JSON.parse(message);
    mongoCustom.push(messageJson);

    if (messageJson.type == "reading") {
        sockets.some(el => {
            let typingMessage: ISPrivateMessageTyping = {
                id: "type",
                type: escapeHTML(messageJson.type),
                to: escapeHTML(messageJson.to),
                sender: escapeHTML(messageJson.sender)
            }

            el.send(JSON.stringify(typingMessage))
        })
    }
}
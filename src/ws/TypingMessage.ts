import { escapeHTML } from "bun";
import { ISPrivateMessageTyping } from "../../interface/interfaceWS";

export let TypingMessage = (ws, message, sockets) => {
    let messageJson = JSON.parse(message);
    if (messageJson.type == "typing") {
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
let msgServer = () => {
  console.log("Server Info :");
  console.log("Status: running");
  console.log("Engine: Bun.js 0.4.0");
  console.log("Version: 0.0.2");
};

let sockets: any[] = [];
let room: any[] = [];
let valueMax: number = 0;
let counter: number = 0;

Bun.serve({
  port: 3987,
  msgconsole: msgServer(),
  fetch(req, server) {
    let url = new URL(req.url);
    console.log(url);
    let token: any = url.searchParams.get("token");

    if (token !== null) {
      if (url.searchParams.get("token") !== "bridge") {
        server.upgrade(req, {
          data: {
            _logger: true,
            token: url.searchParams.get("token"),
            user: url.searchParams.get("token"),
            room: room,
            counter: counter
          }
        });
        return;
      } else {
        server.upgrade(req, {
          data: {
            bridge: true,
            _logger: true,
            counter: counter
          }
        });
        return;
      }
    } else {
      server.upgrade(req, {
        data: {
          _logger: false
        }
      });

      return;
    }
    return new Response("Regular HTTP response");
  },
  websocket: {
    open(ws) {
      //@ts-ignore
      if (!ws.data._logger) {
        setTimeout(() => {
          console.log("user : invalid token");
          ws.close();
        }, 0);
      }
      //@ts-ignore
      ws.data.counter++;
      sockets.push(ws);
      //@ts-ignore
      let messageAll = { all: "welcome " + ws.data.user };
      //@ts-ignore
      ws.publish("welcome", JSON.stringify(messageAll));
      counter++;
    },
    message(ws, message) {
      //@ts-ignore
      let messageJson = JSON.parse(message);
      //ws.send(message);
      if (messageJson.type == "private message") {
        sockets.some((el) => {
          
          if (parseInt(el.data.user) === messageJson.to) {
            //@ts-ignore
            let sendMessage:{} = {
              type: messageJson.type,
              to: messageJson.to,
              from: messageJson.from,
              message: messageJson.message,
              id: messageJson.id,
              isMedia: messageJson.isMedia,
              typeMedia: messageJson.typeMedia,
              media: messageJson.media,
              date: messageJson.date
            };
            el.send(JSON.stringify(sendMessage));
          }
        });
      }
    },
    close(ws, code, reason) {

      let temporis: any[] = [];
      sockets.some((el) => {
        if (el.data.user !== ws.data.user) {
          temporis.push(el);
        }
      });
      sockets = temporis;
      temporis = [];

      counter--;
      console.log(counter);
      console.log(sockets);
    },
    drain(ws) {
      console.log(ws);
      console.log(counter);
    }
  }
});
/*

  type: private message

  {
    block: "no-repeat",
    type: "private message",
    to: test,
    message: lorem ipsum,
    id: "",
    isMedia: false,
    typeMedia:"messageJson.typeMedia",
    media: "messageJson.media",
    date: "messageJson.date"
  }
*/
import { ISMessageSend } from "./interfaceWS";
let msgServer = () => {
  console.log("Server Info :");
  console.log("Status: running");
  console.log("Engine: Bun.js 0.5.1");
  console.log("Version: 0.0.5");
};

let sockets: any[] = [];
let room: any[] = [];
let userData:any[] = []
let counter: number = 0;

Bun.serve({
  port: 3987,
  
  msgconsole: msgServer(),
  fetch(req, server) {
    let url = new URL(req.url);
    console.log(url);
    let token: any = url.searchParams.get("token");
    let user: any = url.searchParams.get("user");
    console.log(token)
    console.log(user)
    if (token !== null && user !== null) {
      server.upgrade(req, {
        data: {
          _logger: true,
          token: token,
          user: user,
          room: room,
          counter: counter
        }
      });
      return;
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
      
      ws.subscribe("welcome");
      ws.subscribe("UserList");
      //@ts-ignore
      ws.data.counter++;

      sockets.push(ws);
      //@ts-ignore
      let messageAll = { all: "welcome " + ws.data.user };
      userData.push({user : ws.data.user});
      let listUserData = {cat : "userlist", list:userData}
      console.log(userData)

      //@ts-ignore
      ws.publish("welcome", JSON.stringify(messageAll));
      ws.publish("UserList", JSON.stringify(listUserData));
      //console.log(sockets.data)
      sockets.some(el =>{
        console.log(el.data.token)
        console.log(el.data.user)
      })
      //ws.send()
      counter++;
    },
    message(ws, message) {
      //@ts-ignore
      let messageJson = JSON.parse(message);
      //ws.send(message);
      if (messageJson.type == "private message") {
        sockets.some((el) => {
          if (el.data.user == messageJson.to) {
            //@ts-ignore
            let sendMessage: ISMessageSend = {
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
      let temporisUser: any[] = [];
      sockets.some((el) => {
        //@ts-ignore
        if (el.data.user !== ws.data.user) {
          temporis.push(el);
          temporisUser.push({user : el.data.user})
        }
      });
      sockets = temporis;
      userData = temporisUser;
      temporis = [];

      console.log(userData)
      
      let listUserData = {cat : "disconnect", list:userData}
      ws.publish("UserList", JSON.stringify(listUserData));
      counter--;
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

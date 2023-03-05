import { ISMessageSend } from "./interfaceWS";
import cookieParser from "cookie";
import { escapeHTML } from "bun";

let msgServer = () => {
  console.log("Server Info :");
  console.log("Status: running");
  console.log("Engine: Bun.js 0.5.5");
  console.log("Version: 0.0.5");
};

/*
let request = (callBack)=> {
  return callBack
}

request(()=>{console.log("ok")})*/

let sockets: any[] = [];
let room: any[] = [];
let userData: any[] = [];
let counter: number = 0;

let customHeader: HeadersInit = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": "http://127.0.0.1:3000"
};

Bun.serve({
  port: 3987,

  msgconsole: msgServer(),
  fetch(req, server) {
    let url = new URL(req.url);

    console.log(url);
    //let token: any = escapeHTML( url.searchParams.get("token"));
    //let token: any = crypto.randomUUID();
    //let user: any =  escapeHTML(url.searchParams.get("users"));
    //if (token !== null && user !== null && token !== "null" && user !== "null" ) {
    /*    server.upgrade(req, {
        data: {
          _logger: true,
          token:  token,
          user: user,
          room: room,
          counter: counter
        }
      });
      return;*/
    //}

    if (url.pathname === "/connection" && req.method === "POST") {
      //console.log(req)
      console.log(escapeHTML(url.searchParams.get("user")));
      if (escapeHTML(url.searchParams.get("user")) !== null) {
        let resp = {
          data: {
            User: escapeHTML(url.searchParams.get("user")),
            id: crypto.randomUUID()
          },
          response: "method " + req.method + " path : " + url.pathname
        };

        let res = new Response(JSON.stringify(resp), {
          status: 200,
          headers: customHeader
          /*
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": "http://127.0.0.1:3000"
          }*/
        });
        res.headers.append("Set-Cookie", "id_User=" + resp.data.id + "; HttpOnly; SameSite=None; Secure");
        res.headers.append("Set-Cookie", "token=" + resp.data.id + "; HttpOnly; SameSite=None; Secure");
        res.headers.append("Set-Cookie", "CSRF_TOKEN=" + crypto.randomUUID() + "; HttpOnly; SameSite=None; Secure");
        return res;
      } else {
        return new Response("error", {
          status: 401,
          headers: customHeader
        });
      }
    }

    if (url.pathname === "/connection" && req.method === "GET") {
      //console.log(req)
      if (req.headers.get("cookie") !== null) {
        console.log("------------");
        console.log(req.headers.get("cookie"));
        let cookieClient = cookieParser.parse(req.headers.get("cookie"));

        let userParams = escapeHTML(url.searchParams.get("user"));
        console.log(userParams);
        if (cookieClient.id_User !== undefined && cookieClient.CSRF_TOKEN !== undefined && userParams !== undefined) {
          if (cookieClient.id_User !== null && cookieClient.CSRF_TOKEN !== null && userParams !== null) {
            console.log("ok");
            server.upgrade(req, {
              data: {
                _logger: true,
                token: cookieClient.id_User,
                CSRF_TOKEN: cookieClient.CSRF_TOKEN,
                user: userParams,
                room: room,
                counter: counter
              }
            });
            return;
          } else {
            return new Response("error", {
              status: 401,
              headers: customHeader
            });
          }
        } else {
          return new Response("error", {
            status: 401,
            headers: customHeader
          });
        }
      } else {
        return new Response("cookie empty", {
          status: 401,
          headers: customHeader
        });
      }
    }
    if (url.pathname === "/logout" && req.method === "GET") {
      let logoutJson: object = {
        status: "logout",
        redirect:"/"
      };
      let res = new Response(JSON.stringify(logoutJson), {
        status: 200,
        headers: customHeader
        /*
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Origin": "http://127.0.0.1:3000"
        }*/
      });
      res.headers.append("Set-Cookie", "id_User=expired; HttpOnly; SameSite=None; Secure ;expires=Thu, 01 Jan 1970 00:00:00 GMT");
      res.headers.append("Set-Cookie", "token=expired; HttpOnly; SameSite=None; Secure;expires=Thu, 01 Jan 1970 00:00:00 GMT");
      res.headers.append("Set-Cookie", "CSRF_TOKEN=expired; HttpOnly; SameSite=None; Secure;expires=Thu, 01 Jan 1970 00:00:0 GMT");

      return res;
    }

    return new Response("Regular HTTP response : 200 ");
  },
  websocket: {
    open(ws) {
      //console.log(ws.data._logger)
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
      let messageAll = { all: "welcome " + escapeHTML(ws.data.user) };
      userData.push({
        user: escapeHTML(ws.data.user),
        id_User: escapeHTML(ws.data.token)
      });
      //console.log(ws.data);
      let listUserData = { cat: "userlist", list: userData };
      //console.log(userData);

      //@ts-ignore
      ws.publish("welcome", JSON.stringify(messageAll));
      ws.publish("UserList", JSON.stringify(listUserData));
      ws.send(JSON.stringify({ token: escapeHTML(ws.data.token) }));

      sockets.some((el) => {
        console.log(el.data.token);
        console.log(el.data.user);
      });

      counter++;
    },

    message(ws, message) {
      //@ts-ignore
      let messageJson = JSON.parse(message);

      if (messageJson.type == "private message") {
        sockets.some((el) => {
          console.log(messageJson.to);
          if (el.data.token == messageJson.to) {
            //@ts-ignore
            let sendMessage: ISMessageSend = {
              type: escapeHTML(messageJson.type),
              to: escapeHTML(messageJson.to),
              from: escapeHTML(messageJson.from),
              message: escapeHTML(messageJson.message),
              id: escapeHTML(messageJson.id),
              isMedia: messageJson.isMedia,
              typeMedia: escapeHTML(messageJson.typeMedia),
              media: escapeHTML(messageJson.media),
              date: escapeHTML(messageJson.date)
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
        if (escapeHTML(el.data.user) !== escapeHTML(ws.data.user)) {
          temporis.push(el);
          temporisUser.push({ 
            user: escapeHTML(el.data.user),
            id_User: escapeHTML(el.data.token)
          });
        }
      });
      sockets = temporis;
      userData = temporisUser;
      temporis = [];

      console.log(userData);

      let listUserData = { cat: "disconnect", list: userData };
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

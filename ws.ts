import { ISAccountSend, ISMessageSend } from "./interface/interfaceWS";
import cookieParser from "cookie";
import { escapeHTML, serve } from "bun";
import { MongoClient } from "mongodb";
import { MongoCustom } from "./function/mongoCustom";
import * as jose from "jose";
import { test } from "bun:test";
import { GetRequest } from "./src/http/requestGet";
import { PostRequest } from "./src/http/requestPost";
import { privateMesasge } from "./src/ws/privateMessage";

let mongoCustom = await MongoCustom("message");

let ipAdress: string = "127.0.0.1";
let ServerPort: number = 3987;

/*
let method = {
  GET: "GET",
  POST: "POST",
};*/



/*
let publicKey = async () => {
  const foo = Bun.file("./rsakey/public_key.pem");
  return await foo.text();
};

let privateKey = async () => {
  try {
    const foo = Bun.file("./rsakey/private_key_pkcs8.pem");
    return await foo.text();
  } catch (error) {
    console.log(error);
  }
};*/

let msgServer = async () => {
  console.log("Server Info :");
  console.log("Status: running");
  console.log("Engine: Bun.js 0.6.9");
  console.log("Version: 0.0.5");
  console.log(`server address: ws://${ipAdress}:${ServerPort}`);
  //console.log(publicKeyString);
  //console.log(await testing())
};

//token test

//joseGroupeSign({test:"data"})

/*
let request = (callBack)=> {
  return callBack
}

request(()=>{console.log("ok")})*/

let counter: number = 0;
let sockets: any[] = [];
let room: any[] = [];
let userData: any[] = [];
/*
let customHeader: HeadersInit = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": "http://127.0.0.1:3000",
};*/

Bun.serve({
  port: 3987,
  //@ts-ignore
  msgconsole: msgServer(),
  async fetch(req, server) {
    let url = new URL(req.url);

    await GetRequest(req, server, counter, sockets, room, userData)
    await PostRequest(req, server, counter, sockets, room, userData)





    if (url.pathname === "/admin") {
      server.upgrade(req, {
        data: {
          _logger: true,
          id_User: "45683233",
          token: "45683233",
          user: "admin",
          room: room,
          counter: counter
        }
      })
    }

    return new Response("Regular HTTP response : 200 ");
  },
  websocket: {
    publishToSelf: true,

    open(ws) {
      //console.log(ws.data._logger)
      //@ts-ignore
      if (!ws.data._logger) {
        setTimeout(() => {
          console.log("user : invalid token");
          ws.close();
        }, 0);
      }

      console.log("pass")
      ws.subscribe("welcome");
      ws.subscribe("UserList");
      //@ts-ignore
      ws.data.counter++;

      sockets.push(ws);
      //@ts-ignore
      let messageAll = { all: "welcome " + escapeHTML(ws.data.user) };
      userData.push({
        user: escapeHTML(ws.data.user),
        id_User: escapeHTML(ws.data.id_User),
        token: escapeHTML(ws.data.token),
      });
      //console.log(ws.data);
      let listUserData = { cat: "userlist", list: userData };
      //console.log(userData);

      console.log(listUserData)

      //@ts-ignore
      ws.publish("welcome", JSON.stringify(messageAll));
      ws.publish("UserList", JSON.stringify(listUserData));

      ws.send(JSON.stringify({ token: escapeHTML(ws.data.token) }));
      sockets.some((el) => {
        //console.log(el.data.token);
        //console.log(el.data.user);
      });

      counter++;
    },

    /**
     *  WS message :
     *  main
     *  sub file : 
     *  path : ./src/ws
     * */

    async message(_ws, message) {
      //@ts-ignore

      privateMesasge(_ws, message, sockets, mongoCustom)

    },

    /**
     *  WS close :
     *  main
     * */


    close(ws, _code, _reason) {
      let temporis: any[] = [];
      let temporisUser: any[] = [];
      sockets.some((el) => {
        //@ts-ignore
        if (escapeHTML(el.data.user) !== escapeHTML(ws.data.user)) {
          temporis.push(el);
          temporisUser.push({
            user: escapeHTML(el.data.user),
            id_User: escapeHTML(el.data.token),
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

    /**
     *  WS drain :
     *  main
     * */

    drain(ws) {
      console.log(ws);
      console.log(counter);
    },
  },
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

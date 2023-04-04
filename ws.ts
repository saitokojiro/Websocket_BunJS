import { ISMessageSend } from "./interface/interfaceWS";
import cookieParser from "cookie";
import { escapeHTML } from "bun";
import { MongoClient } from "mongodb";
import * as jose from 'jose'
import { test } from "bun:test";
//import { publicKey256 , privateKey256 } from "./rsakey/key";
//import publicKey from "./rsakey/jwtRS256.key.pub"
//import privateKey from "./rsakey/jwtRS512.key"

let ipAdress: string = "127.0.0.1"
let ServerPort: number = 3987

let method = {
  "GET": "GET",
  "POST": "POST",
}





let publicKey = async () => {
  const foo = Bun.file("./rsakey/jwtRS256.key.pub");
  return await foo.text()
}

let privateKey = async () => {
  const foo = Bun.file("./rsakey/jwtRS256.key");
  return await foo.text()
}

let msgServer = async () => {
  console.log("Server Info :");
  console.log("Status: running");
  console.log("Engine: Bun.js 0.5.7");
  console.log("Version: 0.0.5");
  console.log(`server address: ws://${ipAdress}:${ServerPort}`)
  //console.log(publicKeyString);
  //console.log(await testing())


};

//token test
let jwtkeys = `eyJhbGciOiJSUzI1NiJ9.eyJ1cm46ZXhhbXBsZTpjbGFpbSI6dHJ1ZSwiaWF0IjoxNjgwNjEwMjIwLCJpc3MiOiJ1cm46ZXhhbXBsZTppc3N1ZXIiLCJhdWQiOiJ1cm46ZXhhbXBsZTphdWRpZW5jZSIsImV4cCI6MTY4MDYxNzQyMH0.JDegji_CWIIU7DnJ0FQsdR8DML6AeYCQ7WaNT4p7lohr-k3ZV21prihTYChdWqz_ZLM2XSbh-lKAdlJE8mliyZPZHzQ1GebaOoRE8zcjQeT3AK7GjS3c0SKyZrfApiiXlPjkho45WzrjYaEf1cAamEPmlTJmUIWiWkRVs8YUbKPoTUqhxb4NoFe1l6HApfkgJ6cJYwVPAp8JEcWpRF9hbm7qHUoLRgeZyjJ1KAFa6IPcQT1CwwcKQhPV45euIORkeB5iRcLSa1wo5US4sXhiwYddjsc-y7n0g5--RFuAa1DTEb61S8GC--CzRCbOqbVLXHF_l9YpexrLkiNEAHDQpw`
let joseGroupeVerify: any = async (token: string) => {
  try {
    const alg = 'RS256'

    let pubK: string = await publicKey()
    const secret = await jose.importSPKI(pubK, alg)

    let { payload, protectedHeader } = await jose.jwtVerify(token, secret, {
      //issuer: 'urn:example:issuer',
      //audience: 'urn:example:audience',
    })
    console.log(payload)
    console.log(protectedHeader)
  } catch (error) {
    console.log("invalid token")
    //console.log(error)

  }

}
console.log(process.env.MONGO_DB)
joseGroupeVerify(jwtkeys)


let joseGroupeSign: any = async () => {



  try {
    const alg = 'RS256'

    let prK: string = await privateKey()

    const secret = await jose.importPKCS8(prK, alg)
    const jwt = await new jose.SignJWT({ 'urn:example:claim': true })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer('urn:example:issuer')
      .setAudience('urn:example:audience')
      .setExpirationTime('2h')
      .sign(secret)

    console.log(jwt)

  } catch (error) {
    console.log(error)
    console.log("error token")
  }

}
joseGroupeSign()

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
  async fetch(req, server) {
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
    if (url.pathname === "/testing" && req.method === method.GET) {
      let resp = {
        data: {
          "data": "ok"
        },
        response: "method : " + req.method + ' path : ' + url.pathname
      }
      let res = new Response(JSON.stringify(resp), {
        status: 200,
        headers: customHeader
      })
      return res;
    }

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
        redirect: "/"
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

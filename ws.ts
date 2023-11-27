import { ISAccountSend, ISMessageSend } from "./interface/interfaceWS";
import cookieParser from "cookie";
import { escapeHTML, serve } from "bun";
import { MongoClient } from "mongodb";
import { MongoCustom } from "./function/mongoCustom";
import * as jose from "jose";
import { test } from "bun:test";
//import { publicKey256 , privateKey256 } from "./rsakey/key";
//import publicKey from "./rsakey/jwtRS256.key.pub"
//import privateKey from "./rsakey/jwtRS512.key"
//console.log(process.env.MONGO_DB)

let mongoCustom = await MongoCustom("message");

//let dataMongo = await mongoCustom.getAll("48d952af-04b2-5251-96a1-0521ecd2035d", "48d952af-04b2-5251-96a1-0521ecd2035d");
/*
let testFunction = await mongoCustom.GetByOne("48d952af-04b2-5251-96a1-0521ecd2035d", "48d952af-04b2-5251-96a1-0521ecd2035d", { "message": "lorem ipstum" });
console.log(testFunction);*/
//mongoCustom

/*
const client = new MongoClient(process.env.MONGO_DB);
//const client = new MongoClient("mongodb://saitoKo:pass@mongo:27017/?useUnifiedTopology=true");
try {
  await client.connect()
} catch (error) {
  console.log(error)
}



const db = client.db("message");*/
//const result = await collection.findOne({ hello: "world" });

//console.log(result);

let ipAdress: string = "127.0.0.1";
let ServerPort: number = 3987;

let method = {
  GET: "GET",
  POST: "POST"
};
/*

let mongoVerificationCollectionExist = async (id_user_one: string, id_user_two: string) => {
  const collections = await db.listCollections().toArray();

  const collection_userOne = collections.find(c => c.name === id_user_one + "/" + id_user_two);
  const collection_userTwo = collections.find(c => c.name === id_user_two + "/" + id_user_one);

  if (collection_userOne) {
    return id_user_one + "/" + id_user_two
  } else if (collection_userTwo) {
    return id_user_two + "/" + id_user_one
  } else {
    return id_user_one + "/" + id_user_two
  }
  //const collection = db.collection(escapeHTML(messageJson.to));
}
*/

/*

let MongoCustom = {
  "push": mongoPush,
  "get": mongoGet,
  "getAll": mongoGetAll,
  "getById": mongoGetById,
  "delete": mongoDelete,
}
*/
/*
let MongoCustom = (()=>{
  let mongoPush = async (messageJson: ISMessageSend) => {
    let verification = await mongoVerificationCollectionExist(messageJson.to, messageJson.sender)
    //const collection = db.collection(escapeHTML(messageJson.to + "/" + messageJson.sender));
    console.log(verification)
    const collection = db.collection(escapeHTML(verification));
    await collection.insertOne({
      id: escapeHTML(messageJson.id),
      type: escapeHTML(messageJson.type),
      to: escapeHTML(messageJson.to),
      sender: escapeHTML(messageJson.sender),
      message: escapeHTML(messageJson.message),
      isMedia: messageJson.isMedia,
      typeMedia: escapeHTML(messageJson.typeMedia),
      media: escapeHTML(messageJson.media),
      date: escapeHTML(messageJson.date)
    });
  
  }
  
  let mongoGet = async () => {
  
  }
  
  let mongoGetAll = async (id_user_one: string, id_user_two: string) => {
  
  }
  
  let mongoGetById = async () => {
  
  }
  
  let mongoDelete = async () => {
  
  }
  return function() {
    return {
      push: mongoPush,
      //update: mongoUpdate,
      //delete: mongoDelete
    };
  };
})()*/

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
};

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
let joseGroupeVerify: any = async (token: string) => {
  try {
    const alg = "RS256";

    let pubK: string = await publicKey();
    const secret = await jose.importSPKI(pubK, alg);

    let { payload, protectedHeader } = await jose.jwtVerify(token, secret, {
      //issuer: 'urn:example:issuer',
      //audience: 'urn:example:audience',
    });
    //console.log(payload)
    //console.log(protectedHeader)
    return { payload: payload, protectedHeader: protectedHeader, status: true };
  } catch (error) {
    console.log("invalid token");
    return {
      payload: "",
      protectedHeader: "",
      response: "invalid token",
      status: false
    };
    //console.log(error)
  }
};

//joseGroupeVerify(jwtkeys)

let joseGroupeSign: any = async (user: jose.JWTPayload) => {
  try {
    const alg: string = "RS256";

    let prK: string = await privateKey();

    //console.log(prK)
    //console.log(user)
    const secret = await jose.importPKCS8(prK, alg);

    const jwt = await new jose.SignJWT(user)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer("urn:example:issuer")
      .setAudience("urn:example:audience")
      .setExpirationTime("2h")
      .sign(secret);

    //console.log(jwt)
    return await jwt;
  } catch (error) {
    console.log(error);
    console.log("error token");
  }
};

//joseGroupeSign({test:"data"})

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

serve({
  port: 3987,
  msgconsole: msgServer(),
  async fetch(req, server) {
    let url = new URL(req.url);


    /**
     * ----------- ----------- ----------- 
     * ---------- Zone de test ----------- 
     * ----------- ----------- ----------- 
     */

    /* verify Token */
    if (url.pathname === "/testConnect" && req.method === method.GET) {
      let checking = await joseGroupeVerify(url.searchParams.get("token"));
      console.log("checking");
      console.log(checking);
      console.log("checking");
      let resp = {
        data: {
          is_valid: false,
          payload: checking?.payload,
          hash: checking?.protectedHeader,
          status: "waiting"
        }
      };
      let res = new Response(JSON.stringify(resp), {
        status: 200
      });
      return res;
    }
    /* connection admin */
    if (url.pathname === "/admin") {
      server.upgrade(req, {
        data: {
          _logger: true,
          token: "45683233",
          user: "admin",
          room: room,
          counter: counter
        }
      });
      return;
    }

    /* create Token */
    if (url.pathname === "/createtoken" && req.method === method.POST) {
      let resp = {
        data: {
          token: await joseGroupeSign({
            id: url.searchParams.get("id"),
            user: url.searchParams.get("user")
            //"password": url.searchParams.get("password"),
          }),
          data: {
            id: url.searchParams.get("id"),
            user: url.searchParams.get("user")
          }
        },
        response: "method : " + req.method + " path : " + url.pathname
      };
      let res = new Response(JSON.stringify(resp), {
        status: 200,
        headers: customHeader
      });
      return res;
    }

    /**
     * -----------    END      ----------- 
     * ----------- ----------- ----------- 
     * ---------- Zone de test ----------- 
     * ----------- ----------- ----------- 
     * -----------    END      ----------- 
     */

    


    if (url.pathname === "/connection" && req.method === "POST") {
      //console.log(req)

      //console.log(escapeHTML(url.searchParams.get("user")));
      if (escapeHTML(url.searchParams.get("user")) !== null) {
        let rndCrypto = crypto.randomUUID();
        let dataConnection = {
          token: await joseGroupeSign({
            id: rndCrypto,
            user: url.searchParams.get("user")
            //"password": url.searchParams.get("password"),
          }),
          user: escapeHTML(url.searchParams.get("user")),
          id: rndCrypto
        };
        let resp = {
          data: dataConnection,
          response: "method " + req.method + " path : " + url.pathname
        };

        let SaveAccountDb: ISAccountSend = {
          id: dataConnection.id,
          user: dataConnection.user,
          create_At: new Date(),
          enable: true
        };
        mongoCustom.pushAny("account", SaveAccountDb);

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
        res.headers.append(
          "Set-Cookie",
          "id_User=" + resp.data.id + "; HttpOnly; SameSite=None; Secure"
        );
        res.headers.append(
          "Set-Cookie",
          "token=" + resp.data.token + "; HttpOnly; SameSite=None; Secure"
        );
        res.headers.append(
          "Set-Cookie",
          "CSRF_TOKEN=" +
          crypto.randomUUID() +
          "; HttpOnly; SameSite=None; Secure"
        );
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
        //console.log(req.headers.get("cookie"));
        let cookieClient = cookieParser.parse(req.headers.get("cookie"));

        let userParams = escapeHTML(url.searchParams.get("user"));
        // console.log(userParams);
        if (
          cookieClient.id_User !== undefined &&
          cookieClient.token !== undefined &&
          cookieClient.CSRF_TOKEN !== undefined &&
          userParams !== undefined
        ) {
          if (
            cookieClient.id_User !== null &&
            cookieClient.CSRF_TOKEN !== null &&
            userParams !== null &&
            cookieClient.token !== null
          ) {
            console.log("ok");
            let verificationJWT = await joseGroupeVerify(cookieClient.token);
            if (verificationJWT.status !== false) {
              console.log("ok");
              server.upgrade(req, {
                data: {
                  _logger: true,
                  id_User: cookieClient.id_User,
                  token: cookieClient.token,
                  CSRF_TOKEN: cookieClient.CSRF_TOKEN,
                  user: userParams,
                  room: room,
                  counter: counter
                }
              });
              return;
            } else {
              console.log(verificationJWT.status);
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


    if (url.pathname === "/getMessageUser" && req.method === method.GET) {
      if (req.headers.get("cookie") !== null) {
        // console.log("------------");
        let cookieClient = cookieParser.parse(req.headers.get("cookie"));
        let userParams = escapeHTML(url.searchParams.get("user"));
        if (
          cookieClient.id_User !== undefined &&
          cookieClient.token !== undefined &&
          cookieClient.CSRF_TOKEN !== undefined &&
          userParams !== undefined
        ) {
          if (
            cookieClient.id_User !== null &&
            cookieClient.CSRF_TOKEN !== null &&
            userParams !== null &&
            cookieClient.token !== null
          ) {
            let tokenverify = await joseGroupeVerify(cookieClient.token);
            //   console.log(tokenverify)
            if (tokenverify.status !== null) {
              //console.log(escapeHTML(url.searchParams.get("iduserto")))
              //console.log(tokenverify.payload.id)
              //console.log(url.searchParams.get("iduserto"))
              //console.log( await mongoCustom.getAll(tokenverify.payload.id, url.searchParams.get("iduserto")))

              let resp = {
                data: {
                  listMsg: await mongoCustom.getAll(
                    tokenverify.payload.id,
                    url.searchParams.get("iduserto")
                  )
                }
              };
              let res = new Response(JSON.stringify(resp), {
                status: 200,
                headers: customHeader
              });

              return res;
            } else {
              let res = new Response("invalid token", {
                status: 401,
                headers: customHeader
              });

              return res;
            }
          }
        }
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
      res.headers.append(
        "Set-Cookie",
        "id_User=expired; HttpOnly; SameSite=None; Secure ;expires=Thu, 01 Jan 1970 00:00:00 GMT"
      );
      res.headers.append(
        "Set-Cookie",
        "token=expired; HttpOnly; SameSite=None; Secure;expires=Thu, 01 Jan 1970 00:00:00 GMT"
      );
      res.headers.append(
        "Set-Cookie",
        "CSRF_TOKEN=expired; HttpOnly; SameSite=None; Secure;expires=Thu, 01 Jan 1970 00:00:0 GMT"
      );

      return res;
    }

    return new Response("Regular HTTP response : 200 ");
  },
  websocket: {
    publishToSelf:true,
    
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
        token: escapeHTML(ws.data.token)
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

    async message(_ws, message) {
      //@ts-ignore

      let messageJson = JSON.parse(message);
      //mongoCustom.push(messageJson);
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
              date: escapeHTML(messageJson.date)
            };

            el.send(JSON.stringify(sendMessage));
            console.log("send")
          }
        });
      }
    },

    close(ws, _code, _reason) {
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

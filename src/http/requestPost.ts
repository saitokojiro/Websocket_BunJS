import { joseGroupeSign, joseGroupeVerify } from "../../function/joseFunction";
import { method, customHeader } from "./../global"
import { MongoCustom } from "../../function/mongoCustom";
import cookieParser from "cookie";
import { escapeHTML } from "bun";

let mongoCustom = await MongoCustom("message");

export let PostRequest = async (req, server) => {
    let url = new URL(req.url);

    /* create Token */
    if (url.pathname === "/createtoken" && req.method === method.POST) {
        let resp = {
            data: {
                token: await joseGroupeSign({
                    id: url.searchParams.get("id"),
                    user: url.searchParams.get("user"),
                    //"password": url.searchParams.get("password"),
                }),
                data: {
                    id: url.searchParams.get("id"),
                    user: url.searchParams.get("user"),
                },
            },
            response: "method : " + req.method + " path : " + url.pathname,
        };
        let res = new Response(JSON.stringify(resp), {
            status: 200,
            headers: customHeader,
        });
        return res;
    }

    if (url.pathname === "/connection" && req.method === "POST") {
        //console.log(req)

        //console.log(escapeHTML(url.searchParams.get("user")));
        if (escapeHTML(url.searchParams.get("user")) !== null) {
            let rndCrypto = crypto.randomUUID();
            let dataConnection = {
                token: await joseGroupeSign({
                    id: rndCrypto,
                    user: url.searchParams.get("user"),
                    //"password": url.searchParams.get("password"),
                }),
                user: escapeHTML(url.searchParams.get("user")),
                id: rndCrypto,
            };
            let resp = {
                data: dataConnection,
                response: "method " + req.method + " path : " + url.pathname,
            };

            let SaveAccountDb: ISAccountSend = {
                id: dataConnection.id,
                user: dataConnection.user,
                create_At: new Date(),
                enable: true,
            };
            mongoCustom.pushAny("account", SaveAccountDb);

            let res = new Response(JSON.stringify(resp), {
                status: 200,
                headers: customHeader,
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
                headers: customHeader,
            });
        }
    }
};

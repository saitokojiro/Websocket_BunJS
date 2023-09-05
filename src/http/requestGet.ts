import { joseGroupeSign, joseGroupeVerify } from "../../function/joseFunction";
import { method, customHeader } from "./../global"
import { MongoCustom } from "../../function/mongoCustom";
import cookieParser from "cookie";
import { escapeHTML } from "bun";

let mongoCustom = await MongoCustom("message");

export let GetRequest = async (req, server, counter, sockets, room, userData) => {
    let url = new URL(req.url);

    // Get user Message 
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
                                ),
                            },
                        };
                        let res = new Response(JSON.stringify(resp), {
                            status: 200,
                            headers: customHeader,
                        });

                        return res;
                    } else {
                        let res = new Response("invalid token", {
                            status: 401,
                            headers: customHeader,
                        });

                        return res;
                    }
                }
            }
        }
    }

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
                status: "waiting",
            },
        };
        let res = new Response(JSON.stringify(resp), {
            status: 200,
        });
        return res;
    }

    // Get Connection
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
                        server.upgrade(req, {
                            data: {
                                _logger: true,
                                id_User: cookieClient.id_User,
                                token: cookieClient.token,
                                CSRF_TOKEN: cookieClient.CSRF_TOKEN,
                                user: userParams,
                                room: room,
                                counter: counter,
                            },
                        });
                        return;
                    } else {
                        console.log(verificationJWT.status);
                        return new Response("error", {
                            status: 401,
                            headers: customHeader,
                        });
                    }
                } else {
                    return new Response("error", {
                        status: 401,
                        headers: customHeader,
                    });
                }
            } else {
                return new Response("error", {
                    status: 401,
                    headers: customHeader,
                });
            }
        } else {
            return new Response("cookie empty", {
                status: 401,
                headers: customHeader,
            });
        }
    }

    if (url.pathname === "/testAccount" && req.method === method.GET) {
        //need code
    }

    // LogOut
    if (url.pathname === "/logout" && req.method === "GET") {
        let logoutJson: object = {
            status: "logout",
            redirect: "/",
        };
        let res = new Response(JSON.stringify(logoutJson), {
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
};

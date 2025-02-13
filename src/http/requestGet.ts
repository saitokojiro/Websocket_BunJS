import { joseGroupeSign, joseGroupeVerify } from "../../function/joseFunction";
import { method } from "./../global"
import { MongoCustom } from "../../function/mongoCustom";
import cookieParser from "cookie";
import { escapeHTML } from "bun";

let mongoCustom = await MongoCustom("message");

export let GetRequest = async (req, server, counter, sockets, room, userData, headers) => {
    let url = new URL(req.url);

    // Get user Message 
    if (url.pathname === "/getMessageUser" && req.method === method.GET) {


        //console.log(req.headers.get("cookie"))

        //let urlMessage = new URL(req.url)
        if (req.headers.get("cookie") !== null) {
            // console.log("------------");
            let cookieClient = cookieParser.parse(req.headers.get("cookie"));
            let userParams = escapeHTML(url.searchParams.get("user"));
            let limitParams = escapeHTML(url.searchParams.get("user"));
            let pageParams = escapeHTML(url.searchParams.get("user"));
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
                    if (tokenverify.status !== null && tokenverify.status === true) {


                        let resp = {
                            data: {
                                listMsg: await mongoCustom.getAll(
                                    tokenverify.payload.id,
                                    url.searchParams.get("user"), true
                                ),
                            },
                        };
                        let respS = { "her": "ok" }
                        let res = new Response(JSON.stringify(resp), {
                            status: 200,
                            headers: headers,
                        });

                        return res;

                    } else {
                        let res = new Response("invalid token", {
                            status: 401,
                            headers: headers,
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
                            headers: headers,
                        });
                    }
                } else {
                    return new Response("error", {
                        status: 401,
                        headers: headers,
                    });
                }
            } else {
                return new Response("error", {
                    status: 401,
                    headers: headers,
                });
            }
        } else {
            return new Response("cookie empty", {
                status: 401,
                headers: headers,
            });
        }
    }

    if (url.pathname === "/testAccount" && req.method === method.GET) {
        //need code
        // Mongo Custom not implemant

        let data = await mongoCustom.GetById({ user: url.searchParams.get("user") }, "acc");
        console.log(data)
        let password_verify = await Bun.password.verify(url.searchParams.get("password"), data.password)
        console.log(password_verify)
        return new Response("cookie empty", {
            status: 200,
            headers: headers,
        });
    }

    // LogOut
    if (url.pathname === "/logout" && req.method === "GET") {
        let logoutJson: object = {
            status: "logout",
            redirect: "/",
        };
        let res = new Response(JSON.stringify(logoutJson), {
            status: 200,
            headers: headers,
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

};

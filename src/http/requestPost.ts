import { joseGroupeSign, joseGroupeVerify } from "../../function/joseFunction";
import { delayedResponse, headersSecurity, method, randomDelayedResponse } from "./../global"
import { MongoCustom } from "../../function/mongoCustom";
import cookieParser from "cookie";
import { escapeHTML } from "bun";
import sanitize from "mongo-sanitize"
import validator from 'validator';

import { ISAccountSend, ISMessageSend, ISStatusAccount } from "../../interface/interfaceWS";


let mongoCustom = await MongoCustom("message");
let mongoAccount = await MongoCustom("Account");


export let PostRequest = async (req, server, counter, sockets, room, userData, headers) => {
    let url = new URL(req.url);


    /* create Token */
    //Post 
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
            headers: headers,
        });
        return res;
    }

    // Post Connection 
    if (url.pathname === "/connection" && req.method === "POST") {

        console.log(req.headers.get('x-forwarded-for'))
        console.log(req.connection)
        console.log(escapeHTML(url.searchParams.get("user")));
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
                email: "test@test.fr",
                password: crypto.randomUUID(),
                user: dataConnection.user,
                status: "Offline",
                create_At: new Date(),
                enable: true,
            };
            mongoAccount.pushAny("account", SaveAccountDb, false);

            let res = new Response(JSON.stringify(resp), {
                status: 200,
                headers: headersSecurity,
            });

            const cookieOptions = {
                httpOnly: true,
                secure: true, // Assurez-vous que cette option correspond à votre environnement (true en production avec HTTPS)
                sameSite: "None", // Ou "Strict" ou "None" selon vos besoins ,Lax
                domain: "127.0.0.1", // Assurez-vous que ce domaine correspond
                path: "/"
            };

            res.headers.append(
                "Set-Cookie",
                `id_User=${resp.data.id}; HttpOnly=${cookieOptions.httpOnly}; SameSite=${cookieOptions.sameSite}; Secure=${cookieOptions.secure};Domain=${cookieOptions.domain};Path=${cookieOptions.path}`
            );
            res.headers.append(
                "Set-Cookie",
                `token=${resp.data.token};  HttpOnly=${cookieOptions.httpOnly}; SameSite=${cookieOptions.sameSite}; Secure=${cookieOptions.secure};Domain=${cookieOptions.domain};Path=${cookieOptions.path}`
            );
            res.headers.append(
                "Set-Cookie",
                `CSRF_TOKEN=${crypto.randomUUID()};  HttpOnly=${cookieOptions.httpOnly}; SameSite=${cookieOptions.sameSite}; Secure=${cookieOptions.secure};Domain=${cookieOptions.domain};Path=${cookieOptions.path}`
            );

            return res;
        }
    }


    if (url.pathname === "/login" && req.method === "POST") {
        let func = async () => {
            try {
                return req.text().then(e => {
                    let EJson = JSON.parse(e)
                    let sanity = sanitize(EJson.email)
                    let accountFind = mongoAccount.GetById({ email: sanity }, "account")
                    return accountFind.then(async (ev) => {
                        if (ev == null) return { error: "account not find" };
                        if (ev.password !== EJson.password) return { error: "password incorrect" };
                        return ev
                    })
                })
            } catch (error) {
                console.log(error)
            }
        }
        let value = await func();
        console.log(!value?.error)
        let resp;
        if (!value?.error) {
            let dataConnection = {
                user: escapeHTML(value.user),
                id: value.id,
                token: await joseGroupeSign({
                    id: value.id,
                    user: escapeHTML(value.user)
                    //"password": url.searchParams.get("password"),
                }),

            }
            let ValueStatus: ISStatusAccount = {
                status: "Online"
            };
            let sanity = sanitize(ValueStatus)
            let sanityID = sanitize(value.id)
            mongoAccount.update({ id: sanityID }, { "$set": sanity }, "account")
            resp = JSON.stringify(dataConnection)
        } else {
            resp = value.error
        }

        /*
                let dataConnection = {
                    token: await joseGroupeSign({
                        id: ev.id,
                        user: escapeHTML(ev.user)
                        //"password": url.searchParams.get("password"),
                    }),
                    user: escapeHTML(ev.user),
                    id: ev.id,
                }
                    */


        let res = new Response(resp, {
            status: 200,
            headers: headers,
        });
        return res
    }
    // creation de compte 
    if (url.pathname === "/register" && req.method === method.POST) {


        console.log(req.remoteAddr)

        let funcRequest = async () => {
            try {
                return req.text().then(e => e)
            } catch (error) {
            }
        }
        let funcFindAccount = async (email: string) => {
            try {
                let sanity = sanitize(email)
                let accountFind = mongoAccount.GetById({ email: sanity }, "account")
                return accountFind.then(async (ev) => {
                    if (ev == null) return { error: "account not find" };
                    return ev
                })
            } catch (error) {
            }
        }
        let funcGenerateID = async (id: string) => {
            try {
                let sanity = sanitize(id)
                let accountFind = mongoAccount.GetById({ id: sanity }, "account")
                return accountFind.then(async (ev) => {
                    if (ev !== null) {
                        let IDAccount = await crypto.randomUUID()
                        return funcGenerateID(IDAccount)
                    }
                    return id
                })
            } catch (error) {

            }
        }
        let reqReg = JSON.parse(await funcRequest())
        let FindAcc = await funcFindAccount(escapeHTML(reqReg.email))

        let resp = {
            data: "",
            response: "method " + req.method + " path : " + url.pathname,
        };
        if (FindAcc?.error) {

            if (validator.isEmail(escapeHTML(reqReg.email))) {
                let SaveAccountDb: ISAccountSend = {
                    id: await funcGenerateID(crypto.randomUUID()),
                    user: escapeHTML(reqReg.user),
                    email: escapeHTML(reqReg.email),
                    password: await Bun.password.hash(escapeHTML(reqReg.password)),
                    create_At: new Date(),
                    enable: true,
                    status: "Offline"
                };
                mongoAccount.pushAny("account", SaveAccountDb, false);
                resp = {
                    data: "account created",
                    response: "method " + req.method + " path : " + url.pathname,
                };
            }
            else {
                resp = {
                    data: "email invalid",
                    response: "method " + req.method + " path : " + url.pathname,
                };
            }



        } else {
            resp = {
                data: "account existing",
                response: "method " + req.method + " path : " + url.pathname,
            };
        }

        let res = await randomDelayedResponse(new Response(JSON.stringify(resp), {
            status: 200,
            headers: headersSecurity,
        }))
        return res

    }


};

import { escapeHTML } from "bun";

export let ConnectOpen = async (ws, sockets, userData, { mongoAccount, mongoCustom }) => {
    console.log("pass")
    ws.subscribe("welcome");
    ws.subscribe("UserList");
    ws.subscribe("test")
    //@ts-ignore
    ws.data.counter++;
    sockets.push(ws);
    //@ts-ignore
    let messageAll = { all: "welcome " + escapeHTML(ws.data.user) };
    userData.push({
        user: escapeHTML(ws.data.user),
        id_User: escapeHTML(ws.data.id_User),
        img: escapeHTML("https://picsum.photos/600/300"),
        last_message: escapeHTML(""),
        date: escapeHTML(new Date().toTimeString().slice(0, 8).slice(0, 5)),
        hasNotification: escapeHTML("false"),
        notification: escapeHTML(0),

        //token: escapeHTML(ws.data.token),
    });
    let listUserData = { cat: "userlist", list: userData };

    console.log("connected new user ", ws.data.user)
    console.log("connected new user ", ws.data.id_User)
    let listUserMongo = await mongoAccount.GetAllColl({}, { projection: { password: 0, email: 0, _id: 0, enable: 0, create_At: 0 } }, "account")
    let UserHistory: any[] = [];
    await Promise.all(
        listUserMongo.map(async (user: any) => {

            if (user.id !== ws.data.id_User) {
                let conversation = await mongoCustom.GetByOne(user.id, ws.data.id_User, {}, { sort: { _id: -1 } })

                if (!conversation?.err) {
                    let tempa = {
                        user: user.user,
                        id_User: user.id,
                        img: "https://picsum.photos/600/300",
                        last_message: conversation.message,
                        date: conversation.date,
                        hasNotification: "false",
                        notification: "0",
                    }
                    UserHistory.push(tempa)
                }

            }
        }))


    console.log("ok message")
    console.log(UserHistory)
    console.log(userData)



    //@ts-ignore
    ws.publish("test", JSON.stringify({ test: "test" }));
    ws.publish("welcome", JSON.stringify(messageAll));
    ws.publish("UserList", JSON.stringify(listUserData));
    console.log("connected new user ")
    //ws.send(JSON.stringify({ cat: "userlist", list: UserHistory }));
}

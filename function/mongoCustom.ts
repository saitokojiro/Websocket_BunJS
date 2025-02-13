import { MongoClient } from "mongodb";
import { escapeHTML } from "bun";
import { ISAccountSend, ISMessageSend } from "../interface/interfaceWS";


const client = new MongoClient(process.env.MONGO_DB);
export let statusDB = ""

try {
    await client.connect().then(() => statusDB = "Online").catch(err => statusDB = "Offline")

} catch (error) {
    console.log(error)
}

/*
export let MongoCustoms = ((param: string) => {
    // Le code de votre fonction MongoCustom ici...
    const setDatabaseName = () => {
        return param;
    };
    // Retourner un objet contenant les fonctions publiques
    return {
        configNameDatabase: setDatabaseName,
        // Ajouter d'autres fonctions publiques ici...
    };
});

let mongoCustom = MongoCustoms("data");
mongoCustom.configNameDatabase()

*/

export let MongoCustom = ((param: string) => {
    let db = client.db(param);

    let mongoVerificationCollectionUser = async (typeC: string) => {
        const collections = await db.listCollections().toArray();
        const collection_type = collections.find(c => c.name === typeC);
        console.log(collection_type)
        console.log(typeC)
        if (collection_type) {
            return collection_type
        } else {
            return typeC
        }


    }
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

    }

    let mongoAnyPush = async (type: any, anyJson: Object, onlyCollection = true) => {
        let verification = await mongoVerificationCollectionUser(type)
        const collection = db.collection(escapeHTML(onlyCollection == true ? verification : type));
        await collection.insertOne(anyJson);
    }

    let mongoPush = async (messageJson: ISMessageSend) => {
        let verification = await mongoVerificationCollectionExist(messageJson.to, messageJson.sender)
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

    let mongoGetByOne = async (id_user_one: string, id_user_two: string, findObject: object) => {
        let verification = await mongoVerificationCollectionExist(id_user_one, id_user_two)
        let collection = db.collection(escapeHTML(verification));
        if ((await collection.findOne(findObject)) !== null) {
            console.log("in")
            return await collection.findOne(findObject);
        }
        else {
            console.log("out")
            return await { "response": "no message found" }
        }

    }

    let mongoGetBy = async (id_user_one: string, id_user_two: string, findObject: object) => {
        let verification = await mongoVerificationCollectionExist(id_user_one, id_user_two)
        let collection = db.collection(escapeHTML(verification));
        console.log(await collection.find(findObject).toArray())

        if ((await collection.find(findObject).toArray()).length !== 0) {
            //return await collection.find().toArray();
            return await collection.find(findObject).toArray();
        }
        else {
            return await [{ "response": "no message found" }]
        }
    }

    let mongoGetAll = async (id_user_one: string, id_user_two: string, haslimit: boolean = false, limit: number = 20, page: number = 0) => {
        let verification = await mongoVerificationCollectionExist(id_user_one, id_user_two)
        let collection = db.collection(escapeHTML(verification));
        if ((await collection.find().toArray()).length != 0) {
            //return await collection.find().toArray();
            if (haslimit) {
                return await collection.find().limit(limit).skip(limit * page).toArray();
            } else {
                return await collection.find().toArray();
            }
            //return await collection.find().limit(20).skip(20).toArray();
        }
        else {
            return await [{ "response": "no message found" }]
        }

    }

    let mongoGetById = async (checkContent: object, selectCollection: string) => {
        let collection = db.collection(escapeHTML(selectCollection))
        return await collection.findOne(checkContent)
    }

    let mongoDelete = async () => {

    }

    let mongoUpdate = async (checkContent: object, update: object, selectCollection: string) => {
        let collection = db.collection(escapeHTML(selectCollection))
        return await collection.updateOne(checkContent, update)
    }

    return {
        pushAny: mongoAnyPush,
        push: mongoPush,
        getAll: mongoGetAll,
        GetBy: mongoGetBy,
        GetByOne: mongoGetByOne,
        GetById: mongoGetById,
        update: mongoUpdate,
        //delete: mongoDelete
    };
    //};
});






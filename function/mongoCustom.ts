import { MongoClient } from "mongodb";
import { escapeHTML } from "bun";


const client = new MongoClient(process.env.MONGO_DB);

try {
    await client.connect()
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
        let verification = await mongoVerificationCollectionExist(id_user_one, id_user_two)
        let collection = db.collection(escapeHTML(verification));
        return await collection.find().toArray();
    }

    let mongoGetById = async () => {

    }

    let mongoDelete = async () => {

    }

    return {
        push: mongoPush,
        getAll: mongoGetAll,
        //update: mongoUpdate,
        //delete: mongoDelete
    };
    //};
});






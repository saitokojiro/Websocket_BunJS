import { MongoClient } from "mongodb";
import { escapeHTML } from "bun";
import { ISAccountSend, ISMessageSend } from "../interface/interfaceWS";


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

    let mongoVerificationCollectionUser = async (typeC : string)=>{
        const collections = await db.listCollections().toArray();
        const collection_type = collections.find(c=> c.name === typeC);
        if(collection_type){
            return collection_type
        }else{
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

    let mongoAnyPush = async (type: any, anyJson: Object) => {        
        let verification = await mongoVerificationCollectionUser(type)
        const collection = db.collection(escapeHTML(verification));
        await collection.insertOne(anyJson); 
    }

    let mongoPush = async (messageJson: ISMessageSend) => {        
        let verification = await mongoVerificationCollectionExist(messageJson.to, messageJson.sender)
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

    let mongoGetByOne = async (id_user_one: string, id_user_two: string , findObject: object) => {
        let verification = await mongoVerificationCollectionExist(id_user_one, id_user_two)
        let collection = db.collection(escapeHTML(verification));
        if((await collection.findOne(findObject)) !== null){
            console.log("in")
            return await collection.findOne(findObject);
        }
        else{
            console.log("out")
            return await {"response":"no message found"}
        }
        
    }

    let mongoGetBy = async (id_user_one: string, id_user_two: string , findObject: object) => {
        let verification = await mongoVerificationCollectionExist(id_user_one, id_user_two)
        let collection = db.collection(escapeHTML(verification));
        console.log(await collection.find(findObject).toArray())
        
        if((await collection.find(findObject).toArray()).length !== 0){
            //return await collection.find().toArray();
            return await collection.find(findObject).toArray();
        }
        else{
            return await [{"response":"no message found"}]
        }
    }

    let mongoGetAll = async (id_user_one: string, id_user_two: string) => {
        let verification = await mongoVerificationCollectionExist(id_user_one, id_user_two)
        let collection = db.collection(escapeHTML(verification));
        if((await collection.find().toArray()).length != 0){
            //return await collection.find().toArray();
            return await collection.find().toArray();
        }
        else{
            return await [{"response":"no message found"}]
        }
        
    }

    let mongoGetById = async () => {

    }

    let mongoDelete = async () => {

    }

    return {
        pushAny:  mongoAnyPush,
        push:  mongoPush,
        getAll: mongoGetAll,
        GetBy: mongoGetBy,
        GetByOne: mongoGetByOne,
        //update: mongoUpdate,
        //delete: mongoDelete
    };
    //};
});






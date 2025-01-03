import "dotenv/config"; // Import
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";


const db = "Midudev";
const collection = "movies";

const client = new MongoClient(process.env.Mongo_DB, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

async function connect () {
    try {
      await client.connect()
      const database = client.db(db)
      return database.collection(collection)
    } catch (error) {
      console.error('Error connecting to the database')
      console.error(error)
      await client.close()
    }
}


export class MovieModel {
    
    static async getAll({genre}) {
        const movies =  await connect();
        const filteredMovies = genre? 
            await movies.find({genre: {
                $elemMatch: {
                  $regex: genre,
                  $options: 'i'
                }
              }}).toArray() : await movies.find().toArray();
        return filteredMovies
    }

    static async getById({id}) {
        const movies =  await connect();
        const objectId = new ObjectId(id)
        return await movies.findOne({_id: objectId});
    }

    static async create({input}) {

        const movies =  await connect();
        const result = await movies.insertOne(input);
        return movies.findOne({_id: result.insertedId});
    }

    static async update({id, input}) {
        const movies =  await connect();
        const objectId = new ObjectId(id)
        const result = await movies.findOneAndUpdate({_id: objectId}, {$set: input},{returnNewDocument: true, returnDocument: 'after'});
        return result;
    }

    static async delete({id}) {
        const movie = await connect()
        const objectId = new ObjectId(id)
        const deletResult = await movie.deleteOne({_id: objectId})
        return deletResult.deletedCount > 0;
    }
}
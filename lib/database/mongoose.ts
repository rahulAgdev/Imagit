import mongoose, {Mongoose} from 'mongoose'

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection{
    conn: Mongoose|null;
    promise: Promise<Mongoose> | null;
}

// we have to call it everytime we need connection. coz it runs in a serverless environment. it starts when handling a req and shuts when done. it ensures that each request is handled independently, which works well with scalable and flexible connection. 

// we need to cache to decrease load.

let cached : MongooseConnection = (global as any).mongoose

if(!cached){
    cached = (global as any).mongoose = {
        conn: null, promise: null
    }
}

export const connectToDatabase = async () => {
    if(cached.conn) return cached.conn;
    if(!MONGODB_URL) throw new Error("Missing mongodb url")

    cached.promise = cached.promise || mongoose.connect(MONGODB_URL, {dbName: 'imagit', bufferCommands: false})

    cached.conn = await cached.promise;
    return cached.conn;
}
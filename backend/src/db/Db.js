import mongoose from "mongoose";

const connectDb = async (dbName) => {
    try {
        const uri = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: dbName
        })
        console.log(`\n MongoDB connected !! DB HOST: ${uri.connection.host}`)
    } catch (error) {
        console.log("MongoDb connection error", error.message)
    }
}

export default connectDb
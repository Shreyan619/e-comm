import express from "express"
import { uploadtoCloudinary } from "./utils/uploadCloudinary.js"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

const app = express()
dotenv.config()

app.use(cors({
    origin: `https://${process.env.HOST}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // enable set cookie
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser())


import user from "./routes/user.routes.js";
import product from "./routes/product.routes.js"
import order from "./routes/order.routes.js"

//routes declaration
app.use("/api/v1", user)
app.use("/api/v1", product)
app.use("/api/v1", order)



const uploadFiles = async () => {
    const files = []
    try {
        for (const file of files) {
            await uploadtoCloudinary(file);
        }
    } catch (error) {
        console.log("Error uploading files to Cloudinary:", error);
    }
};

uploadFiles()

export { app }
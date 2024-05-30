import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv"


// include dotenv.config() in any file that relies on environment variables
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});



const uploadtoCloudinary = (async (file) => {
    try {
        const upload = await cloudinary.uploader.upload(file)
        console.log("file uploaded successfully to cloudinary", upload)
    } catch (error) {
        console.log("error uploading file on cloudinary", error)
    }
})

export { uploadtoCloudinary }
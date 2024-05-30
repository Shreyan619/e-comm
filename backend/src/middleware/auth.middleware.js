import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { apiResponse } from "../utils/apiResponse.js";

dotenv.config()

export const verifyJWT = asyncHandler(async (req, _, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log(token);

        if (!token) {
            throw new apiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {

            throw new apiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token")
    }
})

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log(req.user.role)
        if (!roles.includes(req.user.role)) {
            throw new apiError(403,
                `Role : ${req.user.role} is not allowed to access this resouce`)

        }

        next()
    }
}
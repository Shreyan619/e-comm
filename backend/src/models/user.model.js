import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import validator from "validator"
import dotenv from "dotenv"
import crypto from "crypto"

dotenv.config()

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        lowerCase: true,
        unique: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        lowerCase: true,
        unique: true,
        trim: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    fullName: {
        type: String,
        required: true,
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        default: "user",
    },
    refreshToken: {
        type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,

}, { timestamps: true })

//bcrypt used for hashing passwords
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//jwt for authentication and authorization
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.getPasswordResetToken = function () {

    //generating tokens
    const resetToken = crypto.randomBytes(20).toString("hex")
    console.log(resetToken)

    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken=crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000

    return resetToken
}


export const User = mongoose.model("User", userSchema)
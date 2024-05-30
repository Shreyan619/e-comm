import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js"
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto"


dotenv.config()

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //putting refreshtoken in database
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new apiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { userName, email, fullName, password } = req.body
    console.log(req.body)
    console.log(userName, email, fullName, password)

    if (![userName, email, fullName, password]) {
        throw new apiError(400, "all fields required")
    }

    const existUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    console.log(existUser)
    if (existUser) {
        throw new apiError(409, "User with email or Username already exits")
    }

    const newUser = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: {
            public_id: "sample id",
            url: "sample url"
        }
    })

    if (!newUser) {
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, newUser, "User registered Successfully")
    )

})


const loginUser = asyncHandler(async (req, res) => {

    const { userName, email, password } = req.body

    if (!(userName || email)) {
        throw new apiError(404, "username or email required")
    }

    const findUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (!findUser) {
        throw new apiError(404, "user does not required")
    }

    const isPasswordValid = await findUser.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(401, "password incorrect")
    }

    //called to generate access and refresh tokens for the authenticated user
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(findUser._id)

    const loggedinUser = await User.findById(findUser._id).select("-password -refreshToken")
    console.log(loggedinUser)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedinUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: undefined // this removes the field from document
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .status(200)
            .json(new apiResponse(200, {},
                "User logged out successfully"
            ))
    } catch (error) {
        console.log(error.message)
        return res
            .status(500)
            .json(new apiResponse(500, error.message));
    }
    // res.cookie("token", null, {
    //     expires: new Date(Date.now()),
    //     httpOnly: true,
    //   });

    //   res.status(200).json({
    //     success: true,
    //     message: "Logged Out",
    //   });
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const getRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!getRefreshToken) {
        throw new apiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(getRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const getUser = await User.findById(decodedToken?._id)

        if (!getUser) {
            throw new apiError(401, "inavlid refresh token")
        }

        if (getRefreshToken !== getUser?.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(getUser._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new apiResponse(200,
                {
                    accessToken, refreshToken: newRefreshToken
                },
                "AccessToken refreshed"
            ))

    } catch (error) {
        new apiError(401, error?.message || "Inavlid refresh Token")
    }

})

const forgotPassword = asyncHandler(async (req, res) => {

    const { userName, email, password } = req.body

    const findUser = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (!findUser) {
        throw new apiError(404, "User not found")
    }

    //get resetpasswordtoken
    const resetToken = findUser.getPasswordResetToken()

    await findUser.save({ validateBeforeSave: false })

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
    console.log(resetPasswordUrl)

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested
     this email then, please ignore it.`
    console.log(message)

    try {
        await sendEmail({
            to: findUser.email,
            subject: "Email password Recovery",
            text: message
        })

        res.status(200)
            .json({
                message: `email sent to ${findUser.email} successfully`,
                success: true
            })
    } catch (error) {

        findUser.resetPasswordToken = undefined
        findUser.resetPasswordExpire = undefined

        return res.status(500)
            .json(new apiResponse(500, error.message))
    }
})

const resetPassword = asyncHandler(async (req, res) => {

    try {
        //creating token hash
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");
        console.log("Reset password token:", resetPasswordToken);

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        // console.log("User:", user); 

        if (!user) {
            console.log("User not found or token expired");
            throw new apiError(400, "Reset Password Token is invalid or has been expired");
        }

        if (req.body.password !== req.body.confirmPassword) {
            console.log("Password does not match");
            throw new apiError(400, "Password does not match");
        }

        console.log("Updating user password");
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        console.log("Password updated successfully");
        return res
            .status(200)
            .json(new apiResponse(201, user, resetPasswordToken));
    } catch (error) {
        console.log(error.message)
    }
})

const updatePassword = asyncHandler(async (req, res) => {

    const getUser = await User.findById(req.user.id).select("+password")

    const isPasswordValid = await getUser.isPasswordCorrect(req.body.password)

    if (!isPasswordValid) {
        throw new apiError(401, "password incorrect")
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        throw new apiError(400, "password does not match")
    }

    getUser.password = req.body.newPassword

    await getUser.save()

    return res
        .status(200)
        .json(new apiResponse(200, getUser, "User fetched successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {

    const getUser = await User.findById(req.user.id)

    return res
        .status(200)
        .json(new apiResponse(200, getUser, "User fetched successfully"))
})

const updateProfile = asyncHandler(async (req, res) => {

    const newData = {
        userName: req.body.userName,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
        findOneAndUpdate: false
    })

    return res
        .status(200)
        .json(new apiResponse(200, user, "User data updated successfully"))
})

const getAllusers = asyncHandler(async (req, res) => {

    const users = await User.find();

    return res.status(200)
        .json(new apiResponse(200, users))
})

const getSingleusers = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);

    return res.status(200)
        .json(new apiResponse(200, user))
})

const updateRole = asyncHandler(async (req, res) => {

    const newData = {
        userName: req.body.userName,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
        findOneAndUpdate: false,
    })

    return res
        .status(200)
        .json(new apiResponse(200, user, "User role updated successfully"))
})

const deleteUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id)

    if (!user) {
        throw new apiError(400, `User does not exist with (${req.params.id}) id`)
    }

    await user.deleteOne()

    return res.status(200)
        .json(new apiResponse(201, "User deleted successfully"))
})

export {
    generateAccessAndRefreshToken,
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    updatePassword,
    updateProfile,
    deleteUser,
    getAllusers,
    getSingleusers,
    updateRole
}
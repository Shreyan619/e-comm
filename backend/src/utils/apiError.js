import { apiResponse } from "./apiResponse.js"

class apiError extends Error {
    constructor(
        statuscode,
        message = "Something went wrong",
        error = [],
        stack = ""
    ) {
        super(message)
        this.statuscode = statuscode
        this.data = null

        this.message = message
        this.success = false
        this.error = error

        // Wrong Mongodb Id error
        if (error.name === "CastError") {
            const message = `Resource not found. Invalid: ${error.path}`;
            error = new apiResponse(message, 400);
        }

        // Mongoose duplicate key error
        if (error.code === 11000) {
            const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
            err = new apiResponse(message, 400);
        }

        // Wrong JWT error
        if (error.name === "JsonWebTokenError") {
            const message = `Json Web Token is invalid, Try again `;
            err = new apiResponse(message, 400);
        }

        // JWT EXPIRE error
        if (error.name === "TokenExpiredError") {
            const message = `Json Web Token is Expired, Try again `;
            err = new apiResponse(message, 400);
        }

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { apiError }
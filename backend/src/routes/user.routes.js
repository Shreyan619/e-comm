import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    updatePassword,
    updateProfile,
    deleteUser,
    getAllusers,
    getSingleusers,
    updateRole
}
    from "../controller/user.controller.js";
import { authorizeRoles, verifyJWT } from "../middleware/auth.middleware.js";

const user = Router()


user.post("/register", registerUser)
user.post("/login", loginUser)
user.post("/logout", verifyJWT, logoutUser)
// user.post("/refreshtoken", refreshAccessToken)
user.get("/pasword/forgot", forgotPassword)
user.post("/password/reset/:token", resetPassword)
user.get("/me", verifyJWT, getCurrentUser)
user.put("/password/update", verifyJWT, updatePassword)
user.put("/me/update", verifyJWT, updateProfile)
user.get("/admin/users", verifyJWT, authorizeRoles("user"), getAllusers)
user.get("/admin/user/:id", verifyJWT, authorizeRoles("user"), getSingleusers)
user.put("/admin/user/:id", verifyJWT, authorizeRoles("user"), updateRole)
user.delete("/admin/user/:id", verifyJWT, deleteUser)

export default user
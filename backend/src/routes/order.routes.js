import { Router } from "express";
import { authorizeRoles, verifyJWT } from "../middleware/auth.middleware.js";
import {
    getAllOrders,
    getSingleOrder,
    newOrder,
    getMyOrders,
    updateOrder,
    deleteOrder

} from "../controller/order.controller.js";

const order = Router()

order.post("/order/new", verifyJWT, newOrder)
order.get("/order/:id", verifyJWT, authorizeRoles("user"), getSingleOrder)
order.get("/orders/me", verifyJWT, getMyOrders)
order.get("/admin/orders", verifyJWT, authorizeRoles("user"), getAllOrders)
order.put("/admin/order/:id", verifyJWT, authorizeRoles("user"), updateOrder)
order.delete("/admin/order/:id", verifyJWT, authorizeRoles("user"), deleteOrder)

export default order
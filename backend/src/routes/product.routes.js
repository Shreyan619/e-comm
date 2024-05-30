import { Router } from "express";
import {
    createProdReview,
    createProducts,
    deleteProduct,
    deleteReview,
    getAllProducts,
    getAllProductsReviews,
    getProductDeatils,
    updateProduct
} from "../controller/product.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const product = Router()

product.get("/products", getAllProducts)
product.post("/admin/products/new", verifyJWT, authorizeRoles("user"), createProducts)
product.put("/admin/products/:id", verifyJWT, authorizeRoles("admin"), updateProduct)
product.delete("/admin/products/:id", verifyJWT, authorizeRoles("admin"), deleteProduct)
product.get("/products/:id", getProductDeatils)
product.put("/review", verifyJWT, createProdReview)
product.get("/reviews", getAllProductsReviews)
product.delete("/review/delete", verifyJWT, deleteReview)


export default product
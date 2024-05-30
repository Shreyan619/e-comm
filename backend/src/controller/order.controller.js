import { Product } from "../models/product.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Order } from "../models/orderModel.js";
import order from "../routes/order.routes.js";

const newOrder = asyncHandler(async (req, res) => {

    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200)
        .json(new apiResponse(201, order))
})

const getSingleOrder = asyncHandler(async (req, res) => {

    const order = await Order.findById(req.params.id).populate("user", "email userName")

    if (!order) {
        throw new apiError(404, "Order not found with dis id")
    }

    res.status(200)
        .json(new apiResponse(201, order))
})

// get logged in user  Orders
const getMyOrders = asyncHandler(async (req, res) => {

    const orders = await Order.find({ user: req.user._id });

    res.status(200)
        .json(new apiResponse(201, orders))
})

// update Order Status -- Admin
const getAllOrders = asyncHandler(async (req, res) => {

    const orders = await Order.find();

    let totalAmount = 0

    orders.forEach((order) => {
        totalAmount += order.totalPrice
    })

    res.status(200)
        .json(new apiResponse(201, orders, totalAmount))
})

async function updateStock(id, quantity) {

    const product = await Order.findById(id)

    if (!product) {
        throw new apiError(404, `Product not found with ID ${id}`);
    }

    if (!product.Stock) {
        throw new apiError(400, `Stock information not available for product with ID ${id}`);
    }
    product.Stock -= quantity

    await product.save({ validateBeforeSave: false })
}

// update Order Status -- Admin
const updateOrder = asyncHandler(async (req, res) => {

    const order = await Order.findById(req.params.id)

    if (!order) {
        throw new apiError(404, "Order not found with dis id")
    }

    if (order.orderStatus === "Delivered") {
        throw new apiError("You have already delivered this order", 400)
    }

    const updateStockPromises = order.orderItems.map(async (orderItem) => {
        return updateStock(orderItem.product, orderItem.quantity);
    });

    await Promise.all(updateStockPromises)

    order.orderStatus = req.body.status

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false })

    res.status(200)
        .json(new apiResponse(202, order))
})

const deleteOrder = asyncHandler(async (req, res) => {

    const order = await Order.findById(req.params.id)

    if (!order) {
        throw new apiError(404, "Order not found with dis id")
    }

    await order.deleteOne()

    res.status(200)
        .json(new apiResponse(202))
})


export {
    newOrder,
    getSingleOrder,
    getMyOrders,
    getAllOrders,
    updateOrder,
    deleteOrder
}

//update order not working
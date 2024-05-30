import { Product } from "../models/product.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiFeatures } from "../utils/apiFeatures.js";

const createProducts = asyncHandler(async (req, res) => {

    req.body.user = req.user._id

    const product = await Product.create(req.body)

    return res
        .status(200)
        .json(new apiResponse(200, product, "product created"))
})

const getAllProducts = asyncHandler(async (req, res) => {

    const resultperPage = 5
    const productCount = await Product.countDocuments()

    const apifeatures = new apiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultperPage)

    const products = await apifeatures.query

    return res
        .status(200)
        .json(new apiResponse(200, products, productCount))
})

const updateProduct = asyncHandler(async (req, res, next) => {

    let product = await Product.findById(req.params.id)

    if (!product) {
        throw new apiError(500, "product not found")
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })


    return res
        .status(200)
        .json(new apiResponse(200, product, "product updated"))

})

const deleteProduct = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.params.id)

    if (!product) {
        throw new apiError(500, "product not found")
    }

    await Product.findByIdAndDelete(req.params.id)

    return res
        .status(200)
        .json(new apiResponse(200, "product deleted successfully"))



})

const getProductDeatils = asyncHandler(async (req, res, next) => {

    const product = await Product.findById(req.params.id)

    if (!product) {
        throw new apiError(500, "product not found")
    }

    return res
        .status(200)
        .json(new apiResponse(200, "product details fetched", product))
})

const createProdReview = asyncHandler(async (req, res) => {

    const { rating, comment, productId } = req.body

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    const isReview = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString())

    //The isReview variable is used to check if the current user (req.user._id) has already left a review for the
    // specified product (productId). This check is performed using the find method on the product.reviews array

    //If isReview is truthy(meaning the user has already reviewed the product), the code proceeds to update the 
    //existing review with the new rating and comment.

    //If isReview is falsy(meaning the user has not reviewed the product yet), the code adds a new review to the 
    //product.reviews array and increments the numOfReviews field of the product object.

    if (isReview) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment)

        })
    } else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg = 0

    product.reviews.forEach((rev) => {
        avg += rev.rating
    })

    product.ratings = avg / product.reviews.length

    await product.save({ validateBeforeSave: false })

    res.status(200)
        .json(new apiResponse(200, "Review created or updated"))
})

const getAllProductsReviews = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.query.id)

    if (!product) {
        throw new apiError(404, "Product not found")
    }

    res.status(200)
        .json(
            {
                success: true,
                review: product.reviews
            })
})

const deleteReview = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.query.productId)
    // console.log(product)

    if (!product) {
        throw new apiError(404, "Product not found")
    }

    const reviews = product.reviews.filter((rev) =>
        rev._id.toString() !== req.query.id.toString())
    console.log(reviews)

    let avg = 0

    reviews.forEach((rev) => {
        avg += rev.rating
    })

    const ratings = reviews.length > 0 ? avg / reviews.length : 0

    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(
        req.query.productId, {
        reviews, ratings, numOfReviews
    },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        }
    )

    res.status(200)
        .json(new apiResponse(200, "Review deleted or updated"))
})

export {
    createProducts,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getProductDeatils,
    createProdReview,
    getAllProductsReviews,
    deleteReview
}
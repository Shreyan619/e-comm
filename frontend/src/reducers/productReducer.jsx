import {
    ALL_PRODUCT_REQUEST,
    ALL_PRODUCT_SUCCESS,
    ALL_PRODUCT_FAIL,
    CLEAR_ERRORS,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
} from "../constants/productConstants"


const initialState = {
    products: [],
    loading: false,
    error: null,
  }

export const productReducer = (state = initialState , action) => {

    switch (action.type) {
        case ALL_PRODUCT_REQUEST:

            return {
                loading: true,
                products: [],

            }
        case ALL_PRODUCT_SUCCESS:

            return {
                ...state,
                loading: false,
                products: action.payload.products || action.payload.message,
                productCount: action.payload.productCount
            }
        case ALL_PRODUCT_FAIL:
            // console.log("All Product Fail. Error:", action.payload)

            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case CLEAR_ERRORS:

            return {
                ...state,
                error: null
            }

        default:
            // console.log("Default case. State:", state)
            return state
    }
}
export const productDetailsReducer = (state = { product: {} }, action) => {

    switch (action.type) {
        case PRODUCT_DETAILS_REQUEST:

            return {
                loading: true,
                ...state,

            }
        case PRODUCT_DETAILS_SUCCESS:

            return {
                loading: false,
                product: action.payload.product,
            }
        case PRODUCT_DETAILS_FAIL:
            // console.log("All Product Fail. Error:", action.payload)

            return {
                loading: false,
                error: action.payload
            }
        case CLEAR_ERRORS:

            return {
                ...state,
                error: null
            }

        default:
            // console.log("Default case. State:", state)
            return state
    }
}
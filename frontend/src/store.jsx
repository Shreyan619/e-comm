import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { productDetailsReducer, productReducer } from './reducers/productReducer'


const rootReducer = combineReducers({
    products: productReducer,
    productDetails: productDetailsReducer,
})

let initialState = {}

const store = configureStore({
    initialState,
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== 'production'
})

export default store
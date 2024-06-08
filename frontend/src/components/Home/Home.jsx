import React, { useEffect } from 'react'
import { Fragment } from 'react'
import { CgMouse } from "react-icons/cg"
import { Product } from './Product'
import "./home.css"
import MetaData from '../layout/MetaData'
import { getAllProducts } from '../../actions/productAction'
import { useDispatch, useSelector } from "react-redux"
import Loader from '../layout/Loader/Loader'



const Home = () => {

  const dispatch = useDispatch()
  const { loading, error, products } = useSelector((state) => state.products)
  // console.log("Products:", products)

  useEffect(() => {
    dispatch(getAllProducts())
  }, [dispatch])

  useEffect(() => {
    console.log('Products State after fetching:', products); // Log products state after fetching
  }, [products]);

  console.log('Products State during render:', products);

  console.log("Products:", products)
  return (
    <Fragment>
      {loading ? (<Loader />) : (
        <Fragment>
          <MetaData title="E-COMMERCE" />
          <div className="banner">
            <p>Welcome to Ecommerce</p>
            <h1>FIND AMAZING PRODUCTS BELOW</h1>
            <a href="#container">
              <button>
                Scroll <CgMouse />
              </button>
            </a>
          </div>

          <h2 className="homeHeading">Featured Products</h2>
          <div className="container" id="container">
            {products && products.map((product) => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        </Fragment>
      )}
    </Fragment>
  )
}

export default Home

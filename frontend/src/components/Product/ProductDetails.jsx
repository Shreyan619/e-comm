import React, { Fragment, useEffect } from 'react'
import Carousel from 'react-material-ui-carousel'
import "./ProdDetails.css"
import { useDispatch, useSelector } from "react-redux"
import { getAllProductsDetails } from '../../actions/productAction'

const ProductDetails = (match) => {

  const dispatch = useDispatch()

  const {}=useSelector(state=>state.productDetails)

  useEffect(() => {
    dispatch(getAllProductsDetails(match.params.id))

  }, [dispatch,match.params.id])


  return (
    <Fragment>
      <div className='ProductDetails'>
        <Carousel>
          {product.images && product.images.map((item, i) => (
            <img className='CarouselImage'
              key={item.url}
              alt={`${i} Slide`}
              src={item.url}
            />
          ))}
        </Carousel>
      </div>
    </Fragment>
  )
}

export default ProductDetails

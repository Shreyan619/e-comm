import { useEffect, useState } from 'react'
import { BrowserRouter as Router ,Route, Routes} from "react-router-dom"
import './App.css'
import Header from './components/layout/Header/Header'
import WebFont from "webfontloader"
import { Footer } from './components/layout/Footer/Footer'
import Home from './components/Home/Home'
import Loader from './components/layout/Loader/Loader'
import ProductDetails from './components/Product/ProductDetails'

function App() {

  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Roboto", "Droid Sans", "Chilanka"],
      },
    })
  }, [])

  return (
    <>
      <Router>
        <Header />
        <Routes>
        <Route path='/' Component={Home}/>
        <Route path='/product/:id' Component={ProductDetails}/>
        </Routes>
        <Footer />
      </Router>
    </>
  )
}

export default App

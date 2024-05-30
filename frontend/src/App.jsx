import { useEffect, useState } from 'react'
import { BrowserRouter as Router ,Route} from "react-router-dom"
// import './App.css'
import Header from './components/layout/Header/Header'
import WebFont from "webfontloader"
import { Footer } from './components/layout/Footer/Footer'
import Home from './components/layout/Home/Home'

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
        <Route path='/' Component={Home}/>
        <Footer />
      </Router>
    </>
  )
}

export default App

import React from 'react'
import Hero from '../components/sections/Hero'
import Directions from '../components/sections/Directions'
import About from '../components/sections/About'
import Contact from '../components/sections/Contact'

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Directions />
      <About />
      <Contact />
    </>
  )
}

export default Home
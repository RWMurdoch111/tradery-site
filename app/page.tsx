'use client'
import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorksAnimation from './components/HowItWorksAnimation'
import Pricing from './components/Pricing'
import Examples from './components/Examples'
import About from './components/About'
import ContactModal from './components/ContactModal'
import Footer from './components/Footer'

export default function Home() {
  const [showContact, setShowContact] = useState(false)

  return (
    <>
      <Header onContact={() => setShowContact(true)} />
      <main>
        <Hero onContact={() => setShowContact(true)} />
        <HowItWorksAnimation />
        <Examples />
        <Pricing onContact={() => setShowContact(true)} />
        <About />
      </main>
      <Footer onContact={() => setShowContact(true)} />
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </>
  )
}

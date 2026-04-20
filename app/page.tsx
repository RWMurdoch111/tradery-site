'use client'
import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import VideoExplainer from './components/VideoExplainer'
import SocialProof from './components/SocialProof'
import Pricing from './components/Pricing'
import ContactModal from './components/ContactModal'
import Footer from './components/Footer'

export default function Home() {
  const [showContact, setShowContact] = useState(false)

  return (
    <>
      <Header onContact={() => setShowContact(true)} />
      <main>
        <Hero onContact={() => setShowContact(true)} />
        <VideoExplainer />
        <HowItWorks />
        <SocialProof />
        <Pricing onContact={() => setShowContact(true)} />
      </main>
      <Footer onContact={() => setShowContact(true)} />
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </>
  )
}

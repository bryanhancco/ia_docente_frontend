import Header from './components/landing/Header'
import HeroSection from './components/landing/HeroSection'
import FeaturesSection from './components/landing/FeaturesSection'
import RolesSection from './components/landing/RolesSection'
import ProcessSection from './components/landing/ProcessSection'
import TestimonialsSection from './components/landing/TestimonialsSection'
import CTASection from './components/landing/CTASection'
import Footer from './components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <RolesSection />
        <ProcessSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

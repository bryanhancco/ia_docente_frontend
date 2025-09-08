import Header from './landing_page/components/landing/Header'
import HeroSection from './landing_page/components/landing/HeroSection'
import FeaturesSection from './landing_page/components/landing/FeaturesSection'
import RolesSection from './landing_page/components/landing/RolesSection'
import ProcessSection from './landing_page/components/landing/ProcessSection'
import TestimonialsSection from './landing_page/components/landing/TestimonialsSection'
import CTASection from './landing_page/components/landing/CTASection'
import Footer from './landing_page/components/landing/Footer'

export default function Home() {
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

'use client'

import { Button } from '../../components/ui/button'
import { ArrowRight, Sparkles, Brain, BookOpen } from 'lucide-react'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-black"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left text-white">
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Educación
              <span className="text-accent"> Inteligente</span>
              <br />
              para el Futuro
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Plataforma educativa con IA que personaliza el aprendizaje. 
              Crea contenido automático, identifica perfiles cognitivos y 
              potencia la enseñanza con tecnología avanzada.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-6">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 text-white border-white hover:bg-white hover:text-foreground">
                Ver Demo
              </Button>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-8 mt-12">
              <div className="text-center">
                <div className="flex items-center gap-2 text-accent font-semibold text-lg">
                  <Brain className="h-5 w-5" />
                  <span>IA Avanzada</span>
                </div>
                <p className="text-white/80 text-sm">Perfiles cognitivos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-accent font-semibold text-lg">
                  <BookOpen className="h-5 w-5" />
                  <span>Contenido Auto</span>
                </div>
                <p className="text-white/80 text-sm">Generado por IA</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-glow">
              <Image 
                src="/hero-education.jpg" 
                alt="Educación con Inteligencia Artificial" 
                width={600}
                height={400}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

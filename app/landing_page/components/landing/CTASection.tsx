'use client'

import { Button } from '../../components/ui/button'
import { ArrowRight, CheckCircle } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-black"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            ¿Listo para Transformar 
            <span className="text-accent"> tu Educación</span>?
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Únete a miles de docentes y estudiantes que ya están revolucionando 
            el aprendizaje con inteligencia artificial.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="h-6 w-6 text-accent" />
              <span className="text-lg">Gratis por 30 días</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="h-6 w-6 text-accent" />
              <span className="text-lg">Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="h-6 w-6 text-accent" />
              <span className="text-lg">Soporte en español</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="text-xl px-10 py-8">
              Comenzar Gratis Ahora
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button variant="outline" size="lg" className="text-xl px-10 py-8 text-white border-white hover:bg-white hover:text-foreground">
              Programar Demo
            </Button>
          </div>
          
          <p className="text-sm text-white/70 mt-6">
            Más de 10,000 educadores confían en nuestra plataforma
          </p>
        </div>
      </div>
    </section>
  )
}

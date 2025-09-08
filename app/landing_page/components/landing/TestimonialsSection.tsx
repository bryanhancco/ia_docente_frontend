'use client'

import { Card } from '../../components/ui/card'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: "Dra. María González",
    role: "Profesora de Matemáticas",
    institution: "Universidad Nacional",
    content: "Esta plataforma ha revolucionado mi manera de enseñar. La generación automática de contenido me ahorra horas de preparación y mis estudiantes están más comprometidos que nunca.",
    rating: 5,
    avatar: "MG"
  },
  {
    name: "Prof. Carlos Rodríguez",
    role: "Director Académico",
    institution: "Colegio San Martín",
    content: "Los perfiles cognitivos han sido un cambio total. Ahora entendemos mejor cómo aprende cada estudiante y podemos personalizar la enseñanza de manera efectiva.",
    rating: 5,
    avatar: "CR"
  },
  {
    name: "Ana Sofía Castro",
    role: "Estudiante de Ingeniería",
    institution: "Politécnico Nacional",
    content: "El chatbot personalizado es increíble. Responde exactamente como necesito para mi estilo de aprendizaje. Siento que tengo un tutor personal disponible 24/7.",
    rating: 5,
    avatar: "AC"
  }
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-muted">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Lo que Dicen Nuestros
            <span className="text-primary"> Usuarios</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Docentes y estudiantes de toda Latinoamérica ya están transformando 
            su experiencia educativa con nuestra plataforma.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-gradient-card border-0 shadow-soft hover:shadow-glow transition-all duration-300">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>
              
              <div className="relative mb-6">
                <Quote className="h-8 w-8 text-primary/20 absolute -top-2 -left-2" />
                <p className="text-foreground leading-relaxed pl-6">
                  "{testimonial.content}"
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.institution}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

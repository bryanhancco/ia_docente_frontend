'use client'

import { Card } from '../../components/ui/card'
import { 
  Upload, 
  Brain, 
  FileText, 
  MessageSquare,
  ArrowRight
} from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: "Sube tu Material",
    description: "Carga PDFs, documentos y archivos educativos. El sistema los procesa automáticamente.",
    color: "text-primary bg-primary/10"
  },
  {
    icon: Brain,
    title: "IA Procesa",
    description: "Nuestra IA analiza el contenido y crea una base de conocimiento personalizada.",
    color: "text-secondary bg-secondary/10"
  },
  {
    icon: FileText,
    title: "Genera Contenido",
    description: "Crea automáticamente presentaciones, evaluaciones y recursos educativos.",
    color: "text-accent bg-accent/10"
  },
  {
    icon: MessageSquare,
    title: "Personaliza",
    description: "El sistema adapta el contenido según los perfiles cognitivos de cada estudiante.",
    color: "text-primary bg-primary/10"
  }
]

export default function ProcessSection() {
  return (
    <section id="process" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            ¿Cómo 
            <span className="text-primary"> Funciona</span> Nuestra Plataforma?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            En solo 4 pasos simples, transforma tus materiales educativos en 
            una experiencia de aprendizaje personalizada e inteligente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="p-6 bg-gradient-card border-0 shadow-soft hover:shadow-glow transition-all duration-300 h-full">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  
                  <div className="text-sm font-bold text-muted-foreground mb-2">
                    Paso {index + 1}
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-white rounded-full shadow-soft flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

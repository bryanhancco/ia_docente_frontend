'use client'

import { Card } from '../../components/ui/card'
import { 
  Brain, 
  FileText, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Zap,
  BookOpen,
  Upload,
  Presentation
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: "Perfiles Cognitivos",
    description: "IA avanzada identifica patrones de aprendizaje y personaliza la experiencia educativa para cada estudiante.",
  },
  {
    icon: FileText,
    title: "Generación Automática",
    description: "Crea contenido educativo, presentaciones y evaluaciones automáticamente a partir de tus materiales.",
  },
  {
    icon: MessageSquare,
    title: "Chatbot Personalizado",
    description: "Asistente IA que adapta las respuestas según el perfil cognitivo y emocional de cada estudiante.",
  },
  {
    icon: Upload,
    title: "Gestión de Archivos",
    description: "Sube y organiza materiales educativos. El sistema procesa automáticamente PDFs y documentos.",
  },
  {
    icon: Presentation,
    title: "Presentaciones PowerPoint",
    description: "Genera presentaciones profesionales automáticamente con el contenido de tus clases.",
  },
  {
    icon: BarChart3,
    title: "Analytics Avanzados",
    description: "Métricas detalladas del progreso estudiantil y efectividad de los materiales educativos.",
  },
  {
    icon: Users,
    title: "Colaboración",
    description: "Herramientas para docentes y estudiantes que facilitan la interacción y el trabajo en equipo.",
  },
  {
    icon: BookOpen,
    title: "Recursos Web",
    description: "Busca y almacena recursos educativos relevantes de internet automáticamente.",
  },
  {
    icon: Zap,
    title: "Evaluaciones IA",
    description: "Genera preguntas de opción múltiple y evaluaciones adaptativas con retroalimentación inteligente.",
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Características que
            <span className="text-primary"> Transforman</span> la Educación
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nuestra plataforma combina inteligencia artificial avanzada con herramientas 
            educativas intuitivas para crear una experiencia de aprendizaje única.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 bg-gradient-card border-0 shadow-soft hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

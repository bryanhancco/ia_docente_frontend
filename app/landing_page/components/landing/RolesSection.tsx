'use client'

import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { 
  GraduationCap, 
  Users, 
  FileSpreadsheet, 
  Brain,
  MessageCircle,
  BookOpen,
  BarChart3,
  Lightbulb
} from 'lucide-react'

export default function RolesSection() {
  return (
    <section id="roles" className="py-20 bg-muted">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Diseñado para 
            <span className="text-primary"> Docentes</span> y 
            <span className="text-secondary"> Estudiantes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cada rol tiene herramientas específicas diseñadas para maximizar 
            el potencial educativo y el aprendizaje personalizado.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Sección para Docentes */}
          <Card className="p-8 bg-gradient-card border-0 shadow-soft">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-primary/10">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Para Docentes</h3>
                <p className="text-muted-foreground">Herramientas avanzadas de enseñanza</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <span className="text-foreground">Gestión completa de clases y materiales</span>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-primary" />
                <span className="text-foreground">Procesamiento IA de archivos educativos</span>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-foreground">Generación automática de presentaciones</span>
              </div>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-foreground">Evaluaciones y análisis de resultados</span>
              </div>
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span className="text-foreground">Recursos educativos web automáticos</span>
              </div>
            </div>

            <Button variant="default" className="w-full">
              Empezar como Docente
            </Button>
          </Card>

          {/* Sección para Estudiantes */}
          <Card className="p-8 bg-gradient-card border-0 shadow-soft">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-xl bg-secondary/10">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Para Estudiantes</h3>
                <p className="text-muted-foreground">Aprendizaje personalizado con IA</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-secondary" />
                <span className="text-foreground">Identificación de perfil cognitivo personal</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-secondary" />
                <span className="text-foreground">Chatbot personalizado según tu perfil</span>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-secondary" />
                <span className="text-foreground">Acceso a materiales adaptativos</span>
              </div>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-secondary" />
                <span className="text-foreground">Seguimiento de progreso personalizado</span>
              </div>
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-secondary" />
                <span className="text-foreground">Recomendaciones basadas en IA</span>
              </div>
            </div>

            <Button variant="secondary" className="w-full">
              Empezar como Estudiante
            </Button>
          </Card>
        </div>
      </div>
    </section>
  )
}

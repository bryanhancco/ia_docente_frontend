'use client'

import { Button } from '../../components/ui/button'
import { 
  Brain, 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Facebook 
} from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Learning4Live</span>
            </div>
            <p className="text-white/80 leading-relaxed mb-6 max-w-md">
              Plataforma educativa con inteligencia artificial que personaliza el aprendizaje 
              y potencia la enseñanza del siglo XXI.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <Facebook className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Links de producto */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Producto</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-white/80 hover:text-white transition-colors">Características</a></li>
              <li><a href="#roles" className="text-white/80 hover:text-white transition-colors">Para Docentes</a></li>
              <li><a href="#roles" className="text-white/80 hover:text-white transition-colors">Para Estudiantes</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Precios</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">API</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-white/80">info@learning4live.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                <span className="text-white/80">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-white/80">Ciudad de México, México</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              © 2024 Learning4Live. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Términos de Servicio
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'

import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Brain, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">Learning4Live</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Características
          </Link>
          <Link href="#roles" className="text-muted-foreground hover:text-foreground transition-colors">
            Roles
          </Link>
          <Link href="#process" className="text-muted-foreground hover:text-foreground transition-colors">
            Proceso
          </Link>
          <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
            Testimonios
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link href="/teacher/login">Ingresar como Docente</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/student/login">Ingresar como Estudiante</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="container mx-auto px-6 py-4 space-y-4">
            <nav className="space-y-2">
              <Link 
                href="#features" 
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Características
              </Link>
              <Link 
                href="#roles" 
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Roles
              </Link>
              <Link 
                href="#process" 
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Proceso
              </Link>
              <Link 
                href="#testimonials" 
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonios
              </Link>
            </nav>
            
            <div className="space-y-2 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/teacher/login">Ingresar como Docente</Link>
              </Button>
              <Button variant="default" className="w-full" asChild>
                <Link href="/student/login">Ingresar como Estudiante</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EstudianteResponseDTO } from '../../lib/api';

export default function StudentProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<EstudianteResponseDTO | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const studentDataString = localStorage.getItem('studentData');
    if (!studentDataString) {
      router.push('/student/login');
      return;
    }

    try {
      const studentData: EstudianteResponseDTO = JSON.parse(studentDataString);
      setStudent(studentData);
    } catch (error) {
      console.error('Error parsing student data:', error);
      router.push('/student/login');
    }
  }, [router]);

  if (!student) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
    >
      {/* Header with backdrop blur */}
      <header className="backdrop-blur-md bg-white/70 border-b border-blue-200/50 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 lg:px-10 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/student/dashboard" 
              className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
              </svg>
              Dashboard
            </Link>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path
                  d="M12 3L20 12L12 21L4 12L12 3Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mi Perfil
            </h1>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {student.nombre.charAt(0).toUpperCase()}
            </div>
            <span className="text-blue-700 text-sm font-medium hidden sm:block">Hola, {student.nombre}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-8 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">
                  {student.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {student.nombre}
              </h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <span className="text-blue-700 font-semibold">ID: #{student.id}</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Información Personal</h3>
              </div>
              
              <div className="space-y-4">
                <div className="backdrop-blur-md bg-white/50 rounded-xl p-4 border border-blue-200/30">
                  <label className="block text-gray-600 text-sm font-medium mb-1">Nombre Completo</label>
                  <p className="text-gray-800 font-semibold">{student.nombre}</p>
                </div>
                <div className="backdrop-blur-md bg-white/50 rounded-xl p-4 border border-blue-200/30">
                  <label className="block text-gray-600 text-sm font-medium mb-1">Correo Electrónico</label>
                  <p className="text-gray-800 font-semibold">{student.correo}</p>
                </div>
                <div className="backdrop-blur-md bg-white/50 rounded-xl p-4 border border-blue-200/30">
                  <label className="block text-gray-600 text-sm font-medium mb-1">ID de Estudiante</label>
                  <p className="text-gray-800 font-semibold">#{student.id}</p>
                </div>
              </div>
            </div>

            {/* Learning Profiles */}
            <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Perfiles de Aprendizaje</h3>
              </div>
              
              <div className="space-y-4">
                <div className="backdrop-blur-md bg-white/50 rounded-xl p-4 border border-purple-200/30">
                  <label className="block text-gray-600 text-sm font-medium mb-2">Perfil Cognitivo</label>
                  {student.perfil_cognitivo ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <span className="text-gray-800 font-semibold">{student.perfil_cognitivo}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="text-amber-700 font-medium">No completado</span>
                      </div>
                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfxvJDkrqQWzfhHLjAcZeBTqbn4QOXVf-4kz_XDe011Y_3BgQ/viewform"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                        Completar formulario
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="backdrop-blur-md bg-white/50 rounded-xl p-4 border border-purple-200/30">
                  <label className="block text-gray-600 text-sm font-medium mb-2">Perfil de Personalidad</label>
                  {student.perfil_personalidad ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      </div>
                      <span className="text-gray-800">{(student.perfil_personalidad.match(/(?:\*?En conclusión\*?\s*)([\s\S]*)/i) || [,''])[1].trim()}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="text-amber-700 font-medium">No completado</span>
                      </div>
                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfnCLADtuAvYbLZduHrW4YRMymXx9AzANdpaY6yDPi2lrQwXA/viewform"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                        Completar formulario
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Future Features */}
          <div className="backdrop-blur-md bg-white/40 rounded-2xl shadow-lg border border-white/20 p-6 opacity-75">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Configuración de Cuenta</h3>
            </div>
            
            <div className="space-y-3">
              <div className="backdrop-blur-md bg-white/50 rounded-xl p-4 border border-gray-200/30 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-500 font-medium">Cambiar contraseña</span>
                  <div className="ml-auto inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    Próximamente
                  </div>
                </div>
              </div>
              
              <div className="backdrop-blur-md bg-white/50 rounded-xl p-4 border border-gray-200/30 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-gray-500 font-medium">Actualizar información personal</span>
                  <div className="ml-auto inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    Próximamente
                  </div>
                </div>
              </div>
              
              <div className="backdrop-blur-md bg-white/50 rounded-xl p-4 border border-gray-200/30 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L3 7v11c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-7-5z"/>
                  </svg>
                  <span className="text-gray-500 font-medium">Configurar notificaciones</span>
                  <div className="ml-auto inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    Próximamente
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

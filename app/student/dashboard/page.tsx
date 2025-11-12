'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EstudianteResponseDTO } from '../../lib/api';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<EstudianteResponseDTO | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const studentDataString = localStorage.getItem('studentData');
    // Defensive checks: localStorage may contain the literal string "undefined" or malformed JSON.
    if (!studentDataString || studentDataString === 'undefined' || studentDataString.trim() === '') {
      // Clean up any invalid value and send user to login
      localStorage.removeItem('studentData');
      router.push('/student/login');
      return;
    }

    try {
      const parsed = JSON.parse(studentDataString);
      // Ensure parsed object looks like an EstudianteResponseDTO (basic shape check)
      if (!parsed || typeof parsed !== 'object' || !('id' in parsed)) {
        throw new Error('Invalid student data shape');
      }
      const studentData: EstudianteResponseDTO = parsed as EstudianteResponseDTO;
      setStudent(studentData);
    } catch (error) {
      console.error('Error parsing student data:', error);
      localStorage.removeItem('studentData');
      router.push('/student/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('studentData');
    router.push('/');
  };

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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path
                  d="M12 3L20 12L12 21L4 12L12 3Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LearningForLive - Estudiante
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {student.nombre.charAt(0).toUpperCase()}
              </div>
              <span className="text-blue-700 text-sm font-medium">Hola, {student.nombre}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-8 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                {student.nombre.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                ¡Bienvenido/a, {student.nombre}!
              </h2>
              <p className="text-gray-600 mb-2">Explora tus recursos de aprendizaje</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                ID: #{student.id} | {student.correo}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="backdrop-blur-md bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Clases Activas</h3>
              <p className="text-sm text-gray-600">Clases en progreso</p>
            </div>

            <div className="backdrop-blur-md bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 rounded-xl p-6 border border-indigo-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-indigo-600">85%</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Progreso</h3>
              <p className="text-sm text-gray-600">Completado este mes</p>
            </div>

            <div className="backdrop-blur-md bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold text-purple-600">12</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Actividades</h3>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/student/classes" className="group backdrop-blur-md bg-white/60 rounded-xl p-6 border border-white/20 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">Mis Clases</h3>
              <p className="text-gray-600 mb-4">Accede a tus clases inscritas y contenidos de aprendizaje</p>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Disponible
              </div>
            </Link>

            <div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-white/20 opacity-75">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Materiales</h3>
              <p className="text-gray-600 mb-4">Revisa contenidos, recursos y documentos de estudio</p>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                Próximamente
              </div>
            </div>

            <div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-white/20 opacity-75">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Evaluaciones</h3>
              <p className="text-gray-600 mb-4">Completa tus evaluaciones y seguimientos</p>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                Próximamente
              </div>
            </div>

            <div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-white/20 opacity-75">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Progreso</h3>
              <p className="text-gray-600 mb-4">Monitorea tu avance y estadísticas</p>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                Próximamente
              </div>
            </div>

            <Link href="/student/profile" className="group backdrop-blur-md bg-white/60 rounded-xl p-6 border border-white/20 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">Mi Perfil</h3>
              <p className="text-gray-600 mb-4">Ver y actualizar tu información personal</p>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Disponible
              </div>
            </Link>

            <div className="backdrop-blur-md bg-white/40 rounded-xl p-6 border border-white/20 opacity-75">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Mensajes</h3>
              <p className="text-gray-600 mb-4">Comunicación directa con tus docentes</p>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                Próximamente
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

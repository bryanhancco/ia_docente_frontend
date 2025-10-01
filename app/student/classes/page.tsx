'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService, EstudianteResponseDTO, EstudianteClaseDetalleDTO } from '../../lib/api';

export default function StudentClassesPage() {
  const router = useRouter();
  const [student, setStudent] = useState<EstudianteResponseDTO | null>(null);
  const [classes, setClasses] = useState<EstudianteClaseDetalleDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salindoDeClase, setSalindoDeClase] = useState<number | null>(null);
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

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
      loadClasses(studentData.id);
    } catch (error) {
      console.error('Error parsing student data:', error);
      router.push('/student/login');
    }
  }, [router, mostrarInactivas]);

  const loadClasses = async (studentId: number) => {
    try {
      setIsLoading(true);
      const classesData = await apiService.getClasesEstudiante(studentId, mostrarInactivas);
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
      setError('Error al cargar las clases');
    } finally {
      setIsLoading(false);
    }
  };

  const salirDeClase = async (idInscripcion: number, nombreClase: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas salir de la clase "${nombreClase}"?`)) {
      return;
    }

    try {
      setSalindoDeClase(idInscripcion);
      await apiService.salirDeClase(idInscripcion);
      
      // Recargar las clases para actualizar la lista
      if (student) {
        await loadClasses(student.id);
      }
      
      // Opcional: mostrar mensaje de éxito
      alert('Has salido de la clase exitosamente');
      
    } catch (error) {
      console.error('Error al salir de la clase:', error);
      alert('Error al salir de la clase. Por favor, inténtalo de nuevo.');
    } finally {
      setSalindoDeClase(null);
    }
  };

  const reincorporarAClase = async (idInscripcion: number, nombreClase: string) => {
    try {
      await apiService.reincorporarAClase(idInscripcion);
      
      // Recargar las clases para actualizar la lista
      if (student) {
        await loadClasses(student.id);
      }
      
      alert(`Te has reincorporado a la clase "${nombreClase}" exitosamente`);
      
    } catch (error) {
      console.error('Error al reincorporar a la clase:', error);
      alert('Error al reincorporar a la clase. Por favor, inténtalo de nuevo.');
    }
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
              Mis Clases
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/student/classes/join"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              Unirse a Clase
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-8 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
                <p className="text-gray-600 font-medium">Cargando tus clases...</p>
              </div>
            </div>
          ) : error ? (
            <div className="backdrop-blur-md bg-red-100/80 border border-red-200 rounded-2xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Error al cargar</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={() => loadClasses(student.id)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                </svg>
                Intentar de nuevo
              </button>
            </div>
          ) : classes.length === 0 ? (
            <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">No tienes clases aún</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Solicita a tu docente el ID de la clase para unirte y comenzar tu aventura de aprendizaje
              </p>
              <Link 
                href="/student/classes/join"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Unirse a una Clase
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Tus Clases</h2>
                    <p className="text-gray-600">Tienes {classes.length} clase{classes.length !== 1 ? 's' : ''} {mostrarInactivas ? '(incluyendo inactivas)' : 'activa' + (classes.length !== 1 ? 's' : '')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{classes.length}</div>
                    <div className="text-sm text-gray-500">Clases {mostrarInactivas ? 'totales' : 'activas'}</div>
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMostrarInactivas(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        !mostrarInactivas
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                        </svg>
                        Solo Activas
                      </div>
                    </button>
                    <button
                      onClick={() => setMostrarInactivas(true)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        mostrarInactivas
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-white/70 text-gray-700 hover:bg-white/90 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                        Todas las Clases
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Classes Grid */}
              <div className="grid gap-6">
                {classes.map((inscripcion) => (
                  <div key={inscripcion.id} className={`group backdrop-blur-md rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                    inscripcion.estado === false 
                      ? 'bg-gray-100/60 border-gray-300/50 opacity-75' 
                      : 'bg-white/60 border-white/20 hover:bg-white/80'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            inscripcion.estado === false 
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500' 
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          }`}>
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-xl font-bold mb-1 transition-colors ${
                                inscripcion.estado === false 
                                  ? 'text-gray-600' 
                                  : 'text-gray-800 group-hover:text-blue-600'
                              }`}>
                                {inscripcion.clase_nombre || 'Clase sin nombre'}
                              </h3>
                              {inscripcion.estado === false && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                  Inactiva
                                </span>
                              )}
                            </div>
                            <p className={`${inscripcion.estado === false ? 'text-gray-500' : 'text-gray-600'}`}>
                              <span className="font-medium">Tema:</span> {inscripcion.clase_tema || 'No especificado'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <div className={`backdrop-blur-md rounded-lg px-3 py-2 border ${
                            inscripcion.estado === false 
                              ? 'bg-gray-200/70 border-gray-300/50' 
                              : 'bg-white/70 border-blue-200/50'
                          }`}>
                            <div className="flex items-center gap-2">
                              <svg className={`w-4 h-4 ${inscripcion.estado === false ? 'text-gray-400' : 'text-blue-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              <span className="text-xs text-gray-600 font-medium">Conocimientos:</span>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                inscripcion.nivel_conocimientos === 'Experto' ? 'bg-green-100 text-green-700' :
                                inscripcion.nivel_conocimientos === 'Intermedio' ? 'bg-blue-100 text-blue-700' :
                                inscripcion.nivel_conocimientos === 'Básico' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {inscripcion.nivel_conocimientos || 'No especificado'}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`backdrop-blur-md rounded-lg px-3 py-2 border ${
                            inscripcion.estado === false 
                              ? 'bg-gray-200/70 border-gray-300/50' 
                              : 'bg-white/70 border-purple-200/50'
                          }`}>
                            <div className="flex items-center gap-2">
                              <svg className={`w-4 h-4 ${inscripcion.estado === false ? 'text-gray-400' : 'text-purple-500'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                              </svg>
                              <span className="text-xs text-gray-600 font-medium">Motivación:</span>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                inscripcion.nivel_motivacion === 'Experto' ? 'bg-green-100 text-green-700' :
                                inscripcion.nivel_motivacion === 'Intermedio' ? 'bg-blue-100 text-blue-700' :
                                inscripcion.nivel_motivacion === 'Básico' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {inscripcion.nivel_motivacion || 'No especificado'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex flex-col gap-2">
                        {inscripcion.estado !== false ? (
                          <>
                            <Link 
                              href={`/student/classes/${inscripcion.id_clase}`}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                              </svg>
                              Ver Clase
                            </Link>
                            
                            <button
                              onClick={() => salirDeClase(inscripcion.id, inscripcion.clase_nombre || 'esta clase')}
                              disabled={salindoDeClase === inscripcion.id}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {salindoDeClase === inscripcion.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Saliendo...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                                  </svg>
                                  Salir de Clase
                                </>
                              )}
                            </button>
                          </>
                        ) : (
                          <div className="text-center">
                            <p className="text-gray-500 text-sm mb-2">Has salido de esta clase</p>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Deseas reincorporarte a la clase "${inscripcion.clase_nombre}"?`)) {
                                  reincorporarAClase(inscripcion.id, inscripcion.clase_nombre || 'esta clase');
                                }
                              }}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"/>
                              </svg>
                              Reincorporar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  }, [router]);

  const loadClasses = async (studentId: number) => {
    try {
      setIsLoading(true);
      const classesData = await apiService.getClasesEstudiante(studentId);
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
      setError('Error al cargar las clases');
    } finally {
      setIsLoading(false);
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
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <Link href="/student/dashboard" className="text-[#0d80f2] hover:underline">
              ← Dashboard
            </Link>
            <div className="size-6">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_330)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                    fill="currentColor"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_6_330"><rect width="48" height="48" fill="white"/></clipPath>
                </defs>
              </svg>
            </div>
            <h1 className="text-[#0d141c] text-xl font-bold leading-tight tracking-[-0.015em]">Mis Clases</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/student/classes/join"
              className="bg-[#0d80f2] text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              + Unirse a Clase
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 px-4 py-8">
          <div className="w-full max-w-6xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-[#49739c]">Cargando clases...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => loadClasses(student.id)}
                  className="mt-3 text-[#0d80f2] hover:underline"
                >
                  Intentar de nuevo
                </button>
              </div>
            ) : classes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-12 text-center">
                <div className="text-6xl mb-6">📚</div>
                <h2 className="text-[#0d141c] text-2xl font-bold mb-4">No tienes clases aún</h2>
                <p className="text-[#49739c] text-lg mb-8">
                  Solicita a tu docente el ID de la clase para unirte
                </p>
                <Link 
                  href="/student/classes/join"
                  className="inline-block bg-[#0d80f2] text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Unirse a una Clase
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
                <div className="mb-6">
                  <h2 className="text-[#0d141c] text-2xl font-bold mb-2">Tus Clases</h2>
                  <p className="text-[#49739c]">Clases en las que estás inscrito/a</p>
                </div>

                <div className="grid gap-6">
                  {classes.map((inscripcion) => (
                    <div key={inscripcion.id} className="border border-[#e7edf4] rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-[#0d141c] text-xl font-semibold mb-2">
                            {inscripcion.clase_nombre || 'Clase sin nombre'}
                          </h3>
                          <p className="text-[#49739c] mb-3">
                            <span className="font-medium">Tema:</span> {inscripcion.clase_tema || 'No especificado'}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-[#49739c]">Conocimientos:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                inscripcion.nivel_conocimientos === 'Experto' ? 'bg-green-100 text-green-800' :
                                inscripcion.nivel_conocimientos === 'Intermedio' ? 'bg-blue-100 text-blue-800' :
                                inscripcion.nivel_conocimientos === 'Básico' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {inscripcion.nivel_conocimientos || 'No especificado'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[#49739c]">Motivación:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                inscripcion.nivel_motivacion === 'Experto' ? 'bg-green-100 text-green-800' :
                                inscripcion.nivel_motivacion === 'Intermedio' ? 'bg-blue-100 text-blue-800' :
                                inscripcion.nivel_motivacion === 'Básico' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {inscripcion.nivel_motivacion || 'No especificado'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-6">
                          <Link 
                            href={`/student/classes/${inscripcion.id_clase}`}
                            className="bg-[#0d80f2] text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                          >
                            Ver Clase
                          </Link>
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
    </div>
  );
}

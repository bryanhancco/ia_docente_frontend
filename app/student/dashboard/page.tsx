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
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
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
            <h1 className="text-[#0d141c] text-xl font-bold leading-tight tracking-[-0.015em]">DocentePlus AI - Estudiante</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[#49739c] text-sm">Hola, {student.nombre}</span>
            <button
              onClick={handleLogout}
              className="text-[#0d80f2] hover:underline text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 justify-center items-center px-4 py-8">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
              <div className="text-center mb-8">
                <h2 className="text-[#0d141c] text-[32px] font-bold leading-tight mb-4">
                  Dashboard de Estudiante
                </h2>
                <p className="text-[#49739c] text-lg">
                  Bienvenido/a {student.nombre}
                </p>
                <p className="text-[#49739c] text-sm">
                  ID: #{student.id} | {student.correo}
                </p>
              </div>

              <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <div className="text-6xl mb-4">🚧</div>
                <p className="text-amber-700 text-xl font-medium mb-2">
                  Dashboard en Desarrollo
                </p>
                <p className="text-amber-600 text-base">
                  El dashboard completo para estudiantes estará disponible próximamente. 
                  Aquí podrás acceder a tus clases, materiales y evaluaciones.
                </p>
              </div>

              {/* Action Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Link href="/student/classes" className="border border-[#e7edf4] rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="text-[#0d141c] font-semibold mb-2">Mis Clases</h3>
                  <p className="text-[#49739c] text-sm">Accede a tus clases inscritas</p>
                  <div className="mt-3 text-xs text-blue-600 font-medium">Disponible</div>
                </Link>

                <div className="border border-[#e7edf4] rounded-lg p-6 opacity-50">
                  <div className="text-4xl mb-3">📖</div>
                  <h3 className="text-[#0d141c] font-semibold mb-2">Materiales</h3>
                  <p className="text-[#49739c] text-sm">Revisa contenidos y recursos</p>
                  <div className="mt-3 text-xs text-amber-600 font-medium">Próximamente</div>
                </div>

                <div className="border border-[#e7edf4] rounded-lg p-6 opacity-50">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-[#0d141c] font-semibold mb-2">Evaluaciones</h3>
                  <p className="text-[#49739c] text-sm">Completa tus evaluaciones</p>
                  <div className="mt-3 text-xs text-amber-600 font-medium">Próximamente</div>
                </div>

                <div className="border border-[#e7edf4] rounded-lg p-6 opacity-50">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="text-[#0d141c] font-semibold mb-2">Progreso</h3>
                  <p className="text-[#49739c] text-sm">Monitorea tu progreso</p>
                  <div className="mt-3 text-xs text-amber-600 font-medium">Próximamente</div>
                </div>

                <Link href="/student/profile" className="border border-[#e7edf4] rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-4xl mb-3">👤</div>
                  <h3 className="text-[#0d141c] font-semibold mb-2">Mi Perfil</h3>
                  <p className="text-[#49739c] text-sm">Ver y actualizar tu información</p>
                  <div className="mt-3 text-xs text-blue-600 font-medium">Disponible</div>
                </Link>

                <div className="border border-[#e7edf4] rounded-lg p-6 opacity-50">
                  <div className="text-4xl mb-3">💬</div>
                  <h3 className="text-[#0d141c] font-semibold mb-2">Mensajes</h3>
                  <p className="text-[#49739c] text-sm">Comunicación con docentes</p>
                  <div className="mt-3 text-xs text-amber-600 font-medium">Próximamente</div>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link 
                  href="/" 
                  className="text-[#0d80f2] hover:underline font-medium"
                >
                  ← Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

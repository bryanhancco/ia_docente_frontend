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
            <h1 className="text-[#0d141c] text-xl font-bold leading-tight tracking-[-0.015em]">Mi Perfil</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[#49739c] text-sm">Hola, {student.nombre}</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 justify-center px-4 py-8">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-[#0d80f2] rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {student.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-2">
                  {student.nombre}
                </h2>
                <p className="text-[#49739c] text-base">
                  ID: #{student.id}
                </p>
              </div>

              {/* Profile Information */}
              <div className="space-y-6">
                <div className="border border-[#e7edf4] rounded-lg p-6">
                  <h3 className="text-[#0d141c] font-semibold mb-4">Información Personal</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#49739c] text-sm font-medium mb-1">Nombre Completo</label>
                      <p className="text-[#0d141c] font-medium">{student.nombre}</p>
                    </div>
                    <div>
                      <label className="block text-[#49739c] text-sm font-medium mb-1">Correo Electrónico</label>
                      <p className="text-[#0d141c] font-medium">{student.correo}</p>
                    </div>
                    <div>
                      <label className="block text-[#49739c] text-sm font-medium mb-1">ID de Estudiante</label>
                      <p className="text-[#0d141c] font-medium">#{student.id}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-[#e7edf4] rounded-lg p-6">
                  <h3 className="text-[#0d141c] font-semibold mb-4">Perfiles de Aprendizaje</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#49739c] text-sm font-medium mb-1">Perfil Cognitivo</label>
                      <p className="text-[#0d141c] font-medium">
                        {student.perfil_cognitivo || (
                          <span className="text-amber-600">No completado</span>
                        )}
                      </p>
                      {!student.perfil_cognitivo && (
                        <a
                          href="https://docs.google.com/forms/d/e/1FAIpQLSfxvJDkrqQWzfhHLjAcZeBTqbn4QOXVf-4kz_XDe011Y_3BgQ/viewform"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-[#0d80f2] hover:underline text-sm"
                        >
                          Completar formulario →
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-[#49739c] text-sm font-medium mb-1">Perfil de Personalidad</label>
                      <p className="text-[#0d141c] font-medium">
                        {student.perfil_personalidad || (
                          <span className="text-amber-600">No completado</span>
                        )}
                      </p>
                      {!student.perfil_personalidad && (
                        <a
                          href="https://docs.google.com/forms/d/e/1FAIpQLSfnCLADtuAvYbLZduHrW4YRMymXx9AzANdpaY6yDPi2lrQwXA/viewform"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-[#0d80f2] hover:underline text-sm"
                        >
                          Completar formulario →
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Future Features */}
                <div className="border border-[#e7edf4] rounded-lg p-6 opacity-50">
                  <h3 className="text-[#0d141c] font-semibold mb-4">Configuración de Cuenta</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left py-2 px-3 border border-[#e7edf4] rounded text-[#49739c] cursor-not-allowed">
                      Cambiar contraseña (Próximamente)
                    </button>
                    <button className="w-full text-left py-2 px-3 border border-[#e7edf4] rounded text-[#49739c] cursor-not-allowed">
                      Actualizar información personal (Próximamente)
                    </button>
                    <button className="w-full text-left py-2 px-3 border border-[#e7edf4] rounded text-[#49739c] cursor-not-allowed">
                      Configurar notificaciones (Próximamente)
                    </button>
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

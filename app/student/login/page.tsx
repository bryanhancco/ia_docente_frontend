'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService, EstudianteLoginDTO } from '../../lib/api';

export default function StudentLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EstudianteLoginDTO>({
    correo: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.loginEstudiante(formData);
      
      // Store user data in localStorage
      localStorage.setItem('studentData', JSON.stringify(response.estudiante));
      
      // Redirect to student dashboard
      router.push('/student/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-center whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
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
            <h1 className="text-[#0d141c] text-xl font-bold leading-tight tracking-[-0.015em]">DocentePlus AI</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 justify-center items-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
              <div className="text-center mb-8">
                <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-2">
                  Iniciar Sesión - Estudiante
                </h2>
                <p className="text-[#49739c] text-base">
                  Ingresa a tu cuenta para acceder a tus cursos
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#0d141c] text-sm font-medium mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    required
                    placeholder="estudiante@correo.com"
                    className="w-full px-4 py-3 border border-[#cedbe8] rounded-lg text-[#0d141c] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d80f2] focus:border-[#0d80f2]"
                  />
                </div>

                <div>
                  <label className="block text-[#0d141c] text-sm font-medium mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Ingresa tu contraseña"
                    className="w-full px-4 py-3 border border-[#cedbe8] rounded-lg text-[#0d141c] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d80f2] focus:border-[#0d80f2]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0d80f2] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[#49739c] text-sm">
                  ¿No tienes una cuenta?{' '}
                  <Link href="/student/register" className="text-[#0d80f2] hover:underline font-medium">
                    Regístrate aquí
                  </Link>
                </p>
                <p className="text-[#49739c] text-sm mt-2">
                  <Link href="/" className="text-[#0d80f2] hover:underline font-medium">
                    ← Volver al inicio
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService, DocenteCreateDTO } from '../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<DocenteCreateDTO>({
    nombre: '',
    correo: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiService.createDocente(formData);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Register error:', error);
      setError(error instanceof Error ? error.message : 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
        style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
      >
        <div className="layout-container flex h-full grow flex-col">
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

          <div className="flex flex-1 justify-center items-center px-4 py-8">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8 text-center">
                <div className="text-green-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                </div>
                <h2 className="text-[#0d141c] text-[24px] font-bold leading-tight mb-4">¡Registro exitoso!</h2>
                <p className="text-[#49739c] text-base mb-6">
                  Tu cuenta ha sido creada correctamente. Serás redirigido al login en unos segundos...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d80f2] mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  Crear Cuenta
                </h2>
                <p className="text-[#49739c] text-base">
                  Únete a DocentePlus AI y personaliza la educación con IA
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#0d141c] text-sm font-medium mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-3 border border-[#cedbe8] rounded-lg text-[#0d141c] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d80f2] focus:border-[#0d80f2]"
                  />
                </div>

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
                    placeholder="ejemplo@correo.com"
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
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 border border-[#cedbe8] rounded-lg text-[#0d141c] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d80f2] focus:border-[#0d80f2]"
                  />
                </div>

                <div>
                  <label className="block text-[#0d141c] text-sm font-medium mb-2">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="Repite tu contraseña"
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
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[#49739c] text-sm">
                  ¿Ya tienes una cuenta?{' '}
                  <Link href="/login" className="text-[#0d80f2] hover:underline font-medium">
                    Inicia sesión aquí
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

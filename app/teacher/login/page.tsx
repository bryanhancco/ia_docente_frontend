'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService, DocenteLoginDTO } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<DocenteLoginDTO>({
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
    // Clear previous error
    setError(null);

    // Client-side validation
    const correo = formData.correo?.trim();
    const password = formData.password?.trim();
    if (!correo || !password) {
      setError('Por favor ingresa correo y contraseña');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.loginDocente(formData);

      // Store user data in localStorage with the correct key
      localStorage.setItem('userData', JSON.stringify(response.docente));
      console.log(JSON.stringify(response.docente));

      // Redirect to dashboard
      router.push('/teacher/dashboard');
    } catch (err) {
      console.error('Login error:', err);

      // Parse server error to show friendly messages
      let friendly = 'Error al iniciar sesión';
      if (err instanceof Error && err.message) {
        const msg = err.message;
        const jsonMatch = msg.match(/\{[\s\S]*\}$/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && typeof parsed.detail === 'string') {
              if (parsed.detail.includes('Credenciales inválidas') || parsed.detail.toLowerCase().includes('credenciales')) {
                friendly = 'Datos incorrectos';
              } else {
                friendly = parsed.detail;
              }
            }
          } catch (parseErr) {
            // ignore
          }
        } else if (msg.includes('status: 401')) {
          friendly = 'Datos incorrectos';
        } else {
          friendly = msg;
        }
      }

      setError(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="backdrop-blur-md bg-white/70 border-b border-white/20 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-center gap-4 text-gray-800">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-gray-800 text-xl font-bold">LearningForLive</h1>
            <div className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
              Portal Docente
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex justify-center items-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h2 className="text-gray-800 text-3xl font-bold mb-2">
                  Bienvenido
                </h2>
                <p className="text-gray-600">
                  Accede a tu plataforma educativa profesional
                </p>
              </div>

              {error && (
                <div className="mb-6 backdrop-blur-md bg-red-100/80 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-3">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                      required
                      placeholder="ejemplo@correo.com"
                      className="w-full pl-10 pr-4 py-3 backdrop-blur-md bg-white/50 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-3">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingresa tu contraseña"
                      className="w-full pl-10 pr-4 py-3 backdrop-blur-md bg-white/50 border border-white/30 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Iniciar Sesión
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 space-y-4">
                {/* Botón para cambiar a login de estudiante */}
                <div className="text-center">
                  <Link 
                    href="/student/login" 
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all duration-200 hover:border-blue-300"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                    Ingresar como Estudiante
                  </Link>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    ¿No tienes una cuenta?{' '}
                    <Link href="/teacher/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors duration-200">
                      Regístrate aquí
                    </Link>
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-gray-500 text-sm">
                    <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200 inline-flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17 9a1 1 0 00-1-1H6.414l2.293-2.293a1 1 0 10-1.414-1.414l-4 4a1 1 0 000 1.414l4 4a1 1 0 001.414-1.414L6.414 10H16a1 1 0 001-1z" clipRule="evenodd"/>
                      </svg>
                      Volver al inicio
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Plataforma educativa profesional • Versión 2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

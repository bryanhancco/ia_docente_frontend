'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService, EstudianteCreateDTO, EstudianteResponseDTO } from '../../lib/api';

// Enum para los pasos del registro
enum RegistrationStep {
  BASIC_INFO = 'basic_info',
  PROFILE_FORMS = 'profile_forms',
  VERIFICATION = 'verification',
  COMPLETE = 'complete'
}

export default function StudentRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(RegistrationStep.BASIC_INFO);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredStudent, setRegisteredStudent] = useState<EstudianteResponseDTO | null>(null);
  
  const [formData, setFormData] = useState<EstudianteCreateDTO>({
    nombre: '',
    correo: '',
    password: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validaciones
    if (formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.createEstudiante(formData);
      setRegisteredStudent(response);
      setCurrentStep(RegistrationStep.PROFILE_FORMS);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Error al registrar estudiante');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToVerification = () => {
    setCurrentStep(RegistrationStep.VERIFICATION);
  };

  const handleCompleteRegistration = () => {
    // Store user data in localStorage
    if (registeredStudent) {
      localStorage.setItem('studentData', JSON.stringify(registeredStudent));
    }
    setCurrentStep(RegistrationStep.COMPLETE);
    
    // Auto redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/student/login');
    }, 3000);
  };

  const renderBasicInfoStep = () => (
    <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Registro de Estudiante
        </h2>
        <p className="text-gray-600">
          Completa tus datos básicos para comenzar tu aventura de aprendizaje
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

      <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-gray-700 text-sm font-semibold">
            Nombre Completo *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
            </div>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              placeholder="Ingresa tu nombre completo"
              className="w-full pl-10 pr-4 py-3 backdrop-blur-md bg-white/70 border border-blue-200/50 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-gray-700 text-sm font-semibold">
            Correo Electrónico *
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
              placeholder="estudiante@correo.com"
              className="w-full pl-10 pr-4 py-3 backdrop-blur-md bg-white/70 border border-blue-200/50 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-gray-700 text-sm font-semibold">
            Contraseña *
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
              placeholder="Mínimo 6 caracteres"
              className="w-full pl-10 pr-4 py-3 backdrop-blur-md bg-white/70 border border-blue-200/50 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-gray-700 text-sm font-semibold">
            Confirmar Contraseña *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange}
              required
              placeholder="Repite tu contraseña"
              className="w-full pl-10 pr-4 py-3 backdrop-blur-md bg-white/70 border border-blue-200/50 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              Registrando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Crear Cuenta
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center space-y-3">
        <p className="text-gray-600 text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/student/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            Inicia sesión aquí
          </Link>
        </p>
        <Link href="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );

  const renderProfileFormsStep = () => (
    <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Completa tu Perfil
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl mb-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span className="text-blue-700 font-semibold">ID: #{registeredStudent?.id}</span>
        </div>
        <p className="text-gray-600 text-sm">
          Completa los siguientes formularios para personalizar tu experiencia de aprendizaje
        </p>
      </div>

      <div className="space-y-6">
        <div className="backdrop-blur-md bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                1. Perfil Cognitivo
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Este formulario nos ayudará a identificar tu estilo de aprendizaje preferido y adaptar el contenido a tus necesidades
              </p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfxvJDkrqQWzfhHLjAcZeBTqbn4QOXVf-4kz_XDe011Y_3BgQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Completar Perfil Cognitivo
              </a>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-gradient-to-r from-purple-50/70 to-pink-50/70 border border-purple-200/50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                2. Perfil de Personalidad
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Este formulario nos permitirá adaptar el contenido y la metodología a tu personalidad única
              </p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfnCLADtuAvYbLZduHrW4YRMymXx9AzANdpaY6yDPi2lrQwXA/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Completar Perfil de Personalidad
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleContinueToVerification}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Continuar
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Verificación de Datos
        </h2>
        <p className="text-gray-600">
          Revisa que toda la información sea correcta antes de finalizar
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="backdrop-blur-md bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Información Personal</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between py-2 px-3 bg-white/50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">ID de Estudiante:</span>
              <span className="text-sm font-bold text-blue-600">#{registeredStudent?.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-white/50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Nombre:</span>
              <span className="text-sm font-semibold text-gray-800">{registeredStudent?.nombre}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-white/50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Correo:</span>
              <span className="text-sm font-semibold text-gray-800">{registeredStudent?.correo}</span>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-gradient-to-r from-green-50/70 to-emerald-50/70 border border-green-200/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Estado de Formularios</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2 px-3 bg-white/50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Perfil Cognitivo: Completado</span>
            </div>
            <div className="flex items-center gap-3 py-2 px-3 bg-white/50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Perfil de Personalidad: Completado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setCurrentStep(RegistrationStep.PROFILE_FORMS)}
          className="flex-1 backdrop-blur-md bg-white/70 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-white/90 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
          </svg>
          Volver
        </button>
        <button
          onClick={handleCompleteRegistration}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          Finalizar Registro
        </button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          ¡Registro Completado!
        </h2>
        <p className="text-gray-600">
          Tu cuenta de estudiante ha sido creada exitosamente
        </p>
      </div>

      <div className="backdrop-blur-md bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {registeredStudent?.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-800 mb-1">
              ¡Bienvenido/a {registeredStudent?.nombre}!
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-green-700 text-sm">Tu ID de estudiante es</span>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                #{registeredStudent?.id}
              </div>
            </div>
            <p className="text-green-600 text-sm mt-1">
              Guarda este número para futuras referencias.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="backdrop-blur-md bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/50 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-700 text-sm">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Serás redirigido al login automáticamente en unos segundos...</span>
          </div>
        </div>
        
        <Link 
          href="/student/login" 
          className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-center shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
            </svg>
            Iniciar Sesión Ahora
          </div>
        </Link>
        
        <Link 
          href="/" 
          className="block text-center text-gray-500 hover:text-gray-700 font-medium transition-colors"
        >
          <div className="flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            Volver al inicio
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
    >
      {/* Header with backdrop blur */}
      <header className="backdrop-blur-md bg-white/70 border-b border-blue-200/50 sticky top-0 z-50">
        <div className="flex items-center justify-center px-6 lg:px-10 py-4">
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
              LearningForLive
            </h1>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="backdrop-blur-md bg-white/60 border-b border-blue-200/50 py-6">
        <div className="flex justify-center">
          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-3 ${currentStep === RegistrationStep.BASIC_INFO ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep === RegistrationStep.BASIC_INFO ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110' : 'bg-gradient-to-r from-green-500 to-green-600 text-white'}`}>
                {currentStep === RegistrationStep.BASIC_INFO ? '1' : '✓'}
              </div>
              <span className="text-sm font-medium hidden sm:block">Datos Básicos</span>
            </div>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full">
              <div className={`h-full rounded-full transition-all duration-500 ${currentStep !== RegistrationStep.BASIC_INFO ? 'bg-gradient-to-r from-blue-500 to-indigo-500 w-full' : 'bg-gray-300 w-0'}`}></div>
            </div>
            <div className={`flex items-center space-x-3 ${currentStep === RegistrationStep.PROFILE_FORMS ? 'text-blue-600' : currentStep === RegistrationStep.VERIFICATION || currentStep === RegistrationStep.COMPLETE ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep === RegistrationStep.PROFILE_FORMS ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110' : currentStep === RegistrationStep.VERIFICATION || currentStep === RegistrationStep.COMPLETE ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {currentStep === RegistrationStep.VERIFICATION || currentStep === RegistrationStep.COMPLETE ? '✓' : '2'}
              </div>
              <span className="text-sm font-medium hidden sm:block">Perfiles</span>
            </div>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full">
              <div className={`h-full rounded-full transition-all duration-500 ${currentStep === RegistrationStep.VERIFICATION || currentStep === RegistrationStep.COMPLETE ? 'bg-gradient-to-r from-blue-500 to-indigo-500 w-full' : 'bg-gray-300 w-0'}`}></div>
            </div>
            <div className={`flex items-center space-x-3 ${currentStep === RegistrationStep.VERIFICATION ? 'text-blue-600' : currentStep === RegistrationStep.COMPLETE ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep === RegistrationStep.VERIFICATION ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110' : currentStep === RegistrationStep.COMPLETE ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {currentStep === RegistrationStep.COMPLETE ? '✓' : '3'}
              </div>
              <span className="text-sm font-medium hidden sm:block">Verificación</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 lg:px-8">
        <div className="max-w-md mx-auto">
          {currentStep === RegistrationStep.BASIC_INFO && renderBasicInfoStep()}
          {currentStep === RegistrationStep.PROFILE_FORMS && renderProfileFormsStep()}
          {currentStep === RegistrationStep.VERIFICATION && renderVerificationStep()}
          {currentStep === RegistrationStep.COMPLETE && renderCompleteStep()}
        </div>
      </div>
    </div>
  );
}

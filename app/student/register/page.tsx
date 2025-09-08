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
    <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
      <div className="text-center mb-8">
        <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-2">
          Registro de Estudiante
        </h2>
        <p className="text-[#49739c] text-base">
          Completa tus datos básicos para comenzar
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
        <div>
          <label className="block text-[#0d141c] text-sm font-medium mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            required
            placeholder="Ingresa tu nombre completo"
            className="w-full px-4 py-3 border border-[#cedbe8] rounded-lg text-[#0d141c] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d80f2] focus:border-[#0d80f2]"
          />
        </div>

        <div>
          <label className="block text-[#0d141c] text-sm font-medium mb-2">
            Correo Electrónico *
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
            Contraseña *
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
            Confirmar Contraseña *
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
              Registrando...
            </>
          ) : (
            'Crear Cuenta'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[#49739c] text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/student/login" className="text-[#0d80f2] hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </p>
        <p className="text-[#49739c] text-sm mt-2">
          <Link href="/" className="text-[#0d80f2] hover:underline font-medium">
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );

  const renderProfileFormsStep = () => (
    <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
      <div className="text-center mb-8">
        <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-2">
          Completa tu Perfil
        </h2>
        <p className="text-[#49739c] text-base">
          Tu ID de estudiante es: <span className="font-bold text-[#0d80f2]">#{registeredStudent?.id}</span>
        </p>
        <p className="text-[#49739c] text-sm mt-2">
          Completa los siguientes formularios para personalizar tu experiencia de aprendizaje
        </p>
      </div>

      <div className="space-y-6">
        <div className="border border-[#e7edf4] rounded-lg p-6">
          <h3 className="text-[#0d141c] text-lg font-semibold mb-3">
            1. Perfil Cognitivo
          </h3>
          <p className="text-[#49739c] text-sm mb-4">
            Este formulario nos ayudará a identificar tu estilo de aprendizaje preferido
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfxvJDkrqQWzfhHLjAcZeBTqbn4QOXVf-4kz_XDe011Y_3BgQ/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#0d80f2] text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Completar Perfil Cognitivo →
          </a>
        </div>

        <div className="border border-[#e7edf4] rounded-lg p-6">
          <h3 className="text-[#0d141c] text-lg font-semibold mb-3">
            2. Perfil de Personalidad
          </h3>
          <p className="text-[#49739c] text-sm mb-4">
            Este formulario nos permitirá adaptar el contenido a tu personalidad
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfnCLADtuAvYbLZduHrW4YRMymXx9AzANdpaY6yDPi2lrQwXA/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#0d80f2] text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Completar Perfil de Personalidad →
          </a>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleContinueToVerification}
          className="bg-[#0d80f2] text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Continuar →
        </button>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
      <div className="text-center mb-8">
        <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-2">
          Verificación de Datos
        </h2>
        <p className="text-[#49739c] text-base">
          Revisa que toda la información sea correcta
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="border border-[#e7edf4] rounded-lg p-4">
          <h3 className="text-[#0d141c] font-semibold mb-2">Información Personal</h3>
          <div className="text-[#49739c] space-y-1">
            <p><span className="font-medium">ID:</span> #{registeredStudent?.id}</p>
            <p><span className="font-medium">Nombre:</span> {registeredStudent?.nombre}</p>
            <p><span className="font-medium">Correo:</span> {registeredStudent?.correo}</p>
          </div>
        </div>

        <div className="border border-[#e7edf4] rounded-lg p-4">
          <h3 className="text-[#0d141c] font-semibold mb-2">Estado de Formularios</h3>
          <div className="text-[#49739c] space-y-1">
            <p>✅ Perfil Cognitivo: Completo (requerido)</p>
            <p>✅ Perfil de Personalidad: Completo (requerido)</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setCurrentStep(RegistrationStep.PROFILE_FORMS)}
          className="flex-1 border border-[#e7edf4] text-[#0d141c] py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={handleCompleteRegistration}
          className="flex-1 bg-[#0d80f2] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Finalizar Registro
        </button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-2">
          ¡Registro Completado!
        </h2>
        <p className="text-[#49739c] text-base">
          Tu cuenta de estudiante ha sido creada exitosamente
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-green-800 font-semibold mb-2">¡Bienvenido/a {registeredStudent?.nombre}!</h3>
        <p className="text-green-700 text-sm">
          Tu ID de estudiante es <span className="font-bold">#{registeredStudent?.id}</span>. 
          Guarda este número para futuras referencias.
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-700 text-sm">
            Serás redirigido al login automáticamente en unos segundos...
          </p>
        </div>
        
        <Link 
          href="/student/login" 
          className="block w-full bg-[#0d80f2] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors text-center"
        >
          Iniciar Sesión Ahora
        </Link>
        
        <Link 
          href="/" 
          className="block text-center text-[#0d80f2] hover:underline font-medium"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );

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

        {/* Progress Indicator */}
        <div className="flex justify-center py-4 bg-white border-b border-[#e7edf4]">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === RegistrationStep.BASIC_INFO ? 'text-[#0d80f2]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === RegistrationStep.BASIC_INFO ? 'bg-[#0d80f2] text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="text-sm font-medium">Datos Básicos</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep === RegistrationStep.PROFILE_FORMS ? 'text-[#0d80f2]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === RegistrationStep.PROFILE_FORMS ? 'bg-[#0d80f2] text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-medium">Perfiles</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep === RegistrationStep.VERIFICATION ? 'text-[#0d80f2]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === RegistrationStep.VERIFICATION ? 'bg-[#0d80f2] text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
              <span className="text-sm font-medium">Verificación</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 justify-center items-center px-4 py-8">
          <div className="w-full max-w-md">
            {currentStep === RegistrationStep.BASIC_INFO && renderBasicInfoStep()}
            {currentStep === RegistrationStep.PROFILE_FORMS && renderProfileFormsStep()}
            {currentStep === RegistrationStep.VERIFICATION && renderVerificationStep()}
            {currentStep === RegistrationStep.COMPLETE && renderCompleteStep()}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService, EstudianteResponseDTO, EstudianteClaseCreateDTO } from '../../../lib/api';

// Enum para los pasos del proceso
enum JoinStep {
  ENTER_ID = 'enter_id',
  SET_LEVELS = 'set_levels'
}

export default function JoinClassPage() {
  const router = useRouter();
  const [student, setStudent] = useState<EstudianteResponseDTO | null>(null);
  const [currentStep, setCurrentStep] = useState<JoinStep>(JoinStep.ENTER_ID);
  const [classId, setClassId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [enrollmentData, setEnrollmentData] = useState<EstudianteClaseCreateDTO>({
    id_estudiante: 0,
    id_clase: 0,
    nivel_conocimientos: undefined,
    nivel_motivacion: undefined,
  });

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
      setEnrollmentData(prev => ({
        ...prev,
        id_estudiante: studentData.id
      }));
    } catch (error) {
      console.error('Error parsing student data:', error);
      router.push('/student/login');
    }
  }, [router]);

  const handleClassIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate class exists
      const classData = await apiService.getClase(parseInt(classId));
      
      if (classData) {
        setEnrollmentData(prev => ({
          ...prev,
          id_clase: parseInt(classId)
        }));
        setCurrentStep(JoinStep.SET_LEVELS);
      }
    } catch (error) {
      console.error('Error validating class:', error);
      setError('No se encontró una clase con ese ID. Verifica que el ID sea correcto.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await apiService.inscribirEstudianteClase(enrollmentData);
      router.push('/student/classes');
    } catch (error) {
      console.error('Error enrolling in class:', error);
      setError(error instanceof Error ? error.message : 'Error al inscribirse en la clase');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelChange = (field: 'nivel_conocimientos' | 'nivel_motivacion', value: string) => {
    setEnrollmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!student) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderEnterIdStep = () => (
    <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
      <div className="text-center mb-8">
        <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-2">
          Unirse a una Clase
        </h2>
        <p className="text-[#49739c] text-base">
          Ingresa el ID de la clase proporcionado por tu docente
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleClassIdSubmit} className="space-y-6">
        <div>
          <label className="block text-[#0d141c] text-sm font-medium mb-2">
            ID de la Clase *
          </label>
          <input
            type="number"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
            placeholder="Ej: 12345"
            className="w-full px-4 py-3 border border-[#cedbe8] rounded-lg text-[#0d141c] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d80f2] focus:border-[#0d80f2]"
          />
          <p className="text-[#49739c] text-sm mt-2">
            El docente debe proporcionarte este número único para acceder a la clase
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !classId}
          className="w-full bg-[#0d80f2] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Verificando...
            </>
          ) : (
            'Continuar'
          )}
        </button>
      </form>
    </div>
  );

  const renderSetLevelsStep = () => (
    <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
      <div className="text-center mb-8">
        <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-2">
          Configura tu Perfil para la Clase
        </h2>
        <p className="text-[#49739c] text-base">
          Esto nos ayudará a personalizar la experiencia de aprendizaje
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleLevelsSubmit} className="space-y-6">
        <div>
          <label className="block text-[#0d141c] text-sm font-medium mb-3">
            Nivel de Conocimientos *
          </label>
          <div className="space-y-2">
            {['Sin conocimiento', 'Básico', 'Intermedio', 'Experto'].map((level) => (
              <label key={level} className="flex items-center">
                <input
                  type="radio"
                  name="nivel_conocimientos"
                  value={level}
                  checked={enrollmentData.nivel_conocimientos === level}
                  onChange={(e) => handleLevelChange('nivel_conocimientos', e.target.value)}
                  className="mr-3 text-[#0d80f2] focus:ring-[#0d80f2]"
                  required
                />
                <span className="text-[#0d141c]">{level}</span>
              </label>
            ))}
          </div>
          <p className="text-[#49739c] text-sm mt-2">
            ¿Qué tanto conoces sobre el tema de esta clase?
          </p>
        </div>

        <div>
          <label className="block text-[#0d141c] text-sm font-medium mb-3">
            Nivel de Motivación *
          </label>
          <div className="space-y-2">
            {['Sin conocimiento', 'Básico', 'Intermedio', 'Experto'].map((level) => (
              <label key={level} className="flex items-center">
                <input
                  type="radio"
                  name="nivel_motivacion"
                  value={level}
                  checked={enrollmentData.nivel_motivacion === level}
                  onChange={(e) => handleLevelChange('nivel_motivacion', e.target.value)}
                  className="mr-3 text-[#0d80f2] focus:ring-[#0d80f2]"
                  required
                />
                <span className="text-[#0d141c]">{level}</span>
              </label>
            ))}
          </div>
          <p className="text-[#49739c] text-sm mt-2">
            ¿Qué tan motivado/a estás para aprender este tema?
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep(JoinStep.ENTER_ID)}
            className="flex-1 border border-[#e7edf4] text-[#0d141c] py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            ← Volver
          </button>
          <button
            type="submit"
            disabled={isLoading || !enrollmentData.nivel_conocimientos || !enrollmentData.nivel_motivacion}
            className="flex-1 bg-[#0d80f2] text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Inscribiendo...
              </>
            ) : (
              'Unirse a la Clase'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <Link href="/student/classes" className="text-[#0d80f2] hover:underline">
              ← Mis Clases
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
            <h1 className="text-[#0d141c] text-xl font-bold leading-tight tracking-[-0.015em]">Unirse a Clase</h1>
          </div>
        </header>

        {/* Progress Indicator */}
        <div className="flex justify-center py-4 bg-white border-b border-[#e7edf4]">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === JoinStep.ENTER_ID ? 'text-[#0d80f2]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === JoinStep.ENTER_ID ? 'bg-[#0d80f2] text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="text-sm font-medium">ID de Clase</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep === JoinStep.SET_LEVELS ? 'text-[#0d80f2]' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === JoinStep.SET_LEVELS ? 'bg-[#0d80f2] text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-medium">Configurar Perfil</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 justify-center items-center px-4 py-8">
          <div className="w-full max-w-md">
            {currentStep === JoinStep.ENTER_ID && renderEnterIdStep()}
            {currentStep === JoinStep.SET_LEVELS && renderSetLevelsStep()}
          </div>
        </div>
      </div>
    </div>
  );
}

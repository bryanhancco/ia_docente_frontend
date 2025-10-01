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
      // 1. Inscribir al estudiante en la clase
      await apiService.inscribirEstudianteClase(enrollmentData);
      
      // 2. Inicializar automáticamente el progreso del estudiante
      try {
        await apiService.inicializarProgresoEstudiante(student!.id, enrollmentData.id_clase);
        console.log('Progreso inicializado exitosamente');
      } catch (progressError) {
        console.warn('Error al inicializar progreso:', progressError);
        // No lanzar error aquí, ya que la inscripción fue exitosa
      }
      
      // 3. Redirigir directamente a la vista de la clase específica
      router.push(`/student/classes/${enrollmentData.id_clase}`);
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
    <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Unirse a una Clase
        </h2>
        <p className="text-gray-600">
          Ingresa el ID de la clase proporcionado por tu docente
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

      <form onSubmit={handleClassIdSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-gray-700 text-sm font-semibold">
            ID de la Clase *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <input
              type="number"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              required
              placeholder="Ej: 12345"
              className="w-full pl-10 pr-4 py-3 backdrop-blur-md bg-white/70 border border-blue-200/50 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="backdrop-blur-md bg-blue-50/70 rounded-lg p-3 border border-blue-200/30">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <p className="text-blue-700 text-sm">
                El docente debe proporcionarte este número único para acceder a la clase
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !classId}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Verificando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Continuar
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderSetLevelsStep = () => (
    <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Configura tu Perfil para la Clase
        </h2>
        <p className="text-gray-600">
          Esto nos ayudará a personalizar tu experiencia de aprendizaje
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

      <form onSubmit={handleLevelsSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <label className="text-lg font-bold text-gray-800">
              Nivel de Conocimientos *
            </label>
          </div>
          
          <div className="space-y-3">
            {['Sin conocimiento', 'Básico', 'Intermedio', 'Experto'].map((level, index) => (
              <label key={level} className="group backdrop-blur-md bg-white/50 rounded-xl p-4 border border-blue-200/30 hover:bg-white/70 cursor-pointer transition-all duration-200 flex items-center">
                <input
                  type="radio"
                  name="nivel_conocimientos"
                  value={level}
                  checked={enrollmentData.nivel_conocimientos === level}
                  onChange={(e) => handleLevelChange('nivel_conocimientos', e.target.value)}
                  className="sr-only"
                  required
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                  enrollmentData.nivel_conocimientos === level 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300 group-hover:border-blue-300'
                }`}>
                  {enrollmentData.nivel_conocimientos === level && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    index === 0 ? 'bg-gray-100' : 
                    index === 1 ? 'bg-yellow-100' : 
                    index === 2 ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {index === 0 && <span className="text-gray-600 text-lg">📚</span>}
                    {index === 1 && <span className="text-yellow-600 text-lg">🌱</span>}
                    {index === 2 && <span className="text-blue-600 text-lg">🚀</span>}
                    {index === 3 && <span className="text-green-600 text-lg">🏆</span>}
                  </div>
                  <span className="text-gray-800 font-medium">{level}</span>
                </div>
              </label>
            ))}
          </div>
          
          <div className="backdrop-blur-md bg-blue-50/70 rounded-lg p-3 border border-blue-200/30">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <p className="text-blue-700 text-sm">
                ¿Qué tanto conoces sobre el tema de esta clase?
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
            </div>
            <label className="text-lg font-bold text-gray-800">
              Nivel de Motivación *
            </label>
          </div>
          
          <div className="space-y-3">
            {['Baja', 'Media', 'Alta'].map((level, index) => (
              <label key={level} className="group backdrop-blur-md bg-white/50 rounded-xl p-4 border border-purple-200/30 hover:bg-white/70 cursor-pointer transition-all duration-200 flex items-center">
                <input
                  type="radio"
                  name="nivel_motivacion"
                  value={level}
                  checked={enrollmentData.nivel_motivacion === level}
                  onChange={(e) => handleLevelChange('nivel_motivacion', e.target.value)}
                  className="sr-only"
                  required
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                  enrollmentData.nivel_motivacion === level 
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-gray-300 group-hover:border-purple-300'
                }`}>
                  {enrollmentData.nivel_motivacion === level && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    index === 0 ? 'bg-gray-100' : 
                    index === 1 ? 'bg-yellow-100' : 
                    index === 2 ? 'bg-purple-100' : 'bg-pink-100'
                  }`}>
                    {index === 0 && <span className="text-gray-600 text-lg">😴</span>}
                    {index === 1 && <span className="text-yellow-600 text-lg">😊</span>}
                    {index === 2 && <span className="text-purple-600 text-lg">😃</span>}
                  </div>
                  <span className="text-gray-800 font-medium">{level}</span>
                </div>
              </label>
            ))}
          </div>
          
          <div className="backdrop-blur-md bg-purple-50/70 rounded-lg p-3 border border-purple-200/30">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <p className="text-purple-700 text-sm">
                ¿Qué tan motivado/a estás para aprender este tema?
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep(JoinStep.ENTER_ID)}
            className="flex-1 backdrop-blur-md bg-white/70 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-white/90 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            Volver
          </button>
          <button
            type="submit"
            disabled={isLoading || !enrollmentData.nivel_conocimientos || !enrollmentData.nivel_motivacion}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Inscribiendo...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Unirse a la Clase
              </>
            )}
          </button>
        </div>
      </form>
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
            <Link 
              href="/student/classes" 
              className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
              </svg>
              Mis Clases
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
              Unirse a Clase
            </h1>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="backdrop-blur-md bg-white/60 border-b border-blue-200/50 py-6">
        <div className="flex justify-center">
          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-3 ${currentStep === JoinStep.ENTER_ID ? 'text-blue-600' : 'text-green-600'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep === JoinStep.ENTER_ID ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110' : 'bg-gradient-to-r from-green-500 to-green-600 text-white'}`}>
                {currentStep === JoinStep.ENTER_ID ? '1' : '✓'}
              </div>
              <span className="text-sm font-medium hidden sm:block">ID de Clase</span>
            </div>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full">
              <div className={`h-full rounded-full transition-all duration-500 ${currentStep === JoinStep.SET_LEVELS ? 'bg-gradient-to-r from-blue-500 to-indigo-500 w-full' : 'bg-gray-300 w-0'}`}></div>
            </div>
            <div className={`flex items-center space-x-3 ${currentStep === JoinStep.SET_LEVELS ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep === JoinStep.SET_LEVELS ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className="text-sm font-medium hidden sm:block">Configurar Perfil</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 lg:px-8">
        <div className="max-w-md mx-auto">
          {currentStep === JoinStep.ENTER_ID && renderEnterIdStep()}
          {currentStep === JoinStep.SET_LEVELS && renderSetLevelsStep()}
        </div>
      </div>
    </div>
  );
}

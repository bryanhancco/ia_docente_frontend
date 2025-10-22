'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiService, ClaseData } from '../../../lib/api';

export default function CreateClassPage() {
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      router.push('/teacher/login');
      return;
    }
  }, [router]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    perfil: '',
    area: '',
    tema: '',
    nivel_educativo: '',
    duracion_estimada: '',
    solo_informacion_proporcionada: false,
    conocimientos_previos_estudiantes: '',
    tipo_sesion: '',
    modalidad: '',
    objetivos_aprendizaje: '',
    resultado_taxonomia: '',
    recursos: '',
    aspectos_motivacionales: '',
    estilo_material: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setUploadProgress('idle');
    
    try {
      // Get teacher ID from localStorage
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('No se encontró información del usuario. Por favor, inicia sesión nuevamente.');
      }
      
      const userData = JSON.parse(userDataString);
      const teacherId = userData.id;
      
      // Prepare data for API
      const claseData: ClaseData = {
        id_docente: teacherId, // Use actual teacher ID from localStorage
        nombre: formData.nombre,
        perfil: formData.perfil,
        area: formData.area,
        tema: formData.tema,
        nivel_educativo: formData.nivel_educativo,
        duracion_estimada: parseInt(formData.duracion_estimada) || 60,
        solo_informacion_proporcionada: formData.solo_informacion_proporcionada,
        conocimientos_previos_estudiantes: formData.conocimientos_previos_estudiantes,
        tipo_sesion: formData.tipo_sesion,
        modalidad: formData.modalidad,
        objetivos_aprendizaje: formData.objetivos_aprendizaje,
        resultado_taxonomia: formData.resultado_taxonomia,
        recursos: formData.recursos,
        aspectos_motivacionales: formData.aspectos_motivacionales,
        estilo_material: formData.estilo_material,
        tipo_recursos_generar: 'Guía de estudio (escrita)' // Valor predeterminado
      };

      // Create the class
      const createdClass = await apiService.createClase(claseData);
      console.log('Class created:', createdClass);

      // Upload files if any
      if (uploadedFiles.length > 0) {
        setUploadProgress('uploading');
        await apiService.uploadFiles(createdClass.id, uploadedFiles);
        console.log('Files uploaded successfully');
      }

      // Process the class to generate content
      setUploadProgress('processing');
      const processResult = await apiService.processClase(createdClass.id);
      console.log('Class processed:', processResult);

      setUploadProgress('complete');
      
      // Redirect to class detail page
      router.push(`/teacher/class/${createdClass.id}`);
    } catch (error) {
      console.error('Error creating class:', error);
      setError(error instanceof Error ? error.message : 'Error al crear la clase');
      setIsGenerating(false);
      setUploadProgress('idle');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prevFiles => [...prevFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (isGenerating) {
    const getProgressMessage = () => {
      switch (uploadProgress) {
        case 'uploading':
          return 'Subiendo archivos...';
        case 'processing':
          return 'Procesando contenido con IA...';
        case 'complete':
          return 'Completado! Redirigiendo...';
        default:
          return 'Creando clase...';
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-xl border border-white/20 p-12 text-center max-w-md">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <h2 className="text-gray-800 text-xl font-bold mb-3">{getProgressMessage()}</h2>
          <p className="text-gray-600 text-sm">
            Esto puede tomar algunos minutos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-gray-800">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" clipRule="evenodd"/>
                </svg>
              </div>
              <h1 className="text-gray-800 text-xl font-bold">LearningForLive</h1>
            </div>
            <button 
              className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors duration-200"
              onClick={() => router.push('/teacher/dashboard')}
            >
              ← Volver al Dashboard
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h1 className="text-gray-800 text-3xl font-bold mb-4">
                  Crear Nueva Clase
                </h1>
                <p className="text-gray-600 text-lg">
                  Configure los detalles de su clase para generar contenido educativo personalizado
                </p>
              </div>

              {error && (
                <div className="backdrop-blur-md bg-red-50/80 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información Básica */}
                <div className="backdrop-blur-md bg-white/50 rounded-xl border border-white/30 p-6">
                  <h2 className="text-gray-800 text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    Información Básica
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nombre" className="block text-gray-700 text-sm font-semibold mb-2">
                        Nombre de la clase *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                        placeholder="Ej: Matemáticas Básicas"
                      />
                    </div>

                    <div>
                      <label htmlFor="perfil" className="block text-gray-700 text-sm font-semibold mb-2">
                        Perfil de aprendizaje predominante *
                      </label>
                      <select
                        id="perfil"
                        name="perfil"
                        value={formData.perfil}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                      >
                        <option value="">Seleccionar perfil</option>
                        <option value="Visual">Visual</option>
                        <option value="Auditivo">Auditivo</option>
                        <option value="Lector">Lector/Escritor</option>
                        <option value="Kinestésico">Kinestésico</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="area" className="block text-gray-700 text-sm font-semibold mb-2">
                        Área académica
                      </label>
                      <input
                        type="text"
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                        placeholder="Ej: Matemáticas, Ciencias, Historia"
                      />
                    </div>

                    <div>
                      <label htmlFor="tema" className="block text-gray-700 text-sm font-semibold mb-2">
                        Tema específico
                      </label>
                      <input
                        type="text"
                        id="tema"
                        name="tema"
                        value={formData.tema}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                        placeholder="Ej: Ecuaciones lineales, Revolución Industrial"
                      />
                    </div>
                  </div>
                </div>

                {/* Configuración de Clase */}
                <div className="backdrop-blur-md bg-white/50 rounded-xl border border-white/30 p-6">
                  <h2 className="text-gray-800 text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    Configuración de Clase
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nivel_educativo" className="block text-gray-700 text-sm font-semibold mb-2">
                        Nivel educativo
                      </label>
                      <select
                        id="nivel_educativo"
                        name="nivel_educativo"
                        value={formData.nivel_educativo}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                      >
                        <option value="">Seleccionar nivel</option>
                        <option value="Primaria">Primaria</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Pregrado">Pregrado</option>
                        <option value="Posgrado">Posgrado</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="duracion_estimada" className="block text-gray-700 text-sm font-semibold mb-2">
                        Duración estimada (minutos)
                      </label>
                      <input
                        type="number"
                        id="duracion_estimada"
                        name="duracion_estimada"
                        value={formData.duracion_estimada}
                        onChange={handleInputChange}
                        min="15"
                        max="480"
                        className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                        placeholder="60"
                      />
                    </div>

                    <div>
                      <label htmlFor="tipo_sesion" className="block text-gray-700 text-sm font-semibold mb-2">
                        Tipo de sesión
                      </label>
                      <select
                        id="tipo_sesion"
                        name="tipo_sesion"
                        value={formData.tipo_sesion}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="Clase teorica">Clase teórica</option>
                        <option value="Taller practico">Taller práctico</option>
                        <option value="Laboratorio">Laboratorio</option>
                        <option value="Seminario">Seminario</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="modalidad" className="block text-gray-700 text-sm font-semibold mb-2">
                        Modalidad
                      </label>
                      <select
                        id="modalidad"
                        name="modalidad"
                        value={formData.modalidad}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                      >
                        <option value="">Seleccionar modalidad</option>
                        <option value="Presencial">Presencial</option>
                        <option value="Virtual sincronica">Virtual sincrónica</option>
                        <option value="Virtual asincronica">Virtual asincrónica</option>
                        <option value="Hibrida">Híbrida</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Detalles Pedagógicos */}
                <div className="backdrop-blur-md bg-white/50 rounded-xl border border-white/30 p-6">
                  <h2 className="text-gray-800 text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    Detalles Pedagógicos
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="objetivos_aprendizaje" className="block text-gray-700 text-sm font-semibold mb-2">
                        Objetivos de aprendizaje
                      </label>
                      <textarea
                        id="objetivos_aprendizaje"
                        name="objetivos_aprendizaje"
                        value={formData.objetivos_aprendizaje}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 resize-none"
                        placeholder="Describe los objetivos que esperas que los estudiantes alcancen..."
                      />
                    </div>

                    <div>
                      <label htmlFor="conocimientos_previos_estudiantes" className="block text-gray-700 text-sm font-semibold mb-2">
                        Conocimientos previos de los estudiantes
                      </label>
                      <textarea
                        id="conocimientos_previos_estudiantes"
                        name="conocimientos_previos_estudiantes"
                        value={formData.conocimientos_previos_estudiantes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 resize-none"
                        placeholder="Describe qué conocimientos previos tienen los estudiantes..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="resultado_taxonomia" className="block text-gray-700 text-sm font-semibold mb-2">
                          Nivel de Bloom esperado
                        </label>
                        <select
                          id="resultado_taxonomia"
                          name="resultado_taxonomia"
                          value={formData.resultado_taxonomia}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                        >
                          <option value="">Seleccionar nivel</option>
                          <option value="Recordar">Recordar</option>
                          <option value="Comprender">Comprender</option>
                          <option value="Aplicar">Aplicar</option>
                          <option value="Analizar">Analizar</option>
                          <option value="Evaluar">Evaluar</option>
                          <option value="Crear">Crear</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="estilo_material" className="block text-gray-700 text-sm font-semibold mb-2">
                          Estilo del material
                        </label>
                        <select
                          id="estilo_material"
                          name="estilo_material"
                          value={formData.estilo_material}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                        >
                          <option value="">Seleccionar estilo</option>
                          <option value="Formal academico">Formal y académico</option>
                          <option value="Cercano y motivador">Cercano y motivador</option>
                          <option value="Practico y directo">Práctico y directo</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="aspectos_motivacionales" className="block text-gray-700 text-sm font-semibold mb-2">
                        Aspectos motivacionales
                      </label>
                      <textarea
                        id="aspectos_motivacionales"
                        name="aspectos_motivacionales"
                        value={formData.aspectos_motivacionales}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-3 border border-white/40 rounded-xl bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 resize-none"
                        placeholder="Describe elementos que puedan motivar a los estudiantes..."
                      />
                    </div>
                  </div>
                </div>

                {/* Material de Apoyo */}
                <div className="backdrop-blur-md bg-white/50 rounded-xl border border-white/30 p-6">
                  <h2 className="text-gray-800 text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    Material
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-3">
                        Subir archivos
                      </label>
                      <div className="backdrop-blur-md bg-blue-50/60 border-2 border-dashed border-blue-300 rounded-xl p-6 text-center">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"/>
                            </svg>
                            <p className="text-blue-600 font-semibold mb-2">
                              Haz clic para subir archivos
                            </p>
                            <p className="text-blue-500 text-sm">
                              PDF, DOC, DOCX, TXT, PPT, PPTX (máx. 10MB cada uno)
                            </p>
                          </div>
                        </label>
                      </div>
                      
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-gray-700 text-sm font-semibold">Archivos seleccionados:</p>
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between backdrop-blur-md bg-white/70 border border-white/40 rounded-lg p-3">
                              <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                                </svg>
                                <div>
                                  <p className="text-gray-800 text-sm font-medium">{file.name}</p>
                                  <p className="text-gray-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="backdrop-blur-md bg-amber-50/60 border border-amber-200 rounded-xl p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="solo_informacion_proporcionada"
                          checked={formData.solo_informacion_proporcionada}
                          onChange={handleInputChange}
                          className="h-5 w-5 rounded border-amber-300 border-2 bg-transparent text-amber-600 checked:bg-amber-600 checked:border-amber-600 focus:ring-0 focus:ring-offset-0 focus:border-amber-300 focus:outline-none mt-0.5"
                        />
                        <div>
                          <p className="text-gray-800 text-sm font-semibold mb-1">
                            Usar solo información proporcionada
                          </p>
                          <p className="text-gray-600 text-xs">
                            La IA utilizará únicamente el material que proporcione, sin conocimiento externo
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/teacher/dashboard')}
                    className="backdrop-blur-md bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating || !formData.nombre || !formData.perfil}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                  >
                    Crear Clase
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
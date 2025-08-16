'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiService, ClaseData } from '../../lib/api';

export default function CreateClassPage() {
  const router = useRouter();
  
  // New state for the initial form creation step
  const [currentStep, setCurrentStep] = useState<'initial' | 'form'>('initial');
  const [formId, setFormId] = useState<number | null>(null);
  const [formLink, setFormLink] = useState<string | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isWaitingForLink, setIsWaitingForLink] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      router.push('/login');
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
    estilo_material: '',
    tipo_recursos_generar: [] as string[]
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Function to create a new form
  const createForm = async () => {
    setIsCreatingForm(true);
    setError(null);
    
    try {
      // Use apiService to create form
      const result = await apiService.createFormulario();
      setFormId(result.id!);
      
      // Start waiting for the link generation
      setIsWaitingForLink(true);
      
      setTimeout(async () => {
        await fetchFormLink(result.id!);
      }, 10000);
      
    } catch (error) {
      console.error('Error creating form:', error);
      setError(error instanceof Error ? error.message : 'Error al crear el formulario');
    } finally {
      setIsCreatingForm(false);
    }
  };

  // Function to fetch the form link
  const fetchFormLink = async (formId: number) => {
    try {
      const formData = await apiService.getFormulario(formId);
      console.log(formData)
      if (formData.enlace) {
        setFormLink(formData.enlace);
        setIsWaitingForLink(false);
      } else {
        // If no link yet, try again after a short delay
        setTimeout(() => fetchFormLink(formId), 2000);
      }
    } catch (error) {
      console.error('Error fetching form link:', error);
      setError(error instanceof Error ? error.message : 'Error al obtener el enlace del formulario');
      setIsWaitingForLink(false);
    }
  };

  // Function to proceed to the main form
  const proceedToMainForm = () => {
    if (formLink && formId) {
      setCurrentStep('form');
    }
  };

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
        id_formulario: formId || undefined, // Use the created form ID
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
        tipo_recursos_generar: formData.tipo_recursos_generar.join(', ')
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
      router.push(`/class/${createdClass.id}`);
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
      if (name === 'tipo_recursos_generar') {
        setFormData(prev => ({
          ...prev,
          tipo_recursos_generar: checkbox.checked 
            ? [...prev.tipo_recursos_generar, value]
            : prev.tipo_recursos_generar.filter(item => item !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checkbox.checked
        }));
      }
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
      <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
            <div className="flex items-center gap-4 text-[#0d141c]">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_6_330)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                      fill="currentColor"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_6_330"><rect width="48" height="48" fill="white"></rect></clipPath>
                  </defs>
                </svg>
              </div>
              <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">DocentePlus AI</h2>
            </div>
          </header>
          <div className="px-40 flex flex-1 justify-center py-5 items-center">
            <div className="text-center">
              {error ? (
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto">
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-8,56a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,104a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z"/>
                    </svg>
                  </div>
                  <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-4">Error al crear la clase</h2>
                  <p className="text-red-600 text-base mb-6">{error}</p>
                  <button
                    onClick={() => {setError(null); setIsGenerating(false);}}
                    className="bg-[#0d80f2] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <div>
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0d80f2] mx-auto mb-8"></div>
                  <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-4">Generando contenido</h2>
                  <p className="text-[#49739c] text-base">{getProgressMessage()}</p>
                  {uploadedFiles.length > 0 && (
                    <p className="text-[#49739c] text-sm mt-2">
                      {uploadProgress === 'uploading' && `Subiendo ${uploadedFiles.length} archivo(s)...`}
                      {uploadProgress === 'processing' && 'Analizando documentos y generando contenido personalizado...'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial step - Form creation
  if (currentStep === 'initial') {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" 
        style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
      >
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
            <div className="flex items-center gap-4 text-[#0d141c]">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_6_330)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                      fill="currentColor"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_6_330"><rect width="48" height="48" fill="white"></rect></clipPath>
                  </defs>
                </svg>
              </div>
              <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">DocentePlus AI</h2>
            </div>
            <div className="flex flex-1 justify-end gap-8">
              <div className="flex items-center gap-9">
                <button 
                  className="text-[#0d141c] text-sm font-medium leading-normal hover:text-[#0d80f2]"
                  onClick={() => router.push('/dashboard')}
                >
                  ← Volver al Dashboard
                </button>
              </div>
            </div>
          </header>

          <div className="px-40 flex flex-1 justify-center py-5 items-center">
            <div className="text-center max-w-2xl">
              {error ? (
                <div className="mb-8">
                  <div className="text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto">
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-8,56a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,104a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z"/>
                    </svg>
                  </div>
                  <h2 className="text-[#0d141c] text-[24px] font-bold leading-tight mb-4">Error</h2>
                  <p className="text-red-600 text-base mb-6">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="bg-[#0d80f2] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-[#0d141c] text-[32px] font-bold leading-tight mb-8">
                    Formulario para estudiantes
                  </h1>
                  
                  {!formId ? (
                    <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
                      <p className="text-[#49739c] text-lg leading-relaxed mb-8">
                        Antes de crear la clase, necesitamos generar un formulario que los estudiantes podrán completar. 
                        Esto nos ayudará a personalizar mejor el contenido educativo.
                      </p>
                      <button
                        onClick={createForm}
                        disabled={isCreatingForm}
                        className="bg-[#0d80f2] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                      >
                        {isCreatingForm ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Creando formulario...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>
                            </svg>
                            Crear formulario
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
                      {isWaitingForLink ? (
                        <div>
                          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0d80f2] mx-auto mb-6"></div>
                          <h2 className="text-[#0d141c] text-[24px] font-bold leading-tight mb-4">Generando enlace del formulario</h2>
                          <p className="text-[#49739c] text-base">
                            Por favor espera mientras generamos el enlace personalizado para tus estudiantes...
                          </p>
                        </div>
                      ) : formLink ? (
                        <div>
                          <div className="text-green-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto">
                              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/>
                            </svg>
                          </div>
                          <h2 className="text-[#0d141c] text-[24px] font-bold leading-tight mb-4">¡Formulario creado exitosamente!</h2>
                          <p className="text-[#49739c] text-base mb-6">
                            Comparte este enlace con tus estudiantes para que completen el formulario:
                          </p>
                          
                          <div className="bg-[#f8fafc] border border-[#cedbe8] rounded-lg p-4 mb-6">
                            <p className="text-sm text-[#49739c] mb-2">Enlace del formulario:</p>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={formLink}
                                readOnly
                                className="flex-1 p-2 border border-[#cedbe8] rounded text-sm bg-white"
                              />
                              <button
                                onClick={() => navigator.clipboard.writeText(formLink)}
                                className="px-3 py-2 bg-[#0d80f2] text-white rounded text-sm hover:bg-blue-600"
                              >
                                Copiar
                              </button>
                            </div>
                          </div>
                          
                          <button
                            onClick={proceedToMainForm}
                            className="bg-[#0d80f2] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-600 flex items-center gap-3 mx-auto"
                          >
                            Siguiente
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                              <path d="m221.66,133.66-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/>
                            </svg>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form step
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" 
      style={{
        fontFamily: 'Inter, "Noto Sans", sans-serif',
        '--checkbox-tick-svg': `url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(248,250,252)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')`
      } as any}
    >
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_330)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                    fill="currentColor"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_330"><rect width="48" height="48" fill="white"></rect></clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">DocentePlus AI</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <button 
                className="text-[#0d141c] text-sm font-medium leading-normal"
                onClick={() => router.push('/dashboard')}
              >
                My Classes
              </button>
            </div>
          </div>
        </header>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">
                Crear Nueva Clase
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Información Básica */}
              <div className="bg-[#f8fafc] rounded-lg border border-[#cedbe8] p-6">
                <h3 className="text-[#0d141c] text-[18px] font-bold leading-tight mb-4">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Nombre de la clase *</p>
                    <input
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Matemáticas Básicas"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] h-14 p-[15px] text-base font-normal leading-normal"
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Perfil de aprendizaje *</p>
                    <select
                      name="perfil"
                      value={formData.perfil}
                      onChange={handleInputChange}
                      required
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] h-14 p-[15px] text-base font-normal leading-normal"
                    >
                      <option value="">Seleccionar perfil</option>
                      <option value="Visual">Visual</option>
                      <option value="Auditivo">Auditivo</option>
                      <option value="Lector">Lector/Escritor</option>
                      <option value="Kinestesico">Kinestésico</option>
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Área *</p>
                    <input
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Matemáticas, Ciencias, Historia"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] h-14 p-[15px] text-base font-normal leading-normal"
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Tema específico *</p>
                    <input
                      name="tema"
                      value={formData.tema}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Suma y resta, La Revolución Francesa"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] h-14 p-[15px] text-base font-normal leading-normal"
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Nivel educativo *</p>
                    <select
                      name="nivel_educativo"
                      value={formData.nivel_educativo}
                      onChange={handleInputChange}
                      required
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] h-14 p-[15px] text-base font-normal leading-normal"
                    >
                      <option value="">Seleccionar nivel</option>
                      <option value="Primaria">Primaria</option>
                      <option value="Secundaria">Secundaria</option>
                      <option value="Pregrado">Pregrado</option>
                      <option value="Posgrado">Posgrado</option>
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Duración estimada (minutos) *</p>
                    <input
                      name="duracion_estimada"
                      type="number"
                      value={formData.duracion_estimada}
                      onChange={handleInputChange}
                      required
                      min="15"
                      max="300"
                      placeholder="60"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] h-14 p-[15px] text-base font-normal leading-normal"
                    />
                  </label>
                </div>
              </div>

              {/* Configuración de sesión */}
              <div className="bg-[#f8fafc] rounded-lg border border-[#cedbe8] p-6">
                <h3 className="text-[#0d141c] text-[18px] font-bold leading-tight mb-4">Configuración de Sesión</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Tipo de sesión *</p>
                    <select
                      name="tipo_sesion"
                      value={formData.tipo_sesion}
                      onChange={handleInputChange}
                      required
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] h-14 p-[15px] text-base font-normal leading-normal"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Clase teorica">Clase teórica</option>
                      <option value="Taller practico">Taller práctico</option>
                      <option value="Laboratorio">Laboratorio</option>
                      <option value="Seminario">Seminario</option>
                    </select>
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Modalidad *</p>
                    <select
                      name="modalidad"
                      value={formData.modalidad}
                      onChange={handleInputChange}
                      required
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] h-14 p-[15px] text-base font-normal leading-normal"
                    >
                      <option value="">Seleccionar modalidad</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Virtual">Virtual</option>
                      <option value="Hibrida">Híbrida</option>
                    </select>
                  </label>
                </div>
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="solo_informacion_proporcionada"
                      checked={formData.solo_informacion_proporcionada}
                      onChange={handleInputChange}
                      className="h-5 w-5 rounded border-[#cedbe8] border-2 bg-transparent text-[#0d80f2] checked:bg-[#0d80f2] checked:border-[#0d80f2] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#cedbe8] focus:outline-none"
                    />
                    <p className="text-[#0d141c] text-base font-normal leading-normal ml-3">
                      Usar solo información proporcionada (sin conocimiento externo)
                    </p>
                  </label>
                </div>
              </div>

              {/* Objetivos y Taxonomía */}
              <div className="bg-[#f8fafc] rounded-lg border border-[#cedbe8] p-6">
                <h3 className="text-[#0d141c] text-[18px] font-bold leading-tight mb-4">Objetivos y Taxonomía</h3>
                <div className="grid grid-cols-1 gap-4">
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Objetivos de aprendizaje *</p>
                    <textarea
                      name="objetivos_aprendizaje"
                      value={formData.objetivos_aprendizaje}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      placeholder="Describe qué deben lograr los estudiantes al finalizar la clase"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] p-[15px] text-base font-normal leading-normal"
                    />
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col">
                      <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Taxonomía de Bloom *</p>
                      <select
                        name="resultado_taxonomia"
                        value={formData.resultado_taxonomia}
                        onChange={handleInputChange}
                        required
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] h-14 p-[15px] text-base font-normal leading-normal"
                      >
                        <option value="">Seleccionar nivel</option>
                        <option value="Recordar">Recordar</option>
                        <option value="Comprender">Comprender</option>
                        <option value="Aplicar">Aplicar</option>
                        <option value="Analizar">Analizar</option>
                        <option value="Evaluar">Evaluar</option>
                        <option value="Crear">Crear</option>
                      </select>
                    </label>
                    <label className="flex flex-col">
                      <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Estilo del material *</p>
                      <select
                        name="estilo_material"
                        value={formData.estilo_material}
                        onChange={handleInputChange}
                        required
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] h-14 p-[15px] text-base font-normal leading-normal"
                      >
                        <option value="">Seleccionar estilo</option>
                        <option value="Formal academico">Formal y académico</option>
                        <option value="Cercano y motivador">Cercano y motivador</option>
                        <option value="Practico y directo">Práctico y directo</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              {/* Contexto Estudiantil */}
              <div className="bg-[#f8fafc] rounded-lg border border-[#cedbe8] p-6">
                <h3 className="text-[#0d141c] text-[18px] font-bold leading-tight mb-4">Contexto Estudiantil</h3>
                <div className="grid grid-cols-1 gap-4">
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Conocimientos previos de los estudiantes *</p>
                    <textarea
                      name="conocimientos_previos_estudiantes"
                      value={formData.conocimientos_previos_estudiantes}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      placeholder="Describe qué conocimientos ya tienen los estudiantes sobre el tema"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] p-[15px] text-base font-normal leading-normal"
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Aspectos motivacionales *</p>
                    <textarea
                      name="aspectos_motivacionales"
                      value={formData.aspectos_motivacionales}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      placeholder="Describe qué elementos pueden motivar a los estudiantes en esta clase"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] p-[15px] text-base font-normal leading-normal"
                    />
                  </label>
                </div>
              </div>

              {/* Recursos */}
              <div className="bg-[#f8fafc] rounded-lg border border-[#cedbe8] p-6">
                <h3 className="text-[#0d141c] text-[18px] font-bold leading-tight mb-4">Recursos</h3>
                <div className="grid grid-cols-1 gap-4">
                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Recursos disponibles *</p>
                    <textarea
                      name="recursos"
                      value={formData.recursos}
                      onChange={handleInputChange}
                      required
                      rows={2}
                      placeholder="Ej: Proyector, pizarra, computadoras, laboratorio"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] p-[15px] text-base font-normal leading-normal"
                    />
                  </label>

                  <div>
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Tipo de recursos a generar *</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        'Guía de estudio (escrita)',
                        'Audio',
                        'Presentación (ppt)',
                        'Dinámica participativa',
                        'Evaluación (quizz)',
                      ].map((tipo) => (
                        <label key={tipo} className="flex items-center">
                          <input
                            type="checkbox"
                            name="tipo_recursos_generar"
                            value={tipo}
                            checked={formData.tipo_recursos_generar.includes(tipo)}
                            onChange={handleInputChange}
                            className="h-5 w-5 rounded border-[#cedbe8] border-2 bg-transparent text-[#0d80f2] checked:bg-[#0d80f2] checked:border-[#0d80f2] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#cedbe8] focus:outline-none"
                          />
                          <p className="text-[#0d141c] text-base font-normal leading-normal ml-3">{tipo}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="flex flex-col">
                    <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Subir Archivo (PDF, DOC, DOCX)</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      multiple
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#0d80f2] h-14 p-[15px] text-base font-normal leading-normal"
                      onChange={handleFileChange}
                    />
                  </label>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-[#e7edf4] rounded px-3 py-2">
                          <span className="text-[#49739c] text-sm">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 p-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Cancelar</span>
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !formData.nombre || !formData.perfil}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">Crear Clase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

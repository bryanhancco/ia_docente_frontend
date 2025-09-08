'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  apiService, 
  EstudianteResponseDTO, 
  ClaseResponse, 
  ContenidoGenerado,
  ApoyoPsicopedagogicoRequestDTO,
  RespuestaPsicopedagogicaDTO,
  PlanEstudioResponseDTO,
  EvaluacionComprensionResponseDTO,
  PerfilCognitivoType,
  NivelConocimientosType
} from '../../../lib/api';

export default function ClassDetailPage() {
  const router = useRouter();
  const { id: classId } = useParams();
  const [student, setStudent] = useState<EstudianteResponseDTO | null>(null);
  const [classData, setClassData] = useState<ClaseResponse | null>(null);
  const [contents, setContents] = useState<ContenidoGenerado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  // Estado para tabs de materiales
  const [showCustomTab, setShowCustomTab] = useState(false);
  // Estados para el chatbot y agente psicopedagógico
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'bot', content: string, timestamp: Date}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<'general' | 'apoyo' | 'plan' | 'evaluacion'>('general');

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
      loadClassData();
    } catch (error) {
      console.error('Error parsing student data:', error);
      router.push('/student/login');
    }
  }, [router, classId]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || !student || !classData) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      let botResponse = '';
      
      switch (chatMode) {
        case 'apoyo':
          try {
            const apoyoRequest: ApoyoPsicopedagogicoRequestDTO = {
              perfil_cognitivo: normalizePerfil(student.perfil_cognitivo),
              perfil_personalidad: student.perfil_personalidad || 'Estudiante motivado y participativo',
              nivel_conocimientos: 'basico' as NivelConocimientosType,
              id_clase: parseInt(classId as string),
              mensaje_usuario: currentMessage,
              problema_especifico: currentMessage
            };
            
            const response = await apiService.generarApoyoPsicopedagogico(student.id, apoyoRequest);
            botResponse = response.contenido_generado;
          } catch (error) {
            console.error('Error en apoyo psicopedagógico:', error);
            botResponse = 'Lo siento, no pude generar el apoyo personalizado en este momento. ¿Podrías ser más específico sobre el problema que estás enfrentando?';
          }
          break;
          
        case 'plan':
          try {
            const response = await apiService.generarPlanEstudio(
              student.id,
              normalizePerfil(student.perfil_cognitivo),
              student.perfil_personalidad || 'Estudiante motivado',
              'basico',
              parseInt(classId as string),
              currentMessage,
              currentMessage
            );
            botResponse = response.contenido_generado;
          } catch (error) {
            console.error('Error en plan de estudio:', error);
            botResponse = 'No pude generar un plan de estudio personalizado ahora. Te sugiero revisar los materiales proporcionados y contactar a tu docente.';
          }
          break;
          
        case 'evaluacion':
          try {
            const response = await apiService.evaluarComprension(
              student.id,
              normalizePerfil(student.perfil_cognitivo),
              student.perfil_personalidad || 'Estudiante motivado',
              'basico',
              parseInt(classId as string),
              currentMessage,
              currentMessage
            );
            botResponse = response.contenido_generado;
          } catch (error) {
            console.error('Error en evaluación de comprensión:', error);
            botResponse = 'No pude evaluar tu comprensión en este momento. Te recomiendo practicar con los materiales disponibles.';
          }
          break;
          
        default:
          // Respuesta general básica
          botResponse = `Hola ${student.nombre}! Te ayudo con dudas sobre "${classData.nombre}". Puedo ofrecerte:
          
• **Apoyo personalizado**: Ayuda específica con problemas de aprendizaje
• **Plan de estudio**: Estrategias personalizadas según tu estilo
• **Evaluación**: Retroalimentación sobre tu comprensión

¿En qué te gustaría que te ayude hoy?`;
          break;
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: botResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: 'Lo siento, hubo un problema procesando tu mensaje. Por favor, intenta nuevamente.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    setChatMode('general');
  };

  const normalizePerfil = (perfil: string | undefined): PerfilCognitivoType => {
    if (!perfil) return 'visual';
    const normalized = perfil.toLowerCase();
    const validProfiles: PerfilCognitivoType[] = ['visual', 'auditivo', 'lector', 'kinestesico'];
    return validProfiles.includes(normalized as PerfilCognitivoType) 
      ? normalized as PerfilCognitivoType 
      : 'visual';
  };

  const loadClassData = async () => {
    if (!classId) return;
    
    try {
      setIsLoading(true);
      const [classInfo, classContents] = await Promise.all([
        apiService.getClase(parseInt(classId as string)),
        apiService.getContenidosClase(parseInt(classId as string))
      ]);
      
      setClassData(classInfo);
      setContents(classContents);
    } catch (error) {
      console.error('Error loading class data:', error);
      setError('Error al cargar los datos de la clase');
    } finally {
      setIsLoading(false);
    }
  };

  if (!student) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-[#49739c]">Cargando clase...</span>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || 'Clase no encontrada'}</p>
          <Link href="/student/classes" className="mt-3 text-[#0d80f2] hover:underline block">
            ← Volver a Mis Clases
          </Link>
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
            <h1 className="text-[#0d141c] text-xl font-bold leading-tight tracking-[-0.015em]">
              {classData.nombre || 'Detalle de Clase'}
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 px-4 py-8 relative">
          <div className="w-full max-w-6xl mx-auto">
            {/* Class Header */}
            <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8 mb-6">
              <div className="mb-6">
                <h2 className="text-[#0d141c] text-3xl font-bold mb-3">
                  {classData.nombre || 'Clase sin nombre'}
                </h2>
                <p className="text-[#49739c] text-lg mb-4">
                  {classData.tema || 'Sin tema especificado'}
                </p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-[#49739c] font-medium">Área:</span>
                    <span className="ml-2 text-[#0d141c]">{classData.area || 'No especificada'}</span>
                  </div>
                  <div>
                    <span className="text-[#49739c] font-medium">Nivel:</span>
                    <span className="ml-2 text-[#0d141c]">{classData.nivel_educativo || 'No especificado'}</span>
                  </div>
                  <div>
                    <span className="text-[#49739c] font-medium">Duración:</span>
                    <span className="ml-2 text-[#0d141c]">
                      {classData.duracion_estimada ? `${classData.duracion_estimada} min` : 'No especificada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#49739c] font-medium">Modalidad:</span>
                    <span className="ml-2 text-[#0d141c]">{classData.modalidad || 'No especificada'}</span>
                  </div>
                </div>
              </div>

              {classData.objetivos_aprendizaje && (
                <div className="border-t border-[#e7edf4] pt-6">
                  <h3 className="text-[#0d141c] font-semibold mb-2">Objetivos de Aprendizaje</h3>
                  <p className="text-[#49739c]">{classData.objetivos_aprendizaje}</p>
                </div>
              )}
            </div>

            {/* Tabs for materials */}
            <div className="bg-white rounded-lg shadow-sm border border-[#e7edf4] p-8">
              <div className="mb-6">
                <h3 className="text-[#0d141c] text-2xl font-bold mb-2">Materiales de Clase</h3>
                <p className="text-[#49739c]">Accede a los recursos generados por tu docente</p>
              </div>
              <div className="flex border-b border-[#e7edf4] mb-6">
                <button
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    !showCustomTab ? 'border-[#0d80f2] text-[#0d80f2]' : 'border-transparent text-[#49739c] hover:text-[#0d141c]'
                  }`}
                  onClick={() => setShowCustomTab(false)}
                >
                  Material proporcionado
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    showCustomTab ? 'border-[#0d80f2] text-[#0d80f2]' : 'border-transparent text-[#49739c] hover:text-[#0d141c]'
                  }`}
                  onClick={() => setShowCustomTab(true)}
                >
                  Material personalizado
                </button>
              </div>
              {/* Tab content */}
              {!showCustomTab ? (
                // Material proporcionado: solo mostrar recursos de la pestaña "Contenido de Clase" del docente
                <>
                  {/* Presentación PowerPoint */}
                  <div className="mb-8">
                    <h4 className="text-[#0d141c] text-lg font-semibold mb-4">Presentación PowerPoint</h4>
                    {contents.filter(c => c.tipo_recurso_generado === 'Presentación PowerPoint').length > 0 ? (
                      <div className="space-y-4">
                        {contents.filter(c => c.tipo_recurso_generado === 'Presentación PowerPoint').map((contenido, idx) => {
                          const lines = contenido.contenido.split('\n');
                          const embedUrlLine = lines.find(line => line.includes('URL Embed:'));
                          const downloadUrlLine = lines.find(line => line.includes('ID SlidesGPT:'));
                          const embedUrl = embedUrlLine ? embedUrlLine.split('URL Embed: ')[1] : null;
                          const slidesId = downloadUrlLine ? downloadUrlLine.split('ID SlidesGPT: ')[1] : null;
                          return (
                            <div key={contenido.id} className="bg-slate-50 rounded-lg border border-[#cedbe8] p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h5 className="text-[#0d141c] text-base font-semibold">Presentación PowerPoint</h5>
                                  <p className="text-[#49739c] text-xs">Generada el {new Date(contenido.created_at).toLocaleDateString('es-ES')}</p>
                                </div>
                                {slidesId && (
                                  <button
                                    onClick={() => window.open(`https://slidesgpt.com/presentation/${slidesId}`, '_blank')}
                                    className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-700 flex items-center gap-2"
                                  >
                                    Descargar
                                  </button>
                                )}
                              </div>
                              {embedUrl ? (
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                  <iframe
                                    src={embedUrl}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allowFullScreen
                                    title="Presentación PowerPoint"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">Vista previa no disponible</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center text-[#49739c] py-4">No hay presentación generada</div>
                    )}
                  </div>
                  {/* Recursos Educativos Web */}
                  <div className="mb-8">
                    <h4 className="text-[#0d141c] text-lg font-semibold mb-4">Recursos Educativos Web</h4>
                    {contents.filter(c => c.tipo_recurso_generado === 'Recursos Educativos Web').length > 0 ? (
                      <div className="space-y-4">
                        {contents.filter(c => c.tipo_recurso_generado === 'Recursos Educativos Web').map((contenido, idx) => (
                          <div key={contenido.id} className="bg-slate-50 rounded-lg border border-[#cedbe8] p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h5 className="text-[#0d141c] text-base font-semibold">Recursos Educativos Web</h5>
                                <p className="text-[#49739c] text-xs">Encontrados el {new Date(contenido.created_at).toLocaleDateString('es-ES')}</p>
                              </div>
                            </div>
                            <div className="prose max-w-none">
                              <div className="whitespace-pre-line text-[#0d141c] text-xs leading-relaxed max-h-60 overflow-y-auto bg-white p-2 rounded-lg">
                                {contenido.contenido}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-[#49739c] py-4">No hay recursos web encontrados</div>
                    )}
                  </div>
                </>
              ) : (
                // Material personalizado: funcionalidades del agente psicopedagógico
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h4 className="text-[#0d141c] text-xl font-bold mb-2">Material Personalizado</h4>
                    <p className="text-[#49739c]">Recursos generados específicamente para tu estilo de aprendizaje</p>
                  </div>

                  {/* Tarjetas de funcionalidades */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Apoyo Psicopedagógico */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-blue-600" viewBox="0 0 256 256">
                            <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/>
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-semibold text-[#0d141c]">Apoyo Personalizado</h5>
                          <p className="text-xs text-[#49739c]">Ayuda específica para tus dificultades</p>
                        </div>
                      </div>
                      <p className="text-sm text-[#49739c] mb-4">
                        Obtén apoyo psicopedagógico personalizado basado en tu perfil de aprendizaje y las dificultades específicas que encuentres.
                      </p>
                      <button
                        onClick={() => {
                          setChatMode('apoyo');
                          setShowChatbot(true);
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Solicitar Apoyo
                      </button>
                    </div>

                    {/* Plan de Estudio */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-green-600" viewBox="0 0 256 256">
                            <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V88H40ZM40,200V104H216v96ZM64,128a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H72A8,8,0,0,1,64,128Zm0,32a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H72A8,8,0,0,1,64,160Zm64-32a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H136A8,8,0,0,1,128,128Zm0,32a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H136A8,8,0,0,1,128,160Z"/>
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-semibold text-[#0d141c]">Plan de Estudio</h5>
                          <p className="text-xs text-[#49739c]">Estrategias personalizadas</p>
                        </div>
                      </div>
                      <p className="text-sm text-[#49739c] mb-4">
                        Genera un plan de estudio personalizado adaptado a tu estilo de aprendizaje y objetivos específicos.
                      </p>
                      <button
                        onClick={() => {
                          setChatMode('plan');
                          setShowChatbot(true);
                        }}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        Crear Plan
                      </button>
                    </div>

                    {/* Evaluación de Comprensión */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-purple-600" viewBox="0 0 256 256">
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/>
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-semibold text-[#0d141c]">Evaluación</h5>
                          <p className="text-xs text-[#49739c]">Retroalimentación personalizada</p>
                        </div>
                      </div>
                      <p className="text-sm text-[#49739c] mb-4">
                        Evalúa tu comprensión del tema y recibe retroalimentación personalizada para mejorar tu aprendizaje.
                      </p>
                      <button
                        onClick={() => {
                          setChatMode('evaluacion');
                          setShowChatbot(true);
                        }}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                      >
                        Evaluar Comprensión
                      </button>
                    </div>

                    {/* Asistente General */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-orange-600" viewBox="0 0 256 256">
                            <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM128,72a12,12,0,1,0-12-12A12,12,0,0,0,128,72Zm0,112a12,12,0,1,0,12,12A12,12,0,0,0,128,184Zm94.92,2.92-35.36-35.36a60,60,0,0,0,0-63.12l35.36-35.36a8,8,0,0,0-11.31-11.31L176.25,77.14a60,60,0,0,0-63.12,0L77.77,41.77A8,8,0,0,0,66.46,53.08L101.82,88.44a60,60,0,0,0,0,63.12L66.46,186.92a8,8,0,0,0,11.31,11.31l35.36-35.36a60,60,0,0,0,63.12,0l35.36,35.36a8,8,0,0,0,11.31-11.31ZM128,184a56,56,0,1,1,56-56A56.06,56.06,0,0,1,128,184Z"/>
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-semibold text-[#0d141c]">Asistente General</h5>
                          <p className="text-xs text-[#49739c]">Preguntas y dudas generales</p>
                        </div>
                      </div>
                      <p className="text-sm text-[#49739c] mb-4">
                        Resuelve dudas generales sobre la clase, conceptos o cualquier pregunta relacionada con el contenido.
                      </p>
                      <button
                        onClick={() => {
                          setChatMode('general');
                          setShowChatbot(true);
                        }}
                        className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-orange-700 transition-colors"
                      >
                        Hacer Pregunta
                      </button>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-blue-600 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">Personalización Inteligente</p>
                        <p className="text-xs text-blue-700">
                          Todas estas herramientas utilizan tu perfil de aprendizaje ({normalizePerfil(student?.perfil_cognitivo)}) 
                          para ofrecerte una experiencia educativa personalizada y adaptada a tus necesidades específicas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chatbot Button */}
          <div className="fixed bottom-6 right-6">
            <button
              onClick={() => setShowChatbot(true)}
              className="bg-[#0d80f2] hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
              title="Abrir asistente virtual"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                {/* Friendly assistant avatar */}
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="16" cy="16" r="14" fill="#0d80f2"/>
                  <circle cx="12" cy="13" r="2" fill="white"/>
                  <circle cx="20" cy="13" r="2" fill="white"/>
                  <path
                    d="M10 20c0 3.314 2.686 6 6 6s6-2.686 6-6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* Chatbot Modal */}
          {showChatbot && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-[#e7edf4]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0d80f2] flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="16" cy="16" r="14" fill="white"/>
                        <circle cx="12" cy="13" r="1.5" fill="#0d80f2"/>
                        <circle cx="20" cy="13" r="1.5" fill="#0d80f2"/>
                        <path
                          d="M10 18c0 2.5 2.5 4.5 6 4.5s6-2 6-4.5"
                          stroke="#0d80f2"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[#0d141c] font-semibold">Asistente Virtual</h3>
                      <p className="text-[#49739c] text-xs">¡Estoy aquí para ayudarte con {classData?.nombre}!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearChat}
                      className="text-[#49739c] hover:text-[#0d141c] p-1 text-xs"
                      title="Limpiar chat"
                    >
                      Limpiar
                    </button>
                    <button
                      onClick={() => setShowChatbot(false)}
                      className="text-[#49739c] hover:text-[#0d141c] p-1"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Modo de chat */}
                <div className="p-3 border-b border-[#e7edf4] bg-gray-50">
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => setChatMode('general')}
                      className={`px-2 py-1 rounded ${chatMode === 'general' ? 'bg-[#0d80f2] text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      General
                    </button>
                    <button
                      onClick={() => setChatMode('apoyo')}
                      className={`px-2 py-1 rounded ${chatMode === 'apoyo' ? 'bg-[#0d80f2] text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      Apoyo
                    </button>
                    <button
                      onClick={() => setChatMode('plan')}
                      className={`px-2 py-1 rounded ${chatMode === 'plan' ? 'bg-[#0d80f2] text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      Plan de Estudio
                    </button>
                    <button
                      onClick={() => setChatMode('evaluacion')}
                      className={`px-2 py-1 rounded ${chatMode === 'evaluacion' ? 'bg-[#0d80f2] text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      Evaluación
                    </button>
                  </div>
                </div>
                
                {/* Mensajes del chat */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-[#49739c] text-sm py-8">
                      <div className="mb-3">👋</div>
                      <p>¡Hola {student?.nombre}! Soy tu asistente virtual.</p>
                      <p className="mt-2">Selecciona un modo arriba y escribe tu pregunta.</p>
                    </div>
                  )}
                  
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.type === 'user' 
                          ? 'bg-[#0d80f2] text-white' 
                          : 'bg-gray-100 text-[#0d141c]'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-[#0d141c] p-3 rounded-lg text-sm">
                        <div className="flex items-center gap-1">
                          <span>Escribiendo</span>
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input del chat */}
                <div className="p-4 border-t border-[#e7edf4]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Escribe tu ${chatMode === 'general' ? 'pregunta' : chatMode}...`}
                      className="flex-1 px-3 py-2 border border-[#e7edf4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0d80f2]"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={isTyping}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!currentMessage.trim() || isTyping}
                      className="bg-[#0d80f2] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enviar
                    </button>
                  </div>
                  <div className="text-xs text-[#49739c] mt-1">
                    Modo: {chatMode === 'general' ? 'Preguntas generales' : 
                          chatMode === 'apoyo' ? 'Apoyo psicopedagógico personalizado' :
                          chatMode === 'plan' ? 'Generación de plan de estudio' :
                          'Evaluación de comprensión'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService, TipoEntidadEnum } from '../../../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// Componentes separados
import ChatModal from './chat-view/ChatModal';
import ContenidoClaseTab from './tab-contents/ContenidoClaseTab';
import ResumenesDiagramasTab from './tab-contents/ResumenesDiagramasTab';
import EvaluacionTab from './tab-contents/EvaluacionTab';
import NotasTab from './tab-contents/NotasTab';
import ClaseInteractivaModal from './tab-contents/ClaseInteractivaModal';
import type { 
  EstudianteResponseDTO, ClaseResponse, ContenidoGenerado, ArchivoInfo,
  PerfilCognitivoType, NivelConocimientosType, Flashcard, FlashcardsResponseDTO,
  PreguntaData, RespuestaQuiz, ResultadoQuiz, TipoAgenteEspecializado,
  ContenidoPersonalizadoRequestDTO, ContenidoPersonalizadoResponseDTO,
  RespuestaPsicopedagogicaDTO, ChatGeneralRequestDTO,
  ClaseInteractivaResponseDTO, ContenidoEstudianteResponseDTO, ContenidoEstudianteDataResponseDTO,
  EstadoContenidoType, NotaResponseDTO, NotaCreateDTO, NotaUpdateDTO,
  ConversacionResponseDTO
} from '../../../lib/api';

// Tipos para el chat con audio (debe coincidir con ChatModal)
interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  audioUrl?: string; // URL del audio para reproducir
  isAudioMessage?: boolean; // Si el mensaje original fue de audio
}

export default function ClassDetailPage() {
  const router = useRouter();
  const { id: classId } = useParams();
  const [student, setStudent] = useState<EstudianteResponseDTO | null>(null);
  const [classData, setClassData] = useState<ClaseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  // Estado para tabs principales
  const [activeTab, setActiveTab] = useState<'contenido-clase' | 'detalles-clase' | 'resumenes-diagramas' | 'evaluacion' | 'notas'>('contenido-clase');
  
  // Estados para contenido de clase interactivo
  const [showClassModal, setShowClassModal] = useState(false);
  const [claseInteractiva, setClaseInteractiva] = useState<ClaseInteractivaResponseDTO | null>(null);
  const [contenidoActual, setContenidoActual] = useState<ContenidoEstudianteResponseDTO | null>(null);
  const [progresoActual, setProgresoActual] = useState<ContenidoEstudianteDataResponseDTO | null>(null);
  const [contenidoPaginado, setContenidoPaginado] = useState<string[]>([]);
  const [paginaActual, setPaginaActual] = useState(0);
  const [loadingContenido, setLoadingContenido] = useState(false);
  
  // Estados para notas
  const [notas, setNotas] = useState<NotaResponseDTO[]>([]);
  const [nuevaNota, setNuevaNota] = useState('');
  const [editandoNota, setEditandoNota] = useState<number | null>(null);
  const [textoEditando, setTextoEditando] = useState('');
  const [loadingNotas, setLoadingNotas] = useState(false);
  
  // Estados para flashcards y quiz
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState<'all' | 'basic' | 'intermediate' | 'advanced'>('all');
  
  const [preguntas, setPreguntas] = useState<PreguntaData[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizIniciado, setQuizIniciado] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestasUsuario, setRespuestasUsuario] = useState<RespuestaQuiz[]>([]);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null);
  const [mostrarRetroalimentacion, setMostrarRetroalimentacion] = useState(false);
  const [quizTerminado, setQuizTerminado] = useState(false);
  const [resultadoQuiz, setResultadoQuiz] = useState<ResultadoQuiz | null>(null);
  const [tiempoInicio, setTiempoInicio] = useState<Date | null>(null);

  // Estados para chatbot y detalles de clase
  const [contents, setContents] = useState<ContenidoGenerado[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [originalFiles, setOriginalFiles] = useState<ArchivoInfo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fotoCaricaturaDocente, setFotoCaricaturaDocente] = useState<string>('/images/default-teacher-cartoon-avatar.png');
  const [nombreDocente, setNombreDocente] = useState<string>('Docente');
  
  // Estados para historial de conversaciones
  const [historialConversaciones, setHistorialConversaciones] = useState<ConversacionResponseDTO[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  


  useEffect(() => {
    // Check if user is logged in
    const studentDataString = localStorage.getItem('studentData');
    if (!studentDataString) {
      router.push('/student/login');
      return;
    }

    try {
      const studentData = JSON.parse(studentDataString);
      setStudent(studentData);
      loadClassData();
    } catch (error) {
      console.error('Error parsing student data:', error);
      router.push('/student/login');
    }
  }, [router, classId]);

  // Cargar datos iniciales y configurar progreso del estudiante
  useEffect(() => {
    if (student && classId) {
      inicializarProgresoEstudiante();
    }
  }, [student, classId]);

  // Cargar notas cuando se cambia a la tab de notas
  useEffect(() => {
    if (activeTab === 'notas' && student) {
      cargarNotas();
    }
  }, [activeTab, student]);

  // Cargar historial de conversaciones cuando se abre el chatbot
  useEffect(() => {
    if (showChatbot && student && classId) {
      cargarHistorialConversaciones();
    }
  }, [showChatbot, student, classId]);

  const loadClassData = async () => {
    if (!classId) return;
    
    try {
      const data = await apiService.getClase(Number(classId));
      setClassData(data);

      // Cargar contenidos generados de la clase
      try {
        const contentsData = await apiService.getContenidos(Number(classId));
        setContents(contentsData);
      } catch (error) {
        console.log('No hay contenidos generados aún');
      }

      // Cargar foto caricatura del docente
      try {
        const fotoResponse = await apiService.obtenerFotoCaricaturaDocente(data.id_docente);
        setFotoCaricaturaDocente(fotoResponse.foto_caricatura);
        setNombreDocente(fotoResponse.nombre_docente);
      } catch (error) {
        console.log('No se pudo cargar la foto del docente');
      }

      // Cargar archivos originales
      await loadOriginalFiles();

      // Verificar si el estudiante ya está inscrito
      if (student) {
        try {
          const progresoResponse = await apiService.obtenerProgresoClaseEstudiante(student.id, Number(classId));
          setIsAlreadyEnrolled(true);
        } catch (error) {
          // Si hay error, probablemente no está inscrito
          setIsAlreadyEnrolled(false);
        }
      }
    } catch (error) {
      console.error('Error loading class data:', error);
      setError('Error al cargar los datos de la clase');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== FUNCIONES PARA CONTENIDO INTERACTIVO ==========

  const inicializarProgresoEstudiante = async () => {
    if (!student || !classId) return;

    try {
      // Inicializar progreso si es necesario
      await apiService.inicializarProgresoEstudiante(student.id, Number(classId));
      
      // Cargar progreso actual
      await cargarProgresoClase();
    } catch (error) {
      console.error('Error al inicializar progreso:', error);
    }
  };

  const cargarProgresoClase = async () => {
    if (!student || !classId) return;

    try {
      // Cargar el progreso completo del estudiante en la clase
      const progreso = await apiService.obtenerProgresoClaseEstudiante(student.id, Number(classId));
      setClaseInteractiva(progreso);
    } catch (error) {
      console.error('Error al cargar progreso:', error);
    }
  };

  const iniciarClase = async () => {
    if (!claseInteractiva) {
      // Cargar el progreso del estudiante si no está cargado
      await cargarProgresoClase();
    }
    setShowClassModal(true);
  };

  const handleEnrollInClass = async () => {
    if (!student || !classId) return;

    setIsEnrolling(true);
    try {
      // Inscribir al estudiante en la clase
      await apiService.inscribirEstudianteClase({
        id_estudiante: student.id,
        id_clase: Number(classId)
      });
      
      // Inicializar el progreso del estudiante
      await apiService.inicializarProgresoEstudiante(student.id, Number(classId));
      
      setIsAlreadyEnrolled(true);
      
      // Opcional: recargar datos de la clase
      await loadClassData();
      
    } catch (error) {
      console.error('Error al inscribirse en la clase:', error);
      setError('Error al inscribirse en la clase. Por favor, inténtalo de nuevo.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContinueClass = async () => {
    await iniciarClase();
  };

  const seleccionarContenido = async (contenido: ContenidoEstudianteResponseDTO) => {
    if (!student || !classId) return;

    try {
      setLoadingContenido(true);
      
      // Usar directamente el contenido seleccionado
      const contenidoCompleto = contenido;
      
      setContenidoActual(contenidoCompleto);

      // Buscar el progreso correspondiente
      const progreso = claseInteractiva?.progreso_estudiante.find(
        p => p.id_contenido === contenidoCompleto.id
      );
      setProgresoActual(progreso || null);

      // Solo actualizar estado a "En proceso" si está "No iniciado" y el usuario está viendo el contenido
      if (progreso && progreso.estado === 'No iniciado') {
        await apiService.actualizarEstadoProgreso(progreso.id, 'En proceso');
        await cargarProgresoClase();
        // Actualizar el progreso local también
        setProgresoActual({ ...progreso, estado: 'En proceso' });
      }

      // Paginar contenido si existe
      if (contenidoCompleto.contenido) {
        const paginas = paginarContenido(contenidoCompleto.contenido);
        setContenidoPaginado(paginas);
        setPaginaActual(0);
      }

    } catch (error) {
      console.error('Error al seleccionar contenido:', error);
    } finally {
      setLoadingContenido(false);
    }
  };

  const paginarContenido = (contenido: string): string[] => {
    // Divide el contenido en páginas según el tamaño de pantalla
    const maxCaracteresPorPagina = 2000; // Ajustable según necesidades
    const paginas: string[] = [];
    
    // Dividir por párrafos primero
    const parrafos = contenido.split('\n\n');
    let paginaActual = '';
    
    for (const parrafo of parrafos) {
      if ((paginaActual + parrafo).length > maxCaracteresPorPagina && paginaActual.length > 0) {
        paginas.push(paginaActual.trim());
        paginaActual = parrafo + '\n\n';
      } else {
        paginaActual += parrafo + '\n\n';
      }
    }
    
    if (paginaActual.trim()) {
      paginas.push(paginaActual.trim());
    }
    
    return paginas.length > 0 ? paginas : [contenido];
  };

  const finalizarIndice = async () => {
    if (!progresoActual) return;

    try {
      await apiService.actualizarEstadoProgreso(progresoActual.id, 'Finalizado');
      await cargarProgresoClase();
      
      // Limpiar la vista del contenido actual
      setContenidoActual(null);
      setProgresoActual(null);
      setContenidoPaginado([]);
      setPaginaActual(0);
    } catch (error) {
      console.error('Error al finalizar índice:', error);
    }
  };

  // Función para determinar el texto del botón según si es el último elemento
  const obtenerTextoBotonFinalizar = (): string => {
    if (!claseInteractiva || !contenidoActual) return 'Continuar';
    
    const indiceActual = claseInteractiva.contenidos_disponibles.findIndex(c => c.id === contenidoActual.id);
    const esUltimo = indiceActual === claseInteractiva.contenidos_disponibles.length - 1;
    
    return esUltimo ? 'Finalizar' : 'Continuar';
  };

  // Función para determinar si se puede seleccionar un contenido
  const puedeSeleccionarContenido = (contenido: ContenidoEstudianteResponseDTO): boolean => {
    if (!claseInteractiva) return true;
    
    const progreso = claseInteractiva.progreso_estudiante.find(p => p.id_contenido === contenido.id);
    return true; // Permitir seleccionar cualquier contenido por ahora
  };

  const getEstadoColor = (estado: EstadoContenidoType): string => {
    switch (estado) {
      case 'No iniciado':
        return 'bg-gray-200 text-gray-700';
      case 'En proceso':
        return 'bg-yellow-200 text-yellow-800';
      case 'Finalizado':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  // ========== FUNCIONES PARA NOTAS ==========

  const cargarNotas = async () => {
    if (!student) return;

    try {
      setLoadingNotas(true);
      const notasData = await apiService.obtenerNotasEstudiante(student.id);
      setNotas(notasData);
    } catch (error) {
      console.error('Error al cargar notas:', error);
    } finally {
      setLoadingNotas(false);
    }
  };

  const crearNota = async () => {
    if (!student || !nuevaNota.trim()) return;

    try {
      await apiService.crearNota(student.id, nuevaNota.trim());
      setNuevaNota('');
      await cargarNotas();
    } catch (error) {
      console.error('Error al crear nota:', error);
    }
  };

  const editarNota = async (notaId: number) => {
    if (!textoEditando.trim()) return;

    try {
      await apiService.actualizarNota(notaId, { notas: textoEditando.trim() });
      setEditandoNota(null);
      setTextoEditando('');
      await cargarNotas();
    } catch (error) {
      console.error('Error al editar nota:', error);
    }
  };

  const eliminarNota = async (notaId: number) => {
    try {
      await apiService.eliminarNota(notaId);
      await cargarNotas();
    } catch (error) {
      console.error('Error al eliminar nota:', error);
    }
  };

  // ========== FUNCIONES PARA FLASHCARDS Y QUIZ (simplificadas) ==========

  const loadFlashcards = async () => {
    if (!student || !classId) return;
    
    try {
      setLoadingFlashcards(true);
      const flashcardsData = await apiService.generarFlashcards(student.id, Number(classId));
      setFlashcards(flashcardsData.flashcards || []);
    } catch (error) {
      console.error('Error loading flashcards:', error);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const cargarPreguntas = async () => {
    if (!classId) return;
    
    try {
      setLoadingQuiz(true);
      const preguntasData = await apiService.obtenerPreguntasClase(Number(classId));
      if (preguntasData.length === 0) {
        await apiService.generarPreguntasClase(Number(classId));
        const nuevasPreguntas = await apiService.obtenerPreguntasClase(Number(classId));
        setPreguntas(nuevasPreguntas);
      } else {
        setPreguntas(preguntasData);
      }
    } catch (error) {
      console.error('Error al cargar preguntas:', error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Funciones simplificadas para quiz
  const iniciarQuiz = () => {
    setQuizIniciado(true);
    setTiempoInicio(new Date());
  };

  const seleccionarRespuesta = (opcion: number) => {
    setRespuestaSeleccionada(opcion);
  };

  // ========== FUNCIONES PARA CHATBOT Y DETALLES DE CLASE ==========

  const cargarHistorialConversaciones = async () => {
    if (!student || !classId) return;

    try {
      setLoadingHistorial(true);
      const historial = await apiService.obtenerHistorialChat(student.id, Number(classId));
      setHistorialConversaciones(historial);
      
      // Convertir el historial de la BD al formato del chat local
      const mensajesFormateados = historial.map(conv => ({
        id: conv.id.toString(),
        type: conv.tipo_emisor === TipoEntidadEnum.ESTUDIANTE ? 'user' as const : 'bot' as const,
        content: conv.mensaje,
        timestamp: new Date(conv.created_at)
      }));
      
      setChatMessages(mensajesFormateados);
    } catch (error) {
      console.error('Error al cargar historial de conversaciones:', error);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const normalizePerfil = (perfil: string | undefined): PerfilCognitivoType => {
    if (!perfil) return 'visual';
    const normalized = perfil.toLowerCase();
    const validProfiles: PerfilCognitivoType[] = ['visual', 'auditivo', 'lector', 'kinestesico'];
    return validProfiles.includes(normalized as PerfilCognitivoType) 
      ? normalized as PerfilCognitivoType 
      : 'visual';
  };

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
      const requestData: ChatGeneralRequestDTO = {
        perfil_cognitivo: normalizePerfil(student.perfil_cognitivo),
        perfil_personalidad: student.perfil_personalidad || 'Equilibrado',
        nivel_conocimientos: 'basico',
        id_clase: Number(classId),
        historial_mensajes: chatMessages.map(msg => ({
          tipo: msg.type,
          contenido: msg.content
        })),
        mensaje_actual: currentMessage
      };

      const response = await apiService.chatGeneralPersonalizado(student.id, requestData);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: response.contenido_generado,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    setHistorialConversaciones([]);
  };

  const loadOriginalFiles = async () => {
    if (!classId) return;
    
    try {
      setLoadingFiles(true);
      const response = await apiService.getArchivos(Number(classId), 'Subido');
      setOriginalFiles(response.archivos);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDownloadFile = async (filename: string) => {
    if (!classId) return;
    
    try {
      await apiService.downloadFileFromClass(Number(classId), filename);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Cargando datos de la clase...</div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>{error || 'Error al cargar la clase'}</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="backdrop-blur-md bg-white/70 border-b border-white/20 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4 text-gray-800">
            <Link href="/student/classes" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
              </svg>
              Mis Clases
            </Link>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 className="text-gray-800 text-xl font-bold">
              {classData.nombre || 'Detalle de Clase'}
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 px-6 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Class Header */}
            <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8">
              <div className="mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-gray-800 text-3xl font-bold mb-2">
                      {classData.nombre || 'Clase sin nombre'}
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-4">
                      {classData.tema || 'Sin descripción disponible'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="backdrop-blur-sm bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-4 border border-blue-200/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Área</p>
                            <p className="text-sm font-semibold text-gray-700">{classData.area || 'No especificada'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="backdrop-blur-sm bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-200/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nivel</p>
                            <p className="text-sm font-semibold text-gray-700">{classData.nivel_educativo || 'No especificado'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="backdrop-blur-sm bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-200/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duración</p>
                            <p className="text-sm font-semibold text-gray-700">{classData.duracion_estimada || 'No especificada'} minutos</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="backdrop-blur-sm bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-200/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Modalidad</p>
                            <p className="text-sm font-semibold text-gray-700">{classData.modalidad || 'No especificada'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



              {isAlreadyEnrolled && (
                <div className="mt-6">
                  <button
                    onClick={handleContinueClass}
                    className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                      </svg>
                      <span>Continuar Clase</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'contenido-clase', name: 'Contenido de Clase', icon: '📚' },
              { id: 'resumenes-diagramas', name: 'Resúmenes y Diagramas', icon: '📊' },
              { id: 'evaluacion', name: 'Evaluación', icon: '📝' },
              { id: 'notas', name: 'Apuntes', icon: '📔' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Contenido de Clase */}
          {activeTab === 'contenido-clase' && (
            <ContenidoClaseTab
              claseInteractiva={claseInteractiva}
              loadingContenido={loadingContenido}
              iniciarClase={iniciarClase}
            />
          )}


          {/* Resúmenes y Diagramas */}
          {activeTab === 'resumenes-diagramas' && (
            <ResumenesDiagramasTab />
          )}

          {/* Evaluación */}
          {activeTab === 'evaluacion' && (
            <EvaluacionTab
              flashcards={flashcards}
              loadingFlashcards={loadingFlashcards}
              currentCardIndex={currentCardIndex}
              setCurrentCardIndex={setCurrentCardIndex}
              showAnswer={showAnswer}
              setShowAnswer={setShowAnswer}
              studyMode={studyMode}
              setStudyMode={setStudyMode}
              loadFlashcards={loadFlashcards}
              preguntas={preguntas}
              loadingQuiz={loadingQuiz}
              quizIniciado={quizIniciado}
              preguntaActual={preguntaActual}
              respuestasUsuario={respuestasUsuario}
              respuestaSeleccionada={respuestaSeleccionada}
              mostrarRetroalimentacion={mostrarRetroalimentacion}
              quizTerminado={quizTerminado}
              resultadoQuiz={resultadoQuiz}
              tiempoInicio={tiempoInicio}
              cargarPreguntas={cargarPreguntas}
              iniciarQuiz={iniciarQuiz}
              seleccionarRespuesta={seleccionarRespuesta}
            />
          )}

          {/* Notas */}
          {activeTab === 'notas' && (
            <NotasTab
              notas={notas}
              nuevaNota={nuevaNota}
              setNuevaNota={setNuevaNota}
              editandoNota={editandoNota}
              setEditandoNota={setEditandoNota}
              textoEditando={textoEditando}
              setTextoEditando={setTextoEditando}
              loadingNotas={loadingNotas}
              crearNota={crearNota}
              editarNota={editarNota}
              eliminarNota={eliminarNota}
            />
          )}
        </div>
      </div>

      {/* Modal de Clase Interactiva */}
      <ClaseInteractivaModal
        showClassModal={showClassModal}
        setShowClassModal={setShowClassModal}
        claseInteractiva={claseInteractiva}
        contenidoActual={contenidoActual}
        setContenidoActual={setContenidoActual}
        progresoActual={progresoActual}
        setProgresoActual={setProgresoActual}
        contenidoPaginado={contenidoPaginado}
        setContenidoPaginado={setContenidoPaginado}
        paginaActual={paginaActual}
        setPaginaActual={setPaginaActual}
        loadingContenido={loadingContenido}
        seleccionarContenido={seleccionarContenido}
        finalizarIndice={finalizarIndice}
        obtenerTextoBotonFinalizar={obtenerTextoBotonFinalizar}
        getEstadoColor={getEstadoColor}
      />

      {/* Chatbot Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setShowChatbot(true)}
          className="group backdrop-blur-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl p-2 shadow-xl transition-all duration-300 hover:scale-105 border border-white/20"
          title={`Hablar con ${nombreDocente}`}
        >
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <img 
              src={fotoCaricaturaDocente} 
              alt={`Foto de ${nombreDocente}`}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = 'http://localhost:8000/public/images/caric.jpeg';
              }}
            />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </button>
      </div>

      {/* Chatbot Modal */}
      <ChatModal
        showChatbot={showChatbot}
        setShowChatbot={setShowChatbot}
        student={student!}
        classData={classData}
        classId={classId as string}
        fotoCaricaturaDocente={fotoCaricaturaDocente}
        nombreDocente={nombreDocente}
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        currentMessage={currentMessage}
        setCurrentMessage={setCurrentMessage}
        isTyping={isTyping}
        setIsTyping={setIsTyping}
        historialConversaciones={historialConversaciones}
        setHistorialConversaciones={setHistorialConversaciones}
        loadingHistorial={loadingHistorial}
        setLoadingHistorial={setLoadingHistorial}
      />
          </div>
        </div>
      </div>
    </div>
  );
}
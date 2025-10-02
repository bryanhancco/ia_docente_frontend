import { getApiUrl, checkApiConnection } from './env-check';

import { config, validateApiUrl, getEnvironmentHeaders } from './config';

// Configuración de la URL base de la API con debugging
const getApiBaseUrl = () => {
  const finalUrl = config.apiBaseUrl;
  
  if (config.debug) {
    console.log('🔍 Environment Debug Info:');
    console.log('- Config:', config);
    console.log('- Final API_BASE_URL:', finalUrl);
    console.log('- Is valid URL:', validateApiUrl(finalUrl));
    console.log('- Current location:', typeof window !== 'undefined' ? window.location.href : 'N/A');
  }
  
  if (!validateApiUrl(finalUrl)) {
    console.error('❌ Invalid API URL detected:', finalUrl);
    throw new Error(`Invalid API URL: ${finalUrl}`);
  }
  
  return finalUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Types based on the backend API
export interface ClaseData {
  id_formulario?: number;
  id_docente: number;
  nombre: string;
  perfil: string;
  area: string;
  tema: string;
  nivel_educativo: string;
  duracion_estimada: number;
  solo_informacion_proporcionada?: boolean;
  conocimientos_previos_estudiantes: string;
  tipo_sesion: string;
  modalidad: string;
  objetivos_aprendizaje: string;
  resultado_taxonomia: string;
  recursos: string;
  aspectos_motivacionales: string;
  estilo_material: string;
  tipo_recursos_generar: string;
  estado?: boolean;
}

export interface ClaseResponse extends ClaseData {
  id: number;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContenidoGenerado {
  id: number;
  id_clase: number;
  tipo_recurso_generado: string;
  contenido: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormularioCreateDTO {
  enlace: string;
  cantidad_visual?: number;
  cantidad_auditivo?: number;
  cantidad_lector?: number;
  cantidad_kinestesico?: number;
}

export interface FormularioResponseDTO {
  id: number;
  enlace: string;
  cantidad_visual?: number;
  cantidad_auditivo?: number;
  cantidad_lector?: number;
  cantidad_kinestesico?: number;
  fecha_creacion?: string;
  fecha_cierre?: string;
  estado?: boolean;
}

export interface DocenteCreateDTO {
  nombre: string;
  correo: string;
  password: string;
  foto?: string;
  foto_caricatura?: string;
}

export interface DocenteResponseDTO {
  id: number;
  nombre: string;
  correo: string;
  foto?: string;
  foto_caricatura?: string;
}

export interface DocenteLoginDTO {
  correo: string;
  password: string;
}

export interface DocenteUpdateFotoDTO {
  foto_url: string;
}

export interface DocenteUpdateDTO {
  nombre?: string;
  correo?: string;
  password?: string;
}

export interface FotoCaricaturaResponse {
  foto_caricatura: string;
  nombre_docente: string;
}

export interface LoginResponse {
  message: string;
  docente: DocenteResponseDTO;
}

export interface ProcessResponse {
  message: string;
  collection_name: string;
  documents_processed: number;
  contents_generated: number;
  generated_content: ContenidoGenerado[];
}

export interface ArchivoInfo {
  id: number;
  filename: string;
  tipo: 'Subido' | 'Generado';
  size: number;
  download_url: string;
}

export interface ArchivosResponse {
  id_clase: number;
  filtro_tipo?: string;
  archivos: ArchivoInfo[];
  total_archivos: number;
}

export interface DeleteFileResponse {
  message: string;
  filename: string;
  id_clase: number;
}

export interface EstructuraClaseResponse {
  message: string;
  estructura: string;
  contenido_id: number;
}

export interface RecursosEducativosResponse {
  message: string;
  recursos: string;
  contenido_id: number;
}

export interface PreguntaData {
  id: number;
  id_clase: number;
  pregunta: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  alternativa_correcta: number;
  retroalimentacion_a: string;
  retroalimentacion_b: string;
  retroalimentacion_c: string;
  retroalimentacion_d: string;
  estado: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessResponseNew {
  message: string;
  clase_id: number;
  contenidos_generados: ContenidoGeneradoDetail[];
  tema: string;
  nivel_educativo: string;
}

export interface ContenidoGeneradoDetail {
  tipo: string;
  status: 'success' | 'error';
  contenido_id?: number;
  archivo_id?: number;
  filename?: string;
  file_path?: string;
  slides_info?: {
    id: string;
    embed_url: string;
    download_url: string;
  };
  preguntas_guardadas?: number;
  preguntas_solicitadas?: number;
  preview?: string;
  error?: string;
}

// ====== INTERFACES PARA ESTUDIANTES ======

export interface EstudianteCreateDTO {
  nombre: string;
  correo: string;
  password: string;
  perfil_cognitivo?: string;
  perfil_personalidad?: string;
}

export interface EstudianteResponseDTO {
  id: number;
  nombre: string;
  correo: string;
  perfil_cognitivo?: string;
  perfil_personalidad?: string;
}

export interface EstudianteLoginDTO {
  correo: string;
  password: string;
}

export interface EstudianteLoginResponse {
  message: string;
  estudiante: EstudianteResponseDTO;
}

export interface EstudianteUpdateDTO {
  nombre?: string;
  correo?: string;
  perfil_cognitivo?: string;
  perfil_personalidad?: string;
}

export interface EstudianteClaseCreateDTO {
  id_estudiante: number;
  id_clase: number;
  nivel_conocimientos?: string;
  nivel_motivacion?: string;
}

export interface EstudianteClaseResponseDTO {
  id: number;
  id_estudiante: number;
  id_clase: number;
  nivel_conocimientos?: string;
  nivel_motivacion?: string;
}

export interface EstudianteClaseDetalleDTO {
  id: number;
  id_estudiante: number;
  id_clase: number;
  nivel_conocimientos?: string;
  nivel_motivacion?: string;
  estado?: boolean;
  estudiante_nombre: string;
  estudiante_correo: string;
  estudiante_perfil_cognitivo?: string;
  estudiante_perfil_personalidad?: string;
  clase_nombre?: string;
  clase_tema?: string;
}

// ====== INTERFACES PARA AGENTE PSICOPEDAGÓGICO ======

export type PerfilCognitivoType = 'visual' | 'auditivo' | 'lector' | 'kinestesico';
export type NivelConocimientosType = 'sin_conocimiento' | 'basico' | 'intermedio';

export interface ApoyoPsicopedagogicoRequestDTO {
  perfil_cognitivo: PerfilCognitivoType;
  perfil_personalidad: string;
  nivel_conocimientos: NivelConocimientosType;
  id_clase: number;
  mensaje_usuario: string;
  problema_especifico?: string;
}

export interface PlanEstudioRequestDTO {
  perfil_cognitivo: PerfilCognitivoType;
  perfil_personalidad: string;
  nivel_conocimientos: NivelConocimientosType;
  id_clase: number;
  mensaje_usuario: string;
  objetivos_especificos?: string;
}

export interface EvaluacionComprensionRequestDTO {
  perfil_cognitivo: PerfilCognitivoType;
  perfil_personalidad: string;
  nivel_conocimientos: NivelConocimientosType;
  id_clase: number;
  mensaje_usuario: string;
  respuestas_estudiante?: string;
}

// ====== INTERFACE PARA CHAT GENERAL PERSONALIZADO ======

export interface ChatGeneralRequestDTO {
  perfil_cognitivo: PerfilCognitivoType;
  perfil_personalidad: string;
  nivel_conocimientos: NivelConocimientosType;
  id_clase: number;
  historial_mensajes: Array<{
    tipo: 'user' | 'bot';
    contenido: string;
  }>;
  mensaje_actual: string;
}

export interface RespuestaPsicopedagogicaDTO {
  status: string;
  estudiante_id: number;
  clase_id: number;
  contenido_generado: string;
  perfil_cognitivo: string;
  nivel_conocimientos: string;
  timestamp: string;
  tipo_respuesta: string;
  metadata?: any;
}

export interface PlanEstudioResponseDTO {
  status: string;
  estudiante_id: number;
  clase_id: number;
  plan_estudio: string;
  perfil_cognitivo: string;
  nivel_conocimientos: string;
  objetivos_especificos?: string;
  timestamp: string;
}

export interface EvaluacionComprensionResponseDTO {
  status: string;
  estudiante_id: number;
  clase_id: number;
  evaluacion_comprension: string;
  perfil_cognitivo: string;
  nivel_conocimientos: string;
  timestamp: string;
}

// ====== INTERFACES PARA FLASHCARDS ======

export interface Flashcard {
  id: number;
  categoria: string;
  dificultad: 'Básico' | 'Intermedio' | 'Avanzado';
  pregunta: string;
  respuesta: string;
  tips_estudio: string;
}

export interface FlashcardsResponseDTO {
  status: string;
  estudiante_id: number;
  clase_id: number;
  flashcards: Flashcard[];
  total_flashcards: number;
  perfil_cognitivo: string;
  timestamp: string;
  mode?: string;
}

// ====== INTERFACES PARA QUIZ ======

export interface PreguntaData {
  id: number;
  id_clase: number;
  pregunta: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  alternativa_correcta: number;
  retroalimentacion_a: string;
  retroalimentacion_b: string;
  retroalimentacion_c: string;
  retroalimentacion_d: string;
  estado: boolean;
}

export interface RespuestaQuiz {
  pregunta_id: number;
  opcion_seleccionada: number;
  es_correcta: boolean;
  tiempo_respuesta?: number;
}

export interface ResultadoQuiz {
  total_preguntas: number;
  respuestas_correctas: number;
  respuestas_incorrectas: number;
  porcentaje_acierto: number;
  tiempo_total?: number;
  respuestas: RespuestaQuiz[];
}

// ====== INTERFACES PARA AGENTES ESPECIALIZADOS ======

export type TipoAgenteEspecializado = 'guias-estudio' | 'mapas-conceptuales' | 'mapas-mentales' | 'resumenes-personalizados' | 'preguntas-rapidas';

export interface ContenidoPersonalizadoRequestDTO {
  tipo_agente: TipoAgenteEspecializado;
  perfil_cognitivo: PerfilCognitivoType;
  perfil_personalidad: string;
  nivel_conocimientos: NivelConocimientosType;
  id_clase: number;
  mensaje_usuario: string;
  preferencias_especificas?: string;
}

export interface ContenidoPersonalizadoResponseDTO {
  status: string;
  estudiante_id: number;
  clase_id: number;
  tipo_agente: TipoAgenteEspecializado;
  contenido_generado: string;
  perfil_cognitivo: string;
  nivel_conocimientos: string;
  timestamp: string;
  metadata?: {
    formato?: string;
    estructura?: string;
    elementos_visuales?: boolean;
    interactividad?: boolean;
  };
}

// ====== INTERFACES PARA CONTENIDO ESTUDIANTE ======

export interface ContenidoEstudianteResponseDTO {
  id: number;
  id_clase: number;
  orden: number;  // Agregar el campo orden que está en la tabla
  indice: string;
  contenido: string;
  perfil_cognitivo: string;
  tiempo_estimado: number;
  estado: boolean;
  created_at?: string;
  updated_at?: string;
}

export type EstadoContenidoType = 'No iniciado' | 'En proceso' | 'Finalizado';

export interface ContenidoEstudianteDataResponseDTO {
  id: number;
  id_contenido: number;
  id_estudiante: number;
  estado: EstadoContenidoType;
  created_at: string;
  modified_at: string;
}

export interface ContenidoEstudianteDataUpdateDTO {
  estado: EstadoContenidoType;
}

export interface ClaseInteractivaResponseDTO {
  id_clase: number;
  contenidos_disponibles: ContenidoEstudianteResponseDTO[];
  progreso_estudiante: ContenidoEstudianteDataResponseDTO[];
  porcentaje_completado: number;
}

// ====== INTERFACES PARA NOTAS ======

export interface NotaCreateDTO {
  id_estudiante: number;
  notas: string;
  estado?: boolean;
}

export interface NotaResponseDTO {
  id: number;
  id_estudiante: number;
  notas: string;
  estado: boolean;
}

export interface NotaUpdateDTO {
  notas?: string;
  estado?: boolean;
}

// ====== INTERFACES PARA CONVERSACIONES ======

export enum TipoEntidadEnum {
  ESTUDIANTE = 1,
  DOCENTE = 2,
  CHATBOT = 3
}

export interface ConversacionCreateDTO {
  id_emisor: number;
  id_receptor: number;
  tipo_emisor: TipoEntidadEnum;
  tipo_receptor: TipoEntidadEnum;
  mensaje: string;
}

export interface ConversacionResponseDTO {
  id: number;
  id_emisor: number;
  id_receptor: number;
  tipo_emisor: TipoEntidadEnum;
  tipo_receptor: TipoEntidadEnum;
  mensaje: string;
  created_at: string;
}

export interface ConversacionQueryDTO {
  id_emisor?: number;
  id_receptor?: number;
  tipo_emisor?: TipoEntidadEnum;
  tipo_receptor?: TipoEntidadEnum;
  limit?: number;
  offset?: number;
}

// ====== INTERFACES PARA AUDIO PROCESSING ======

export interface TTSRequestDTO {
  text: string;
  voice_model?: string;
  save_to_db?: boolean;
}

export interface TTSResponseDTO {
  message: string;
  filename: string;
  size: number;
  duration_estimate: number;
  voice_model: string;
  download_url: string;
}

export interface STTRequestDTO {
  audio_file: File;
  language?: string;
  save_transcript?: boolean;
  save_audio?: boolean;
}

export interface STTResponseDTO {
  message: string;
  transcript: string;
  confidence: number;
  words_count: number;
  character_count: number;
  language: string;
  transcript_file?: string;
  transcript_download_url?: string;
}

export interface BatchTTSRequestDTO {
  texts: string[];
  voice_model?: string;
}

export interface BatchTTSResponseDTO {
  message: string;
  total_texts: number;
  successful: number;
  failed: number;
  results: Array<{
    success: boolean;
    filename?: string;
    size?: number;
    error?: string;
  }>;
}

export interface AudioVoicesResponseDTO {
  message: string;
  total_voices: number;
  voices: Record<string, string>;
}

export interface AudioFormatsResponseDTO {
  message: string;
  total_formats: number;
  formats: string[];
}

export interface AudioValidationResponseDTO {
  message: string;
  valid: boolean;
  size?: number;
  size_mb?: number;
  format?: string;
  filename: string;
  error?: string;
}

class ApiService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit) {
    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      
      if (config.debug) {
        console.log('🌐 Making API request:', {
          url: fullUrl,
          method: options?.method || 'GET',
          headers: options?.headers,
          API_BASE_URL,
          config
        });
      }

      const environmentHeaders = getEnvironmentHeaders();
      
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...environmentHeaders,
          ...options?.headers,
        },
        mode: 'cors',
      });

      if (config.debug) {
        console.log('📡 Response received:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500) + (errorText.length > 500 ? '...' : '')
        });
        
        // Si es HTML, probablemente es una página de error
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
          throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. This usually means the API endpoint is not available or there's a routing issue. URL: ${fullUrl}`);
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Intentar parsear la respuesta como JSON
      const responseText = await response.text();
      
      if (config.debug) {
        console.log('📄 Response text preview:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      }

      if (!responseText) {
        console.log('⚠️ Empty response received');
        return {};
      }

      // Verificar si es HTML antes de intentar parsear como JSON
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.error('❌ Received HTML instead of JSON:', responseText.substring(0, 500));
        throw new Error(`Server returned HTML instead of JSON. This usually means the API endpoint is not available or there's a CORS/routing issue. URL: ${fullUrl}`);
      }

      try {
        const jsonData = JSON.parse(responseText);
        if (config.debug) {
          console.log('✅ Successfully parsed JSON response');
        }
        return jsonData;
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', {
          parseError,
          responseText: responseText.substring(0, 500)
        });
        const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
        throw new Error(`Invalid JSON response: ${errorMessage}. Response: ${responseText.substring(0, 200)}`);
      }

    } catch (error) {
      console.error('🚨 API Request failed:', {
        url: `${API_BASE_URL}${url}`,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  // Crear una nueva clase
  async createClase(claseData: ClaseData): Promise<ClaseResponse> {
    return this.fetchWithErrorHandling('/clases', {
      method: 'POST',
      body: JSON.stringify(claseData),
    });
  }

  // Obtener una clase específica
  async getClase(idClase: number): Promise<ClaseResponse> {
    return this.fetchWithErrorHandling(`/clases/${idClase}`);
  }

  // Listar clases de un docente
  async getClases(idDocente: number): Promise<ClaseResponse[]> {
    return this.fetchWithErrorHandling(`/clases?id_docente=${idDocente}`);
  }

  // Cambiar estado de una clase (habilitar/deshabilitar)
  async cambiarEstadoClase(idClase: number, estado: boolean): Promise<{message: string, id_clase: number, nuevo_estado: boolean}> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/estado?estado=${estado}`, {
      method: 'PATCH',
    });
  }

  // Subir archivos para una clase
  async uploadFiles(idClase: number, files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/clases/${idClase}/upload-files`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  // Procesar clase (generar contenido)
  async processClase(idClase: number): Promise<ProcessResponseNew> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/process`, {
      method: 'POST',
    });
  }

  // Obtener preguntas de una clase
  async getPreguntas(idClase: number): Promise<PreguntaData[]> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/preguntas`);
  }

  // Obtener contenidos generados de una clase
  async getContenidos(idClase: number): Promise<ContenidoGenerado[]> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/contenidos`);
  }

  async getContenido(idContenido: number): Promise<ContenidoGenerado> {
    return this.fetchWithErrorHandling(`/contenidos/${idContenido}`);
  }

  // Método de fallback con datos mock para desarrollo
  async getClasesMock(idDocente: number): Promise<ClaseResponse[]> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 1,
        id_docente: idDocente,
        nombre: "Matemáticas Básicas",
        perfil: "Visual",
        area: "Matemáticas",
        tema: "Suma y resta",
        nivel_educativo: "Primaria",
        duracion_estimada: 60,
        solo_informacion_proporcionada: false,
        conocimientos_previos_estudiantes: "Los estudiantes conocen los números del 1 al 10",
        tipo_sesion: "Clase teorica",
        modalidad: "Presencial",
        objetivos_aprendizaje: "Que los estudiantes aprendan a sumar y restar números de una cifra",
        resultado_taxonomia: "Aplicar",
        recursos: "Pizarra, marcadores, fichas",
        aspectos_motivacionales: "Usar juegos y dinámicas",
        estilo_material: "Cercano y motivador",
        tipo_recursos_generar: "Esquema visual / mapa mental, Juego o simulación",
        estado: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 2,
        id_docente: idDocente,
        nombre: "Historia del Perú",
        perfil: "Auditivo",
        area: "Historia",
        tema: "Independencia",
        nivel_educativo: "Secundaria",
        duracion_estimada: 90,
        solo_informacion_proporcionada: true,
        conocimientos_previos_estudiantes: "Conocimiento básico del período colonial",
        tipo_sesion: "Clase teorica",
        modalidad: "Hibrida",
        objetivos_aprendizaje: "Comprender los procesos independentistas",
        resultado_taxonomia: "Comprender",
        recursos: "Videos, documentos históricos",
        aspectos_motivacionales: "Relatos y narrativas históricas",
        estilo_material: "Narrativo/Storytelling",
        tipo_recursos_generar: "Video explicativo, Artículo o lectura",
        estado: true,
        created_at: "2024-01-14T14:30:00Z",
        updated_at: "2024-01-14T14:30:00Z"
      },
      {
        id: 3,
        id_docente: idDocente,
        nombre: "Ciencias Naturales",
        perfil: "Kinestesico",
        area: "Ciencias",
        tema: "El sistema solar",
        nivel_educativo: "Primaria",
        duracion_estimada: 75,
        solo_informacion_proporcionada: false,
        conocimientos_previos_estudiantes: "Conceptos básicos de astronomía",
        tipo_sesion: "Taller practico",
        modalidad: "Presencial",
        objetivos_aprendizaje: "Identificar y describir los planetas del sistema solar",
        resultado_taxonomia: "Recordar",
        recursos: "Maquetas, proyector, materiales de craft",
        aspectos_motivacionales: "Actividades hands-on y experimentos",
        estilo_material: "Practico y directo",
        tipo_recursos_generar: "Dinámica participativa",
        estado: false,
        created_at: "2024-01-13T09:15:00Z",
        updated_at: "2024-01-13T09:15:00Z"
      }
    ];
  }

  // Método para intentar la API real con fallback a mock
  async getClasesWithFallback(idDocente: number): Promise<ClaseResponse[]> {
    try {
      return await this.getClases(idDocente);
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      return await this.getClasesMock(idDocente);
    }
  }

  // Formularios API methods
  async createFormulario(): Promise<FormularioResponseDTO> {
    try {
      return await this.fetchWithErrorHandling('/formularios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
    } catch (error) {
      console.warn('API not available, using mock data for formulario creation:', error);
      // Mock response for development - API returns {"id": integer}
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: Math.floor(Math.random() * 1000) + 1,
        enlace: `https://forms.example.com/estudiantes/${Math.floor(Math.random() * 1000) + 1}`,
        cantidad_visual: 15,
        cantidad_auditivo: 8,
        cantidad_lector: 12,
        cantidad_kinestesico: 5,
        fecha_creacion: new Date().toISOString(),
        estado: true
      };
    }
  }

  async getFormulario(idFormulario: number): Promise<FormularioResponseDTO> {
    try {
      return await this.fetchWithErrorHandling(`/formularios/${idFormulario}`);
    } catch (error) {
      console.warn('API not available, using mock data for formulario fetch:', error);
      // Mock response for development
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: idFormulario,
        enlace: `https://forms.example.com/estudiantes/${idFormulario}`,
        cantidad_visual: 15,
        cantidad_auditivo: 8,
        cantidad_lector: 12,
        cantidad_kinestesico: 5,
        fecha_creacion: '2024-01-15T10:00:00Z',
        fecha_cierre: '2024-01-30T23:59:59Z',
        estado: true
      };
    }
  }

  // Docentes API methods
  async createDocente(docenteData: DocenteCreateDTO): Promise<DocenteResponseDTO> {
    try {
      return await this.fetchWithErrorHandling('/docentes', {
        method: 'POST',
        body: JSON.stringify(docenteData),
      });
    } catch (error) {
      console.warn('API not available for docente creation:', error);
      throw error;
    }
  }

  async loginDocente(loginData: DocenteLoginDTO): Promise<LoginResponse> {
    try {
      return await this.fetchWithErrorHandling('/docentes/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });
    } catch (error) {
      console.warn('API not available for docente login:', error);
      throw error;
    }
  }

  async getDocente(idDocente: number): Promise<DocenteResponseDTO> {
    try {
      return await this.fetchWithErrorHandling(`/docentes/${idDocente}`);
    } catch (error) {
      console.warn('API not available for docente fetch:', error);
      throw error;
    }
  }

  async getDocentes(): Promise<DocenteResponseDTO[]> {
    try {
      return await this.fetchWithErrorHandling('/docentes');
    } catch (error) {
      console.warn('API not available for docentes list:', error);
      throw error;
    }
  }

  async updateDocente(idDocente: number, data: DocenteUpdateDTO): Promise<DocenteResponseDTO> {
    try {
      return await this.fetchWithErrorHandling(`/docentes/${idDocente}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('API not available for docente update:', error);
      throw error;
    }
  }

  // Métodos para manejar fotos de docentes
  async subirFotoDocente(idDocente: number, file: File): Promise<{ message: string; docente: DocenteResponseDTO }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/docentes/${idDocente}/foto`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API not available for foto upload:', error);
      throw error;
    }
  }

  async obtenerFotoCaricaturaDocente(idDocente: number): Promise<FotoCaricaturaResponse> {
    try {
      return await this.fetchWithErrorHandling(`/docentes/${idDocente}/foto-caricatura`);
    } catch (error) {
      console.warn('API not available for foto caricatura:', error);
      // Retornar valores predeterminados en caso de error
      return {
        foto_caricatura: '/images/default-teacher-cartoon-avatar.png',
        nombre_docente: 'Docente'
      };
    }
  }

  async eliminarFotoDocente(idDocente: number): Promise<{ message: string; docente: DocenteResponseDTO }> {
    try {
      return await this.fetchWithErrorHandling(`/docentes/${idDocente}/foto`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('API not available for foto deletion:', error);
      throw error;
    }
  }

  // Download file from API
  async downloadFile(idContenido: number, fileName: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/contenidos/${idContenido}/download`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf,application/octet-stream',
          'ngrok-skip-browser-warning': 'true',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download Error:', error);
      throw error;
    }
  }

  // Convertir contenido HTML a PDF y descargarlo
  async downloadContentAsPDF(contenido: ContenidoGenerado): Promise<void> {
    try {
      // Importar html2pdf dinámicamente
      const html2pdf = await import('html2pdf.js');
      
      // Preprocesar el contenido HTML para mejorar la compatibilidad
      let processedContent = contenido.contenido;
      
      // Simplificar fórmulas matemáticas LaTeX
      processedContent = processedContent.replace(/\\\[(.*?)\\\]/g, (match, formula) => {
        return `<div class="math-formula">${formula}</div>`;
      });
      processedContent = processedContent.replace(/\\\((.*?)\\\)/g, (match, formula) => {
        return `<span class="math-inline">${formula}</span>`;
      });
      
      // Crear un contenedor completo para el PDF
      const fullHTML = `
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${contenido.tipo_recurso_generado}</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: Arial, sans-serif; 
              font-size: 12px; 
              line-height: 1.6; 
              color: #333; 
              background: white;
            }
            h1 { 
              font-size: 18px; 
              margin: 20px 0 15px 0; 
              font-weight: bold; 
              color: #2c3e50;
              page-break-after: avoid;
            }
            h2 { 
              font-size: 16px; 
              margin: 18px 0 12px 0; 
              font-weight: bold; 
              color: #34495e;
              page-break-after: avoid;
            }
            h3 { 
              font-size: 14px; 
              margin: 15px 0 10px 0; 
              font-weight: bold; 
              color: #7f8c8d;
              page-break-after: avoid;
            }
            p { 
              margin: 8px 0; 
              text-align: justify;
            }
            ul, ol { 
              margin: 10px 0; 
              padding-left: 25px; 
            }
            li { 
              margin: 4px 0; 
            }
            strong { 
              font-weight: bold; 
              color: #2c3e50;
            }
            em { 
              font-style: italic; 
            }
            .math-formula { 
              margin: 10px 0; 
              padding: 8px; 
              background-color: #f8f9fa; 
              text-align: center; 
              font-family: 'Times New Roman', serif;
              border-left: 3px solid #3498db;
            }
            .math-inline {
              font-family: 'Times New Roman', serif;
              font-style: italic;
            }
            hr { 
              border: 1px solid #bdc3c7; 
              margin: 20px 0; 
            }
            .math {
              margin: 10px 0; 
              padding: 8px; 
              background-color: #f8f9fa; 
              text-align: center; 
              font-family: 'Times New Roman', serif;
            }
          </style>
        </head>
        <body>
          ${processedContent}
        </body>
        </html>
      `;
      
      // Crear elemento temporal visible para renderizado
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = processedContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.top = '0';
      tempDiv.style.left = '0';
      tempDiv.style.width = '794px'; // Ancho A4 en pixels (210mm)
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.color = '#333';
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.visibility = 'visible';
      tempDiv.style.zIndex = '9999';
      
      document.body.appendChild(tempDiv);

      // Configuración simplificada y más compatible
      const options = {
        margin: [15, 15, 15, 15],
        filename: `${contenido.tipo_recurso_generado.replace(/[^a-zA-Z0-9\s]/g, '_')}_${contenido.id}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.92 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          allowTaint: true,
          logging: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      // Dar tiempo para el renderizado completo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Generando PDF con contenido:', tempDiv.innerHTML.substring(0, 200) + '...');
      
      // Generar el PDF
      await html2pdf.default().set(options).from(tempDiv).save();
      
      // Limpiar
      document.body.removeChild(tempDiv);
      
    } catch (error) {
      console.error('Error converting HTML to PDF:', error);
      
      // Limpiar elementos temporales en caso de error
      const tempElements = document.querySelectorAll('div[style*="position: absolute"]');
      tempElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      
      // Fallback: descarga como archivo HTML con estructura completa
      const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${contenido.tipo_recurso_generado}</title>
    <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px; 
          background: white;
        }
        h1 { 
          color: #2c3e50; 
          border-bottom: 2px solid #3498db; 
          padding-bottom: 10px; 
        }
        h2 { 
          color: #34495e; 
          margin-top: 30px; 
        }
        h3 { 
          color: #7f8c8d; 
        }
        .math { 
          margin: 15px 0; 
          padding: 10px; 
          background-color: #f8f9fa; 
          text-align: center; 
          border-left: 4px solid #3498db; 
        }
        strong { 
          color: #2c3e50; 
        }
        ul, ol { 
          padding-left: 25px; 
        }
        hr { 
          border: 1px solid #bdc3c7; 
          margin: 30px 0; 
        }
        .math-formula { 
          margin: 15px 0; 
          padding: 10px; 
          background-color: #f8f9fa; 
          text-align: center; 
          border-left: 4px solid #3498db; 
          font-family: 'Times New Roman', serif;
        }
    </style>
</head>
<body>
    ${contenido.contenido}
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contenido.tipo_recurso_generado.replace(/[^a-zA-Z0-9\s]/g, '_')}_${contenido.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      throw new Error('No se pudo convertir a PDF. Se descargó como HTML.');
    }
  }

  // Listar archivos de una clase
  async getArchivos(idClase: number, tipo?: 'Subido' | 'Generado'): Promise<ArchivosResponse> {
    const url = `/clases/${idClase}/archivos${tipo ? `?tipo=${tipo}` : ''}`;
    return this.fetchWithErrorHandling(url);
  }

  // Descargar archivo específico de una clase
  async downloadFileFromClass(idClase: number, filename: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/clases/${idClase}/archivos/${filename}/download`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream',
          'ngrok-skip-browser-warning': 'true',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download Error:', error);
      throw error;
    }
  }

  // Eliminar archivo de una clase
  async deleteFile(idClase: number, filename: string): Promise<DeleteFileResponse> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/archivos/${filename}`, {
      method: 'DELETE',
    });
  }

  // Generar estructura de clase
  async generarEstructuraClase(idClase: number): Promise<EstructuraClaseResponse> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/generar-estructura`, {
      method: 'POST',
    });
  }

  // Buscar recursos educativos web
  async buscarRecursosEducativos(idClase: number): Promise<RecursosEducativosResponse> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/buscar-recursos`, {
      method: 'POST',
    });
  }

  // ====== MÉTODOS PARA ESTUDIANTES ======

  // Crear estudiante
  async createEstudiante(estudiante: EstudianteCreateDTO): Promise<EstudianteResponseDTO> {
    return this.fetchWithErrorHandling('/estudiantes', {
      method: 'POST',
      body: JSON.stringify(estudiante),
    });
  }

  // Login estudiante
  async loginEstudiante(loginData: EstudianteLoginDTO): Promise<EstudianteLoginResponse> {
    return this.fetchWithErrorHandling('/estudiantes/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  // Obtener estudiante por ID
  async getEstudiante(idEstudiante: number): Promise<EstudianteResponseDTO> {
    return this.fetchWithErrorHandling(`/estudiantes/${idEstudiante}`);
  }

  // Actualizar estudiante
  async updateEstudiante(idEstudiante: number, data: EstudianteUpdateDTO): Promise<EstudianteResponseDTO> {
    return this.fetchWithErrorHandling(`/estudiantes/${idEstudiante}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Obtener clases de un estudiante
  async getClasesEstudiante(idEstudiante: number, incluirInactivas: boolean = false): Promise<EstudianteClaseDetalleDTO[]> {
    const url = `/estudiantes/${idEstudiante}/clases${incluirInactivas ? '?incluir_inactivas=true' : ''}`;
    return this.fetchWithErrorHandling(url);
  }

  // Inscribir estudiante en una clase
  async inscribirEstudianteClase(inscripcion: EstudianteClaseCreateDTO): Promise<EstudianteClaseResponseDTO> {
    return this.fetchWithErrorHandling('/estudiante-clase', {
      method: 'POST',
      body: JSON.stringify(inscripcion),
    });
  }

  // Obtener estudiantes de una clase específica
  async getEstudiantesClase(idClase: number): Promise<EstudianteClaseDetalleDTO[]> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/estudiantes`);
  }

  // Salir de una clase (cambiar estado a false)
  async salirDeClase(idInscripcion: number): Promise<{ message: string; id_inscripcion: number; nuevo_estado: boolean }> {
    return this.fetchWithErrorHandling(`/estudiante-clase/${idInscripcion}/salir`, {
      method: 'PUT',
    });
  }

  // Reincorporar a una clase (cambiar estado a true)
  async reincorporarAClase(idInscripcion: number): Promise<{ message: string; id_inscripcion: number; nuevo_estado: boolean }> {
    return this.fetchWithErrorHandling(`/estudiante-clase/${idInscripcion}/reincorporar`, {
      method: 'PUT',
    });
  }

  // Desinscribir estudiante de una clase (eliminar completamente)
  async desinscribirEstudianteClase(idInscripcion: number): Promise<{ message: string }> {
    return this.fetchWithErrorHandling(`/estudiante-clase/${idInscripcion}`, {
      method: 'DELETE',
    });
  }

  // Obtener todos los estudiantes (para agregar a clases)
  async getAllEstudiantes(): Promise<EstudianteResponseDTO[]> {
    return this.fetchWithErrorHandling('/estudiantes');
  }

  // Obtener estadísticas de estudiantes de una clase
  async getEstudiantesClaseEstadisticas(idClase: number): Promise<{
    total: number;
    perfiles_cognitivos: {
      Visual: number;
      Auditivo: number;
      Lector: number;
      Kinestesico: number;
    };
    perfil_predominante: string;
  }> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/estudiantes/estadisticas`);
  }

  // Obtener contenidos de una clase
  async getContenidosClase(idClase: number): Promise<ContenidoGenerado[]> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/contenidos`);
  }

  // ====== MÉTODOS PARA AGENTE PSICOPEDAGÓGICO ======

  // Generar apoyo psicopedagógico personalizado
  async generarApoyoPsicopedagogico(
    estudianteId: number, 
    requestData: ApoyoPsicopedagogicoRequestDTO
  ): Promise<RespuestaPsicopedagogicaDTO> {
    try {
      // Normalizar el perfil cognitivo
      const normalizedData = {
        ...requestData,
        perfil_cognitivo: requestData.perfil_cognitivo.toLowerCase(),
      };

      console.log('Enviando datos de apoyo psicopedagógico:', normalizedData);
      
      const response = await fetch(`${API_BASE_URL}/api/psicopedagogico/apoyo/${estudianteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error en la respuesta:', errorData);
        throw new Error(`Error HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Respuesta del apoyo psicopedagógico:', data);
      return data;
    } catch (error) {
      console.error('Error al generar apoyo psicopedagógico:', error);
      throw error;
    }
  }

  // Generar plan de estudio personalizado
  async generarPlanEstudio(
    estudianteId: number,
    perfilCognitivo: string,
    perfilPersonalidad: string,
    nivelConocimientos: string,
    idClase: number,
    mensajeUsuario: string,
    objetivosEspecificos?: string
  ): Promise<RespuestaPsicopedagogicaDTO> {
    try {
      const requestData: PlanEstudioRequestDTO = {
        perfil_cognitivo: perfilCognitivo.toLowerCase() as PerfilCognitivoType,
        perfil_personalidad: perfilPersonalidad,
        nivel_conocimientos: nivelConocimientos as NivelConocimientosType,
        id_clase: idClase,
        mensaje_usuario: mensajeUsuario,
        objetivos_especificos: objetivosEspecificos
      };

      console.log('Enviando datos para plan de estudio:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/api/psicopedagogico/plan-estudio/${estudianteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error en la respuesta:', errorData);
        throw new Error(`Error HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Respuesta del plan de estudio:', data);
      return data;
    } catch (error) {
      console.error('Error al generar plan de estudio:', error);
      throw error;
    }
  }

  // Evaluar comprensión del estudiante
  async evaluarComprension(
    estudianteId: number,
    perfilCognitivo: string,
    perfilPersonalidad: string,
    nivelConocimientos: string,
    idClase: number,
    mensajeUsuario: string,
    respuestasEstudiante?: string
  ): Promise<RespuestaPsicopedagogicaDTO> {
    try {
      const requestData: EvaluacionComprensionRequestDTO = {
        perfil_cognitivo: perfilCognitivo.toLowerCase() as PerfilCognitivoType,
        perfil_personalidad: perfilPersonalidad,
        nivel_conocimientos: nivelConocimientos as NivelConocimientosType,
        id_clase: idClase,
        mensaje_usuario: mensajeUsuario,
        respuestas_estudiante: respuestasEstudiante
      };

      console.log('Enviando datos para evaluación de comprensión:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/api/psicopedagogico/evaluacion/${estudianteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error en la respuesta:', errorData);
        throw new Error(`Error HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Respuesta de la evaluación de comprensión:', data);
      return data;
    } catch (error) {
      console.error('Error al generar evaluación de comprensión:', error);
      throw error;
    }
  }

  // ====== MÉTODOS PARA FLASHCARDS ======

  async generarFlashcards(estudianteId: number, idClase: number): Promise<FlashcardsResponseDTO> {
    try {
      console.log(`Generando flashcards para estudiante ${estudianteId} en clase ${idClase}`);
      
      const response = await fetch(`${API_BASE_URL}/clases/${idClase}/estudiantes/${estudianteId}/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error en la respuesta:', errorData);
        throw new Error(`Error HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Flashcards generadas:', data);
      return data;
    } catch (error) {
      console.error('Error al generar flashcards:', error);
      throw error;
    }
  }

  // ====== MÉTODOS PARA QUIZ ======

  async obtenerPreguntasClase(idClase: number): Promise<PreguntaData[]> {
    try {
      console.log(`Obteniendo preguntas para clase ${idClase}`);
      
      const response = await fetch(`${API_BASE_URL}/clases/${idClase}/preguntas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error en la respuesta:', errorData);
        throw new Error(`Error HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Preguntas obtenidas:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener preguntas:', error);
      throw error;
    }
  }

  async generarPreguntasClase(idClase: number): Promise<any> {
    try {
      console.log(`Generando preguntas para clase ${idClase}`);
      
      const response = await fetch(`${API_BASE_URL}/clases/${idClase}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error en la respuesta:', errorData);
        throw new Error(`Error HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Proceso de generación completado:', data);
      return data;
    } catch (error) {
      console.error('Error al generar contenido de clase:', error);
      throw error;
    }
  }

  // ====== MÉTODOS PARA AGENTES ESPECIALIZADOS ======

  // Generar contenido personalizado con agente especializado
  async generarContenidoPersonalizado(
    estudianteId: number,
    requestData: ContenidoPersonalizadoRequestDTO
  ): Promise<ContenidoPersonalizadoResponseDTO> {
    try {
      // Normalizar el perfil cognitivo
      const normalizedData = {
        ...requestData,
        perfil_cognitivo: requestData.perfil_cognitivo.toLowerCase(),
      };

      console.log('Enviando datos para contenido personalizado:', normalizedData);
      
      const response = await fetch(`${API_BASE_URL}/api/agentes-especializados/generar/${estudianteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error en la respuesta:', errorData);
        throw new Error(`Error HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Contenido personalizado generado:', data);
      return data;
    } catch (error) {
      console.error('Error al generar contenido personalizado:', error);
      throw error;
    }
  }

  // Generar respuesta de chat general personalizado
  async chatGeneralPersonalizado(
    estudianteId: number,
    requestData: ChatGeneralRequestDTO
  ): Promise<RespuestaPsicopedagogicaDTO> {
    try {
      console.log('Enviando datos de chat general:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/api/chat-general/${estudianteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error en la respuesta del chat:', errorData);
        throw new Error(`Error HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Respuesta del chat generada:', data);
      return data;
    } catch (error) {
      console.error('Error al generar respuesta del chat:', error);
      throw error;
    }
  }

  // ====== MÉTODOS PARA CONTENIDO ESTUDIANTE ======

  // Generar índices de contenido para una clase
  async generarIndicesContenido(idClase: number): Promise<ContenidoEstudianteResponseDTO[]> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/generar-indices-contenido`, {
      method: 'POST',
    });
  }

  // Actualizar contenido personalizado de un índice
  async actualizarContenidoEstudiante(contenidoId: number): Promise<ContenidoEstudianteResponseDTO> {
    return this.fetchWithErrorHandling(`/contenido-estudiante/${contenidoId}/actualizar-contenido`, {
      method: 'PUT',
    });
  }

  // Obtener contenido por clase
  async obtenerContenidoEstudiantePorClase(idClase: number): Promise<ContenidoEstudianteResponseDTO[]> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/contenido-estudiante`);
  }

  // Obtener contenido por perfil cognitivo
  async obtenerContenidoPorPerfil(idClase: number, perfilCognitivo: string): Promise<ContenidoEstudianteResponseDTO> {
    return this.fetchWithErrorHandling(`/clases/${idClase}/contenido-estudiante/${perfilCognitivo}`);
  }

  // ====== MÉTODOS PARA PROGRESO DE ESTUDIANTES ======

  // Inicializar progreso de estudiante en una clase
  async inicializarProgresoEstudiante(estudianteId: number, idClase: number): Promise<any> {
    return this.fetchWithErrorHandling(`/estudiantes/${estudianteId}/clases/${idClase}/inicializar-progreso`, {
      method: 'POST',
    });
  }

  // Obtener progreso completo de un estudiante en una clase
  async obtenerProgresoClaseEstudiante(estudianteId: number, idClase: number): Promise<ClaseInteractivaResponseDTO> {
    return this.fetchWithErrorHandling(`/estudiantes/${estudianteId}/clases/${idClase}/progreso`);
  }

  // Actualizar estado de progreso de un contenido
  async actualizarEstadoProgreso(progresoId: number, estado: EstadoContenidoType): Promise<ContenidoEstudianteDataResponseDTO> {
    return this.fetchWithErrorHandling(`/contenido-estudiante-data/${progresoId}/actualizar-estado`, {
      method: 'PUT',
      body: JSON.stringify({ estado }),
    });
  }

  // ====== MÉTODOS PARA NOTAS ======

  // Crear nueva nota
  async crearNota(estudianteId: number, notas: string): Promise<NotaResponseDTO> {
    return this.fetchWithErrorHandling(`/estudiantes/${estudianteId}/notas`, {
      method: 'POST',
      body: JSON.stringify({ id_estudiante: estudianteId, notas }),
    });
  }

  // Obtener notas de un estudiante
  async obtenerNotasEstudiante(estudianteId: number): Promise<NotaResponseDTO[]> {
    return this.fetchWithErrorHandling(`/estudiantes/${estudianteId}/notas`);
  }

  // Actualizar una nota
  async actualizarNota(notaId: number, datos: NotaUpdateDTO): Promise<NotaResponseDTO> {
    return this.fetchWithErrorHandling(`/notas/${notaId}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    });
  }

  // Eliminar una nota
  async eliminarNota(notaId: number): Promise<{ message: string; id: number }> {
    return this.fetchWithErrorHandling(`/notas/${notaId}`, {
      method: 'DELETE',
    });
  }

  // ====== MÉTODOS PARA CONVERSACIONES ======

  // Crear una nueva conversación
  async crearConversacion(conversacion: ConversacionCreateDTO): Promise<ConversacionResponseDTO> {
    return this.fetchWithErrorHandling('/conversaciones', {
      method: 'POST',
      body: JSON.stringify(conversacion),
    });
  }

  // Obtener conversaciones con filtros
  async obtenerConversaciones(filtros: ConversacionQueryDTO = {}): Promise<ConversacionResponseDTO[]> {
    const params = new URLSearchParams();
    
    if (filtros.id_emisor !== undefined) params.append('id_emisor', filtros.id_emisor.toString());
    if (filtros.id_receptor !== undefined) params.append('id_receptor', filtros.id_receptor.toString());
    if (filtros.tipo_emisor !== undefined) params.append('tipo_emisor', filtros.tipo_emisor.toString());
    if (filtros.tipo_receptor !== undefined) params.append('tipo_receptor', filtros.tipo_receptor.toString());
    if (filtros.limit !== undefined) params.append('limit', filtros.limit.toString());
    if (filtros.offset !== undefined) params.append('offset', filtros.offset.toString());

    const queryString = params.toString();
    const url = queryString ? `/conversaciones?${queryString}` : '/conversaciones';
    
    return this.fetchWithErrorHandling(url);
  }

  // Obtener historial de chat entre estudiante y chatbot de una clase
  async obtenerHistorialChat(estudianteId: number, idClase: number, limit: number = 50): Promise<ConversacionResponseDTO[]> {
    return this.fetchWithErrorHandling(`/conversaciones/chat/${estudianteId}/${idClase}?limit=${limit}`);
  }

  // Eliminar una conversación
  async eliminarConversacion(conversacionId: number): Promise<{ message: string; id: number }> {
    return this.fetchWithErrorHandling(`/conversaciones/${conversacionId}`, {
      method: 'DELETE',
    });
  }

  // ====== MÉTODOS PARA AUDIO PROCESSING ======

  // Text-to-Speech (TTS)
  async textToSpeech(idClase: number, data: TTSRequestDTO): Promise<TTSResponseDTO> {
    const formData = new FormData();
    formData.append('text', data.text);
    if (data.voice_model) formData.append('voice_model', data.voice_model);
    if (data.save_to_db !== undefined) formData.append('save_to_db', data.save_to_db.toString());

    const response = await fetch(`${API_BASE_URL}/audio/text-to-speech/${idClase}`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // Speech-to-Text (STT)
  async speechToText(idClase: number, data: STTRequestDTO): Promise<STTResponseDTO> {
    const formData = new FormData();
    formData.append('audio_file', data.audio_file);
    if (data.language) formData.append('language', data.language);
    if (data.save_transcript !== undefined) formData.append('save_transcript', data.save_transcript.toString());
    if (data.save_audio !== undefined) formData.append('save_audio', data.save_audio.toString());

    const response = await fetch(`${API_BASE_URL}/audio/speech-to-text/${idClase}`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // Batch Text-to-Speech
  async batchTextToSpeech(idClase: number, data: BatchTTSRequestDTO): Promise<BatchTTSResponseDTO> {
    return this.fetchWithErrorHandling(`/audio/batch-text-to-speech/${idClase}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Obtener voces disponibles
  async getAvailableVoices(): Promise<AudioVoicesResponseDTO> {
    return this.fetchWithErrorHandling('/audio/voices');
  }

  // Obtener formatos soportados
  async getSupportedFormats(): Promise<AudioFormatsResponseDTO> {
    return this.fetchWithErrorHandling('/audio/formats');
  }

  // Validar archivo de audio
  async validateAudioFile(file: File): Promise<AudioValidationResponseDTO> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/audio/validate`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();

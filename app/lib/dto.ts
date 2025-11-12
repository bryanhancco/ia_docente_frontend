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
  archivo?: string; // Ruta del archivo de audio opcional
}

export interface ConversacionResponseDTO {
  id: number;
  id_emisor: number;
  id_receptor: number;
  tipo_emisor: TipoEntidadEnum;
  tipo_receptor: TipoEntidadEnum;
  mensaje: string;
  archivo?: string; // Ruta del archivo de audio si existe
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
  conversacion_id?: number;
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
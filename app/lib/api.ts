import { config, getEnvironmentHeaders } from './config';

// Configuración de la URL base de la API con debugging
const getApiBaseUrl = () => {
  return config.apiBaseUrl;
};

const API_BASE_URL = getApiBaseUrl();

import type {
  ClaseData,
  ClaseResponse,
  ProcessResponseNew,
  PreguntaData,
  ContenidoGenerado,
  FormularioResponseDTO,
  DocenteCreateDTO,
  DocenteResponseDTO,
  DocenteLoginDTO,
  DocenteUpdateDTO,
  FotoCaricaturaResponse,
  LoginResponse,
  ArchivoInfo,
  ArchivosResponse,
  DeleteFileResponse,
  EstructuraClaseResponse,
  RecursosEducativosResponse,
  EstudianteCreateDTO,
  EstudianteResponseDTO,
  EstudianteLoginDTO,
  EstudianteLoginResponse,
  EstudianteUpdateDTO,
  EstudianteClaseCreateDTO,
  EstudianteClaseResponseDTO,
  EstudianteClaseDetalleDTO,
  ApoyoPsicopedagogicoRequestDTO,
  RespuestaPsicopedagogicaDTO,
  FlashcardsResponseDTO,
  ContenidoPersonalizadoRequestDTO,
  ContenidoPersonalizadoResponseDTO,
  ChatGeneralRequestDTO,
  ContenidoEstudianteResponseDTO,
  ContenidoEstudianteDataResponseDTO,
  ClaseInteractivaResponseDTO,
  PerfilCognitivoType,
  NivelConocimientosType,
  PlanEstudioRequestDTO,
  EvaluacionComprensionRequestDTO,
  EstadoContenidoType,
  NotaResponseDTO,
  NotaUpdateDTO,
  ConversacionCreateDTO,
  ConversacionResponseDTO,
  ConversacionQueryDTO,
  TTSRequestDTO,
  TTSResponseDTO,
  STTRequestDTO,
  STTResponseDTO,
  BatchTTSRequestDTO,
  BatchTTSResponseDTO,
  AudioVoicesResponseDTO,
  AudioFormatsResponseDTO,
  AudioValidationResponseDTO,
} from './dto';

// Re-export all DTOs so UI code can import types from `lib/api` for compatibility
export * from './dto';

class ApiService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit & { responseType?: 'json' | 'blob' | 'text' }) {
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
      
      const mergedHeaders = {
        ...environmentHeaders,
        ...options?.headers,
      } as Record<string, string>;

      if (options && options.body instanceof FormData) {
        if ('Content-Type' in mergedHeaders) {
          delete mergedHeaders['Content-Type'];
        }
      }

      if (options && !(options.body instanceof FormData)) {
        const body = options.body as any;
        // check for existing header ignoring case
        const headerKeys = Object.keys(mergedHeaders || {});
        const hasContentType = headerKeys.some(h => h.toLowerCase() === 'content-type');

        if (!hasContentType && typeof body === 'string') {
          const trimmed = body.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            mergedHeaders['Content-Type'] = 'application/json';
          } else {
            mergedHeaders['Content-Type'] = 'text/plain;charset=UTF-8';
          }
        }
      }

      const response = await fetch(fullUrl, {
        ...options,
        headers: mergedHeaders,
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
          throw new Error(`Server returned HTML instead of JSON/Text. Status: ${response.status}. URL: ${fullUrl}`);
        }

        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Support for returning blob/text when requested
      const responseType = (options as any)?.responseType || 'json';

      if (responseType === 'blob') {
        return await response.blob();
      }

      if (responseType === 'text') {
        const text = await response.text();
        if (config.debug) {
          console.log('📄 Response text preview:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
        }
        return text;
      }

      // Default: parse JSON
      const responseText = await response.text();
      if (config.debug) {
        console.log('📄 Response text preview:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      }

      if (!responseText) {
        if (config.debug) console.log('⚠️ Empty response received');
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
    // El backend espera el valor 'estado' en el body (Body(...))
    return this.fetchWithErrorHandling(`/clases/${idClase}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    });
  }

  // Subir archivos para una clase
  async uploadFiles(idClase: number, files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    // Use fetchWithErrorHandling; do not set Content-Type so browser sets multipart boundary
    return this.fetchWithErrorHandling(`/files/upload-multiple?class_id=${encodeURIComponent(String(idClase))}`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
      // default is json, backend returns json after upload
      responseType: 'json',
    } as any);
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

      // Use fetchWithErrorHandling so errors are handled consistently
      return await this.fetchWithErrorHandling(`/docentes/${idDocente}/foto`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
        responseType: 'json',
      } as any);
    } catch (error) {
      console.warn('API not available for foto upload:', error);
      throw error;
    }
  }

  async obtenerFotoCaricaturaDocente(idDocente: number): Promise<FotoCaricaturaResponse> {
    try {
      const resp = await this.fetchWithErrorHandling(`/docentes/${idDocente}`);
      // resp puede ser DocenteResponseDTO
      return {
        foto_caricatura: (resp && (resp as any).foto_caricatura) || (resp && (resp as any).foto) || '/images/default-teacher-cartoon-avatar.png',
        nombre_docente: (resp && (resp as any).nombre) || 'Docente',
      };
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
      const blob = await this.fetchWithErrorHandling(`/contenidos/${idContenido}/download`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf,application/octet-stream',
          'ngrok-skip-browser-warning': 'true',
        },
        responseType: 'blob',
      } as any);

      if (!(blob instanceof Blob)) {
        throw new Error('Expected blob response for download');
      }

      // const blob = await response.blob();
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

  // Listar archivos de una clase
  async getArchivos(idClase: number, tipo?: 'Subido' | 'Generado'): Promise<ArchivosResponse> {
    // El service de archivos expone /files/list que acepta un prefijo
    const prefix = `uploaded/class/${idClase}/`;
    try {
      const res = await this.fetchWithErrorHandling(`/files/list?prefix=${encodeURIComponent(prefix)}`);
      const files: ArchivoInfo[] = (res.files || []).map((key: string, idx: number) => {
        const parts = key.split('/');
        const filename = parts[parts.length - 1];
        return {
          id: idx + 1,
          filename,
          tipo: 'Subido',
          size: 0,
          download_url: `${API_BASE_URL}/files/url?path=${encodeURIComponent('/' + key)}`,
        };
      });

      return {
        id_clase: idClase,
        filtro_tipo: tipo,
        archivos: files,
        total_archivos: files.length,
      };
    } catch (error) {
      throw error;
    }
  }

  // Descargar archivo específico de una clase
  async downloadFileFromClass(idClase: number, filename: string): Promise<void> {
    try {
      // Obtener URL prefirmada desde /files/url usando fetchWithErrorHandling
      const result = await this.fetchWithErrorHandling(`/files/url?path=${encodeURIComponent(`/uploaded/class/${idClase}/${filename}`)}`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
      } as any);

      const url = result && (result as any).url;
      if (!url) throw new Error('No presigned URL returned');

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download Error:', error);
      throw error;
    }
  }

  // Eliminar archivo de una clase
  async deleteFile(idClase: number, filename: string): Promise<DeleteFileResponse> {
    const path = `/uploaded/class/${idClase}/${filename}`;
    return this.fetchWithErrorHandling(`/files/delete?path=${encodeURIComponent(path)}`, {
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

  // Verificar si los datos de perfil del estudiante están completos
  async checkPerfilCompleto(idEstudiante: number): Promise<{ perfil_cognitivo: boolean; perfil_personalidad: boolean; completo: boolean }> {
    return this.fetchWithErrorHandling(`/estudiantes/${idEstudiante}/perfil-completo`);
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
    const url = `/estudiante-clase/${idEstudiante}/clases${incluirInactivas ? '?incluir_inactivas=true' : ''}`;
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

      const payload = {
        perfil_cognitivo: normalizedData.perfil_cognitivo,
        perfil_personalidad: normalizedData.perfil_personalidad,
        nivel_conocimientos: normalizedData.nivel_conocimientos,
        id_clase: normalizedData.id_clase,
        historial_mensajes: [],
        mensaje_actual: normalizedData.mensaje_usuario,
      };

      const result = await this.fetchWithErrorHandling(`/api/chat-general/${estudianteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      } as any);
      console.log('Respuesta del apoyo psicopedagógico:', result);
      return result as any;
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

      console.log('Enviando datos para plan de estudio (chat-general):', requestData);

      const payload = {
        perfil_cognitivo: requestData.perfil_cognitivo,
        perfil_personalidad: requestData.perfil_personalidad,
        nivel_conocimientos: requestData.nivel_conocimientos,
        id_clase: requestData.id_clase,
        historial_mensajes: [],
        mensaje_actual: requestData.mensaje_usuario,
      };

      const result = await this.fetchWithErrorHandling(`/api/chat-general/${estudianteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      } as any);
      console.log('Respuesta del plan de estudio:', result);
      return result as any;
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
      
      const payload = {
        perfil_cognitivo: requestData.perfil_cognitivo,
        perfil_personalidad: requestData.perfil_personalidad,
        nivel_conocimientos: requestData.nivel_conocimientos,
        id_clase: requestData.id_clase,
        historial_mensajes: [],
  // incluir las respuestas del estudiante en el mensaje actual para que el modelo las evalúe
  mensaje_actual: JSON.stringify({ respuestas: requestData.respuestas_estudiante }),
      };

      const result = await this.fetchWithErrorHandling(`/api/chat-general/${estudianteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      } as any);
      console.log('Respuesta de la evaluación de comprensión:', result);
      return result as any;
    } catch (error) {
      console.error('Error al generar evaluación de comprensión:', error);
      throw error;
    }
  }

  // ====== MÉTODOS PARA FLASHCARDS ======

  async generarFlashcards(estudianteId: number, idClase: number): Promise<FlashcardsResponseDTO> {
    try {
      console.log(`Generando flashcards para estudiante ${estudianteId} en clase ${idClase}`);
      const payload = {
        clase_info: { id: idClase },
        tipo_recurso: 'flashcards',
      };

      const result = await this.fetchWithErrorHandling('/generative-ai/chat/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      } as any);
      console.log('Flashcards generadas:', result);
      return result as any;
    } catch (error) {
      console.error('Error al generar flashcards:', error);
      throw error;
    }
  }

  // ====== MÉTODOS PARA QUIZ ======

  async obtenerPreguntasClase(idClase: number): Promise<PreguntaData[]> {
    try {
      console.log(`Obteniendo preguntas para clase ${idClase}`);
      
  const result = await this.fetchWithErrorHandling(`/clases/${idClase}/preguntas`);
  console.log('Preguntas obtenidas:', result);
  return result as any;
    } catch (error) {
      console.error('Error al obtener preguntas:', error);
      throw error;
    }
  }

  async generarPreguntasClase(idClase: number): Promise<any> {
    try {
      console.log(`Generando preguntas para clase ${idClase}`);
      
      const result = await this.fetchWithErrorHandling(`/clases/${idClase}/process`, {
        method: 'POST',
      } as any);
      console.log('Proceso de generación completado:', result);
      return result as any;
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
      
      const result = await this.fetchWithErrorHandling(`/api/agentes-especializados/generar/${estudianteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedData),
      } as any);
      console.log('Contenido personalizado generado:', result);
      return result as any;
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
      
      const result = await this.fetchWithErrorHandling(`/api/chat-general/${estudianteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      } as any);
      console.log('Respuesta del chat generada:', result);
      return result as any;
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
    return this.fetchWithErrorHandling(`/notas/estudiantes/${estudianteId}`, {
      method: 'POST',
      body: JSON.stringify({ id_estudiante: estudianteId, notas }),
    });
  }

  // Obtener notas de un estudiante
  async obtenerNotasEstudiante(estudianteId: number): Promise<NotaResponseDTO[]> {
    return this.fetchWithErrorHandling(`/notas/estudiantes/${estudianteId}`);
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
    // El backend espera un JSON con { id_clase: number, text: string, ... }
    const payload: any = {
      id_clase: idClase,
      text: data.text,
    };

    if (data.conversacion_id !== undefined && data.conversacion_id !== null) {
      payload.conversacion_id = data.conversacion_id;
    }
    if (data.voice_model) payload.voice_model = data.voice_model;
    if (data.save_to_db !== undefined) payload.save_to_db = data.save_to_db;

    const result = await this.fetchWithErrorHandling('/generative-ai/audio/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(payload),
    } as any);
    return result as any;
  }

  // Speech-to-Text (STT)
  async speechToText(idClase: number, data: STTRequestDTO): Promise<STTResponseDTO> {
    const formData = new FormData();
    formData.append('audio_file', data.audio_file);
    if (data.language) formData.append('language', data.language);
    if (data.save_transcript !== undefined) formData.append('save_transcript', data.save_transcript.toString());
    if (data.save_audio !== undefined) formData.append('save_audio', data.save_audio.toString());

    const result = await this.fetchWithErrorHandling(`/audio/speech-to-text/${idClase}`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    } as any);
    return result as any;
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

    const result = await this.fetchWithErrorHandling('/audio/validate', {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    } as any);
    return result as any;
  }
}

export const apiService = new ApiService();

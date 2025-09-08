const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

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
}

export interface ClaseResponse extends ClaseData {
  id: number;
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
}

export interface DocenteResponseDTO {
  id: number;
  nombre: string;
  correo: string;
}

export interface DocenteLoginDTO {
  correo: string;
  password: string;
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
  estudiante_nombre: string;
  estudiante_correo: string;
  estudiante_perfil_cognitivo?: string;
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

class ApiService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options?.headers,
        },
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
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

  // Subir archivos para una clase
  async uploadFiles(idClase: number, files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/clases/${idClase}/upload-files`, {
        method: 'POST',
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

  // Download file from API
  async downloadFile(idContenido: number, fileName: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/contenidos/${idContenido}/download`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf,application/octet-stream',
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
  async getClasesEstudiante(idEstudiante: number): Promise<EstudianteClaseDetalleDTO[]> {
    return this.fetchWithErrorHandling(`/estudiantes/${idEstudiante}/clases`);
  }

  // Inscribir estudiante en una clase
  async inscribirEstudianteClase(inscripcion: EstudianteClaseCreateDTO): Promise<EstudianteClaseResponseDTO> {
    return this.fetchWithErrorHandling('/estudiante-clase', {
      method: 'POST',
      body: JSON.stringify(inscripcion),
    });
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
}

export const apiService = new ApiService();

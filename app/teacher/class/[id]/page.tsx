'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClaseResponse, ContenidoGenerado, FormularioResponseDTO, ArchivoInfo, ArchivosResponse, EstructuraClaseResponse, RecursosEducativosResponse, PreguntaData, EstudianteClaseDetalleDTO, EstudianteResponseDTO, apiService } from '../../../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Interfaces para la estructura de clase visual
interface ClassSubsection {
  number: string;
  title: string;
  duration: number;
  type: 'subsection';
  content: string[];
}

interface ClassSection {
  number: number;
  title: string;
  duration: number;
  type: 'main';
  subsections: ClassSubsection[];
}

// Helper function to calculate student statistics
const calculateStudentStats = (estudiantes: EstudianteClaseDetalleDTO[]) => {
  const total = estudiantes.length;
  const perfiles = {
    Visual: 0,
    Auditivo: 0,
    Lector: 0,
    Kinestesico: 0
  };

  estudiantes.forEach(est => {
    if (est.estudiante_perfil_cognitivo) {
      const perfil = est.estudiante_perfil_cognitivo as keyof typeof perfiles;
      if (perfiles.hasOwnProperty(perfil)) {
        perfiles[perfil]++;
      }
    }
  });

  // Calcular perfil predominante
  let perfil_predominante = 'Visual';
  let maxCount = perfiles.Visual;
  
  Object.entries(perfiles).forEach(([perfil, count]) => {
    if (count > maxCount) {
      maxCount = count;
      perfil_predominante = perfil;
    }
  });

  return {
    total,
    perfiles_cognitivos: perfiles,
    perfil_predominante
  };
};

export default function ClassDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [clase, setClase] = useState<ClaseResponse | null>(null);
  const [contenidos, setContenidos] = useState<ContenidoGenerado[]>([]);
  const [currentFormulario, setCurrentFormulario] = useState<FormularioResponseDTO | null>(null);
  const [archivos, setArchivos] = useState<ArchivoInfo[]>([]);
  const [preguntas, setPreguntas] = useState<PreguntaData[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteClaseDetalleDTO[]>([]);
  const [estudiantesEstadisticas, setEstudiantesEstadisticas] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<EstudianteClaseDetalleDTO | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingPDF, setProcessingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        
        // Obtener los datos de la clase desde la API
        const claseData = await apiService.getClase(parseInt(id as string));
        setClase(claseData);

        // Si la clase tiene un formulario asociado, obtener sus datos
        if (claseData.id_formulario) {
          try {
            const formularioData = await apiService.getFormulario(claseData.id_formulario);
            setCurrentFormulario(formularioData);
          } catch (error) {
            console.error('Error fetching formulario data:', error);
            // Si no se puede obtener el formulario, usar datos mock para desarrollo
            const mockFormularioData: FormularioResponseDTO = {
              id: claseData.id_formulario,
              enlace: 'https://forms.example.com/estudiantes/1',
              cantidad_visual: 15,
              cantidad_auditivo: 8,
              cantidad_lector: 12,
              cantidad_kinestesico: 5,
              fecha_creacion: '2024-01-15T10:00:00Z',
              fecha_cierre: '2024-01-30T23:59:59Z',
              estado: true
            };
            setCurrentFormulario(mockFormularioData);
          }
        }

        // Obtener los contenidos generados para esta clase
        try {
          const contenidosData = await apiService.getContenidos(parseInt(id as string));
          setContenidos(contenidosData);
        } catch (error) {
          console.error('Error fetching contenidos:', error);
          setContenidos([]);
        }

        // Obtener los archivos de la clase
        try {
          const archivosData = await apiService.getArchivos(parseInt(id as string));
          setArchivos(archivosData.archivos);
        } catch (error) {
          console.error('Error fetching archivos:', error);
          setArchivos([]);
        }

        // Obtener las preguntas de la clase
        try {
          const preguntasData = await apiService.getPreguntas(parseInt(id as string));
          setPreguntas(preguntasData);
        } catch (error) {
          console.error('Error fetching preguntas:', error);
          setPreguntas([]);
        }

        // Obtener los estudiantes de la clase
        try {
          const estudiantesData = await apiService.getEstudiantesClase(parseInt(id as string));
          setEstudiantes(estudiantesData);
          
          // Obtener estadísticas de estudiantes (intentar desde el backend primero)
          try {
            const estadisticasData = await apiService.getEstudiantesClaseEstadisticas(parseInt(id as string));
            setEstudiantesEstadisticas(estadisticasData);
          } catch (error) {
            console.error('Error fetching estadísticas de estudiantes, calculando localmente:', error);
            // Calcular estadísticas localmente si el endpoint no está disponible
            const stats = calculateStudentStats(estudiantesData);
            setEstudiantesEstadisticas(stats);
          }
        } catch (error) {
          console.error('Error fetching estudiantes:', error);
          setEstudiantes([]);
          setEstudiantesEstadisticas(null);
        }
        
      } catch (error) {
        console.error('Error fetching class data:', error);
        // En caso de error, usar datos mock para desarrollo
        const mockClassData: ClaseResponse = {
          id: parseInt(id as string),
          id_formulario: 1,
          id_docente: 1,
          nombre: 'Nueva Clase Generada',
          perfil: 'Visual',
          area: 'Generada por IA',
          tema: 'Personalizado',
          nivel_educativo: 'Adaptable',
          duracion_estimada: 60,
          tipo_sesion: 'Clase teorica',
          modalidad: 'Presencial',
          objetivos_aprendizaje: 'Contenido generado automáticamente por IA según los datos proporcionados',
          resultado_taxonomia: 'Comprender',
          estilo_material: 'Cercano y motivador',
          conocimientos_previos_estudiantes: 'Se adaptará según el contexto proporcionado',
          aspectos_motivacionales: 'Enfoque práctico y aplicado',
          recursos: 'Recursos digitales y físicos según disponibilidad',
          tipo_recursos_generar: 'Presentación personalizada',
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T10:00:00Z'
        };
        setClase(mockClassData);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClassData();
    }
  }, [id]);

  const getChartData = () => {
    if (!currentFormulario) {
      return { data: [], predominant: 'Sin datos' };
    }

    const data = [
      { 
        name: 'Visual', 
        value: currentFormulario.cantidad_visual, 
        color: '#0088FE' 
      },
      { 
        name: 'Auditivo', 
        value: currentFormulario.cantidad_auditivo, 
        color: '#00C49F' 
      },
      { 
        name: 'Lector', 
        value: currentFormulario.cantidad_lector, 
        color: '#FFBB28' 
      },
      { 
        name: 'Kinestésico', 
        value: currentFormulario.cantidad_kinestesico, 
        color: '#FF8042' 
      }
    ];

    // Calcular perfil predominante
    const max = Math.max(
      currentFormulario.cantidad_visual!,
      currentFormulario.cantidad_auditivo!,
      currentFormulario.cantidad_lector!,
      currentFormulario.cantidad_kinestesico!
    );

    let predominant = 'Visual';
    if (max === currentFormulario.cantidad_auditivo) predominant = 'Auditivo';
    else if (max === currentFormulario.cantidad_lector) predominant = 'Lector';
    else if (max === currentFormulario.cantidad_kinestesico) predominant = 'Kinestésico';

    return { data, predominant };
  };

  const getIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('audio') || lowerType.includes('micrófono') || lowerType.includes('microfono')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V240a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"/>
        </svg>
      );
    }
    
    if (lowerType.includes('presentación') || lowerType.includes('presentation')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,136H40V56H216V176Z"/>
        </svg>
      );
    }
    
    if (lowerType.includes('video')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M164.44,105.34l-48-32A8,8,0,0,0,104,80v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,129.05V95l25.58,17ZM216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,128H40V56H216V168Zm16,40a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208Z"/>
        </svg>
      );
    }
    
    // Default document icon
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
        <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/>
      </svg>
    );
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Función para parsear la estructura de clase y convertirla en formato visual
  const parseClassStructure = (content: string): ClassSection[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const structure: ClassSection[] = [];
    let currentSection: ClassSection | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detectar secciones principales (1., 2., 3.)
      const mainSectionMatch = trimmedLine.match(/^(\d+)\.\s*(.+?)\s*\((\d+)\s*minutos?\)$/i);
      if (mainSectionMatch) {
        const [, number, title, duration] = mainSectionMatch;
        currentSection = {
          number: parseInt(number),
          title: title.trim(),
          duration: parseInt(duration),
          type: 'main',
          subsections: []
        };
        structure.push(currentSection);
        continue;
      }

      // Detectar subsecciones (1.1., 1.2., etc.)
      const subSectionMatch = trimmedLine.match(/^(\d+\.\d+)\.\s*(.+?)\s*\((\d+)\s*minutos?\)$/i);
      if (subSectionMatch && currentSection) {
        const [, number, title, duration] = subSectionMatch;
        currentSection.subsections.push({
          number,
          title: title.trim(),
          duration: parseInt(duration),
          type: 'subsection',
          content: []
        });
        continue;
      }

      // Detectar contenido con viñetas o guiones
      if ((trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) && currentSection) {
        const content = trimmedLine.replace(/^[-•]\s*/, '').trim();
        if (currentSection.subsections.length > 0) {
          const lastSubsection = currentSection.subsections[currentSection.subsections.length - 1];
          lastSubsection.content.push(content);
        }
      }
    }

    return structure;
  };

  const downloadAsPDF = async (contenido: ContenidoGenerado) => {
    if (processingPDF) return; // Evitar múltiples descargas simultáneas
    
    try {
      setProcessingPDF(true);
      console.log('Iniciando conversión de HTML a PDF...');
      await apiService.downloadContentAsPDF(contenido);
      console.log('Conversión completada exitosamente');
    } catch (error) {
      console.error('Error downloading content as PDF:', error);
      if (error instanceof Error && error.message.includes('Se descargó como HTML')) {
        alert('No se pudo convertir a PDF. El contenido se descargó como archivo HTML.');
      } else {
        alert('Error al procesar el contenido para descarga. Por favor, intente nuevamente.');
      }
    } finally {
      setProcessingPDF(false);
    }
  };

  const downloadArchivo = async (archivo: ArchivoInfo) => {
    try {
      // Para archivos de la tabla Archivos, usar descarga directa de la API
      await apiService.downloadFileFromClass(parseInt(id as string), archivo.filename);
    } catch (error) {
      console.error('Error downloading archivo:', error);
      alert(`Error al descargar el archivo: ${archivo.filename}`);
    }
  };

  const deleteArchivo = async (archivo: ArchivoInfo) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el archivo "${archivo.filename}"?`)) {
      return;
    }

    try {
      await apiService.deleteFile(parseInt(id as string), archivo.filename);
      // Actualizar la lista de archivos después de eliminar
      const archivosData = await apiService.getArchivos(parseInt(id as string));
      setArchivos(archivosData.archivos);
    } catch (error) {
      console.error('Error deleting archivo:', error);
      alert(`Error al eliminar el archivo: ${archivo.filename}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handlers para estudiantes
  const handleUnenrollStudent = async (estudianteClaseId: number) => {
    if (!confirm('¿Estás seguro de que quieres desmatricular a este estudiante?')) {
      return;
    }

    try {
      await apiService.desinscribirEstudianteClase(estudianteClaseId);
      // Actualizar la lista de estudiantes
      const estudiantesData = await apiService.getEstudiantesClase(parseInt(id as string));
      setEstudiantes(estudiantesData);
      // Recalcular estadísticas
      const stats = calculateStudentStats(estudiantesData);
      setEstudiantesEstadisticas(stats);
      alert('Estudiante desmatriculado exitosamente');
    } catch (error) {
      console.error('Error unenrolling student:', error);
      alert('Error al desmatricular al estudiante');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center backdrop-blur-md bg-white/70 rounded-3xl p-12 shadow-2xl border border-white/20">
            <div className="relative mx-auto mb-8 w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-gray-800 text-2xl font-bold mb-3">Cargando clase</h2>
            <p className="text-gray-600">Obteniendo los detalles de la clase...</p>
          </div>
        </div>
      </div>
    );
  }

  const { data: chartData, predominant } = getChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header moderno con glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414L9 5.586 7.707 4.293a1 1 0 00-1.414 1.414L8.586 8l-2.293 2.293a1 1 0 101.414 1.414L9 10.414l1.293 1.293a1 1 0 001.414-1.414L10.414 9l2.293-2.293a1 1 0 000-1.414z" clipRule="evenodd"/>
                </svg>
              </div>
              <h1 className="text-gray-800 text-xl font-bold">LearningForLive</h1>
            </div>
            <nav className="flex items-center gap-8">
              <button 
                onClick={() => router.push('/teacher/dashboard')}
                className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200"
              >
                Mis Clases
              </button>
              <button 
                onClick={() => router.push('/teacher/class/create')}
                className="text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200"
              >
                Crear Clase
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('userData');
                  router.push('/teacher/login');
                }}
                className="backdrop-blur-md bg-red-100/80 hover:bg-red-200/80 text-red-700 font-semibold py-2 px-4 rounded-xl transition-all duration-200 border border-red-200"
              >
                Cerrar Sesión
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          
          {/* Navegación de tabs mejorada */}
          <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-xl border border-white/20 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'info'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  Información General
                </span>
              </button>
              <button
                onClick={() => setActiveTab('estudiantes')}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'estudiantes'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                  Estudiantes
                </span>
              </button>
              <button
                onClick={() => setActiveTab('estructura')}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'estructura'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  Estructura de Clase
                </span>
              </button>
              <button
                onClick={() => setActiveTab('contenido')}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'contenido'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z" clipRule="evenodd"/>
                  </svg>
                  Contenido de Clase
                </span>
              </button>
            </div>
          </div>

          {/* Contenido de los tabs */}
          {activeTab === 'info' && clase && (
            <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-gray-800 text-2xl font-bold">Detalles de la Clase</h2>
                  <p className="text-gray-600">Información general y configuración</p>
                </div>
              </div>
              
              {/* ID de clase para compartir */}
              <div className="mb-8 backdrop-blur-md bg-blue-50/80 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-semibold mb-1">ID de Clase para estudiantes</p>
                    <p className="text-blue-600 text-sm">Comparte este código con tus estudiantes para que puedan acceder</p>
                  </div>
                  <div className="backdrop-blur-md bg-white/80 border border-blue-300 rounded-xl px-6 py-3">
                    <span className="text-2xl font-mono font-bold text-blue-800 select-all">{clase.id}</span>
                  </div>
                </div>
              </div>

              {/* Grid de información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Nombre de la clase</label>
                    <p className="text-gray-800 font-medium mt-1">{clase.nombre}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Área</label>
                    <p className="text-gray-800 font-medium mt-1">{clase.area}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Tema</label>
                    <p className="text-gray-800 font-medium mt-1">{clase.tema}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Nivel educativo</label>
                    <p className="text-gray-800 font-medium mt-1">{clase.nivel_educativo}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Duración estimada</label>
                    <p className="text-gray-800 font-medium mt-1">{clase.duracion_estimada} minutos</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Tipo de sesión</label>
                    <p className="text-gray-800 font-medium mt-1">{clase.tipo_sesion}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Modalidad</label>
                    <p className="text-gray-800 font-medium mt-1">{clase.modalidad}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Perfil dominante</label>
                    <p className="text-gray-800 font-medium mt-1">{clase.perfil}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Objetivos de aprendizaje</label>
                    <p className="text-gray-800 font-medium mt-1 leading-relaxed">{clase.objetivos_aprendizaje}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Resultado taxonomía</label>
                    <p className="text-gray-800 font-medium mt-1">{clase.resultado_taxonomia}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Estilo de material</label>
                    <p className="text-gray-800 font-medium mt-1">{clase.estilo_material}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Conocimientos previos</label>
                    <p className="text-gray-800 font-medium mt-1 leading-relaxed">{clase.conocimientos_previos_estudiantes}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Aspectos motivacionales</label>
                    <p className="text-gray-800 font-medium mt-1 leading-relaxed">{clase.aspectos_motivacionales}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Recursos disponibles</label>
                    <p className="text-gray-800 font-medium mt-1 leading-relaxed">{clase.recursos}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Tipo de recursos a generar</label>
                    <p className="text-gray-800 font-medium mt-1">{clase.tipo_recursos_generar}</p>
                  </div>
                  
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-4">
                    <label className="text-gray-600 text-sm font-semibold">Fecha de creación</label>
                    <p className="text-gray-800 font-medium mt-1">{getFormattedDate(clase.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

            {activeTab === 'estudiantes' && (
              <div>
                <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Estudiantes</h2>
                
                {/* Estadísticas generales */}
                {estudiantesEstadisticas && (
                  <div className="p-4">
                    <div className="mb-8 bg-white rounded-lg border border-[#cedbe8] p-6">
                      <h3 className="text-[#0d141c] text-lg font-semibold mb-4">Estadísticas Generales</h3>
                      <div className="grid grid-cols-3 gap-6 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-3xl font-bold text-blue-600">{estudiantesEstadisticas.total}</p>
                          <p className="text-sm text-gray-600">Total Estudiantes</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-lg font-bold text-green-600">{estudiantesEstadisticas.perfil_predominante}</p>
                          <p className="text-sm text-gray-600">Perfil Predominante</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-lg font-bold text-purple-600">
                            {estudiantesEstadisticas.perfiles_cognitivos ? 
                              Math.max(
                                estudiantesEstadisticas.perfiles_cognitivos.Visual || 0,
                                estudiantesEstadisticas.perfiles_cognitivos.Auditivo || 0,
                                estudiantesEstadisticas.perfiles_cognitivos.Lector || 0,
                                estudiantesEstadisticas.perfiles_cognitivos.Kinestesico || 0
                              ) : 0
                            }
                          </p>
                          <p className="text-sm text-gray-600">Mayor Cantidad</p>
                        </div>
                      </div>

                      {/* Gráfico de distribución de perfiles cognitivos */}
                      <h3 className="text-[#0d141c] text-lg font-semibold mb-4 text-center">Distribución de Perfiles Cognitivos</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Visual', value: estudiantesEstadisticas.perfiles_cognitivos.Visual, color: '#0088FE' },
                                { name: 'Auditivo', value: estudiantesEstadisticas.perfiles_cognitivos.Auditivo, color: '#00C49F' },
                                { name: 'Lector', value: estudiantesEstadisticas.perfiles_cognitivos.Lector, color: '#FFBB28' },
                                { name: 'Kinestésico', value: estudiantesEstadisticas.perfiles_cognitivos.Kinestesico, color: '#FF8042' }
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {[
                                { name: 'Visual', value: estudiantesEstadisticas.perfiles_cognitivos.Visual, color: '#0088FE' },
                                { name: 'Auditivo', value: estudiantesEstadisticas.perfiles_cognitivos.Auditivo, color: '#00C49F' },
                                { name: 'Lector', value: estudiantesEstadisticas.perfiles_cognitivos.Lector, color: '#FFBB28' },
                                { name: 'Kinestésico', value: estudiantesEstadisticas.perfiles_cognitivos.Kinestesico, color: '#FF8042' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Estadísticas detalladas por perfil */}
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { name: 'Visual', value: estudiantesEstadisticas.perfiles_cognitivos.Visual, color: '#0088FE' },
                          { name: 'Auditivo', value: estudiantesEstadisticas.perfiles_cognitivos.Auditivo, color: '#00C49F' },
                          { name: 'Lector', value: estudiantesEstadisticas.perfiles_cognitivos.Lector, color: '#FFBB28' },
                          { name: 'Kinestésico', value: estudiantesEstadisticas.perfiles_cognitivos.Kinestesico, color: '#FF8042' }
                        ].map((item, index) => (
                          <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
                            <div 
                              className="w-4 h-4 rounded-full mx-auto mb-2" 
                              style={{ backgroundColor: item.color }}
                            />
                            <p className="text-sm font-semibold text-[#0d141c]">{item.name}</p>
                            <p className="text-lg font-bold text-[#0d80f2]">{item.value}</p>
                            <p className="text-xs text-[#49739c]">
                              {estudiantesEstadisticas.total > 0 
                                ? Math.round((item.value / estudiantesEstadisticas.total) * 100)
                                : 0}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lista de estudiantes */}
                    <div className="bg-white rounded-lg border border-[#cedbe8] p-6">
                      <h3 className="text-[#0d141c] text-lg font-semibold mb-4">Lista de Estudiantes</h3>
                      {estudiantes.length > 0 ? (
                        <div className="space-y-3">
                          {estudiantes.map((estudiante) => (
                            <div key={estudiante.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {estudiante.estudiante_nombre.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-base font-semibold text-gray-800">{estudiante.estudiante_nombre}</h4>
                                  <p className="text-sm text-gray-600">{estudiante.estudiante_correo}</p>
                                  {estudiante.estudiante_perfil_cognitivo && (
                                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                                      {estudiante.estudiante_perfil_cognitivo}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedStudent(estudiante);
                                    setShowStudentDetails(true);
                                  }}
                                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                  Detalles
                                </button>
                                <button
                                  onClick={() => handleUnenrollStudent(estudiante.id)}
                                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                  Desmatricular
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto">
                              <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"/>
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay estudiantes matriculados</h3>
                          <p className="text-gray-500">Aún no hay estudiantes en esta clase.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!estudiantesEstadisticas && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="text-[#49739c] mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto">
                          <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"/>
                        </svg>
                      </div>
                      <h3 className="text-[#0d141c] text-lg font-semibold mb-2">Cargando datos de estudiantes</h3>
                      <p className="text-[#49739c] text-base">Por favor espera mientras cargamos la información.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'estructura' && (
              <div>
                <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                  Estructura de Clase
                </h2>

                {/* Mostrar estructura generada */}
                {contenidos.filter(contenido => contenido.tipo_recurso_generado === 'Estructura de Clase').length > 0 ? (
                  <div className="space-y-6 p-4">
                    {contenidos.filter(contenido => contenido.tipo_recurso_generado === 'Estructura de Clase').map((contenido, index) => {
                      const structureData = parseClassStructure(contenido.contenido);
                      
                      if (structureData.length === 0) {
                        return (
                          <div key={index} className="bg-white rounded-lg border border-[#cedbe8] p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-[#0d141c] text-lg font-semibold flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M208,128a80,80,0,0,1-80,80H40V136a8,8,0,0,1,16,0v56h72a64,64,0,0,0,0-128H56a8,8,0,0,1,0-16h72A80,80,0,0,1,208,128Z"/>
                                  </svg>
                                  Estructura de Clase
                                </h3>
                                <p className="text-[#49739c] text-sm">
                                  Generada el {getFormattedDate(contenido.created_at)}
                                </p>
                              </div>
                              <button
                                onClick={() => downloadAsPDF(contenido)}
                                disabled={processingPDF}
                                className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {processingPDF ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Procesando...
                                  </>
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                      <path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0ZM101.66,122.34a8,8,0,0,0,11.31,0L128,107.31V184a8,8,0,0,0,16,0V107.31l15.03,15.03a8,8,0,0,0,11.31-11.31l-28.68-28.68a8,8,0,0,0-11.32,0L101.66,111.03A8,8,0,0,0,101.66,122.34Z"/>
                                    </svg>
                                    Descargar PDF
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="whitespace-pre-line text-[#0d141c] text-sm leading-relaxed">
                                {contenido.contenido}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Calcular tiempo total
                      const totalTime = structureData.reduce((total, section) => total + section.duration, 0);

                      return (
                        <div key={index} className="bg-white rounded-lg border border-[#cedbe8] overflow-hidden shadow-lg">
                          {/* Header con gradiente */}
                          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM188,180H68a12,12,0,0,1,0-24H188a12,12,0,0,1,0,24Zm0-40H68a12,12,0,0,1,0-24H188a12,12,0,0,1,0,24Zm0-40H68a12,12,0,0,1,0-24H188a12,12,0,0,1,0,24Z"/>
                                  </svg>
                                  Estructura de Clase
                                </h3>
                                <p className="text-indigo-100 text-lg">Plan pedagógico detallado para la sesión</p>
                              </div>
                              <div className="text-right">
                                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white border-opacity-30">
                                  <div className="text-sm text-indigo-100 font-medium">Duración total</div>
                                  <div className="text-2xl font-bold">{totalTime} min</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Barra de progreso visual */}
                            <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full" style={{width: '100%'}}></div>
                            </div>
                          </div>

                          {/* Contenido de la estructura */}
                          <div className="p-8">
                            <div className="relative">
                              {/* Línea del timeline */}
                              <div className="absolute left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-300 via-purple-300 to-pink-300"></div>
                              
                              {structureData.map((section, sectionIndex) => {
                                // Esquemas de color para diferentes secciones
                                const sectionColors = [
                                  { 
                                    bg: 'bg-gradient-to-br from-blue-50 to-indigo-100', 
                                    border: 'border-blue-300', 
                                    text: 'text-blue-900', 
                                    icon: 'bg-gradient-to-r from-blue-500 to-indigo-600',
                                    accent: 'text-blue-600'
                                  },
                                  { 
                                    bg: 'bg-gradient-to-br from-purple-50 to-violet-100', 
                                    border: 'border-purple-300', 
                                    text: 'text-purple-900', 
                                    icon: 'bg-gradient-to-r from-purple-500 to-violet-600',
                                    accent: 'text-purple-600'
                                  },
                                  { 
                                    bg: 'bg-gradient-to-br from-emerald-50 to-green-100', 
                                    border: 'border-emerald-300', 
                                    text: 'text-emerald-900', 
                                    icon: 'bg-gradient-to-r from-emerald-500 to-green-600',
                                    accent: 'text-emerald-600'
                                  },
                                  { 
                                    bg: 'bg-gradient-to-br from-orange-50 to-amber-100', 
                                    border: 'border-orange-300', 
                                    text: 'text-orange-900', 
                                    icon: 'bg-gradient-to-r from-orange-500 to-amber-600',
                                    accent: 'text-orange-600'
                                  }
                                ];
                                const colorScheme = sectionColors[sectionIndex % sectionColors.length];

                                return (
                                  <div key={sectionIndex} className="relative mb-10 last:mb-0">
                                    {/* Círculo del timeline con icono */}
                                    <div className={`absolute left-6 w-8 h-8 ${colorScheme.icon} rounded-full border-4 border-white shadow-lg z-10 flex items-center justify-center`}>
                                      <span className="text-white font-bold text-sm">{section.number}</span>
                                    </div>
                                    
                                    {/* Contenido de la sección */}
                                    <div className="ml-20">
                                      <div className={`${colorScheme.bg} ${colorScheme.border} border-2 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                                        {/* Header de la sección */}
                                        <div className="flex items-start justify-between mb-6">
                                          <div className="flex-1">
                                            <h4 className={`text-2xl font-bold ${colorScheme.text} mb-3 flex items-center gap-3`}>
                                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className={colorScheme.accent}>
                                                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm12-88a12,12,0,1,1-12-12A12,12,0,0,1,140,128Z"/>
                                              </svg>
                                              {section.title}
                                            </h4>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                              <span className="flex items-center gap-2 bg-white bg-opacity-70 px-3 py-1 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/>
                                                </svg>
                                                <span className="font-semibold">{section.duration} minutos</span>
                                              </span>
                                              <span className="flex items-center gap-2 bg-white bg-opacity-70 px-3 py-1 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                                  <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM48,48H208V88H48ZM48,208V104H208V208Z"/>
                                                </svg>
                                                <span className="font-semibold">{section.subsections.length} actividades</span>
                                              </span>
                                            </div>
                                          </div>
                                          <div className={`${colorScheme.icon} text-white text-sm font-bold px-4 py-2 rounded-full shadow-md`}>
                                            Fase {section.number}
                                          </div>
                                        </div>

                                        {/* Subsecciones */}
                                        {section.subsections.length > 0 && (
                                          <div className="space-y-4">
                                            {section.subsections.map((subsection, subIndex) => (
                                              <div key={subIndex} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                                <div className="flex items-center justify-between mb-4">
                                                  <h5 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                    <span className={`w-6 h-6 ${colorScheme.icon} text-white text-xs font-bold rounded-full flex items-center justify-center`}>
                                                      {subIndex + 1}
                                                    </span>
                                                    {subsection.title}
                                                  </h5>
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                                      {subsection.duration} min
                                                    </span>
                                                  </div>
                                                </div>
                                                
                                                {subsection.content.length > 0 && (
                                                  <div className="mt-4">
                                                    <ul className="space-y-3">
                                                      {subsection.content.map((item, itemIndex) => (
                                                        <li key={itemIndex} className="text-gray-700 flex items-start gap-3 leading-relaxed">
                                                          <span className={`w-2 h-2 ${colorScheme.icon} rounded-full mt-2 flex-shrink-0`}></span>
                                                          <span className="text-sm">{item}</span>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Footer con estadísticas */}
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-6 text-sm">
                                <span className="flex items-center gap-2 font-medium text-gray-700">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" className="text-indigo-600">
                                    <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM48,48H208V88H48ZM48,208V104H208V208Z"/>
                                  </svg>
                                  <span className="text-indigo-800">{structureData.length} fases principales</span>
                                </span>
                                <span className="flex items-center gap-2 font-medium text-gray-700">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" className="text-purple-600">
                                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/>
                                  </svg>
                                  <span className="text-purple-800">{totalTime} minutos totales</span>
                                </span>
                                <span className="flex items-center gap-2 font-medium text-gray-700">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256" className="text-green-600">
                                    <path d="M200,32H56A24,24,0,0,0,32,56V200a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V56A24,24,0,0,0,200,32Zm8,168a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8Zm-48-80a8,8,0,0,1-8,8H104a8,8,0,0,1,0-16h48A8,8,0,0,1,160,120Zm0-32a8,8,0,0,1-8,8H104a8,8,0,0,1,0-16h48A8,8,0,0,1,160,88Z"/>
                                  </svg>
                                  <span className="text-green-800">{structureData.reduce((total, section) => total + section.subsections.length, 0)} actividades</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => downloadAsPDF(contenido)}
                                  disabled={processingPDF}
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                  {processingPDF ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Procesando...
                                    </>
                                  ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0ZM101.66,122.34a8,8,0,0,0,11.31,0L128,107.31V184a8,8,0,0,0,16,0V107.31l15.03,15.03a8,8,0,0,0,11.31-11.31l-28.68-28.68a8,8,0,0,0-11.32,0L101.66,111.03A8,8,0,0,0,101.66,122.34Z"/>
                                      </svg>
                                      Descargar PDF
                                    </>
                                  )}
                                </button>
                                <div className="text-xs text-gray-500 text-right">
                                  <div>Generado el</div>
                                  <div className="font-medium">{getFormattedDate(contenido.created_at)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center max-w-md mx-auto">
                      <div className="text-[#49739c] mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 256 256" className="mx-auto text-gray-400">
                          <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM188,180H68a12,12,0,0,1,0-24H188a12,12,0,0,1,0,24Zm0-40H68a12,12,0,0,1,0-24H188a12,12,0,0,1,0,24Zm0-40H68a12,12,0,0,1,0-24H188a12,12,0,0,1,0,24Z"/>
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-700 mb-3">No hay estructura de clase generada</h3>
                      <p className="text-gray-500 text-base leading-relaxed">
                        La estructura de clase se genera automáticamente cuando procesas los materiales. 
                        Una vez generada, aparecerá aquí con un diseño visual interactivo y detallado.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}


          {activeTab === 'formulario' && (
            <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 002 0V3a2 2 0 012 0h1a2 2 0 012 2v1a1 1 0 100 2V6a2 2 0 002-2h1a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM6 5v6h8V5H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-gray-800 text-2xl font-bold">Datos del Formulario</h2>
                  <p className="text-gray-600">Análisis de estilos de aprendizaje</p>
                </div>
              </div>
              
              {currentFormulario ? (
                <div className="space-y-8">
                  {/* Información del formulario */}
                  <div className="backdrop-blur-md bg-purple-50/80 border border-purple-200 rounded-xl p-6">
                    <h3 className="text-purple-800 text-lg font-semibold mb-4">Información del Formulario</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-purple-700 text-sm font-semibold">Enlace del formulario</label>
                        <a 
                          href={currentFormulario.enlace} 
                          className="block text-blue-600 hover:text-blue-800 underline mt-1 text-sm" 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {currentFormulario.enlace}
                        </a>
                      </div>
                      <div>
                        <label className="text-purple-700 text-sm font-semibold">Estado</label>
                        <p className="mt-1">
                          {currentFormulario.estado ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              Inactivo
                            </span>
                          )}
                        </p>
                      </div>
                      {currentFormulario.fecha_creacion && (
                        <div>
                          <label className="text-purple-700 text-sm font-semibold">Fecha de creación</label>
                          <p className="text-gray-800 mt-1 text-sm">{getFormattedDate(currentFormulario.fecha_creacion)}</p>
                        </div>
                      )}
                      {currentFormulario.fecha_cierre && (
                        <div>
                          <label className="text-purple-700 text-sm font-semibold">Fecha de cierre</label>
                          <p className="text-gray-800 mt-1 text-sm">{getFormattedDate(currentFormulario.fecha_cierre)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Perfil predominante */}
                  <div className="text-center backdrop-blur-md bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 rounded-xl p-8">
                    <h3 className="text-indigo-800 text-xl font-bold mb-4">Perfil de Aprendizaje Predominante</h3>
                    <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg">
                      <span className="text-2xl font-bold">{predominant}</span>
                    </div>
                  </div>

                  {/* Gráfico circular y estadísticas */}
                  <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-6">
                    <h3 className="text-gray-800 text-lg font-semibold mb-6 text-center">Distribución de Estilos de Aprendizaje</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Estadísticas detalladas */}
                      <div className="grid grid-cols-2 gap-4">
                        {chartData.map((item, index) => (
                          <div key={index} className="text-center backdrop-blur-md bg-white/80 border border-gray-200 rounded-xl p-4">
                            <div 
                              className="w-6 h-6 rounded-full mx-auto mb-3" 
                              style={{ backgroundColor: item.color }}
                            />
                            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                            <p className="text-2xl font-bold text-gray-800 my-1">{item.value}</p>
                            <p className="text-xs text-gray-600">
                              {chartData.reduce((sum, d) => sum + (d.value || 0), 0) > 0 
                                ? Math.round(((item.value || 0) / chartData.reduce((sum, d) => sum + (d.value || 0), 0)) * 100)
                                : 0}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center backdrop-blur-md bg-white/70 rounded-2xl p-8 border border-white/20">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 002 0V3a2 2 0 012 0h1a2 2 0 012 2v1a1 1 0 100 2V6a2 2 0 002-2h1a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM6 5v6h8V5H6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="text-gray-800 text-lg font-semibold mb-2">No hay datos de formulario</h3>
                    <p className="text-gray-600">Esta clase no tiene un formulario asociado o aún no se han recopilado datos.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'estructura' && (
            <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-gray-800 text-2xl font-bold">Estructura de Clase</h2>
                  <p className="text-gray-600">Plan pedagógico detallado</p>
                </div>
              </div>

              {contenidos.filter(contenido => contenido.tipo_recurso_generado === 'Estructura de Clase').length > 0 ? (
                <div className="space-y-6">
                  {contenidos.filter(contenido => contenido.tipo_recurso_generado === 'Estructura de Clase').map((contenido, index) => {
                    const structureData = parseClassStructure(contenido.contenido);
                    
                    if (structureData.length === 0) {
                      return (
                        <div key={index} className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-gray-800 text-lg font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                                </svg>
                                Estructura de Clase
                              </h3>
                              <p className="text-gray-600 text-sm">
                                Generada el {getFormattedDate(contenido.created_at)}
                              </p>
                            </div>
                            <button
                              onClick={() => downloadAsPDF(contenido)}
                              disabled={processingPDF}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                            >
                              {processingPDF ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Procesando...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                                  </svg>
                                  Descargar PDF
                                </>
                              )}
                            </button>
                          </div>
                          <div className="backdrop-blur-md bg-gray-50/80 rounded-xl p-4">
                            <div className="whitespace-pre-line text-gray-800 text-sm leading-relaxed">
                              {contenido.contenido}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Aquí iría la estructura visual compleja que ya estaba en el código original
                    return (
                      <div key={index} className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-gray-800 text-lg font-semibold">Estructura Visual de Clase</h3>
                            <p className="text-gray-600 text-sm">Plan pedagógico interactivo</p>
                          </div>
                          <button
                            onClick={() => downloadAsPDF(contenido)}
                            disabled={processingPDF}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                          >
                            {processingPDF ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Procesando...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                                </svg>
                                Descargar PDF
                              </>
                            )}
                          </button>
                        </div>
                        <div className="backdrop-blur-md bg-gray-50/80 rounded-xl p-4">
                          <p className="text-gray-700 text-sm">Estructura detallada disponible para descarga</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center backdrop-blur-md bg-white/70 rounded-2xl p-8 border border-white/20">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                    </div>
                    <h3 className="text-gray-800 text-lg font-semibold mb-2">No hay estructura de clase generada</h3>
                    <p className="text-gray-600">La estructura se genera automáticamente al procesar los materiales.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contenido' && (
            <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-gray-800 text-2xl font-bold">Contenido de Clase</h2>
                  <p className="text-gray-600">Recursos y materiales generados</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Presentación PowerPoint */}
                <div className="backdrop-blur-md bg-orange-50/80 border border-orange-200 rounded-xl p-6">
                  <h3 className="text-orange-800 text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                    </svg>
                    Presentación PowerPoint
                  </h3>
                  {contenidos.filter(contenido => contenido.tipo_recurso_generado === 'Presentación PowerPoint').length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-orange-700 text-sm">Presentaciones interactivas disponibles para descarga</p>
                    </div>
                  ) : (
                    <p className="text-orange-600 text-sm">No hay presentaciones generadas</p>
                  )}
                </div>

                {/* Recursos Educativos Web */}
                <div className="backdrop-blur-md bg-blue-50/80 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-blue-800 text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                    </svg>
                    Recursos Educativos Web
                  </h3>
                  {contenidos.filter(contenido => contenido.tipo_recurso_generado === 'Recursos Educativos Web').length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-blue-700 text-sm">Enlaces y recursos web especializados encontrados</p>
                    </div>
                  ) : (
                    <p className="text-blue-600 text-sm">No hay recursos web encontrados</p>
                  )}
                </div>

                {/* Preguntas de Evaluación */}
                <div className="backdrop-blur-md bg-purple-50/80 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-purple-800 text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                    </svg>
                    Preguntas de Evaluación
                  </h3>
                  {preguntas.length > 0 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-purple-700 text-sm">
                        {preguntas.length} preguntas disponibles para evaluación
                      </p>
                      <button
                        onClick={() => router.push(`/teacher/class/evaluation/${id}`)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414L9 5.586 7.707 4.293a1 1 0 00-1.414 1.414L8.586 8l-2.293 2.293a1 1 0 101.414 1.414L9 10.414l1.293 1.293a1 1 0 001.414-1.414L10.414 9l2.293-2.293a1 1 0 000-1.414z" clipRule="evenodd"/>
                        </svg>
                        Ver Evaluación
                      </button>
                    </div>
                  ) : (
                    <p className="text-purple-600 text-sm">No hay preguntas generadas</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal para detalles del estudiante */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Detalles del Estudiante</h2>
                <button
                  onClick={() => {
                    setShowStudentDetails(false);
                    setSelectedStudent(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedStudent.estudiante_nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{selectedStudent.estudiante_nombre}</h3>
                    <p className="text-gray-600">{selectedStudent.estudiante_correo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStudent.estudiante_perfil_cognitivo && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <label className="text-gray-600 text-sm font-semibold">Perfil Cognitivo</label>
                      <p className="text-blue-800 font-medium mt-1">{selectedStudent.estudiante_perfil_cognitivo}</p>
                    </div>
                  )}

                  {selectedStudent.estudiante_perfil_personalidad && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <label className="text-gray-600 text-sm font-semibold">Perfil de Personalidad</label>
                      <p className="text-yellow-800 font-medium mt-1">{(selectedStudent.estudiante_perfil_personalidad.match(/(?:\*?En conclusión\*?\s*)([\s\S]*)/i) || [,''])[1].trim()}</p>
                    </div>
                  )}

                  {selectedStudent.nivel_conocimientos && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <label className="text-gray-600 text-sm font-semibold">Nivel de Conocimientos</label>
                      <p className="text-green-800 font-medium mt-1">{selectedStudent.nivel_conocimientos}</p>
                    </div>
                  )}

                  {selectedStudent.nivel_motivacion && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <label className="text-gray-600 text-sm font-semibold">Nivel de Motivación</label>
                      <p className="text-purple-800 font-medium mt-1">{selectedStudent.nivel_motivacion}</p>
                    </div>
                  )}

                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowStudentDetails(false);
                      setSelectedStudent(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      if (selectedStudent && confirm('¿Estás seguro de que quieres desmatricular a este estudiante?')) {
                        handleUnenrollStudent(selectedStudent.id);
                        setShowStudentDetails(false);
                        setSelectedStudent(null);
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Desmatricular
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

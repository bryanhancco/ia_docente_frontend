'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClaseResponse, ContenidoGenerado, FormularioResponseDTO, ArchivoInfo, ArchivosResponse, apiService } from '../../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function ClassDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [clase, setClase] = useState<ClaseResponse | null>(null);
  const [contenidos, setContenidos] = useState<ContenidoGenerado[]>([]);
  const [currentFormulario, setCurrentFormulario] = useState<FormularioResponseDTO | null>(null);
  const [archivos, setArchivos] = useState<ArchivoInfo[]>([]);
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

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-slate-50">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0d80f2] mx-auto mb-8"></div>
                  <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-4">Cargando clase</h2>
                  <p className="text-[#49739c] text-base">Obteniendo los detalles de la clase...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { data: chartData, predominant } = getChartData();

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{
        fontFamily: 'Inter, "Noto Sans", sans-serif',
      }}
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
                Mis Clases
              </button>
              <button 
                className="text-[#0d141c] text-sm font-medium leading-normal"
                onClick={() => router.push('/class/create')}
              >
                Crear Clase
              </button>
              <button 
                className="text-[#0d141c] text-sm font-medium leading-normal"
                onClick={() => {
                  localStorage.removeItem('userData');
                  router.push('/login');
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            
            {/* Navegación de tabs */}
            <div className="flex border-b border-[#e7edf4] mb-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'info'
                    ? 'border-[#0d80f2] text-[#0d80f2]'
                    : 'border-transparent text-[#49739c] hover:text-[#0d141c]'
                }`}
              >
                Información General
              </button>
              <button
                onClick={() => setActiveTab('formulario')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'formulario'
                    ? 'border-[#0d80f2] text-[#0d80f2]'
                    : 'border-transparent text-[#49739c] hover:text-[#0d141c]'
                }`}
              >
                Datos del Formulario
              </button>
              <button
                onClick={() => setActiveTab('recursos')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'recursos'
                    ? 'border-[#0d80f2] text-[#0d80f2]'
                    : 'border-transparent text-[#49739c] hover:text-[#0d141c]'
                }`}
              >
                Recursos
              </button>
            </div>

            {/* Contenido de los tabs */}
            {activeTab === 'info' && clase && (
              <div>
                <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                  Detalles de la Clase
                </h2>
                
                <div className="p-4">
                  <div className="bg-white rounded-lg border border-[#cedbe8] overflow-hidden">
                    <div className="p-6">
                      <div className="grid grid-cols-[20%_1fr] gap-x-6">
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Nombre</p>
                          <p className="text-[#0d141c] text-sm">{clase.nombre}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Área</p>
                          <p className="text-[#0d141c] text-sm">{clase.area}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Tema</p>
                          <p className="text-[#0d141c] text-sm">{clase.tema}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Nivel Educativo</p>
                          <p className="text-[#0d141c] text-sm">{clase.nivel_educativo}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Duración</p>
                          <p className="text-[#0d141c] text-sm">{clase.duracion_estimada} minutos</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Tipo de Sesión</p>
                          <p className="text-[#0d141c] text-sm">{clase.tipo_sesion}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Modalidad</p>
                          <p className="text-[#0d141c] text-sm">{clase.modalidad}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Perfil Dominante</p>
                          <p className="text-[#0d141c] text-sm">{clase.perfil}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Objetivos de Aprendizaje</p>
                          <p className="text-[#0d141c] text-sm">{clase.objetivos_aprendizaje}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Resultado Taxonomía</p>
                          <p className="text-[#0d141c] text-sm">{clase.resultado_taxonomia}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Estilo de Material</p>
                          <p className="text-[#0d141c] text-sm">{clase.estilo_material}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Conocimientos Previos</p>
                          <p className="text-[#0d141c] text-sm">{clase.conocimientos_previos_estudiantes}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Aspectos Motivacionales</p>
                          <p className="text-[#0d141c] text-sm">{clase.aspectos_motivacionales}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Recursos</p>
                          <p className="text-[#0d141c] text-sm">{clase.recursos}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Tipo de Recursos a Generar</p>
                          <p className="text-[#0d141c] text-sm">{clase.tipo_recursos_generar}</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Fecha de Creación</p>
                          <p className="text-[#0d141c] text-sm">{getFormattedDate(clase.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'formulario' && (
              <div>
                <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Datos del Formulario</h2>
                
                {currentFormulario && (
                  <div className="p-4">
                    {/* Información del formulario */}
                    <div className="mb-8 bg-white rounded-lg border border-[#cedbe8] p-6">
                      <h3 className="text-[#0d141c] text-lg font-semibold mb-4">Información del Formulario</h3>
                      <div className="grid grid-cols-[20%_1fr] gap-x-6">
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Enlace</p>
                          <a href={currentFormulario.enlace} className="text-[#0d80f2] text-sm hover:underline" target="_blank" rel="noopener noreferrer">
                            {currentFormulario.enlace}
                          </a>
                        </div>
                        <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                          <p className="text-[#49739c] text-sm font-normal">Estado</p>
                          <p className="text-[#0d141c] text-sm">
                            {currentFormulario.estado ? (
                              <span className="text-green-600">Activo</span>
                            ) : (
                              <span className="text-red-600">Inactivo</span>
                            )}
                          </p>
                        </div>
                        {currentFormulario.fecha_creacion && (
                          <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                            <p className="text-[#49739c] text-sm font-normal">Fecha de Creación</p>
                            <p className="text-[#0d141c] text-sm">{getFormattedDate(currentFormulario.fecha_creacion)}</p>
                          </div>
                        )}
                        {currentFormulario.fecha_cierre && (
                          <div className="col-span-2 grid grid-cols-subgrid border-t border-t-[#cedbe8] py-3">
                            <p className="text-[#49739c] text-sm font-normal">Fecha de Cierre</p>
                            <p className="text-[#0d141c] text-sm">{getFormattedDate(currentFormulario.fecha_cierre)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Perfil predominante */}
                    <div className="mb-6 text-center">
                      <h3 className="text-[#0d141c] text-xl font-bold mb-2">Perfil de Aprendizaje Predominante</h3>
                      <div className="inline-block bg-[#0d80f2] text-white px-6 py-3 rounded-lg">
                        <span className="text-lg font-semibold">{predominant}</span>
                      </div>
                    </div>

                    {/* Gráfico circular */}
                    <div className="bg-white rounded-lg border border-[#cedbe8] p-6">
                      <h3 className="text-[#0d141c] text-lg font-semibold mb-4 text-center">Distribución de Estilos de Aprendizaje</h3>
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
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {chartData.map((item, index) => (
                          <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
                            <div 
                              className="w-4 h-4 rounded-full mx-auto mb-2" 
                              style={{ backgroundColor: item.color }}
                            />
                            <p className="text-sm font-semibold text-[#0d141c]">{item.name}</p>
                            <p className="text-lg font-bold text-[#0d80f2]">{item.value}</p>
                            <p className="text-xs text-[#49739c]">
                              {chartData.reduce((sum, d) => sum + (d.value || 0), 0) > 0 
                                ? Math.round(((item.value || 0) / chartData.reduce((sum, d) => sum + (d.value || 0), 0)) * 100)
                                : 0}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!currentFormulario && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="text-[#49739c] mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto">
                          <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V88H40ZM40,200V104H216v96Z"/>
                        </svg>
                      </div>
                      <h3 className="text-[#0d141c] text-lg font-semibold mb-2">No hay datos de formulario</h3>
                      <p className="text-[#49739c] text-base">Esta clase no tiene un formulario asociado o aún no se han recopilado datos.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recursos' && (
              <div>
                <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Recursos</h2>
                
                {/* Archivos Subidos */}
                <div className="mb-8">
                  <h3 className="text-[#0d141c] text-lg font-semibold mb-4 px-4">Archivos Subidos</h3>
                  {archivos.filter(archivo => archivo.tipo === 'Subido').length > 0 ? (
                    <div className="space-y-4">
                      {archivos.filter(archivo => archivo.tipo === 'Subido').map((archivo, index) => (
                        <div key={index} className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-4 border border-[#cedbe8] rounded-lg">
                          <div className="text-[#0d141c] flex items-center justify-center rounded-lg bg-[#e7edf4] shrink-0 size-12">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/>
                            </svg>
                          </div>
                          
                          <div className="flex flex-1 flex-col justify-center">
                            <p className="text-[#0d141c] text-base font-medium leading-normal">
                              {archivo.filename}
                            </p>
                            <p className="text-[#49739c] text-sm font-normal leading-normal">
                              Archivo subido • {formatFileSize(archivo.size)} • Descarga directa
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => downloadArchivo(archivo)}
                              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
                            >
                              <span className="truncate">Descargar</span>
                            </button>
                            <button
                              onClick={() => deleteArchivo(archivo)}
                              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-red-500 text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
                            >
                              <span className="truncate">Eliminar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="text-[#49739c] mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256" className="mx-auto">
                            <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/>
                          </svg>
                        </div>
                        <p className="text-[#49739c] text-base">No hay archivos subidos</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recursos Generados */}
                <div className="mb-8">
                  <h3 className="text-[#0d141c] text-lg font-semibold mb-4 px-4">Recursos Generados</h3>
                  
                  {/* Archivos generados automáticamente */}
                  {archivos.filter(archivo => archivo.tipo === 'Generado').length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-[#0d141c] text-base font-medium mb-3 px-4">Archivos Generados</h4>
                      <div className="space-y-4">
                        {archivos.filter(archivo => archivo.tipo === 'Generado').map((archivo, index) => (
                          <div key={index} className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-4 border border-[#cedbe8] rounded-lg">
                            <div className="text-[#0d141c] flex items-center justify-center rounded-lg bg-[#e7edf4] shrink-0 size-12">
                              {getIcon('generado')}
                            </div>
                            
                            <div className="flex flex-1 flex-col justify-center">
                              <p className="text-[#0d141c] text-base font-medium leading-normal">
                                {archivo.filename}
                              </p>
                              <p className="text-[#49739c] text-sm font-normal leading-normal">
                                Generado automáticamente • {formatFileSize(archivo.size)} • Descarga directa
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => downloadArchivo(archivo)}
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
                              >
                                <span className="truncate">Descargar</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contenidos de tipo "Guía de estudio (escrita)" */}
                  {contenidos.filter(contenido => contenido.tipo_recurso_generado === 'Guía de estudio (escrita)').length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-[#0d141c] text-base font-medium mb-3 px-4">Guías de Estudio</h4>
                      <div className="space-y-4">
                        {contenidos.filter(contenido => contenido.tipo_recurso_generado === 'Guía de estudio (escrita)').map((contenido, index) => (
                          <div key={index} className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-4 border border-[#cedbe8] rounded-lg">
                            <div className="text-[#0d141c] flex items-center justify-center rounded-lg bg-[#e7edf4] shrink-0 size-12">
                              {getIcon(contenido.tipo_recurso_generado)}
                            </div>
                            
                            <div className="flex flex-1 flex-col justify-center">
                              <p className="text-[#0d141c] text-base font-medium leading-normal">
                                {contenido.tipo_recurso_generado}
                              </p>
                              <p className="text-[#49739c] text-sm font-normal leading-normal">
                                Generado el {getFormattedDate(contenido.created_at)} • Contenido HTML
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => router.push(`/class/content/${contenido.id}`)}
                                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]"
                              >
                                <span className="truncate">Ver</span>
                              </button>
                              <button
                                onClick={() => downloadAsPDF(contenido)}
                                disabled={processingPDF}
                                className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 text-sm font-bold leading-normal tracking-[0.015em] ${
                                  processingPDF 
                                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                                    : 'bg-[#0d80f2] text-slate-50 hover:bg-[#0b6ad1]'
                                }`}
                              >
                                {processingPDF ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="truncate">Generando PDF...</span>
                                  </div>
                                ) : (
                                  <span className="truncate">Descargar PDF</span>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mensaje cuando no hay recursos generados */}
                  {archivos.filter(archivo => archivo.tipo === 'Generado').length === 0 && contenidos.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="text-[#49739c] mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto">
                            <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/>
                          </svg>
                        </div>
                        <h3 className="text-[#0d141c] text-lg font-semibold mb-2">No hay recursos generados</h3>
                        <p className="text-[#49739c] text-base">Esta clase no tiene recursos generados aún.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

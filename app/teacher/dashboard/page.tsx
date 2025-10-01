'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { apiService, ClaseResponse, DocenteResponseDTO } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('classes');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [classes, setClasses] = useState<ClaseResponse[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [updatingClaseId, setUpdatingClaseId] = useState<number | null>(null);
  const [filtroClases, setFiltroClases] = useState<'todas' | 'activas' | 'inactivas'>('todas');
  const [docente, setDocente] = useState<DocenteResponseDTO | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      try {
        setIsLoadingUser(true);
        const userDataString = localStorage.getItem('userData');
        console.log(userDataString)
        
        if (!userDataString) {
          router.push('/teacher/login');
          return;
        }

        const userData = JSON.parse(userDataString);
        const docenteData = await apiService.getDocente(userData.id);
        setDocente(docenteData);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear invalid session and redirect to login
        localStorage.removeItem('userData');
        router.push('/teacher/login');
      } finally {
        setIsLoadingUser(false);
      }
    };

    checkAuthAndLoadUser();
  }, [router]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!docente) return;
      
      try {
        setIsLoadingClasses(true);
        const classesData = await apiService.getClases(docente.id);
        console.log(classesData)
        setClasses(classesData);
      } catch (error) {
        console.error('Error fetching classes:', error);
        // Use mock data as fallback
        setClasses(mockClasses);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [docente]);

  // Mock data as fallback
  const mockClasses: ClaseResponse[] = [
    {
      id: 1,
      id_formulario: 1,
      id_docente: 1,
      nombre: 'Mathematics 101',
      perfil: 'Visual',
      area: 'Matemáticas',
      tema: 'Álgebra básica',
      nivel_educativo: 'Secundaria',
      duracion_estimada: 60,
      tipo_sesion: 'Clase teorica',
      modalidad: 'Presencial',
      objetivos_aprendizaje: 'Comprender los conceptos básicos del álgebra',
      resultado_taxonomia: 'Aplicar',
      estilo_material: 'Cercano y motivador',
      conocimientos_previos_estudiantes: 'Operaciones básicas',
      aspectos_motivacionales: 'Aplicaciones prácticas',
      recursos: 'Proyector, pizarra',
      tipo_recursos_generar: 'Esquema visual',
      estado: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateClass = () => {
    router.push('/teacher/class/create');
  };

  const handleCreateSyllabus = () => {
    router.push('/teacher/syllabus/create');
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    router.push('/teacher/login');
  };

  const handleToggleClaseEstado = async (claseId: number, estadoActual: boolean) => {
    try {
      setUpdatingClaseId(claseId);
      const nuevoEstado = !estadoActual;
      
      // Llamar al API para cambiar el estado
      await apiService.cambiarEstadoClase(claseId, nuevoEstado);
      
      // Actualizar el estado local
      setClasses(prevClasses => 
        prevClasses.map(clase => 
          clase.id === claseId 
            ? { ...clase, estado: nuevoEstado }
            : clase
        )
      );
      
      // Opcional: mostrar mensaje de éxito
      console.log(`Clase ${nuevoEstado ? 'habilitada' : 'deshabilitada'} exitosamente`);
      
    } catch (error) {
      console.error('Error cambiando estado de clase:', error);
      // Aquí podrías mostrar un toast o mensaje de error
    } finally {
      setUpdatingClaseId(null);
    }
  };

  // Función para filtrar clases
  const filtrarClases = (clases: ClaseResponse[]) => {
    switch (filtroClases) {
      case 'activas':
        return clases.filter(clase => clase.estado === true);
      case 'inactivas':
        return clases.filter(clase => clase.estado === false);
      case 'todas':
      default:
        return clases;
    }
  };

  const clasesFiltradas = filtrarClases(classes);

  // Show loading screen while checking authentication
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      <div className="flex h-full flex-col">
        <header className="backdrop-blur-md bg-white/70 border-b border-white/20 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-gray-800">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-gray-800 text-xl font-bold">LearningForLive</h2>
              <div className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
                Portal Docente
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2">
                <button 
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'classes' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'backdrop-blur-md bg-white/50 text-gray-700 hover:bg-white/70 border border-white/30'
                  }`}
                  onClick={() => setActiveTab('classes')}
                >
                  Clases
                </button>
                <button 
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'syllabi' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'backdrop-blur-md bg-white/50 text-gray-700 hover:bg-white/70 border border-white/30'
                  }`}
                  onClick={() => setActiveTab('syllabi')}
                >
                  Syllabus
                </button>
              </div>

              {/* Create Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                  Crear
                </button>
                {showCreateMenu && (
                  <div className="absolute right-0 top-12 backdrop-blur-md bg-white/90 border border-white/20 rounded-xl shadow-xl z-10 min-w-[180px] overflow-hidden">
                    <button 
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100"
                      onClick={handleCreateClass}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Crear Clase
                      </div>
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                      onClick={handleCreateSyllabus}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.707.707L12 14.414l-2.293 2.293A1 1 0 018 16V4z" clipRule="evenodd"/>
                        </svg>
                        Crear Syllabus
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 backdrop-blur-md bg-white/50 hover:bg-white/70 border border-white/30 rounded-xl p-2 transition-all duration-200"
                  title={`Perfil - ${docente?.nombre || ''}`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="hidden sm:block text-sm font-medium text-gray-700">
                    {docente?.nombre || 'Usuario'}
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 backdrop-blur-md bg-white/90 border border-white/20 rounded-xl shadow-xl z-10 min-w-[200px] overflow-hidden">
                    <button 
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100"
                      onClick={() => {
                        router.push('/teacher/settings');
                        setShowProfileMenu(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Configuración
                      </div>
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar sesión
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-gray-800 text-3xl font-bold mb-2">
                    Bienvenido, {docente?.nombre || 'Docente'}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Gestiona tus clases y contenido educativo desde tu panel profesional
                  </p>
                </div>
              </div>
            </div>
            
            {activeTab === 'classes' && (
              <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h2 className="text-gray-800 text-2xl font-bold">
                      {filtroClases === 'todas' ? 'Todas las Clases' : 
                       filtroClases === 'activas' ? 'Clases Activas' : 'Clases Inactivas'}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({clasesFiltradas.length})
                      </span>
                    </h2>
                  </div>
                  
                  {/* Filtros */}
                  <div className="flex items-center gap-2">
                    <button 
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        filtroClases === 'todas' 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                          : 'backdrop-blur-md bg-white/50 text-gray-700 hover:bg-white/70 border border-white/30'
                      }`}
                      onClick={() => setFiltroClases('todas')}
                    >
                      Todas
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        filtroClases === 'activas' 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                          : 'backdrop-blur-md bg-white/50 text-gray-700 hover:bg-white/70 border border-white/30'
                      }`}
                      onClick={() => setFiltroClases('activas')}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Activas
                      </div>
                    </button>
                    <button 
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        filtroClases === 'inactivas' 
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                          : 'backdrop-blur-md bg-white/50 text-gray-700 hover:bg-white/70 border border-white/30'
                      }`}
                      onClick={() => setFiltroClases('inactivas')}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Inactivas
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="backdrop-blur-md bg-white/30 rounded-xl border border-white/20 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-b border-white/20">
                    <div className="grid grid-cols-12 gap-4 font-semibold text-gray-700 text-sm">
                      <div className="col-span-4">Nombre de la Clase</div>
                      <div className="col-span-4">Detalles</div>
                      <div className="col-span-2 text-center">Estado</div>
                      <div className="col-span-2 text-center">Acciones</div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-white/20">
                    {isLoadingClasses ? (
                      <div className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="text-gray-600 font-medium">Cargando clases...</span>
                        </div>
                      </div>
                    ) : clasesFiltradas.length > 0 ? (
                      clasesFiltradas.map((clase) => (
                        <div key={clase.id} className={`px-6 py-4 hover:bg-white/20 transition-colors duration-200 ${!clase.estado ? 'opacity-60' : ''}`}>
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-4">
                              <h3 className="font-semibold text-gray-800 mb-1">{clase.nombre}</h3>
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                                  {clase.perfil}
                                </span>
                                {!clase.estado && (
                                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-medium">
                                    Deshabilitada
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="col-span-4">
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                                  </svg>
                                  <span>{clase.area} • {clase.tema}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                  </svg>
                                  <span>{clase.nivel_educativo}</span>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-2 text-center">
                              <button
                                onClick={() => handleToggleClaseEstado(clase.id, clase.estado)}
                                disabled={updatingClaseId === clase.id}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                                  clase.estado 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                } ${
                                  updatingClaseId === clase.id 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'cursor-pointer'
                                }`}
                              >
                                {updatingClaseId === clase.id ? (
                                  <div className="flex items-center gap-1">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                    <span>...</span>
                                  </div>
                                ) : (
                                  clase.estado ? 'Habilitada' : 'Deshabilitada'
                                )}
                              </button>
                            </div>
                            <div className="col-span-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-xs"
                                  onClick={() => router.push(`/teacher/class/${clase.id}`)}
                                >
                                  Ver detalles
                                </button>
                                <button
                                  onClick={() => handleToggleClaseEstado(clase.id, clase.estado)}
                                  disabled={updatingClaseId === clase.id}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                                    clase.estado 
                                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white' 
                                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                                  } ${
                                    updatingClaseId === clase.id 
                                      ? 'opacity-50 cursor-not-allowed' 
                                      : 'cursor-pointer'
                                  }`}
                                >
                                  {updatingClaseId === clase.id ? (
                                    <div className="flex items-center gap-1">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    </div>
                                  ) : (
                                    clase.estado ? 'Deshabilitar' : 'Habilitar'
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <h3 className="text-gray-800 font-semibold mb-2">
                          {classes.length === 0 
                            ? 'No hay clases creadas' 
                            : filtroClases === 'activas' 
                              ? 'No hay clases activas' 
                              : 'No hay clases inactivas'
                          }
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {classes.length === 0 
                            ? 'Comienza creando tu primera clase para gestionar contenido educativo'
                            : filtroClases === 'activas'
                              ? 'Todas las clases están deshabilitadas. Habilita una clase para verla aquí.'
                              : 'Todas las clases están habilitadas.'
                          }
                        </p>
                        {classes.length === 0 && (
                          <button
                            onClick={handleCreateClass}
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            Crear primera clase
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'syllabi' && (
              <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.707.707L12 14.414l-2.293 2.293A1 1 0 018 16V4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h2 className="text-gray-800 text-2xl font-bold">Syllabus Activos</h2>
                </div>
                
                <div className="backdrop-blur-md bg-white/30 rounded-xl border border-white/20 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-b border-white/20">
                    <div className="grid grid-cols-12 gap-4 font-semibold text-gray-700 text-sm">
                      <div className="col-span-6">Nombre del Curso</div>
                      <div className="col-span-3">Duración</div>
                      <div className="col-span-3 text-center">Estado</div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 hover:bg-white/20 transition-colors duration-200">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6">
                        <h3 className="font-semibold text-gray-800 mb-1">Matemáticas Avanzadas</h3>
                        <div className="flex items-center gap-2">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium">
                            Curso Completo
                          </span>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                          </svg>
                          <span>16 semanas</span>
                        </div>
                      </div>
                      <div className="col-span-3 text-center">
                        <button
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                          onClick={() => router.push('/teacher/syllabus/1')}
                        >
                          Activo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { apiService, ClaseResponse, DocenteResponseDTO } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('classes');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [classes, setClasses] = useState<ClaseResponse[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [docente, setDocente] = useState<DocenteResponseDTO | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      try {
        setIsLoadingUser(true);
        const userDataString = localStorage.getItem('userData');
        
        if (!userDataString) {
          // No user data, redirect to login
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
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
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

  // Show loading screen while checking authentication
  if (isLoadingUser) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
        <div className="flex flex-1 justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d80f2] mx-auto mb-4"></div>
            <p className="text-[#49739c] text-lg">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <button 
                className={`text-sm font-medium leading-normal ${activeTab === 'classes' ? 'text-[#0d80f2]' : 'text-[#0d141c]'}`}
                onClick={() => setActiveTab('classes')}
              >
                Clases
              </button>
              <button 
                className={`text-sm font-medium leading-normal ${activeTab === 'syllabi' ? 'text-[#0d80f2]' : 'text-[#0d141c]'}`}
                onClick={() => setActiveTab('syllabi')}
              >
                Syllabus
              </button>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
                onClick={() => setShowCreateMenu(!showCreateMenu)}
              >
                <span className="truncate">Crear</span>
              </button>
              {/* Dropdown menu for create options */}
              {showCreateMenu && (
                <div className="absolute right-0 top-12 bg-white border border-[#cedbe8] rounded-lg shadow-lg z-10 min-w-[150px]">
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 rounded-t-lg"
                    onClick={handleCreateClass}
                  >
                    Crear Clase
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 rounded-b-lg"
                    onClick={handleCreateSyllabus}
                  >
                    Crear Syllabus
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 hover:bg-slate-100 rounded-lg p-2"
                title={`Cerrar sesión - ${docente?.nombre || ''}`}
              >
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                  style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD6Kgkgqdb4sEmSys8jq7Xo_r5Z3GEyzyMnGBjEpWUcHxUC2rRmPZceKgsZcg4RWaxqXRrXPnfJyGZi-7Ji7NmLkWxIGo8u1eo5114z8IGunYWUchXeX13NWITtWJDwW8fyWUIIguTLj9lQzOAbPj8OUdQ-oRnGD0OsOO7FHpnOfw5dI3PqaeFLs6SffayYF11jYsmtFTRK372_4mY8DRTTrlVYPsyvau03Mno7maG_GOKRp65cS8xr2zS4yERPr6Dv_QVvgki53w")'}}
                ></div>
                <div className="hidden sm:block text-sm text-[#0d141c]">
                  {docente?.nombre || 'Usuario'}
                </div>
              </button>
            </div>
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">
                Bienvenido, {docente?.nombre || 'Docente'}
              </p>
            </div>
            
            {activeTab === 'classes' && (
              <>
                <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Clases Activas</h2>
                <div className="px-4 py-3">
                  <div className="flex overflow-hidden rounded-lg border border-[#cedbe8] bg-slate-50">
                    <table className="flex-1">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-4 py-3 text-left text-[#0d141c] w-[400px] text-sm font-medium leading-normal">
                            Nombre de la Clase
                          </th>
                          <th className="px-4 py-3 text-left text-[#0d141c] w-[400px] text-sm font-medium leading-normal">
                            Detalles
                          </th>
                          <th className="px-4 py-3 text-left text-[#0d141c] w-60 text-sm font-medium leading-normal">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingClasses ? (
                          <tr className="border-t border-t-[#cedbe8]">
                            <td colSpan={3} className="h-[72px] px-4 py-2 text-center">
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0d80f2] mr-2"></div>
                                Cargando clases...
                              </div>
                            </td>
                          </tr>
                        ) : classes.length > 0 ? (
                          classes.map((clase) => (
                            <tr key={clase.id} className="border-t border-t-[#cedbe8]">
                              <td className="h-[72px] px-4 py-2 w-[400px] text-[#0d141c] text-sm font-normal leading-normal">
                                {clase.nombre}
                              </td>
                              <td className="h-[72px] px-4 py-2 w-[400px] text-[#49739c] text-sm font-normal leading-normal">
                                <div className="space-y-1">
                                  <div>{clase.area} • {clase.tema}</div>
                                  <div>{clase.perfil} • {clase.nivel_educativo}</div>
                                </div>
                              </td>
                              <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                                <button
                                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-medium leading-normal w-full hover:bg-[#cedbe8]"
                                  onClick={() => router.push(`/teacher/class/${clase.id}`)}
                                >
                                  <span className="truncate">Ver detalles</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="border-t border-t-[#cedbe8]">
                            <td colSpan={3} className="h-[72px] px-4 py-2 text-center text-[#49739c]">
                              No hay clases creadas aún. ¡Crea tu primera clase!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'syllabi' && (
              <>
                <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Syllabus Activos</h2>
                <div className="px-4 py-3">
                  <div className="flex overflow-hidden rounded-lg border border-[#cedbe8] bg-slate-50">
                    <table className="flex-1">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-4 py-3 text-left text-[#0d141c] w-[400px] text-sm font-medium leading-normal">
                            Nombre del Curso
                          </th>
                          <th className="px-4 py-3 text-left text-[#0d141c] w-[200px] text-sm font-medium leading-normal">
                            Semanas
                          </th>
                          <th className="px-4 py-3 text-left text-[#0d141c] w-60 text-sm font-medium leading-normal">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-t-[#cedbe8]">
                          <td className="h-[72px] px-4 py-2 w-[400px] text-[#0d141c] text-sm font-normal leading-normal">
                            Matemáticas Avanzadas
                          </td>
                          <td className="h-[72px] px-4 py-2 w-[200px] text-[#49739c] text-sm font-normal leading-normal">
                            16 semanas
                          </td>
                          <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                            <button
                              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-medium leading-normal w-full"
                              onClick={() => router.push('/teacher/syllabus/1')}
                            >
                              <span className="truncate">Activo</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import type { 
  ClaseInteractivaResponseDTO,
  ContenidoEstudianteResponseDTO,
  ContenidoEstudianteDataResponseDTO,
  EstadoContenidoType
} from '../../../../lib/api';

interface ContenidoClaseTabProps {
  claseInteractiva: ClaseInteractivaResponseDTO | null;
  loadingContenido: boolean;
  iniciarClase: () => Promise<void>;
}

export default function ContenidoClaseTab({
  claseInteractiva,
  loadingContenido,
  iniciarClase
}: ContenidoClaseTabProps) {
  // Normalizar y proteger el porcentaje para evitar llamar `toFixed` sobre undefined
  const porcentaje = (() => {
    const raw = claseInteractiva?.porcentaje_completado;
    // Intentar convertir a número si viene como string
    const num = typeof raw === 'number' ? raw : Number(raw ?? 0);
    if (Number.isNaN(num)) return 0;
    // Asegurar rango entre 0 y 100
    return Math.max(0, Math.min(100, num));
  })();
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contenido de la Clase</h2>
        <p className="text-gray-600 mb-8">
          Explora el contenido interactivo de la clase adaptado a tu perfil de aprendizaje
        </p>
        
        {claseInteractiva && (
          <div className="mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Progreso de la clase</h3>
              <div className="mt-2">
                <div className="bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  {porcentaje.toFixed(1)}% completado
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={iniciarClase}
          disabled={loadingContenido}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loadingContenido ? 'Cargando...' : claseInteractiva ? 'Continuar Clase' : 'Iniciar Clase'}
        </button>
      </div>
    </div>
  );
}
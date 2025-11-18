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
  // Calcular porcentaje a partir de la estructura que devuelve la API.
  // Si la API ya incluye `porcentaje_completado` lo usamos; si no, lo calculamos
  // usando `contenidos_disponibles` y `progreso_estudiante`.
  // - 'Finalizado' cuenta como 1
  // - 'En proceso' cuenta como 0.5 (medio progreso)
  // Esto maneja respuestas como las que compartiste en la descripción.
  const porcentaje = (() => {
    // Si backend ya envía porcentaje_completado úsalo (acepta string o number)
    const rawPct = (claseInteractiva as any)?.porcentaje_completado;
    if (rawPct != null) {
      const num = typeof rawPct === 'number' ? rawPct : Number(rawPct);
      if (!Number.isNaN(num)) return Math.max(0, Math.min(100, num));
    }

    const contenidos = Array.isArray((claseInteractiva as any)?.contenidos_disponibles)
      ? (claseInteractiva as any).contenidos_disponibles
      : [];
    const progreso = Array.isArray((claseInteractiva as any)?.progreso_estudiante)
      ? (claseInteractiva as any).progreso_estudiante
      : [];

    const total = contenidos.length > 0 ? contenidos.length : progreso.length;
    if (total === 0) return 0;

    const finished = progreso.filter((p: any) => {
      const estado = String(p?.estado ?? '').toLowerCase();
      return estado.includes('finaliz') || estado === 'finalizado' || estado === 'completed';
    }).length;

    const inProgress = progreso.filter((p: any) => {
      const estado = String(p?.estado ?? '').toLowerCase();
      return estado.includes('en proceso') || estado.includes('proceso') || estado === 'in progress';
    }).length;

    const completedEquivalent = finished + inProgress * 0.5;
    const pct = (completedEquivalent / total) * 100;
    return Math.max(0, Math.min(100, pct));
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
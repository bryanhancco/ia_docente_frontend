'use client';

export default function ResumenesDiagramasTab() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">En Construcción</h2>
        <p className="text-gray-600">
          Los resúmenes y diagramas personalizados estarán disponibles pronto.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-800">Resúmenes Inteligentes</h3>
            <p className="text-sm text-gray-600 mt-1">Resúmenes personalizados basados en tu perfil de aprendizaje</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl mb-2">🗺️</div>
            <h3 className="font-semibold text-gray-800">Mapas Conceptuales</h3>
            <p className="text-sm text-gray-600 mt-1">Diagramas visuales para conectar conceptos clave</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-semibold text-gray-800">Mapas Mentales</h3>
            <p className="text-sm text-gray-600 mt-1">Organizadores gráficos para facilitar el estudio</p>
          </div>
        </div>
      </div>
    </div>
  );
}
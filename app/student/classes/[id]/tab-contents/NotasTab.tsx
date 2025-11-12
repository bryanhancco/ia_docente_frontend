'use client';

import type { NotaResponseDTO } from '../../../../lib/api';

interface NotasTabProps {
  notas: NotaResponseDTO[];
  nuevaNota: string;
  setNuevaNota: (nota: string) => void;
  editandoNota: number | null;
  setEditandoNota: (id: number | null) => void;
  textoEditando: string;
  setTextoEditando: (texto: string) => void;
  loadingNotas: boolean;
  crearNota: () => Promise<void>;
  editarNota: (notaId: number) => Promise<void>;
  eliminarNota: (notaId: number) => Promise<void>;
}

export default function NotasTab({
  notas,
  nuevaNota,
  setNuevaNota,
  editandoNota,
  setEditandoNota,
  textoEditando,
  setTextoEditando,
  loadingNotas,
  crearNota,
  editarNota,
  eliminarNota
}: NotasTabProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Apuntes</h2>
      
      {/* Crear nueva nota */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Crear nuevo apunte</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <textarea
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            placeholder="Escribe aquí tus apuntes sobre la clase..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500">
              {nuevaNota.length} caracteres
            </span>
            <button
              onClick={crearNota}
              disabled={!nuevaNota.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ✨ Agregar Apunte
            </button>
          </div>
        </div>
      </div>

      {/* Lista de notas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Mis apuntes guardadas</h3>
        {loadingNotas ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando apuntes...</p>
          </div>
        ) : notas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <h4 className="text-lg font-semibold mb-2">No tienes apuntes aún</h4>
            <p>¡Crea tu primer apunte para empezar a organizar tus apuntes!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notas.map((nota, index) => (
              <div key={nota.id} className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
                {editandoNota === nota.id ? (
                  <div>
                    <textarea
                      value={textoEditando}
                      onChange={(e) => setTextoEditando(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {textoEditando.length} caracteres
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editarNota(nota.id)}
                          disabled={!textoEditando.trim()}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          ✅ Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditandoNota(null);
                            setTextoEditando('');
                          }}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-500 font-medium">
                          Apunte #{index + 1}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditandoNota(nota.id);
                            setTextoEditando(nota.notas);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          title="Editar nota"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de que quieres eliminar este apunte?')) {
                              eliminarNota(nota.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                          title="Eliminar apunte"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{nota.notas}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
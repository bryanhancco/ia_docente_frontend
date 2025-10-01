'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { 
  ClaseInteractivaResponseDTO,
  ContenidoEstudianteResponseDTO,
  ContenidoEstudianteDataResponseDTO,
  EstadoContenidoType
} from '../../../../lib/api';

interface ClaseInteractivaModalProps {
  showClassModal: boolean;
  setShowClassModal: (show: boolean) => void;
  claseInteractiva: ClaseInteractivaResponseDTO | null;
  contenidoActual: ContenidoEstudianteResponseDTO | null;
  setContenidoActual: (contenido: ContenidoEstudianteResponseDTO | null) => void;
  progresoActual: ContenidoEstudianteDataResponseDTO | null;
  setProgresoActual: (progreso: ContenidoEstudianteDataResponseDTO | null) => void;
  contenidoPaginado: string[];
  setContenidoPaginado: (paginas: string[]) => void;
  paginaActual: number;
  setPaginaActual: (pagina: number) => void;
  loadingContenido: boolean;
  seleccionarContenido: (contenido: ContenidoEstudianteResponseDTO) => Promise<void>;
  finalizarIndice: () => Promise<void>;
  obtenerTextoBotonFinalizar: () => string;
  getEstadoColor: (estado: EstadoContenidoType) => string;
}

export default function ClaseInteractivaModal({
  showClassModal,
  setShowClassModal,
  claseInteractiva,
  contenidoActual,
  setContenidoActual,
  progresoActual,
  setProgresoActual,
  contenidoPaginado,
  setContenidoPaginado,
  paginaActual,
  setPaginaActual,
  loadingContenido,
  seleccionarContenido,
  finalizarIndice,
  obtenerTextoBotonFinalizar,
  getEstadoColor
}: ClaseInteractivaModalProps) {

  if (!showClassModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Índice de la Clase</h2>
          <button
            onClick={() => {
              setShowClassModal(false);
              setContenidoActual(null);
              setProgresoActual(null);
            }}
            className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex h-[calc(90vh-100px)]">
          {/* Panel izquierdo - Índice */}
          <div className="w-1/3 border-r p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Contenidos</h3>
            {/* Los contenidos ya vienen ordenados por 'orden' desde el backend */}
            {claseInteractiva?.contenidos_disponibles.map((contenido, index) => {
              const progreso = claseInteractiva.progreso_estudiante.find(
                p => p.id_contenido === contenido.id
              );

              return (
                <div key={contenido.id} className="mb-2">
                  <button
                    onClick={() => seleccionarContenido(contenido)}
                    className={`w-full text-left p-3 rounded-lg border mb-2 transition-all hover:shadow-md ${
                      contenidoActual?.id === contenido.id
                        ? 'bg-blue-50 border-blue-300 shadow-md'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {/* Usar directamente el campo 'indice' de la tabla contenido_estudiante como título */}
                          {(() => {
                            // Si el indice contiene JSON (datos antiguos), intentar parsearlo
                            if (contenido.indice?.startsWith('[') || contenido.indice?.startsWith('{')) {
                              try {
                                const parsedIndex = JSON.parse(contenido.indice);
                                if (Array.isArray(parsedIndex) && parsedIndex[0]?.indice) {
                                  return parsedIndex[0].indice;
                                }
                                if (parsedIndex?.indice) {
                                  return parsedIndex.indice;
                                }
                              } catch (e) {
                                console.warn('Error al parsear índice JSON:', e);
                              }
                            }
                            // Si es un string simple o no se pudo parsear, usar directamente
                            return contenido.indice || `Contenido ${index + 1}`;
                          })()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {contenido.tiempo_estimado || 30} min
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(progreso?.estado || 'No iniciado')}`}>
                        {progreso?.estado || 'No iniciado'}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Panel derecho - Contenido */}
          <div className="flex-1 flex flex-col">
            {contenidoActual ? (
              <>
                {/* Área de contenido */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {loadingContenido ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando contenido personalizado...</p>
                      </div>
                    </div>
                  ) : contenidoPaginado.length > 0 ? (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 prose-code:text-purple-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 prose-pre:border prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-4 prose-ul:list-disc prose-ol:list-decimal prose-img:rounded-lg prose-img:shadow-md prose-hr:border-gray-300"
                        style={{ fontSize: '16px', lineHeight: '1.6' }}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b-2 border-blue-500 pb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-1" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-3 text-gray-800" {...props} />,
                            h4: ({node, ...props}) => <h4 className="text-base font-medium mb-2 text-gray-700" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 text-gray-700 leading-relaxed" {...props} />,
                            ul: ({node, ...props}) => <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />,
                            li: ({node, ...props}) => <li className="text-gray-700 leading-relaxed" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                            em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                            code: ({node, ...props}) => <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-mono" {...props} />,
                            pre: ({node, ...props}) => <pre className="bg-gray-800 text-gray-100 rounded-lg p-4 overflow-x-auto mb-4 shadow-inner" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-6 py-3 mb-4 italic text-gray-600 rounded-r-lg" {...props} />,
                            a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                            table: ({node, ...props}) => <div className="overflow-x-auto mb-4"><table className="min-w-full border-collapse border border-gray-300 rounded-lg shadow-sm" {...props} /></div>,
                            th: ({node, ...props}) => <th className="border border-gray-300 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-800" {...props} />,
                            td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-3 text-gray-700" {...props} />,
                            hr: ({node, ...props}) => <hr className="border-gray-300 my-6" {...props} />,
                            img: ({node, ...props}) => <img className="rounded-lg shadow-md max-w-full h-auto mx-auto mb-4" {...props} />,
                          }}
                        >
                          {contenidoPaginado[paginaActual]}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Navegación de páginas */}
                      {contenidoPaginado.length > 1 && (
                        <div className="flex justify-between items-center mt-6 pt-4 border-t">
                          <button
                            onClick={() => setPaginaActual(Math.max(0, paginaActual - 1))}
                            disabled={paginaActual === 0}
                            className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50 hover:bg-gray-700 transition-colors"
                          >
                            ← Anterior
                          </button>
                          <span className="text-sm text-gray-600">
                            Página {paginaActual + 1} de {contenidoPaginado.length}
                          </span>
                          <button
                            onClick={() => setPaginaActual(Math.min(contenidoPaginado.length - 1, paginaActual + 1))}
                            disabled={paginaActual === contenidoPaginado.length - 1}
                            className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50 hover:bg-gray-700 transition-colors"
                          >
                            Siguiente →
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📚</div>
                        <p className="text-lg">Selecciona un contenido del índice para comenzar</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón de continuar/finalizar */}
                {progresoActual && progresoActual.estado !== 'Finalizado' && (
                  <div className="border-t p-4">
                    <button
                      onClick={finalizarIndice}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                    >
                      {obtenerTextoBotonFinalizar()}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">📚</div>
                  <p className="text-lg">Selecciona un contenido del índice para comenzar</p>
                  <p className="text-sm text-gray-400 mt-2">Haz clic en cualquier elemento de la lista para ver su contenido</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
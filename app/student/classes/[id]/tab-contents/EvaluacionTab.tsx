'use client';

import type { 
  Flashcard,
  PreguntaData,
  RespuestaQuiz,
  ResultadoQuiz
} from '../../../../lib/api';

interface EvaluacionTabProps {
  // Flashcards
  flashcards: Flashcard[];
  loadingFlashcards: boolean;
  currentCardIndex: number;
  setCurrentCardIndex: (index: number) => void;
  showAnswer: boolean;
  setShowAnswer: (show: boolean) => void;
  studyMode: 'all' | 'basic' | 'intermediate' | 'advanced';
  setStudyMode: (mode: 'all' | 'basic' | 'intermediate' | 'advanced') => void;
  loadFlashcards: () => Promise<void>;
  
  // Quiz
  preguntas: PreguntaData[];
  loadingQuiz: boolean;
  quizIniciado: boolean;
  preguntaActual: number;
  respuestasUsuario: RespuestaQuiz[];
  respuestaSeleccionada: number | null;
  mostrarRetroalimentacion: boolean;
  quizTerminado: boolean;
  resultadoQuiz: ResultadoQuiz | null;
  tiempoInicio: Date | null;
  cargarPreguntas: () => Promise<void>;
  iniciarQuiz: () => void;
  seleccionarRespuesta: (opcion: number) => void;
}

export default function EvaluacionTab({
  flashcards,
  loadingFlashcards,
  currentCardIndex,
  setCurrentCardIndex,
  showAnswer,
  setShowAnswer,
  studyMode,
  setStudyMode,
  loadFlashcards,
  preguntas,
  loadingQuiz,
  quizIniciado,
  preguntaActual,
  respuestasUsuario,
  respuestaSeleccionada,
  mostrarRetroalimentacion,
  quizTerminado,
  resultadoQuiz,
  tiempoInicio,
  cargarPreguntas,
  iniciarQuiz,
  seleccionarRespuesta
}: EvaluacionTabProps) {
  
  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const filteredFlashcards = flashcards.filter(card => {
    if (studyMode === 'all') return true;
    return card.dificultad.toLowerCase() === studyMode;
  });

  return (
    <div className="space-y-6">
      {/* Flashcards */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Flashcards de Estudio</h3>
          <div className="flex gap-2">
            <select
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">Todas las dificultades</option>
              <option value="basic">Básico</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
            <button
              onClick={loadFlashcards}
              disabled={loadingFlashcards}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingFlashcards ? 'Cargando...' : 'Cargar Flashcards'}
            </button>
          </div>
        </div>
        
        {flashcards.length > 0 ? (
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-4 border border-blue-200">
              <div className="text-sm text-blue-600 mb-2">
                Flashcard {currentCardIndex + 1} de {filteredFlashcards.length}
              </div>
              <div className="text-lg font-semibold mb-4 text-gray-800">
                {flashcards[currentCardIndex]?.pregunta}
              </div>
              {showAnswer && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                  <p className="font-semibold text-blue-800 mb-2">Respuesta:</p>
                  <p className="text-gray-700 mb-3">{flashcards[currentCardIndex]?.respuesta}</p>
                  {flashcards[currentCardIndex]?.tips_estudio && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                      <p className="font-semibold text-yellow-800 text-sm mb-1">💡 Tip de estudio:</p>
                      <p className="text-yellow-700 text-sm">{flashcards[currentCardIndex]?.tips_estudio}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  flashcards[currentCardIndex]?.dificultad === 'Básico' ? 'bg-green-100 text-green-800' :
                  flashcards[currentCardIndex]?.dificultad === 'Intermedio' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {flashcards[currentCardIndex]?.dificultad}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mb-4">
              <button 
                onClick={() => setShowAnswer(!showAnswer)} 
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {showAnswer ? 'Ocultar' : 'Mostrar'} Respuesta
              </button>
            </div>

            {flashcards.length > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === flashcards.length - 1}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📚</div>
            <p>No hay flashcards disponibles. Haz clic en "Cargar Flashcards" para generar contenido de estudio.</p>
          </div>
        )}
      </div>

      {/* Quiz */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Quiz de Evaluación</h3>
          <button
            onClick={cargarPreguntas}
            disabled={loadingQuiz}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loadingQuiz ? 'Cargando...' : 'Cargar Quiz'}
          </button>
        </div>
        
        {preguntas.length > 0 && !quizIniciado ? (
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <div className="text-4xl mb-4">📝</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Quiz Disponible</h4>
              <p className="text-gray-600 mb-4">
                Tienes {preguntas.length} preguntas listas para evaluar tu conocimiento
              </p>
              <button
                onClick={iniciarQuiz}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                🚀 Iniciar Quiz
              </button>
            </div>
          </div>
        ) : preguntas.length === 0 && !loadingQuiz ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">❓</div>
            <p>No hay preguntas de quiz disponibles. Haz clic en "Cargar Quiz" para generar preguntas.</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">⏳</div>
            <p>Funcionalidad de quiz en desarrollo...</p>
          </div>
        )}
      </div>
    </div>
  );
}
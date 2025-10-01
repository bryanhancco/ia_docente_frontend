'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PreguntaData, apiService } from '../../../../lib/api';

export default function ClassEvaluationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [preguntas, setPreguntas] = useState<PreguntaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        setLoading(true);
        const preguntasData = await apiService.getPreguntas(parseInt(id as string));
        setPreguntas(preguntasData);
      } catch (error) {
        console.error('Error fetching preguntas:', error);
        // Mock data para desarrollo
        const mockPreguntas: PreguntaData[] = [
          {
            id: 1,
            id_clase: parseInt(id as string),
            pregunta: "¿Cuál es la capital de Francia?",
            alternativa_a: "Londres",
            alternativa_b: "París",
            alternativa_c: "Madrid",
            alternativa_d: "Roma",
            alternativa_correcta: 2,
            retroalimentacion_a: "Londres es la capital del Reino Unido, no de Francia.",
            retroalimentacion_b: "¡Correcto! París es la capital de Francia.",
            retroalimentacion_c: "Madrid es la capital de España, no de Francia.",
            retroalimentacion_d: "Roma es la capital de Italia, no de Francia.",
            estado: true
          },
          {
            id: 2,
            id_clase: parseInt(id as string),
            pregunta: "¿Cuántos continentes hay en el mundo?",
            alternativa_a: "5",
            alternativa_b: "6",
            alternativa_c: "7",
            alternativa_d: "8",
            alternativa_correcta: 3,
            retroalimentacion_a: "Son más de 5 continentes.",
            retroalimentacion_b: "Son más de 6 continentes.",
            retroalimentacion_c: "¡Correcto! Hay 7 continentes: Asia, África, América del Norte, América del Sur, Europa, Oceanía y Antártida.",
            retroalimentacion_d: "Son menos de 8 continentes.",
            estado: true
          }
        ];
        setPreguntas(mockPreguntas);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPreguntas();
    }
  }, [id]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (submitted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
  };

  const getAlternativeText = (pregunta: PreguntaData, index: number) => {
    switch (index) {
      case 1: return pregunta.alternativa_a;
      case 2: return pregunta.alternativa_b;
      case 3: return pregunta.alternativa_c;
      case 4: return pregunta.alternativa_d;
      default: return '';
    }
  };

  const getRetroalimentacion = (pregunta: PreguntaData, index: number) => {
    switch (index) {
      case 1: return pregunta.retroalimentacion_a;
      case 2: return pregunta.retroalimentacion_b;
      case 3: return pregunta.retroalimentacion_c;
      case 4: return pregunta.retroalimentacion_d;
      default: return '';
    }
  };

  const calculateScore = () => {
    let correct = 0;
    preguntas.forEach((pregunta, index) => {
      if (selectedAnswers[index] === pregunta.alternativa_correcta) {
        correct++;
      }
    });
    return { correct, total: preguntas.length, percentage: Math.round((correct / preguntas.length) * 100) };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="backdrop-blur-md bg-white/70 border-b border-white/20 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  LearningForLive
                </h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="backdrop-blur-md bg-white/80 border border-white/20 rounded-3xl p-12 shadow-2xl text-center max-w-md">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Cargando evaluación</h2>
            <p className="text-gray-600">Obteniendo las preguntas...</p>
          </div>
        </div>
      </div>
    );
  }

  const score = submitted ? calculateScore() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="backdrop-blur-md bg-white/70 border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                LearningForLive
              </h1>
            </div>
            <button 
              onClick={() => router.push(`/teacher/class/${id}`)}
              className="backdrop-blur-md bg-white/60 hover:bg-white/80 border border-white/30 px-4 py-2 rounded-xl text-gray-700 hover:text-gray-900 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a la Clase
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="backdrop-blur-md bg-white/80 border border-white/20 rounded-3xl p-8 shadow-2xl mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                Evaluación de Clase
              </h1>
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{preguntas.length} preguntas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${submitted ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                  <span className="font-medium">{submitted ? 'Completado' : 'En progreso'}</span>
                </div>
              </div>
            </div>
            
            {submitted && score && (
              <div className="backdrop-blur-md bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-2xl p-6 text-center shadow-lg">
                <div className={`text-3xl font-bold mb-2 ${
                  score.percentage >= 70 
                    ? 'text-green-600' 
                    : score.percentage >= 50 
                      ? 'text-yellow-600' 
                      : 'text-red-600'
                }`}>
                  {score.percentage}%
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {score.correct} de {score.total} correctas
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {preguntas.map((pregunta, questionIndex) => (
            <div key={pregunta.id} className="backdrop-blur-md bg-white/80 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg">
                    {questionIndex + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
                    {pregunta.pregunta}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3, 4].map((alternativeIndex) => {
                  const alternativeText = getAlternativeText(pregunta, alternativeIndex);
                  const isSelected = selectedAnswers[questionIndex] === alternativeIndex;
                  const isCorrect = pregunta.alternativa_correcta === alternativeIndex;
                  const showFeedback = submitted && isSelected;
                  
                  let buttonClass = "flex items-center gap-4 w-full p-4 rounded-2xl text-left transition-all duration-200 ";
                  
                  if (submitted) {
                    if (isCorrect) {
                      buttonClass += "border-2 border-green-400 bg-gradient-to-r from-green-50/90 to-emerald-50/90 text-green-800 shadow-lg";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "border-2 border-red-400 bg-gradient-to-r from-red-50/90 to-pink-50/90 text-red-800 shadow-lg";
                    } else {
                      buttonClass += "border border-gray-200 bg-gray-50/60 text-gray-500";
                    }
                  } else {
                    if (isSelected) {
                      buttonClass += "border-2 border-blue-400 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 text-blue-800 shadow-lg";
                    } else {
                      buttonClass += "border border-white/40 bg-white/60 text-gray-700 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 hover:shadow-lg";
                    }
                  }

                  return (
                    <div key={alternativeIndex}>
                      <button
                        onClick={() => handleAnswerSelect(questionIndex, alternativeIndex)}
                        className={buttonClass}
                        disabled={submitted}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          isSelected 
                            ? (submitted && isCorrect ? 'border-green-500 bg-green-500' : submitted && !isCorrect ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500')
                            : submitted && isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'
                        }`}>
                          {(isSelected || (submitted && isCorrect)) && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="font-semibold text-lg">{String.fromCharCode(64 + alternativeIndex)}.</span>
                        <span className="font-medium">{alternativeText}</span>
                      </button>
                      
                      {showFeedback && (
                        <div className={`mt-3 p-4 rounded-2xl text-sm shadow-lg ${
                          isCorrect 
                            ? 'bg-gradient-to-r from-green-100/90 to-emerald-100/90 text-green-800 border border-green-200' 
                            : 'bg-gradient-to-r from-red-100/90 to-pink-100/90 text-red-800 border border-red-200'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isCorrect ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                {isCorrect ? (
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                ) : (
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                )}
                              </svg>
                            </div>
                            <span className="font-medium leading-relaxed">{getRetroalimentacion(pregunta, alternativeIndex)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {!submitted && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== preguntas.length}
              className="backdrop-blur-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar Respuestas
              </div>
            </button>
          </div>
        )}

        {/* Results Summary */}
        {submitted && score && (
          <div className="mt-8 backdrop-blur-md bg-white/80 border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Resumen de Resultados</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 backdrop-blur-md bg-gradient-to-r from-gray-50/80 to-slate-50/80 rounded-2xl border border-gray-200 shadow-lg">
                <div className="text-3xl font-bold text-gray-700 mb-2">{score.total}</div>
                <div className="text-gray-600 font-medium">Total de preguntas</div>
              </div>
              <div className="text-center p-6 backdrop-blur-md bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-2xl border border-green-200 shadow-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">{score.correct}</div>
                <div className="text-green-700 font-medium">Respuestas correctas</div>
              </div>
              <div className="text-center p-6 backdrop-blur-md bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-200 shadow-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">{score.percentage}%</div>
                <div className="text-blue-700 font-medium">Puntuación final</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setSubmitted(false);
                  setShowResults(false);
                }}
                className="backdrop-blur-md bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reintentar
                </div>
              </button>
              <button
                onClick={() => router.push(`/teacher/class/${id}`)}
                className="backdrop-blur-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a la Clase
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

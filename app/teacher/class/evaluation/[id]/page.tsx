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
      <div className="relative flex size-full min-h-screen flex-col bg-slate-50">
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0d80f2] mx-auto mb-8"></div>
                  <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-4">Cargando evaluación</h2>
                  <p className="text-[#49739c] text-base">Obteniendo las preguntas...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const score = submitted ? calculateScore() : null;

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
                onClick={() => router.push(`/teacher/class/${id}`)}
              >
                ← Volver a la Clase
              </button>
            </div>
          </div>
        </header>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-[#0d141c] text-[32px] font-bold leading-tight">
                  Evaluación de Clase
                </h1>
                <p className="text-[#49739c] text-base mt-2">
                  {preguntas.length} preguntas • {submitted ? 'Completado' : 'En progreso'}
                </p>
              </div>
              
              {submitted && score && (
                <div className="bg-white rounded-lg border border-[#cedbe8] p-4 text-center">
                  <div className={`text-2xl font-bold ${score.percentage >= 70 ? 'text-green-600' : score.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {score.percentage}%
                  </div>
                  <div className="text-sm text-[#49739c]">
                    {score.correct} de {score.total} correctas
                  </div>
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {preguntas.map((pregunta, questionIndex) => (
                <div key={pregunta.id} className="bg-white rounded-lg border border-[#cedbe8] p-6">
                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#0d80f2] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {questionIndex + 1}
                      </div>
                      <h3 className="text-[#0d141c] text-lg font-semibold leading-tight">
                        {pregunta.pregunta}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {[1, 2, 3, 4].map((alternativeIndex) => {
                      const alternativeText = getAlternativeText(pregunta, alternativeIndex);
                      const isSelected = selectedAnswers[questionIndex] === alternativeIndex;
                      const isCorrect = pregunta.alternativa_correcta === alternativeIndex;
                      const showFeedback = submitted && isSelected;
                      
                      let buttonClass = "flex items-center gap-3 w-full p-4 rounded-lg border text-left transition-all ";
                      
                      if (submitted) {
                        if (isCorrect) {
                          buttonClass += "border-green-500 bg-green-50 text-green-800";
                        } else if (isSelected && !isCorrect) {
                          buttonClass += "border-red-500 bg-red-50 text-red-800";
                        } else {
                          buttonClass += "border-[#cedbe8] bg-gray-50 text-[#49739c]";
                        }
                      } else {
                        if (isSelected) {
                          buttonClass += "border-[#0d80f2] bg-blue-50 text-[#0d80f2]";
                        } else {
                          buttonClass += "border-[#cedbe8] bg-white text-[#0d141c] hover:border-[#0d80f2] hover:bg-blue-50";
                        }
                      }

                      return (
                        <div key={alternativeIndex}>
                          <button
                            onClick={() => handleAnswerSelect(questionIndex, alternativeIndex)}
                            className={buttonClass}
                            disabled={submitted}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                              isSelected 
                                ? (submitted && isCorrect ? 'border-green-500 bg-green-500' : submitted && !isCorrect ? 'border-red-500 bg-red-500' : 'border-[#0d80f2] bg-[#0d80f2]')
                                : submitted && isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300'
                            }`}>
                              {(isSelected || (submitted && isCorrect)) && (
                                <svg
                                  className="w-3 h-3 text-white m-auto"
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
                            <span className="font-medium">{String.fromCharCode(64 + alternativeIndex)}.</span>
                            <span>{alternativeText}</span>
                          </button>
                          
                          {showFeedback && (
                            <div className={`mt-2 p-3 rounded-lg text-sm ${
                              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              <div className="flex items-start gap-2">
                                <svg
                                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  {isCorrect ? (
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  ) : (
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"
                                    />
                                  )}
                                </svg>
                                <span>{getRetroalimentacion(pregunta, alternativeIndex)}</span>
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
                  className="bg-[#0d80f2] text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar Respuestas
                </button>
              </div>
            )}

            {/* Results Summary */}
            {submitted && score && (
              <div className="mt-8 bg-white rounded-lg border border-[#cedbe8] p-6">
                <h3 className="text-[#0d141c] text-xl font-semibold mb-4">Resumen de Resultados</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#0d141c]">{score.total}</div>
                    <div className="text-sm text-[#49739c]">Total de preguntas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{score.correct}</div>
                    <div className="text-sm text-green-600">Respuestas correctas</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-[#0d80f2]">{score.percentage}%</div>
                    <div className="text-sm text-[#0d80f2]">Puntuación final</div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setSelectedAnswers({});
                      setSubmitted(false);
                      setShowResults(false);
                    }}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700"
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={() => router.push(`/teacher/class/${id}`)}
                    className="bg-[#0d80f2] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600"
                  >
                    Volver a la Clase
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

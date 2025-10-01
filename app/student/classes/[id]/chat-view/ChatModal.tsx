'use client';

import { useState, useRef, useEffect } from 'react';
import { apiService, TipoEntidadEnum } from '../../../../lib/api';
import type { 
  EstudianteResponseDTO, 
  ClaseResponse, 
  PerfilCognitivoType,
  ChatGeneralRequestDTO,
  ConversacionResponseDTO,
  TTSRequestDTO,
  STTRequestDTO
} from '../../../../lib/api';
import styles from './ChatModal.module.css';

// Tipos para el chat con audio
type ResponseMode = 'text' | 'audio' | 'visual';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  audioUrl?: string; // URL del audio para reproducir
  isAudioMessage?: boolean; // Si el mensaje original fue de audio
}

interface ChatModalProps {
  showChatbot: boolean;
  setShowChatbot: (show: boolean) => void;
  student: EstudianteResponseDTO;
  classData: ClaseResponse;
  classId: string;
  fotoCaricaturaDocente: string;
  nombreDocente: string;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  historialConversaciones: ConversacionResponseDTO[];
  setHistorialConversaciones: React.Dispatch<React.SetStateAction<ConversacionResponseDTO[]>>;
  loadingHistorial: boolean;
  setLoadingHistorial: (loading: boolean) => void;
}

export default function ChatModal({
  showChatbot,
  setShowChatbot,
  student,
  classData,
  classId,
  fotoCaricaturaDocente,
  nombreDocente,
  chatMessages,
  setChatMessages,
  currentMessage,
  setCurrentMessage,
  isTyping,
  setIsTyping,
  historialConversaciones,
  setHistorialConversaciones,
  loadingHistorial,
  setLoadingHistorial
}: ChatModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Estados para funcionalidades de audio
  const [responseMode, setResponseMode] = useState<ResponseMode>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<Record<string, string>>({});
  const [selectedVoice, setSelectedVoice] = useState('aura-2-celeste-es');
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  // Cargar voces disponibles al montar el componente
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voicesResponse = await apiService.getAvailableVoices();
        setAvailableVoices(voicesResponse.voices);
      } catch (error) {
        console.error('Error al cargar voces:', error);
        // Voces por defecto si falla la carga
        setAvailableVoices({
          'aura-2-celeste-es': 'Celeste (Español, Femenina)',
          'aura-2-diego-es': 'Diego (Español, Masculina)'
        });
      }
    };
    
    if (showChatbot) {
      loadVoices();
    }
  }, [showChatbot]);

  // Función para iniciar grabación de audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Por favor, asegúrate de dar permisos.');
    }
  };

  // Función para detener grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Función para procesar audio grabado (STT)
  const processRecordedAudio = async () => {
    if (recordedChunks.length === 0) return;

    setIsProcessingAudio(true);
    try {
      const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

      // Convertir audio a texto usando STT
      const sttResponse = await apiService.speechToText(Number(classId), {
        audio_file: audioFile,
        language: 'es',
        save_transcript: true,
        save_audio: true
      });

      // Usar el texto transcrito como mensaje
      if (sttResponse.transcript) {
        setCurrentMessage(sttResponse.transcript);
        
        // Crear mensaje de usuario indicando que fue de audio
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: sttResponse.transcript,
          timestamp: new Date(),
          isAudioMessage: true
        };

        setChatMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        
        // Enviar mensaje automáticamente
        await sendMessageWithText(sttResponse.transcript);
      }

      setRecordedChunks([]);
    } catch (error) {
      console.error('Error al procesar audio:', error);
      alert('Error al procesar el audio. Por favor, inténtalo de nuevo.');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  // Función para convertir respuesta a audio (TTS)
  const convertResponseToAudio = async (text: string): Promise<string | null> => {
    if (responseMode !== 'audio') return null;
    
    setIsLoadingTTS(true);
    try {
      const ttsResponse = await apiService.textToSpeech(Number(classId), {
        text,
        voice_model: selectedVoice,
        save_to_db: true
      });

      return ttsResponse.download_url;
    } catch (error) {
      console.error('Error en TTS:', error);
      return null;
    } finally {
      setIsLoadingTTS(false);
    }
  };

  // Función para reproducir audio
  const playAudio = (audioUrl: string) => {
    if (currentPlayingAudio === audioUrl) {
      // Si ya está reproduciéndose, pausar
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentPlayingAudio(null);
      }
    } else {
      // Reproducir nuevo audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setCurrentPlayingAudio(audioUrl);
        
        audioRef.current.onended = () => {
          setCurrentPlayingAudio(null);
        };
      }
    }
  };

  const cargarHistorialConversaciones = async () => {
    if (!student || !classId) return;

    try {
      setLoadingHistorial(true);
      const historial = await apiService.obtenerHistorialChat(student.id, Number(classId));
      setHistorialConversaciones(historial);
      
      // Convertir el historial de la BD al formato del chat local
      const mensajesFormateados: ChatMessage[] = historial.map(conv => ({
        id: conv.id.toString(),
        type: conv.tipo_emisor === TipoEntidadEnum.ESTUDIANTE ? 'user' as const : 'bot' as const,
        content: conv.mensaje,
        timestamp: new Date(conv.created_at)
      }));
      
      setChatMessages(mensajesFormateados);
    } catch (error) {
      console.error('Error al cargar historial de conversaciones:', error);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const normalizePerfil = (perfil: string | undefined): PerfilCognitivoType => {
    if (!perfil) return 'visual';
    const normalized = perfil.toLowerCase();
    const validProfiles: PerfilCognitivoType[] = ['visual', 'auditivo', 'lector', 'kinestesico'];
    return validProfiles.includes(normalized as PerfilCognitivoType) 
      ? normalized as PerfilCognitivoType 
      : 'visual';
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !student || !classData) return;
    await sendMessageWithText(currentMessage);
    setCurrentMessage('');
  };

  const sendMessageWithText = async (messageText: string) => {
    if (!messageText.trim() || !student || !classData) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: messageText,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const requestData: ChatGeneralRequestDTO = {
        perfil_cognitivo: normalizePerfil(student.perfil_cognitivo),
        perfil_personalidad: student.perfil_personalidad || 'Equilibrado',
        nivel_conocimientos: 'basico',
        id_clase: Number(classId),
        historial_mensajes: chatMessages.map(msg => ({
          tipo: msg.type,
          contenido: msg.content
        })),
        mensaje_actual: messageText
      };

      const response = await apiService.chatGeneralPersonalizado(student.id, requestData);
      
      // Preparar mensaje del bot
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: response.contenido_generado,
        timestamp: new Date()
      };

      // Si el modo de respuesta es audio, convertir a audio
      if (responseMode === 'audio') {
        const audioUrl = await convertResponseToAudio(response.contenido_generado);
        if (audioUrl) {
          botMessage.audioUrl = audioUrl;
        }
      }

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    setHistorialConversaciones([]);
  };

  // Cargar historial cuando se abre el chatbot
  useEffect(() => {
    if (showChatbot && student && classId && chatMessages.length === 0) {
      cargarHistorialConversaciones();
    }
  }, [showChatbot, student, classId]);

  // Procesar audio grabado automáticamente
  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      processRecordedAudio();
    }
  }, [recordedChunks, isRecording]);

  if (!showChatbot) return null;

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${styles['animate-fade-in']}`}>
      <div className={`${styles['glass-effect']} rounded-2xl shadow-2xl w-full max-w-3xl h-[700px] flex flex-col border border-gray-200/50 overflow-hidden`}>
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className={`relative ${styles['animate-floating']}`}>
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-3 border-white/30 shadow-lg">
                   <img 
                    src={fotoCaricaturaDocente} 
                    alt={nombreDocente}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'http://localhost:8000/public/images/caric.jpeg';
                    }}
                  />
                </div>
                {/* Indicador de estado online */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full flex items-center justify-center ${styles['animate-pulse-glow']}`}>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-white drop-shadow-sm">{nombreDocente}</h3>
                <p className="text-blue-100 text-sm font-medium">
                  🤖 Asistente IA para {classData?.nombre}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-100">En línea</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {loadingHistorial && (
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-transparent"></div>
                  <span>Cargando...</span>
                </div>
              )}
              
              {/* Botón limpiar chat */}
              <button
                onClick={clearChat}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
                title="Limpiar chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                Limpiar
              </button>
              
              {/* Botón cerrar */}
              <button
                onClick={() => setShowChatbot(false)}
                className="p-2 hover:bg-white/20 rounded-full text-white transition-all duration-200"
                title="Cerrar chat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Configuración de modo de respuesta mejorada */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700">Modo de respuesta:</span>
              </div>
              
              <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => setResponseMode('text')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    responseMode === 'text' 
                      ? 'bg-blue-500 text-white shadow-md scale-105' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <span className="text-base">📝</span>
                  <span>Texto</span>
                </button>
                
                <button
                  onClick={() => setResponseMode('audio')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    responseMode === 'audio' 
                      ? 'bg-green-500 text-white shadow-md scale-105' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <span className="text-base">🔊</span>
                  <span>Audio</span>
                </button>
                
                <button
                  onClick={() => setResponseMode('visual')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    responseMode === 'visual' 
                      ? 'bg-purple-500 text-white shadow-md scale-105' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  disabled
                  title="Próximamente disponible"
                >
                  <span className="text-base">🎨</span>
                  <span>Visual</span>
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full ml-1">Pronto</span>
                </button>
              </div>
            </div>
            
            {responseMode === 'audio' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Voz:</span>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                >
                  {Object.entries(availableVoices).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        {/* Mensajes del chat con diseño mejorado */}
        <div className={`flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50/30 to-white ${styles['custom-scrollbar']}`}>
          {loadingHistorial ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-blue-200 animate-pulse"></div>
              </div>
              <p className="text-gray-600 mt-4 font-medium">Cargando historial de conversaciones...</p>
              <p className="text-gray-400 text-sm mt-1">Preparando tu experiencia personalizada</p>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">👋</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-3 border-white flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-gray-800 mb-2">
                ¡Hola {student?.nombre}! 🌟
              </h4>
              <p className="text-gray-600 font-medium mb-3">
                Soy <span className="text-blue-600 font-semibold">{nombreDocente}</span>, tu profesor personalizado con IA
              </p>
              <div className="max-w-md space-y-2 text-gray-500">
                <p className="text-sm">Estoy aquí para ayudarte con <span className="font-semibold text-blue-600">{classData?.nombre}</span></p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">📚 Explicaciones</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✏️ Tareas</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">📋 Planes de estudio</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">🎯 Evaluaciones</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${message.type === 'user' ? styles['animate-slide-in-right'] : styles['animate-slide-in-left']}`}>
                  <div className={`group max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    {/* Avatar para mensajes del bot */}
                    {message.type === 'bot' && (
                      <div className="flex items-end gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white shadow-md">
                          <img 
                            src={fotoCaricaturaDocente} 
                            alt={nombreDocente}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'http://localhost:8000/public/images/caric.jpeg';
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{nombreDocente}</span>
                      </div>
                    )}
                    
                    <div className={`${styles['message-bubble']} relative p-4 rounded-2xl shadow-md transition-all duration-200 group-hover:shadow-lg ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-12' 
                        : 'bg-white border border-gray-200 mr-12'
                    }`}>
                      {/* Contenido del mensaje */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className={`whitespace-pre-wrap text-sm leading-relaxed ${
                            message.type === 'user' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {message.content}
                          </div>
                          
                          {/* Indicadores y metadata */}
                          <div className="flex items-center gap-2 mt-3">
                            {/* Indicador si el mensaje fue de audio */}
                            {message.isAudioMessage && (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                message.type === 'user' 
                                  ? 'bg-blue-400/30 text-blue-100' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                                </svg>
                                <span>Mensaje de voz</span>
                              </div>
                            )}
                            
                            {/* Timestamp */}
                            <span className={`text-xs font-medium ${
                              message.type === 'user' ? 'text-blue-200' : 'text-gray-400'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Controles de audio para respuestas del bot */}
                        {message.type === 'bot' && (message.audioUrl || (responseMode === 'audio' && isLoadingTTS)) && (
                          <div className="flex flex-col gap-2">
                            {/* Botón de reproducir audio */}
                            {message.audioUrl && (
                              <button
                                onClick={() => playAudio(message.audioUrl!)}
                                className={`p-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${
                                  currentPlayingAudio === message.audioUrl
                                    ? 'bg-green-500 text-white scale-110'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:scale-105'
                                }`}
                                title={currentPlayingAudio === message.audioUrl ? 'Pausar audio' : 'Reproducir audio'}
                              >
                                {currentPlayingAudio === message.audioUrl ? (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                  </svg>
                                ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                )}
                              </button>
                            )}
                            
                            {/* Indicador de carga TTS */}
                            {responseMode === 'audio' && isLoadingTTS && index === chatMessages.length - 1 && (
                              <div className="flex items-center gap-2 px-2 py-1 bg-green-100 rounded-full">
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-green-500 border-t-transparent"></div>
                                <span className="text-xs text-green-700 font-medium">Generando audio...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Flecha de mensaje */}
                      <div className={`absolute top-4 ${
                        message.type === 'user' 
                          ? '-right-2 border-l-blue-500' 
                          : '-left-2 border-r-white'
                      } w-0 h-0 border-t-8 border-b-8 border-t-transparent border-b-transparent ${
                        message.type === 'user' ? 'border-l-8' : 'border-r-8'
                      }`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Indicador de escritura mejorado */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-end gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white shadow-md">
                  <img 
                    src={fotoCaricaturaDocente} 
                    alt={nombreDocente}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'http://localhost:8000/public/images/caric.jpeg';
                    }}
                  />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm font-medium">{nombreDocente} está escribiendo</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input del chat con diseño moderno */}
        <div className="p-6 bg-white border-t border-gray-200">
          {/* Barra de estado superior */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {isRecording ? '🔴 Grabando...' : 
                   isProcessingAudio ? '🎵 Procesando audio...' : 
                   `Charlando con ${nombreDocente}`}
                </span>
              </div>
              
              {/* Indicador del modo actual */}
              {responseMode === 'audio' && !isRecording && !isProcessingAudio && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                  <span className="text-xs font-semibold text-green-700">Respuestas en audio</span>
                </div>
              )}
            </div>
            
            {/* Sugerencias rápidas */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-gray-400">Sugerencias:</span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentMessage("¿Puedes explicarme este tema?")}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs text-gray-600 transition-colors"
                >
                  Explicar tema
                </button>
                <button 
                  onClick={() => setCurrentMessage("¿Cómo puedo estudiar mejor?")}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs text-gray-600 transition-colors"
                >
                  Consejos estudio
                </button>
              </div>
            </div>
          </div>
          
          {/* Área de input principal */}
          <div className="relative">
            <div className="flex gap-3 items-end">
              {/* Botón de grabación de audio mejorado */}
              <div className="relative">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTyping || isProcessingAudio}
                  className={`${styles['audio-button']} group relative p-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                    isRecording 
                      ? `bg-red-500 text-white ${styles['animate-recording-pulse']} scale-110 ${styles['recording-waves']}` 
                      : `${styles['gradient-blue']} text-white hover:scale-105`
                  }`}
                  title={isRecording ? 'Detener grabación' : 'Grabar mensaje de voz'}
                >
                  {isProcessingAudio ? (
                    <div className="relative">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    </div>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="relative z-10">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  )}
                  
                  {/* Efecto de ondas cuando está grabando */}
                  {isRecording && (
                    <>
                      <div className="absolute inset-0 rounded-2xl bg-red-400 animate-ping opacity-75"></div>
                      <div className="absolute inset-0 rounded-2xl bg-red-300 animate-pulse opacity-50"></div>
                    </>
                  )}
                  
                  {/* Tooltip mejorado */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-800 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap">
                      {isRecording ? 'Haz clic para detener' : 'Mantén presionado para hablar'}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </button>
              </div>
              
              {/* Campo de texto mejorado */}
              <div className="flex-1 relative">
                <textarea
                  placeholder={
                    isRecording ? "🎤 Grabando... Haz clic en el micrófono para detener" : 
                    isProcessingAudio ? "🎵 Procesando tu mensaje de voz..." :
                    "Escribe tu pregunta o mensaje..."
                  }
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none bg-gray-50 focus:bg-white min-h-[50px] max-h-[120px]"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isRecording && !isProcessingAudio) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isTyping || isRecording || isProcessingAudio}
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '50px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
                
                {/* Contador de caracteres */}
                <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                  {currentMessage.length}/1000
                </div>
              </div>
              
              {/* Botón de enviar mejorado */}
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim() || isTyping || isRecording || isProcessingAudio}
                className="group relative p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                title="Enviar mensaje"
              >
                {isTyping ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform group-hover:translate-x-0.5 transition-transform duration-200">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                  </svg>
                )}
              </button>
            </div>
            
            {/* Indicadores de progreso */}
            {(isRecording || isProcessingAudio) && (
              <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isRecording ? (
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    ) : (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {isRecording ? '🎤 Grabando tu mensaje...' : '🎵 Convirtiendo audio a texto...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isRecording ? 'Habla claramente. Haz clic en el micrófono cuando termines.' : 'Esto puede tomar unos segundos...'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Información adicional */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Powered by IA</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Press</span>
                <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">Enter</kbd>
                <span>to send</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Seguro y privado</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Audio player oculto para reproducción */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
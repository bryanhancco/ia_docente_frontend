"use client";
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { apiService, TipoEntidadEnum, ChatGeneralRequestDTO, ConversacionResponseDTO, EstudianteResponseDTO } from '../../../../lib/api';
import { AudioMessage } from './AudioMessage';
import { AudioRecordingIndicator } from './AudioRecordingIndicator';

type ChatMessage = {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  isAudioMessage?: boolean;
};

interface ChatModalProps {
  show: boolean;
  onClose: () => void;
  student: EstudianteResponseDTO | null;
  classId: number;
  docenteName?: string;
  docentePhoto?: string; // URL
}

console.log("asdasdasdasdsa==============================", process.env.S3_BUCKET_BASE_URL)

export const ChatModal: React.FC<ChatModalProps> = ({ show, onClose, student, classId, docenteName = 'Docente', docentePhoto }) => {
  const normalizeApiUrl = (maybeUrl?: string | null) => {
    if (!maybeUrl) return undefined;
    const url = String(maybeUrl);
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = (process.env.S3_BUCKET_BASE_URL || '').replace(/\/$/, '');
    if (!base) return url;
    return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [responseMode, setResponseMode] = useState<'text' | 'audio'>('text');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (show && student && classId) {
      cargarHistorial();
    }
  }, [show, student, classId]);

  const cargarHistorial = async () => {
    if (!student) return;
    setLoading(true);
    try {
      const historial = await apiService.obtenerHistorialChat(student.id, Number(classId), 200);
      console.log(historial)
      const mapped = historial.map((c: ConversacionResponseDTO) => ({
        id: c.id.toString(),
        type: c.tipo_emisor === TipoEntidadEnum.ESTUDIANTE ? 'user' : 'bot',
        content: c.mensaje || '',
        timestamp: new Date(c.created_at),
        audioUrl: normalizeApiUrl(c.archivo) as string | undefined,
        isAudioMessage: !!c.archivo,
      } as ChatMessage));

      // Mostrar la conversación en orden cronológico (oldest-first)
      setMessages(mapped);

      // Colocar el scroll al final para mostrar el mensaje más reciente
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 50);
    } catch (error) {
      console.error('Error cargando historial de chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizePerfil = (p: any) => {
    if (!p) return 'visual';
    const val = String(p).toLowerCase();
    if (val.includes('visual')) return 'visual';
    if (val.includes('audit')) return 'auditivo';
    if (val.includes('lector') || val.includes('leer')) return 'lector';
    return 'visual';
  };

  const perfilForBackend = (perfil: string) => {
    if (!perfil) return 'Visual';
    const p = String(perfil).toLowerCase();
    return p.charAt(0).toUpperCase() + p.slice(1);
  };

  const sendText = async () => {
    if (!input.trim() || !student) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

  // Append so the newest messages appear at the bottom
  setMessages(prev => [...prev, userMsg]);
    setInput('');

    setIsSending(true);
    try {
      // NOTE: backend registra automáticamente la conversación del estudiante y la respuesta del chatbot.
      // Enviar request al endpoint que genera la respuesta (el backend hará los inserts necesarios y devolverá metadata)
      const perfilNormalized = normalizePerfil(student.perfil_cognitivo);
      const requestPayload = {
        perfil_cognitivo: perfilForBackend(perfilNormalized),
        perfil_personalidad: student.perfil_personalidad || 'Equilibrado',
        nivel_conocimientos: 'Secundaria',
        id_clase: Number(classId),
        // messages are stored oldest-first in this component; send them as-is
        historial_mensajes: messages.map(m => ({ tipo: m.type, contenido: m.content })),
        mensaje_actual: userMsg.content,
      } as any;

      const response = await apiService.chatGeneralPersonalizado(student.id, requestPayload);
      const botText = (response as any).contenido_generado || (response as any).contenido || response;

      // Construir el mensaje del bot en el frontend. Para id y timestamps confiamos en la BD; si el backend devuelve conversacion_id lo usamos
      const botMessage: ChatMessage = {
        id: response?.metadata?.conversacion_id ? String(response.metadata.conversacion_id) : (Date.now() + 1).toString(),
        type: 'bot',
        content: botText,
        timestamp: new Date()
      };

      // Si el backend devolvió conversacion_id y el modo audio está activado, pedir TTS pasando esa conversacion_id
      if (responseMode === 'audio') {
        try {
          const convId = response?.metadata?.conversacion_id;
          const tts = await apiService.textToSpeech(classId, { text: botText, save_to_db: true, conversacion_id: convId });
          if ((tts as any).download_url) {
            botMessage.audioUrl = normalizeApiUrl((tts as any).download_url);
            botMessage.isAudioMessage = true;
          }
        } catch (e) {
          console.warn('TTS falló:', e);
        }
      }

  setMessages(prev => [...prev, botMessage]);

  // show the new bot response at bottom
  setTimeout(() => { if (messagesContainerRef.current) messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight; }, 50);
    } catch (error) {
      console.error('Error enviando mensaje de chat:', error);
    } finally {
      setIsSending(false);
    }
  };

  // --- Audio recording and STT ---
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Tu navegador no soporta grabación de audio.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.addEventListener('dataavailable', (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      });

      mediaRecorder.addEventListener('stop', async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });

        // Mostrar mensaje provisional
        const provisionalMsg: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: 'Audio enviado (procesando...)',
          timestamp: new Date(),
          isAudioMessage: true,
        };

  setMessages(prev => [...prev, provisionalMsg]);

        setIsSending(true);
        try {
          // Mandar STT
          const stt = await apiService.speechToText(classId, { audio_file: file, save_transcript: true, save_audio: true });

          const transcript = (stt as any).transcript || '';
          const audioUrlRaw = (stt as any).transcript_download_url || (stt as any).transcript_file || undefined;
          const audioUrl = normalizeApiUrl(audioUrlRaw);

          // Registrar conversación del estudiante (con posible archivo)
          // Nota: el backend de chat_general registra automáticamente ambas conversaciones; si deseas mantener registro manual,
          // puedes descomentar la siguiente línea. Por ahora evitamos duplicados.
          // await apiService.crearConversacion({ ... })

          // Reemplazar provisional con mensaje real (texto)
          setMessages(prev => prev.map(m => m.id === provisionalMsg.id ? ({ ...m, content: transcript || m.content, audioUrl }) : m));

          // Procesar igual que un mensaje de texto: llamar al endpoint que genera la respuesta (el backend hará los inserts)
          const perfilNormalized2 = normalizePerfil(student!.perfil_cognitivo);
          const requestPayload2 = {
            perfil_cognitivo: perfilForBackend(perfilNormalized2),
            perfil_personalidad: student!.perfil_personalidad || 'Equilibrado',
            nivel_conocimientos: 'Secundaria',
            id_clase: Number(classId),
            // messages are oldest-first; send them as-is
            historial_mensajes: messages.map(m => ({ tipo: m.type, contenido: m.content })),
            mensaje_actual: transcript || '',
          } as any;

          const response = await apiService.chatGeneralPersonalizado(student!.id, requestPayload2);
          const botText = (response as any).contenido_generado || (response as any).contenido || response;

          const botMessage: ChatMessage = {
            id: response?.metadata?.conversacion_id ? String(response.metadata.conversacion_id) : (Date.now() + 1).toString(),
            type: 'bot',
            content: botText,
            timestamp: new Date()
          };

          if (responseMode === 'audio') {
            try {
              const convId = response?.metadata?.conversacion_id;
              const tts = await apiService.textToSpeech(classId, { text: botText, save_to_db: true, conversacion_id: convId });
              if ((tts as any).download_url) {
                botMessage.audioUrl = normalizeApiUrl((tts as any).download_url);
                botMessage.isAudioMessage = true;
              }
            } catch (e) {
              console.warn('TTS falló:', e);
            }
          }

          setMessages(prev => [...prev, botMessage]);

          // ensure newest is visible (scroll to bottom)
          setTimeout(() => { if (messagesContainerRef.current) messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight; }, 50);

        } catch (error) {
          console.error('Error en STT o procesamiento:', error);
        } finally {
          setIsSending(false);
        }
      });

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      alert('No se pudo acceder al micrófono.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      const tracks = (mediaRecorderRef.current as any).stream?.getTracks?.() || [];
      tracks.forEach((t: MediaStreamTrack) => t.stop());
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full md:max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden m-4 flex flex-col">
        {/* Header: docente info + mode toggle */}
        <div className="flex items-center justify-between gap-4 p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {docentePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={normalizeApiUrl(docentePhoto) || ''} alt={docenteName} className="w-full h-full object-cover" />
              ) : (
                <div className="text-sm font-semibold text-gray-700">{(docenteName || 'Docente').split(' ').slice(0,1)[0]}</div>
              )}
            </div>
            <div>
              <div className="text-sm text-gray-600">Docente</div>
              <div className="font-medium">{docenteName}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">Respuesta:</div>
            <div className="bg-gray-100 rounded-xl p-1 flex items-center">
              <button
                onClick={() => setResponseMode('text')}
                className={`px-3 py-1 rounded-lg text-sm ${responseMode === 'text' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>
                Texto
              </button>
              <button
                onClick={() => setResponseMode('audio')}
                className={`px-3 py-1 rounded-lg text-sm ${responseMode === 'audio' ? 'bg-white shadow text-gray-900' : 'text-gray-600'}`}>
                Audio
              </button>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>

        {/* Body: mensajes (newest first) */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="text-center text-sm text-gray-500">Cargando historial...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-gray-500">Aún no hay mensajes. Empieza la conversación diciendo hola 👋</div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'bot' && (
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                      {docentePhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={normalizeApiUrl(docentePhoto)} alt={docenteName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-sm font-semibold text-gray-700">{(docenteName || 'Docente').split(' ').slice(0,1)[0]}</div>
                      )}
                    </div>
                  )}

                  <div className={`max-w-[85%] ${msg.type === 'user' ? 'ml-auto text-right' : ''}`}>
                    <div className={`inline-block p-4 rounded-2xl shadow-lg ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-100'}`}>
                      {msg.isAudioMessage ? (
                        <AudioMessage message={{ id: msg.id, type: msg.type, content: msg.content, timestamp: msg.timestamp, audioUrl: msg.audioUrl, isAudioMessage: msg.isAudioMessage }} isUser={msg.type === 'user'} avatarUrl={msg.type === 'bot' ? normalizeApiUrl(docentePhoto) : undefined} userName={msg.type === 'bot' ? docenteName : undefined} />
                      ) : (
                        msg.type === 'bot' ? (
                          <div className="prose max-w-none text-sm text-gray-800">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <div className="text-sm">{msg.content}</div>
                        )
                      )}

                      <div className="text-xs text-gray-400 mt-2">{msg.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: input + controls */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isRecording) stopRecording(); else startRecording();
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {isRecording ? '●' : '🎤'}
            </button>

            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendText(); }}
              placeholder="Escribe tu pregunta o usa el micrófono..."
              className="flex-1 px-4 py-3 rounded-xl border bg-white outline-none"
            />

            <button onClick={sendText} disabled={isSending} className={`px-4 py-2 rounded-xl font-semibold ${isSending ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white'}`}>
              Enviar
            </button>
          </div>
        </div>

        {/* Overlay recording indicator */}
        <AudioRecordingIndicator isRecording={isRecording} onStopRecording={stopRecording} duration={0} />
      </div>
    </div>
  );
};

export default ChatModal;

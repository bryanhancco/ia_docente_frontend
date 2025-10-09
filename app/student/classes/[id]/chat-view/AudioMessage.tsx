import React, { useState, useRef, useEffect } from 'react';
import { AudioWaveform } from './AudioWaveform';

interface AudioMessageProps {
  message: {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    audioUrl?: string;
    isAudioMessage?: boolean;
  };
  isUser: boolean;
  avatarUrl?: string;
  userName?: string;
}

export const AudioMessage: React.FC<AudioMessageProps> = ({ 
  message, 
  isUser, 
  avatarUrl, 
  userName 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (message.audioUrl) {
      const audio = new Audio(message.audioUrl);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      return () => {
        audio.pause();
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
      };
    }
  }, [message.audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span>{isUser ? '👤' : '🤖'}</span>
          )}
        </div>
      </div>

      {/* Mensaje de audio */}
      <div className={`flex-1 max-w-md ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Nombre y timestamp */}
        <div className={`flex items-center gap-2 mb-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-sm font-medium text-gray-700">
            {isUser ? 'Tú' : userName || 'IA Docente'}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {message.isAudioMessage && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              🎤 Audio
            </span>
          )}
        </div>

        {/* Contenedor del mensaje de audio */}
        <div className={`
          relative p-4 rounded-2xl shadow-lg border
          ${isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-300' 
            : 'bg-white text-gray-800 border-gray-200'
          }
          min-w-[280px] max-w-full
        `}>
          {/* Botón de play/pause */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={togglePlayPause}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                transition-all duration-200 hover:scale-105 shadow-lg
                ${isUser 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
              `}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Información de duración */}
            <div className="flex-1">
              <div className={`text-sm font-medium ${isUser ? 'text-white' : 'text-gray-700'}`}>
                {isPlaying ? 'Reproduciendo...' : 'Audio mensaje'}
              </div>
              <div className={`text-xs ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          {/* Visualización de ondas de audio */}
          <div className="mb-3">
            <AudioWaveform 
              isPlaying={isPlaying}
              audioUrl={message.audioUrl}
              height={40}
              color={isUser ? '#FFFFFF' : '#3B82F6'}
              className="rounded-lg"
            />
          </div>

          {/* Barra de progreso */}
          <div className={`w-full h-1 rounded-full mb-3 ${isUser ? 'bg-white/20' : 'bg-gray-200'}`}>
            <div 
              className={`h-full rounded-full transition-all duration-100 ${
                isUser ? 'bg-white' : 'bg-blue-500'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>

          {/* Botón para mostrar/ocultar transcripción */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`
              text-xs underline transition-opacity hover:opacity-80
              ${isUser ? 'text-blue-100' : 'text-gray-600'}
            `}
          >
            {showTranscript ? 'Ocultar transcripción' : 'Ver transcripción'}
          </button>
        </div>

        {/* Transcripción */}
        {showTranscript && (
          <div className={`
            mt-2 p-3 rounded-lg text-sm leading-relaxed
            ${isUser 
              ? 'bg-blue-50 text-blue-800 border border-blue-200' 
              : 'bg-gray-50 text-gray-700 border border-gray-200'
            }
            max-w-full
          `}>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.82L4.29 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.29l4.093-3.82a1 1 0 011-.104zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Transcripción:</span>
            </div>
            <p className="italic">&quot;{message.content}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
};
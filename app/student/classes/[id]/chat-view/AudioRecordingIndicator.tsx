import React, { useEffect, useState } from 'react';

interface AudioRecordingIndicatorProps {
  isRecording: boolean;
  onStopRecording: () => void;
  duration: number;
}

export const AudioRecordingIndicator: React.FC<AudioRecordingIndicatorProps> = ({
  isRecording,
  onStopRecording,
  duration
}) => {
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white rounded-2xl p-8 shadow-2xl border-4 border-red-200 max-w-sm w-full mx-4">
        {/* Título */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            🎤 Grabando Audio
          </h3>
          <p className="text-gray-600">
            Habla claramente hacia el micrófono
          </p>
        </div>

        {/* Visualización de ondas de grabación */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-end gap-1 h-20">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-red-500 rounded-full transition-all duration-150"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  animationDelay: `${i * 0.05}s`,
                  animation: 'recording-wave 0.8s ease-in-out infinite alternate'
                }}
              />
            ))}
          </div>
        </div>

        {/* Tiempo de grabación */}
        <div className="text-center mb-6">
          <div className="text-3xl font-mono font-bold text-red-600">
            {formatTime(recordingTime)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Tiempo de grabación
          </div>
        </div>

        {/* Indicador pulsante */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            {/* Ondas expansivas */}
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-ping animation-delay-100"></div>
          </div>
        </div>

        {/* Botones de control */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onStopRecording}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Detener
          </button>
        </div>

        {/* Consejos */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Consejos para una mejor grabación:</p>
              <ul className="text-xs space-y-1">
                <li>• Habla con claridad y volumen normal</li>
                <li>• Mantén el micrófono cerca</li>
                <li>• Evita ruidos de fondo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes recording-wave {
          0% { height: 20%; }
          100% { height: 80%; }
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  );
};
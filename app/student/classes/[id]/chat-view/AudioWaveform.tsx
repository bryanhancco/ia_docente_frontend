import React, { useState, useRef, useEffect } from 'react';

interface AudioWaveformProps {
  isPlaying: boolean;
  audioUrl?: string;
  className?: string;
  height?: number;
  color?: string;
  responsive?: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  isPlaying, 
  audioUrl,
  className = '',
  height = 50,
  color = '#3B82F6',
  responsive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Crear datos simulados de ondas cuando no hay audio real
  const generateSimulatedWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const centerY = canvas.height / 2;
    const barCount = Math.floor(width / 4);
    
    ctx.clearRect(0, 0, width, canvas.height);
    ctx.fillStyle = color;

    for (let i = 0; i < barCount; i++) {
      const x = i * 4;
      const amplitude = isPlaying 
        ? Math.random() * (canvas.height * 0.4) + 10
        : Math.random() * 5 + 3;
      
      const barHeight = Math.sin(Date.now() * 0.005 + i * 0.1) * amplitude;
      
      ctx.fillRect(
        x, 
        centerY - barHeight / 2, 
        2, 
        Math.abs(barHeight)
      );
    }
  };

  // Crear visualización de audio real
  const drawRealWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / bufferLength * 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.8;
      
      ctx.fillRect(
        x, 
        height - barHeight, 
        barWidth, 
        barHeight
      );
      
      x += barWidth + 1;
    }
  };

  // Inicializar audio context
  const initializeAudio = async () => {
    if (!audioUrl || isInitialized) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audio = new Audio(audioUrl);
      audio.crossOrigin = 'anonymous';
      
      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      audioRef.current = audio;
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error inicializando audio:', error);
    }
  };

  // Animar ondas
  const animate = () => {
    if (isPlaying) {
      if (analyserRef.current && audioRef.current) {
        drawRealWaveform();
      } else {
        generateSimulatedWaveform();
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  // Configurar canvas responsive
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (responsive) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    } else {
      canvas.width = canvas.offsetWidth;
      canvas.height = height;
    }
  };

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, []);

  useEffect(() => {
    if (audioUrl) {
      initializeAudio();
    }
  }, [audioUrl]);

  useEffect(() => {
    if (isPlaying) {
      animate();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Mostrar ondas estáticas cuando no está reproduciendo
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = color;
          
          const width = canvas.width;
          const centerY = canvas.height / 2;
          const barCount = Math.floor(width / 4);
          
          for (let i = 0; i < barCount; i++) {
            const x = i * 4;
            const barHeight = 5;
            ctx.fillRect(x, centerY - barHeight / 2, 2, barHeight);
          }
        }
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${className}`}
      style={{ height: `${height}px` }}
    />
  );
};
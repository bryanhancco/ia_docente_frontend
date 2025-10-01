'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiService, ContenidoGenerado } from '../../../../lib/api';

// Declare MathJax global type
declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function ContentDetailPage() {
  const router = useRouter();
  const { id: contentId } = useParams();
  const [content, setContent] = useState<ContenidoGenerado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Basic HTML sanitization function (for additional security)
  const sanitizeHTML = (html: string) => {
    // Remove potentially dangerous elements and attributes
    // This is a basic implementation - for production, consider using DOMPurify
    const cleanHTML = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove inline event handlers
      .replace(/on\w+\s*=\s*'[^']*'/gi, '') // Remove inline event handlers
      .replace(/javascript:/gi, ''); // Remove javascript: URLs
    
    return cleanHTML;
  };

  // Load and configure MathJax
  const loadMathJax = () => {
    if (typeof window !== 'undefined' && !window.MathJax) {
      // Configure MathJax before loading
      window.MathJax = {
        tex: {
          inlineMath: [['\\(', '\\)']],
          displayMath: [['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
        },
        startup: {
          ready: () => {
            console.log('MathJax is loaded and ready.');
            window.MathJax.startup.defaultReady();
          }
        }
      };

      // Load MathJax script
      const script = document.createElement('script');
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
      script.async = true;
      document.head.appendChild(script);

      const mathJaxScript = document.createElement('script');
      mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      mathJaxScript.async = true;
      mathJaxScript.onload = () => {
        console.log('MathJax script loaded');
      };
      document.head.appendChild(mathJaxScript);
    }
  };

  // Process MathJax after content is rendered
  const processMathJax = () => {
    if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise()
        .then(() => {
          console.log('MathJax processing completed');
        })
        .catch((err: any) => {
          console.error('MathJax processing failed:', err);
        });
    }
  };

  useEffect(() => {
    // Load MathJax when component mounts
    loadMathJax();
    
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (contentId) {
          try {
            const contentData = await apiService.getContenido(Number(contentId));
            console.log(contentData)
            setContent(contentData);
          } catch (apiError) {
            console.warn('API not available, using mock data:', apiError);
            // Mock content for demonstration
            const mockContent: ContenidoGenerado = {
              id: Number(contentId),
              id_clase: 1,
              tipo_recurso_generado: "Guía de Estudio",
              contenido: `
<style>
  .math {
    text-align: center;
    margin: 20px 0;
    padding: 15px;
    background-color: #f8f9fa;
    border-left: 4px solid #0d80f2;
    font-family: 'Times New Roman', serif;
    font-size: 1.1em;
  }
  
  .content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    line-height: 1.6;
    color: #333;
  }
  
  .content-wrapper h1 {
    color: #0d80f2;
    border-bottom: 2px solid #0d80f2;
    padding-bottom: 10px;
    margin-bottom: 30px;
  }
  
  .content-wrapper h2 {
    color: #2c5aa0;
    margin-top: 40px;
    margin-bottom: 20px;
  }
  
  .content-wrapper h3 {
    color: #4a6fa5;
    margin-top: 30px;
    margin-bottom: 15px;
  }
  
  .content-wrapper p {
    margin-bottom: 15px;
    text-align: justify;
  }
  
  .content-wrapper ul {
    margin-bottom: 20px;
    padding-left: 25px;
  }
  
  .content-wrapper li {
    margin-bottom: 8px;
  }
  
  .content-wrapper strong {
    color: #0d80f2;
    font-weight: 600;
  }
  
  .content-wrapper em {
    font-style: italic;
    color: #5a6c7d;
  }
</style>

<div class="content-wrapper">
  <h1>Guía de Estudio: Introducción a las Derivadas</h1>

  <h2>1. Introducción y Contexto Histórico</h2>

  <p>
    El cálculo diferencial, la piedra angular de gran parte de la ciencia y la ingeniería modernas, no surgió de la noche a la mañana. Su desarrollo fue el resultado de siglos de avances, impulsados por la curiosidad humana y la necesidad de modelar el mundo natural.
  </p>

  <p>
    <strong>¿Por qué estudiar derivadas?</strong> Imagina querer entender cómo cambia la velocidad de un coche en cada instante, o cómo se propaga una enfermedad en una población. Las derivadas nos proporcionan las herramientas para cuantificar y comprender estas tasas de cambio. Son la clave para desentrañar la dinámica de los sistemas que nos rodean, desde el movimiento de los planetas hasta el crecimiento de las economías.
  </p>

  <p>
    La necesidad de herramientas para describir el cambio se hizo patente durante la Revolución Científica, un período de efervescencia intelectual que vio surgir figuras como Copérnico, Galileo y Kepler. Entre 1630 y 1660, los matemáticos comenzaron a emplear técnicas que hoy reconoceríamos como precursoras de las derivadas. Estas técnicas, a menudo empíricas y enfocadas en resolver problemas concretos, carecían de un rigor formal, pero demostraban la utilidad de abordar el cambio de manera sistemática.
  </p>

  <p>
    La invención del cálculo, atribuida independientemente a <strong>Isaac Newton</strong> y <strong>Gottfried Wilhelm Leibniz</strong> en el último tercio del siglo XVII, representó una síntesis monumental. Unificaron una diversidad de técnicas y problemas bajo dos conceptos generales: la <strong>integral</strong> y la <strong>derivada</strong>. Esta unificación transformó el panorama matemático, proporcionando un lenguaje universal para la ciencia.
  </p>

  <ul>
    <li><strong>Newton</strong> desarrolló su cálculo de "fluxiones" entre 1664 y 1666, utilizándolo extensamente en su obra magna, <em>Philosophiæ Naturalis Principia Mathematica</em> (1687), donde sentó las bases de la mecánica clásica.</li>
    <li><strong>Leibniz</strong>, por su parte, concibió su cálculo en 1675, enfocándose en el desarrollo de una notación matemática que facilitara la manipulación de estas nuevas ideas. Su notación, que ha demostrado ser extraordinariamente superior, es la que prevalece en gran medida hoy en día.</li>
  </ul>

  <p>
    Si bien las primeras formulaciones del cálculo, especialmente el uso de cantidades infinitesimales, presentaban desafíos conceptuales y de rigor, la notación de Leibniz, manejada como un cociente de cantidades infinitesimales (como \\( dy/dx \\)), ofrece una intuición poderosa y una gran fuerza operativa, especialmente en aplicaciones prácticas.
  </p>

  <h2>2. Objetivos de Aprendizaje</h2>

  <p>Al finalizar esta sesión, usted será capaz de:</p>
  <ul>
    <li>Comprender la noción fundamental de la derivada como una tasa de cambio instantánea.</li>
    <li>Reconocer el significado geométrico de la derivada como la pendiente de la recta tangente a una curva.</li>
    <li>Identificar las principales figuras históricas y sus contribuciones al desarrollo del cálculo diferencial.</li>
    <li>Apreciar la importancia del cálculo diferencial como herramienta para la comprensión científica.</li>
  </ul>

  <h2>3. Conocimientos Previos Requeridos</h2>

  <p>
    Para abordar esta guía de estudio de manera efectiva, se asume que usted posee conocimientos sólidos sobre el concepto de <strong>funciones</strong>, incluyendo su representación gráfica, dominio, rango y propiedades básicas.
  </p>

  <h2>4. Conceptos Clave</h2>

  <h3>4.1. La Derivada como Tasa de Cambio</h3>

  <p>
    La derivada de una función en un punto específico nos indica la <strong>tasa de cambio instantánea</strong> de esa función en dicho punto. En términos más sencillos, nos dice qué tan rápido está cambiando el valor de la función a medida que su variable independiente cambia infinitesimalmente.
  </p>

  <p>Consideremos una función \\( f(x) \\). La tasa de cambio promedio de \\( f(x) \\) sobre un intervalo \\([a, b]\\) se define como:</p>

  <div class="math">\\[ \\text{Tasa de cambio promedio} = \\frac{f(b) - f(a)}{b - a} \\]</div>

  <p>
    Esto representa la pendiente de la recta secante que une los puntos \\( (a, f(a)) \\) y \\( (b, f(b)) \\) en la gráfica de la función.
  </p>

  <p>
    Para obtener la tasa de cambio instantánea en un punto \\( x=a \\), debemos hacer que el intervalo se vuelva infinitamente pequeño, es decir, que \\( b \\) se acerque a \\( a \\). Esto nos lleva a la definición formal de la derivada:
  </p>

  <div class="math">\\[ f'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h} \\]</div>

  <p>donde \\( h = b-a \\).</p>

  <p>Esta expresión es el <strong>límite de la tasa de cambio promedio</strong> a medida que el intervalo tiende a cero.</p>

  <h3>4.2. La Derivada como Pendiente de la Recta Tangente</h3>

  <p>
    Geométricamente, la derivada de una función \\( f(x) \\) en un punto \\( x=a \\), denotada como \\( f'(a) \\), representa la <strong>pendiente de la recta tangente</strong> a la gráfica de \\( f(x) \\) en el punto \\( (a, f(a)) \\).
  </p>

  <p>
    La recta tangente en un punto es una línea que "roza" la curva en ese punto y tiene la misma dirección que la curva en ese instante. La pendiente de esta recta nos proporciona información crucial sobre la inclinación de la curva en ese punto.
  </p>

  <div class="math">\\[ \\text{Pendiente de la recta tangente} = f'(a) \\]</div>

  <h2>5. Notación de Leibniz</h2>

  <p>
    Gottfried Wilhelm Leibniz introdujo una notación para la derivada que ha perdurado por su potencia y claridad. La derivada de una función \\( y = f(x) \\) se denota como:
  </p>

  <div class="math">\\[ \\frac{dy}{dx} \\]</div>

  <p>
    Esta notación, \\( dy/dx \\), puede interpretarse intuitivamente como el cociente de un cambio infinitesimal en \\( y \\) (denominado \\( dy \\)) entre un cambio infinitesimal en \\( x \\) (denominado \\( dx \\)). Aunque la base rigurosa de los infinitesimales fue establecida posteriormente, la notación de Leibniz sigue siendo una herramienta muy útil y poderosa para el cálculo.
  </p>

  <p><strong>Ejemplo de uso:</strong> Si tenemos la función \\( f(x) = x^2 \\), la derivada en un punto \\( x \\) se denota como \\( \\frac{d(x^2)}{dx} \\).</p>

  <h2>6. Reflexión y Aplicación</h2>

  <p>
    La invención del cálculo por Newton y Leibniz fue un hito que unificó el estudio del cambio. La capacidad de cuantificar tasas de cambio instantáneas y de comprender la inclinación de las curvas ha abierto puertas a la comprensión de fenómenos complejos en todas las ramas de la ciencia.
  </p>

  <ul>
    <li><strong>Pregunta para la reflexión:</strong> ¿En qué situaciones de su vida cotidiana o de sus estudios podría ser útil conocer la tasa a la que algo está cambiando? Piense en ejemplos como la velocidad de un objeto, el crecimiento de una población o la variación de la temperatura.</li>
  </ul>

  <h2>7. Próximos Pasos</h2>

  <p>
    En sesiones futuras, exploraremos las reglas de derivación que nos permitirán calcular derivadas de manera sistemática para una amplia variedad de funciones, así como las aplicaciones prácticas de este poderoso concepto.
  </p>
</div>`,
              estado: true,
              created_at: "2024-01-15T10:30:00Z",
              updated_at: "2024-01-15T10:30:00Z"
            };
            setContent(mockContent);
          }
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar el contenido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId]);

  // Process MathJax when content changes
  useEffect(() => {
    if (content && content.contenido) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        processMathJax();
      }, 100);
    }
  }, [content]);

  const downloadAsHTML = () => {
    if (!content) return;
    
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.tipo_recurso_generado}</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <script>
      window.MathJax = {
        tex: {
          inlineMath: [['\\\\(', '\\\\)']],
          displayMath: [['\\\\[', '\\\\]']],
          processEscapes: true,
          processEnvironments: true
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
        }
      };
    </script>
</head>
<body>
    ${content.contenido}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${content.tipo_recurso_generado.toLowerCase().replace(/\s+/g, '_')}_${content.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center backdrop-blur-md bg-white/70 rounded-3xl p-12 shadow-2xl border border-white/20">
            <div className="relative mx-auto mb-8 w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>
            <h2 className="text-gray-800 text-2xl font-bold mb-3">Cargando contenido</h2>
            <p className="text-gray-600">Obteniendo el material generado...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
        style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}
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
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_6_330"><rect width="48" height="48" fill="white"/></clipPath>
                  </defs>
                </svg>
              </div>
              <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">LearningForLive</h2>
            </div>
            <div className="flex flex-1 justify-end gap-8">
              <button 
                className="text-[#0d141c] text-sm font-medium leading-normal hover:text-[#0d80f2]"
                onClick={() => router.back()}
              >
                ← Volver
              </button>
            </div>
          </header>
          <div className="px-40 flex flex-1 justify-center py-5 items-center">
            <div className="text-center backdrop-blur-md bg-white/70 rounded-3xl p-12 shadow-2xl border border-white/20 max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <h2 className="text-gray-800 text-xl font-bold mb-3">Error al cargar contenido</h2>
              <p className="text-gray-600 mb-6">{error || 'No se pudo encontrar el contenido solicitado'}</p>
              <button 
                onClick={() => router.back()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Add custom styles for HTML content */}
      <style jsx global>{`
        .html-content {
          /* Ensure HTML content inherits proper styling */
          color: inherit;
          font-family: inherit;
        }
        
        .html-content body {
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
        }
        
        .html-content .container {
          max-width: none !important;
        }
        
        .html-content h1 {
          font-size: 2.5em;
          margin-bottom: 0.5em;
          color: #0d80f2;
          font-weight: 700;
        }
        
        .html-content h2 {
          font-size: 2em;
          margin-bottom: 0.4em;
          color: #2c5aa0;
          font-weight: 600;
        }
        
        .html-content h3 {
          font-size: 1.5em;
          margin-bottom: 0.3em;
          color: #4a6fa5;
          font-weight: 600;
        }
        
        .html-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .html-content ul, .html-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .html-content li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        
        .html-content strong {
          font-weight: 600;
          color: #0d80f2;
        }
        
        .html-content em {
          font-style: italic;
        }
        
        .html-content blockquote {
          border-left: 4px solid #0d80f2;
          margin: 1rem 0;
          padding-left: 1rem;
          background-color: rgba(248, 249, 250, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 0.5rem;
        }
        
        .html-content code {
          background-color: rgba(241, 243, 244, 0.8);
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        
        .html-content pre {
          background-color: rgba(248, 249, 250, 0.8);
          border: 1px solid rgba(233, 236, 239, 0.6);
          border-radius: 0.75rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
          backdrop-filter: blur(10px);
        }
        
        .html-content pre code {
          background-color: transparent;
          padding: 0;
        }
        
        .html-content table {
          width: 100%;
          max-width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .html-content table th,
        .html-content table td {
          border: 1px solid rgba(222, 226, 230, 0.6);
          padding: 0.75rem;
          text-align: left;
        }
        
        .html-content table th {
          background-color: rgba(248, 249, 250, 0.9);
          font-weight: 600;
        }
        
        /* MathJax elements */
        .html-content .MathJax {
          font-size: 1.1em !important;
        }
        
        .html-content .math {
          text-align: center;
          margin: 20px 0;
          padding: 15px;
          background-color: rgba(248, 249, 250, 0.9);
          border-left: 4px solid #0d80f2;
          border-radius: 0.75rem;
          backdrop-filter: blur(10px);
        }
        
        /* Ensure responsive behavior */
        .html-content {
          width: 100%;
          overflow-x: auto;
          word-wrap: break-word;
        }
        
        .html-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1rem 0;
        }
        
        /* Print styles */
        @media print {
          .html-content {
            background: white !important;
          }
          
          .html-content .math {
            background-color: #f8f9fa !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
        
        /* Custom styles for content wrapper */
        .html-content .content-wrapper {
          padding: 2rem;
          max-width: 100%;
        }
        
        @media (max-width: 768px) {
          .html-content .content-wrapper {
            padding: 1rem;
          }
        }
      `}</style>
      
      {/* Header moderno con glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414L9 5.586 7.707 4.293a1 1 0 00-1.414 1.414L8.586 8l-2.293 2.293a1 1 0 101.414 1.414L9 10.414l1.293 1.293a1 1 0 001.414-1.414L10.414 9l2.293-2.293a1 1 0 000-1.414z" clipRule="evenodd"/>
                </svg>
              </div>
              <h1 className="text-gray-800 text-xl font-bold">LearningForLive</h1>
            </div>
            <nav className="flex items-center gap-6">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                </svg>
                Volver
              </button>
              <button 
                onClick={downloadAsHTML}
                className="flex items-center gap-2 backdrop-blur-md bg-green-100/80 hover:bg-green-200/80 text-green-700 font-semibold py-2 px-4 rounded-xl transition-all duration-200 border border-green-200"
                title="Descargar como HTML"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Descargar
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 backdrop-blur-md bg-purple-100/80 hover:bg-purple-200/80 text-purple-700 font-semibold py-2 px-4 rounded-xl transition-all duration-200 border border-purple-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-2h1v2zm7 0v2H8v-2h4zM9 3h2v1H9V3z" clipRule="evenodd"/>
                </svg>
                Imprimir
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Content Header */}
          <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-gray-800 text-3xl font-bold mb-2">
                    {content.tipo_recurso_generado}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                      ID: {content.id}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Clase ID: {content.id_clase}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                      {new Date(content.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-lg ${
                content.estado 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                  : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'
              }`}>
                {content.estado ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Activo
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    Inactivo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* HTML Content */}
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div 
              className="html-content p-8"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(content.contenido) }}
            />
          </div>

          {/* Footer */}
          <div className="backdrop-blur-md bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-2xl p-6 text-center">
            <p className="text-blue-800 font-semibold mb-2">Material generado por LearningForLive</p>
            <p className="text-blue-600 text-sm">
              Personalizado para el perfil de aprendizaje específico • 
              Última actualización: {new Date(content.updated_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

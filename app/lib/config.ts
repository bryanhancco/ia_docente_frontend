// Configuración de entornos
export interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
}

const ensureUrlHasScheme = (url: string): string => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `http://${url}`;
};

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // URLs conocidas para diferentes entornos
  const developmentUrl = 'http://localhost:8000';
  const rawNgrokUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const ngrokUrl = ensureUrlHasScheme(rawNgrokUrl);
  
  // Detectar si es una URL de ngrok
  const isNgrokUrl = ngrokUrl.includes('ngrok-free.app') || ngrokUrl.includes('ngrok.io');
  
  let apiBaseUrl: string;
  
  if (isProduction) {
    // En producción, usar la URL de la variable de entorno (normalizada) o una URL por defecto
    apiBaseUrl = ngrokUrl || 'https://75af69b126cd.ngrok-free.app';
  } else {
    // En desarrollo, preferir localhost si no hay ngrok configurado
    apiBaseUrl = ngrokUrl || developmentUrl;
  }

  // Asegurar que el apiBaseUrl tenga esquema
  apiBaseUrl = ensureUrlHasScheme(apiBaseUrl);
  
  console.log('🏗️ Environment Configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    isDevelopment,
    isProduction,
    ngrokUrl,
    isNgrokUrl,
    finalApiBaseUrl: apiBaseUrl
  });
  
  return {
    apiBaseUrl,
    environment: isProduction ? 'production' : isDevelopment ? 'development' : 'test',
    debug: isDevelopment || process.env.NEXT_PUBLIC_DEBUG === 'true'
  };
};

export const config = getEnvironmentConfig();

// Función para validar que la URL de la API sea válida
export const validateApiUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Función para obtener headers específicos según el entorno
export const getEnvironmentHeaders = (): Record<string, string> => {
  const baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Si es ngrok, agregar el header especial
  if (config.apiBaseUrl.includes('ngrok')) {
    return {
      ...baseHeaders,
      'ngrok-skip-browser-warning': 'true',
    };
  }
  
  return baseHeaders;
};
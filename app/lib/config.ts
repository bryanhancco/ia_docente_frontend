// Configuración de entornos
export interface EnvironmentConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  // URLs conocidas para diferentes entornos
  const developmentUrl = 'http://localhost:8000';
    
  let apiBaseUrl: string;
  
  apiBaseUrl = developmentUrl
  
  console.log('🏗️ Environment Configuration:', {
    NODE_ENV: process.env.NODE_ENV,
    isDevelopment,
    isProduction,
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
  // Do not set Content-Type globally because some requests (FormData/file uploads)
  // must allow the browser to set the multipart boundary automatically. Callers
  // that send JSON should set 'Content-Type': 'application/json' explicitly in
  // the request options.
  return {
    'Accept': 'application/json',
  };
};
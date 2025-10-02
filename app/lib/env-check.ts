// Utilidad para verificar y debuggear variables de entorno

export const checkEnvironmentVariables = () => {
  const envVars = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  console.log('🔍 Estado de las variables de entorno:');
  console.table(envVars);

  // Verificar si estamos en el cliente o servidor
  console.log('🌍 Entorno de ejecución:', typeof window !== 'undefined' ? 'Cliente' : 'Servidor');
  
  return envVars;
};

export const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 API URL utilizada: ${apiUrl}`);
  }
  
  return apiUrl;
};

// Función para verificar conectividad con la API
export const checkApiConnection = async (baseUrl?: string): Promise<boolean> => {
  const url = baseUrl || getApiUrl();
  
  try {
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    const isConnected = response.ok;
    console.log(`🔌 Conexión API ${url}:`, isConnected ? '✅ Conectado' : '❌ Desconectado');
    
    return isConnected;
  } catch (error) {
    console.error(`❌ Error conectando a API ${url}:`, error);
    return false;
  }
};
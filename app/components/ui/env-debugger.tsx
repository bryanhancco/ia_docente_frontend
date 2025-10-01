'use client'

import { useEffect, useState } from 'react';
import { checkEnvironmentVariables, checkApiConnection, getApiUrl } from '../../lib/env-check';

export default function EnvDebugger() {
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Verificar variables de entorno
    const vars = checkEnvironmentVariables();
    setEnvVars(vars);

    // Verificar conexión con la API
    checkApiConnection().then(setApiStatus);
  }, []);

  const apiUrl = getApiUrl();

  return (
    <div className="p-6 bg-gray-100 rounded-lg m-4">
      <h2 className="text-2xl font-bold mb-4">🔍 Debugger de Variables de Entorno</h2>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">📝 Variables de Entorno</h3>
          <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">🔗 URL de la API</h3>
          <p className="font-mono bg-gray-100 p-2 rounded">{apiUrl}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">🔌 Estado de la API</h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-3 h-3 rounded-full ${
              apiStatus === null ? 'bg-yellow-500' : 
              apiStatus ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            <span>{
              apiStatus === null ? 'Verificando...' :
              apiStatus ? 'Conectado' : 'Desconectado'
            }</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg mb-2">🔧 Acciones de Debug</h3>
          <div className="space-x-2">
            <button 
              onClick={() => checkEnvironmentVariables()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Verificar Variables
            </button>
            <button 
              onClick={() => checkApiConnection().then(setApiStatus)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Probar Conexión API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
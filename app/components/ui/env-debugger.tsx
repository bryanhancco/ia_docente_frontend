'use client'

import { useEffect, useState } from 'react';
import { checkEnvironmentVariables, checkApiConnection, getApiUrl } from '../../lib/env-check';
import { apiService } from '../../lib/api';

export default function EnvDebugger() {
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);
  const [envVars, setEnvVars] = useState<any>({});
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // Verificar variables de entorno
    const vars = checkEnvironmentVariables();
    setEnvVars(vars);

    // Verificar conexión con la API
    checkApiConnection().then(setApiStatus);
  }, []);

  const apiUrl = getApiUrl();

  const testApiEndpoints = async () => {
    const endpoints = [
      { name: 'Health Check', path: '/health' },
      { name: 'Docentes', path: '/docentes' },
      { name: 'Clases', path: '/clases' },
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint.name}`);
        const response = await fetch(`${apiUrl}${endpoint.path}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          mode: 'cors',
        });

        const responseText = await response.text();
        const isJson = (() => {
          try {
            JSON.parse(responseText);
            return true;
          } catch {
            return false;
          }
        })();

        results.push({
          name: endpoint.name,
          path: endpoint.path,
          status: response.status,
          ok: response.ok,
          isJson,
          responsePreview: responseText.substring(0, 200),
          contentType: response.headers.get('content-type'),
        });
      } catch (error) {
        results.push({
          name: endpoint.name,
          path: endpoint.path,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    setTestResults(results);
  };

  const testSpecificClass = async () => {
    try {
      console.log('Testing specific class fetch...');
      const classes = await apiService.getClases(1); // Test with docente ID 1
      console.log('Classes fetched successfully:', classes);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

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
          <h3 className="font-semibold text-lg mb-2">🧪 Test de Endpoints</h3>
          <div className="space-x-2 mb-4">
            <button 
              onClick={testApiEndpoints}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Probar Endpoints
            </button>
            <button 
              onClick={testSpecificClass}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Probar Clases API
            </button>
          </div>
          
          {testResults.length > 0 && (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded p-3 text-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      result.error ? 'bg-red-500' : 
                      result.ok ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></span>
                    <strong>{result.name}</strong> - {result.path}
                  </div>
                  {result.error ? (
                    <p className="text-red-600">Error: {result.error}</p>
                  ) : (
                    <div className="text-gray-600">
                      <p>Status: {result.status} | JSON: {result.isJson ? '✅' : '❌'}</p>
                      <p>Content-Type: {result.contentType}</p>
                      <details className="mt-1">
                        <summary className="cursor-pointer">Ver respuesta</summary>
                        <pre className="bg-gray-100 p-2 mt-1 text-xs overflow-x-auto">
                          {result.responsePreview}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
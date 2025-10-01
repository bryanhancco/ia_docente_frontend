import EnvDebugger from '../components/ui/env-debugger';

export default function TestEnvPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          🧪 Página de Testing - Variables de Entorno
        </h1>
        <EnvDebugger />
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">📋 Instrucciones de Testing</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Abre las herramientas de desarrollador del navegador (F12)</li>
            <li>Ve a la pestaña "Console"</li>
            <li>Busca los mensajes de debug que empiezan con 🔍</li>
            <li>Verifica que la URL de la API sea la correcta</li>
            <li>Comprueba el estado de conexión con tu backend</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
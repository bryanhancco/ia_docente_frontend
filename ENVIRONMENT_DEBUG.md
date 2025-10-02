# 🔧 Configuración de Variables de Entorno

## Problema Identificado

El error `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON` indica que el frontend está recibiendo HTML en lugar de JSON desde el backend. Esto generalmente ocurre por:

1. **Variable de entorno no configurada en Vercel**
2. **Backend no accesible desde el dominio de producción**
3. **Problemas de CORS**
4. **URL del backend incorrecta**

## 🚀 Solución para Vercel

### Paso 1: Configurar Variable de Entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `ia-docente-frontend`
3. Ve a **Settings** → **Environment Variables**
4. Agrega la siguiente variable:

```
Name: NEXT_PUBLIC_API_BASE_URL
Value: https://75af69b126cd.ngrok-free.app
Environment: Production, Preview, Development
```

### Paso 2: Verificar la URL de ngrok

Asegúrate de que tu URL de ngrok esté activa y accesible:

```bash
# En tu terminal donde está corriendo el backend
ngrok http 8000
```

Copia la URL HTTPS que ngrok te proporciona (ejemplo: `https://75af69b126cd.ngrok-free.app`)

### Paso 3: Configurar CORS en el Backend

Tu backend debe permitir solicitudes desde tu dominio de Vercel:

```python
# En tu archivo api.py o donde configures CORS
CORS(app, 
     origins=[
         "https://ia-docente-frontend.vercel.app",
         "http://localhost:3000",
         "https://localhost:3000"
     ],
     allow_credentials=True,
     allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
)
```

### Paso 4: Headers para ngrok

Asegúrate de que todas las solicitudes a ngrok incluyan el header:
```javascript
'ngrok-skip-browser-warning': 'true'
```

## 🧪 Testing

### Página de Debug
Visita `/test-env` en tu aplicación para diagnosticar problemas:
- https://ia-docente-frontend.vercel.app/test-env

### Console Logs
Abre DevTools (F12) → Console para ver logs detallados:
- Variables de entorno cargadas
- URLs de API utilizadas
- Respuestas del servidor
- Errores específicos

## 🔍 Diagnóstico de Problemas

### Error: HTML en lugar de JSON
- **Causa**: El backend está devolviendo una página de error HTML
- **Solución**: Verificar que el backend esté corriendo y accesible

### Error: CORS
- **Causa**: El backend no permite solicitudes desde Vercel
- **Solución**: Configurar CORS correctamente

### Error: Variable de entorno undefined
- **Causa**: Variable no configurada en Vercel
- **Solución**: Agregar `NEXT_PUBLIC_API_BASE_URL` en Vercel

### Error: ngrok no accesible
- **Causa**: ngrok se desconectó o cambió de URL
- **Solución**: Reiniciar ngrok y actualizar la variable de entorno

## 📋 Checklist de Verificación

- [ ] Variable `NEXT_PUBLIC_API_BASE_URL` configurada en Vercel
- [ ] Backend corriendo localmente
- [ ] ngrok activo y accesible
- [ ] CORS configurado para permitir Vercel
- [ ] Headers de ngrok incluidos en solicitudes
- [ ] Redeploy de Vercel después de cambios de variables

## 🆘 Comandos de Debug

```bash
# Verificar que el backend responda
curl -H "ngrok-skip-browser-warning: true" https://75af69b126cd.ngrok-free.app/health

# Verificar CORS
curl -H "Origin: https://ia-docente-frontend.vercel.app" \
     -H "ngrok-skip-browser-warning: true" \
     -X OPTIONS \
     https://75af69b126cd.ngrok-free.app/clases
```

## 🔄 Próximos Pasos

1. **Configurar la variable en Vercel**
2. **Redeploy el proyecto en Vercel**
3. **Verificar los logs en la página de debug**
4. **Probar endpoints específicos**
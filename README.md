# LearningForLive - Frontend

Una aplicación web desarrollada en Next.js para la creación de clases y sílabos educativos con inteligencia artificial.

## Características

- **Autenticación**: Sistema de login mockup
- **Dashboard**: Pantalla principal con pestañas para Clases y Sílabos
- **Gestión de Clases**: Creación y visualización de clases con perfiles cognitivos
- **Gestión de Sílabos**: Creación y visualización de sílabos educativos
- **Interfaz Responsiva**: Diseño adaptable usando Tailwind CSS

## Estructura del Proyecto

### Rutas Principales

- `/` - Redirección automática al login
- `/login` - Página de inicio de sesión
- `/dashboard` - Pantalla principal de bienvenida
- `/class/create` - Formulario de creación de clases
- `/class/[id]` - Detalle de clase específica
- `/syllabus/create` - Formulario de creación de sílabos
- `/syllabus/[id]` - Detalle de sílabo específico

### Flujo de la Aplicación

1. **Inicio de Sesión**
   - Campos: Correo, Contraseña
   - Botón: Ingresar
   - Redirección automática al dashboard

2. **Pantalla de Bienvenida (Dashboard)**
   - Encabezado: "Bienvenido, {nombre}"
   - Pestañas: Clases | Sílabos
   - Listado de clases activas con información
   - Botón "Crear" con opciones desplegables

3. **Crear Clase**
   - Formulario con campos de información básica
   - Selección de perfil cognitivo
   - Subida de archivos (PDF, DOC, DOCX)
   - Pantalla de carga con animación
   - Redirección al detalle de la clase generada

4. **Detalle de Clase**
   - Información completa de la clase
   - Panel cognitivo con checkboxes
   - Datos de origen (objetivos, Bloom, modalidad, duración)
   - Recursos generados (presentaciones, videos, quizzes)

5. **Crear Sílabo**
   - Campos: Nombre del curso, Número de semanas, Resultados esperados, Ejes temáticos
   - Generación automática del sílabo
   - Vista de detalle con tabla de ejes temáticos

## Tecnologías Utilizadas

- **Next.js 15.4.6**: Framework de React
- **React 19.1.0**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de estilos
- **App Router**: Sistema de enrutamiento de Next.js

## Instalación y Ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

3. Abrir en navegador: `http://localhost:3000` (o puerto alternativo si está ocupado)

## Características Técnicas

### Componentes React
- **'use client'**: Todos los componentes son del lado del cliente para interactividad
- **useState**: Manejo de estado local para formularios y navegación
- **useRouter**: Navegación programática entre páginas
- **useParams**: Obtención de parámetros de URL dinámicos

### Funcionalidades Implementadas

#### Login (`/login/page.tsx`)
- Formulario de autenticación con validación
- Redirección automática al dashboard
- Estado de formulario manejado con React hooks

#### Dashboard (`/dashboard/page.tsx`)
- Navegación por pestañas (Clases/Sílabos)
- Menú desplegable para opciones de creación
- Listados mockup con datos de ejemplo
- Navegación a páginas de detalle

#### Creación de Clases (`/class/create/page.tsx`)
- Formulario completo con múltiples secciones
- Selección de perfiles cognitivos
- Carga de archivos
- Pantalla de generación con animación
- Validación de formularios

#### Detalle de Clase (`/class/[id]/page.tsx`)
- Rutas dinámicas para diferentes clases
- Datos mockup basados en ID
- Checkboxes para perfiles cognitivos
- Lista de recursos generados con iconos

#### Creación de Sílabos (`/syllabus/create/page.tsx`)
- Formulario específico para sílabos
- Campos de texto y numéricos
- Pantalla de generación
- Validación de datos

#### Detalle de Sílabo (`/syllabus/[id]/page.tsx`)
- Vista de solo lectura del sílabo
- Tabla de ejes temáticos
- Información completa del curso

## Datos Mockup

La aplicación incluye datos de ejemplo para demostrar la funcionalidad:

- **Clases**: Mathematics 101, History 202, Science 303
- **Sílabos**: Advanced Mathematics
- **Perfiles Cognitivos**: Visual, Auditivo, Kinestésico, Lectura/Escritura, Mixto
- **Recursos**: Presentaciones, Videos, Worksheets, Quizzes

## Estado del Proyecto

✅ **Completado:**
- Estructura de rutas de Next.js
- Componentes de UI convertidos de HTML
- Navegación entre páginas
- Formularios funcionales
- Estados de carga
- Datos mockup
- Diseño responsivo mantenido

🔄 **Por implementar (futuras versiones):**
- Integración con backend/API
- Autenticación real
- Base de datos
- Generación de contenido con IA
- Carga real de archivos
- Validaciones avanzadas
- Testing

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm start` - Servidor de producción
- `npm run lint` - Linting del código

## Notas Importantes

- Los archivos HTML originales se mantienen en sus directorios para referencia
- Todos los estilos se conservaron fielmente usando Tailwind CSS
- La funcionalidad es mockup pero completamente navegable
- La aplicación usa TypeScript para mejor desarrollo
- Compatible con las últimas versiones de React y Next.js

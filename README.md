# Sistema de Salud para Personas con Discapacidad - Frontend

Este es el proyecto frontend del sistema de salud para personas con discapacidad, desarrollado como parte de un proyecto de vinculación con la Universidad Pontificia Universidad Católica del Ecuador.

El sistema tiene como objetivo proporcionar servicios de salud accesibles y eficientes para personas con discapacidad, con una interfaz amigable y accesible.

## Tecnologías Usadas

- **Next.js**: Framework de React para la creación de aplicaciones web rápidas y escalables.
- **Axios**: Cliente HTTP para hacer peticiones al backend.
- **TailwindCSS**: Framework CSS para un diseño personalizado y responsivo.
- **pnpm**: Gestor de dependencias rápido y eficiente.
- **React TanStack Query**: Librería para la gestión del estado de datos remotos, con caching y sincronización.
- **Zod**: Librería para la validación de datos y formularios de manera robusta.
- **Shadcn**: Componentes de UI personalizables y accesibles.
- **NextAuth**: Sistema de autenticación para Next.js, compatible con múltiples proveedores de autenticación.

## Requisitos

- **Node.js**: Se recomienda la versión 16 o superior.
- **pnpm**: Utilizado para la gestión de dependencias.

  Puedes instalar `pnpm` globalmente con el siguiente comando:

  ```bash
  npm install -g pnpm
  ```

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   ```

2. Instala las dependencias:

   ```bash
   pnpm install
   ```

3. Configura las variables de entorno:

   Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

   ```bash
   cp .env.example .env.local
   ```

   ```env
       NEXTAUTH_SECRET=12312312312312312312312312
       NEXTAUTH_URL=http://localhost:8000
       PORT=8000
       NEXT_PUBLIC_BACKEND_URL=http://localhost:3000/api/
   ```

4. Inicia el servidor de desarrollo:

   ```bash
   pnpm dev -p 8000
   ```

   El servidor se iniciará en `http://localhost:8000`

## Scripts Disponibles

- `pnpm dev`: Inicia el servidor de desarrollo
- `pnpm build`: Construye la aplicación para producción
- `pnpm start`: Inicia la aplicación en modo producción
- `pnpm lint`: Ejecuta el linter para verificar el código
- `pnpm format`: Verifica el formato del código
- `pnpm format:fix`: Corrige automáticamente el formato del código

## Estructura del Proyecto

```bash
src/
├── app/ # Rutas y páginas de la aplicación
├── components/ # Componentes reutilizables
├── hooks/ # Custom hooks
├── lib/ # Utilidades y configuraciones
├── providers/ # Proveedores de contexto
├── services/ # Servicios para llamadas a la API
├── styles/ # Estilos globales
└── types/ # Definiciones de tipos TypeScript
```

## Características Principales

- Autenticación y autorización con NextAuth
- Gestión de estado con React Query
- Diseño responsivo con TailwindCSS
- Componentes UI accesibles con Shadcn
- Validación de formularios con Zod
- Modo oscuro/claro
- Breadcrumbs para navegación
- Tablas con paginación y ordenamiento
- Gestión de usuarios y roles

## Contribuciones

Si deseas contribuir a este proyecto, por favor sigue estos pasos:

1. Haz un fork de este repositorio
2. Crea una rama para tu contribución: `git checkout -b nombre-de-la-contribucion`
3. Haz tus cambios y realiza commits: `git commit -am 'Descripción de la contribución'`
4. Haz push a tu rama: `git push origin nombre-de-la-contribucion`
5. Abre un pull request en GitHub

## Notas

- Este proyecto utiliza NextAuth para la autenticación, por lo que es necesario configurar las variables de entorno correctamente.
- El backend debe estar corriendo en `http://localhost:3000` para que el frontend funcione correctamente.
- Se recomienda usar `pnpm` en lugar de `npm` o `yarn` para mantener la consistencia en el proyecto.
- Este proyecto está en desarrollo, por lo que algunas funcionalidades pueden cambiar en futuras versiones.

## Licencia

Este proyecto está bajo la Licencia MIT.

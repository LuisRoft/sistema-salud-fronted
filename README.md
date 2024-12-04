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

```bash
cp .env.example .env
```

4. Inicia el servidor de desarrollo:

```bash
pnpm dev
```

## Contribuciones

Si deseas contribuir a este proyecto, por favor sigue estos pasos:

1. Haz un fork de este repositorio.
2. Crea una rama para tu contribución: `git checkout -b nombre-de-la-contribucion`.
3. Haz tus cambios y realiza commits: `git commit -am 'Descripción de la contribución'`.
4. Haz push a tu rama: `git push origin nombre-de-la-contribucion`.
5. Abre un pull request en GitHub.

## Notas

- Este proyecto utiliza NextAuth para la autenticación, por lo que es necesario configurar las variables de entorno para el proveedor de autenticación que se esté utilizando.
- Este proyecto está en desarrollo, por lo que es posible que algunas funcionalidades no estén disponibles o puedan cambiar en futuras versiones.

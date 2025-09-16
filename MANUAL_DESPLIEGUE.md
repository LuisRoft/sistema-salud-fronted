# Manual de Despliegue - Frontend Sistema de Salud

## Tabla de Contenidos
- [Requisitos Previos](#requisitos-previos)
- [1. Configuración Inicial](#1-configuración-inicial)
  - [Clonar el Repositorio](#clonar-el-repositorio)
  - [Instalar Dependencias](#instalar-dependencias)
- [2. Configuración de Variables de Entorno](#2-configuración-de-variables-de-entorno)
- [3. Despliegue Local](#3-despliegue-local)
  - [Modo Desarrollo](#modo-desarrollo)
  - [Modo Producción](#modo-producción)
- [4. Despliegue con Docker](#4-despliegue-con-docker)
- [5. Despliegue en Vercel](#5-despliegue-en-vercel)
- [6. Configuración de Red](#6-configuración-de-red)
- [7. Monitoreo y Mantenimiento](#7-monitoreo-y-mantenimiento)
- [8. Resolución de Problemas Comunes](#8-resolución-de-problemas-comunes)
- [9. Seguridad](#9-seguridad)

## Requisitos Previos

- Node.js (versión 18.x o superior)
- pnpm (gestor de paquetes recomendado)
- Docker (opcional, para despliegue en contenedores)
- Git
- Cuenta en Vercel (para despliegue en la nube)

## 1. Configuración Inicial

### Clonar el Repositorio

```bash
git clone https://github.com/nightydev/sistema-salud-frontend.git
cd sistema-salud-frontend
```

### Instalar Dependencias

```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm

# Instalar dependencias del proyecto
pnpm install
```

## 2. Configuración de Variables de Entorno

Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# URL de la API de backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000/api/

# Configuración de autenticación
NEXTAUTH_URL=http://localhost:8000
NEXTAUTH_SECRET=12312312312312312312312312

# Puerto de la aplicación
PORT=8000
```

## 3. Despliegue Local

### Modo Desarrollo

```bash
# Iniciar servidor de desarrollo en el puerto 8000
pnpm dev -p 8000
```

La aplicación estará disponible en: `http://localhost:8000`

### Modo Producción

```bash
# Construir la aplicación
pnpm build

# Iniciar en producción
pnpm start
```

## 4. Despliegue con Docker

### Construir la imagen

Primero, asegúrate de tener un `Dockerfile` configurado para usar pnpm. Luego:

```bash
docker build -t sistema-salud-frontend .
```

### Ejecutar el contenedor

```bash
docker run -d \
  --name sistema-salud-frontend \
  -p 8000:8000 \
  --env-file .env.local \
  sistema-salud-frontend
```

## 5. Despliegue en Vercel

1. Instala la CLI de Vercel si no la tienes:
   ```bash
   pnpm add -g vercel
   ```

2. Inicia sesión en tu cuenta de Vercel:
   ```bash
   vercel login
   ```

3. Despliega la aplicación:
   ```bash
   vercel --prod
   ```

4. Sigue las instrucciones en pantalla para configurar el proyecto.

## 6. Configuración de Red

Asegúrate de que los siguientes puertos estén abiertos en tu firewall:
- Puerto 8000 (puerto por defecto de la aplicación)
- Puerto 3000 (para la API del backend)

## 7. Monitoreo y Mantenimiento

### Ver logs en producción

Si usas Vercel:
```bash
vercel logs
```

Si usas Docker:
```bash
docker logs sistema-salud-frontend
```

### Actualizaciones

Para actualizar la aplicación:

```bash
# Obtener los últimos cambios
git pull origin main

# Reinstalar dependencias
pnpm install

# Reconstruir la aplicación
pnpm build

# Reiniciar el servicio (si es necesario)
pnpm start
```

## 8. Resolución de Problemas Comunes

### Errores de compilación
- Verifica que todas las variables de entorno estén configuradas correctamente
- Limpia la caché de Next.js:
  ```bash
  rm -rf .next .pnpm-store
  ```

### Problemas de CORS
- Asegúrate de que la URL del backend esté correctamente configurada en `NEXT_PUBLIC_BACKEND_URL`
- Verifica la configuración de CORS en el backend

### Errores de dependencias
- Si hay problemas con las dependencias, intenta:
  ```bash
  rm -rf node_modules pnpm-lock.yaml .next
  pnpm install
  ```

## 9. Seguridad

- Nunca subas el archivo `.env.local` al control de versiones
- Usa siempre HTTPS en producción
- Mantén actualizadas las dependencias con `pnpm audit`
- Configura políticas de seguridad de contenido (CSP) según sea necesario

## 10. Optimización de Rendimiento

Para mejorar el rendimiento en producción:

1. Habilita la compresión GZIP/Brotli
2. Configura el almacenamiento en caché adecuado
3. Optimiza las imágenes usando el componente `next/image`
4. Implementa carga perezosa (lazy loading) para componentes pesados
5. Usa `next/dynamic` para la carga dinámica de componentes

## 11. Integración Continua (CI/CD)

Ejemplo de configuración para GitHub Actions usando pnpm:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '18.x'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

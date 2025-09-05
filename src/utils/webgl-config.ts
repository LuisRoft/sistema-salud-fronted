/**
 * Configuración y utilidades para WebGL
 * Maneja problemas de adaptadores gráficos y fallbacks de software
 */

export interface WebGLInfo {
  supported: boolean;
  version?: string;
  renderer?: string;
  vendor?: string;
  error?: string;
  hasSoftwareFallback?: boolean;
}

/**
 * Verifica el soporte de WebGL y obtiene información del sistema gráfico
 */
export function checkWebGLSupport(): WebGLInfo {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return {
        supported: false,
        error: 'WebGL no está disponible en este navegador',
        hasSoftwareFallback: false
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Desconocido';
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Desconocido';
    const version = gl.getParameter(gl.VERSION);

    // Detectar si está usando software rendering
    const isSoftwareRenderer = renderer.toLowerCase().includes('software') || 
                              renderer.toLowerCase().includes('swiftshader') ||
                              renderer.toLowerCase().includes('mesa');

    return {
      supported: true,
      version,
      renderer,
      vendor,
      hasSoftwareFallback: isSoftwareRenderer
    };
  } catch (error) {
    return {
      supported: false,
      error: `Error verificando WebGL: ${error}`,
      hasSoftwareFallback: false
    };
  }
}

/**
 * Configura parámetros de URL para optimizar WebGL según las capacidades del sistema
 */
export function getWebGLOptimizedParams(baseUrl: string): string {
  const webglInfo = checkWebGLSupport();
  const url = new URL(baseUrl);
  
  // Parámetros base para mejorar compatibilidad
  url.searchParams.set('webgl_fallback', 'true');
  url.searchParams.set('antialias', 'false'); // Reducir carga gráfica
  url.searchParams.set('preserveDrawingBuffer', 'true');
  
  if (!webglInfo.supported) {
    // Si WebGL no está soportado, forzar software rendering
    url.searchParams.set('force_software_webgl', 'true');
    url.searchParams.set('disable_webgl2', 'true');
    url.searchParams.set('quality', 'low');
  } else if (webglInfo.hasSoftwareFallback) {
    // Si ya está usando software rendering, optimizar para ello
    url.searchParams.set('quality', 'medium');
    url.searchParams.set('disable_webgl2', 'true');
  } else {
    // Hardware WebGL disponible, usar configuración normal
    url.searchParams.set('quality', 'high');
    url.searchParams.set('disable_webgl2', 'false');
  }
  
  return url.toString();
}

/**
 * Logs detallados sobre el estado de WebGL para debugging
 */
export function logWebGLStatus(): void {
  const webglInfo = checkWebGLSupport();
  
  console.group('🎮 Estado de WebGL');
  console.log('✅ Soportado:', webglInfo.supported);
  
  if (webglInfo.supported) {
    console.log('🔧 Versión:', webglInfo.version);
    console.log('🎨 Renderer:', webglInfo.renderer);
    console.log('🏭 Vendor:', webglInfo.vendor);
    console.log('💻 Software Fallback:', webglInfo.hasSoftwareFallback);
    
    if (webglInfo.hasSoftwareFallback) {
      console.warn('⚠️ Usando renderizado por software - rendimiento reducido');
    }
  } else {
    console.error('❌ Error:', webglInfo.error);
  }
  
  console.groupEnd();
}

/**
 * Detecta si el entorno soporta hardware acceleration
 */
export function hasHardwareAcceleration(): boolean {
  const webglInfo = checkWebGLSupport();
  return webglInfo.supported && !webglInfo.hasSoftwareFallback;
}

/**
 * Configuración recomendada para BioDigital según las capacidades del sistema
 */
export function getBioDigitalConfig() {
  const webglInfo = checkWebGLSupport();
  
  return {
    webglSupported: webglInfo.supported,
    recommendedQuality: webglInfo.hasSoftwareFallback ? 'medium' : 'high',
    useWebGL2: webglInfo.supported && !webglInfo.hasSoftwareFallback,
    enableAntialiasing: hasHardwareAcceleration(),
    maxTextureSize: webglInfo.hasSoftwareFallback ? 1024 : 2048
  };
}
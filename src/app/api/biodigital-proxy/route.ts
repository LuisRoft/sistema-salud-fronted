import { NextRequest, NextResponse } from 'next/server';

// Función para generar token de BioDigital
async function generateBioDigitalToken(): Promise<string> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/api-key/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Error al generar token: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('❌ Error al generar token de BioDigital en proxy:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelUrl = searchParams.get('url');
    
    if (!modelUrl) {
      return NextResponse.json(
        { error: 'URL del modelo es requerida' },
        { status: 400 }
      );
    }

    // Decodificar la URL del modelo
    const decodedUrl = decodeURIComponent(modelUrl);
    
    console.log('🔗 Proxy BioDigital - URL solicitada:', decodedUrl);

    // Generar token de autenticación
    let authToken: string | null = null;
    try {
      authToken = await generateBioDigitalToken();
      console.log('🔑 Token de autenticación generado para proxy');
    } catch (error) {
      console.warn('⚠️ No se pudo generar token, continuando sin autenticación:', error);
    }

    // Preparar headers con autenticación si está disponible
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };

    // Agregar token de autorización si está disponible
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Realizar la petición al modelo de BioDigital
    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers,
      },
    });

    if (!response.ok) {
      console.error('❌ Error en proxy BioDigital:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Error cargando modelo de BioDigital' },
        { status: response.status }
      );
    }

    const content = await response.text();
    
    // Modificar el contenido HTML para ajustar referencias y agregar configuraciones de seguridad
    const modifiedContent = content
      .replace(/src="\//g, 'src="https://human.biodigital.com/')
      .replace(/href="\//g, 'href="https://human.biodigital.com/')
      .replace(/url\(\//g, 'url(https://human.biodigital.com/')
      .replace(/<head>/i, '<head><meta http-equiv="Content-Security-Policy" content="default-src * \'unsafe-inline\' \'unsafe-eval\' data: blob:; worker-src * blob: data:; script-src * \'unsafe-inline\' \'unsafe-eval\';">')
      .replace(/<\/head>/i, '<script>window.addEventListener("error", function(e) { console.log("Error capturado:", e); });</script></head>');

    console.log('✅ Proxy BioDigital - Contenido servido exitosamente');

    return new NextResponse(modifiedContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('❌ Error en proxy BioDigital:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del proxy BioDigital', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
import { NextRequest, NextResponse } from 'next/server';

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

    // Realizar la petición al modelo de BioDigital
    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
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
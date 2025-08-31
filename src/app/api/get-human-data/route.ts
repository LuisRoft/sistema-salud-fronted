import { NextRequest, NextResponse } from 'next/server';
import { fetchBioDigitalData } from '@/services/biodigitalService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Obteniendo datos de BioDigital con token dinámico del backend');
    
    const data = await fetchBioDigitalData();
    
    console.log('✅ Datos obtenidos de BioDigital exitosamente');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Error obteniendo datos de BioDigital:', error);
    return NextResponse.json(
      { 
        error: 'Error obteniendo datos de BioDigital', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

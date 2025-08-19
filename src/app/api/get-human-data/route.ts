import { NextResponse } from "next/server";

// Interfaces para tipado
interface BioDigitalContent {
  content_url: string;
  id: string;
  title?: string;
}

interface BioDigitalResponse {
  myhuman: BioDigitalContent[];
}

// Configuración de la API
const BIODIGITAL_API_BASE_URL =
  "https://apis.biodigital.com/services/v2" as const;
const COLLECTION_ENDPOINT = "/content/collections/myhuman" as const;

export async function GET(request: Request) {
  const API_KEY = process.env.NEXT_PUBLIC_BIODIGITAL_API_KEY;

  // Validación de API key
  if (!API_KEY) {
    console.error("NEXT_PUBLIC_BIODIGITAL_API_KEY no está configurada");
    return NextResponse.json(
      { error: "API key no configurada" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${BIODIGITAL_API_BASE_URL}${COLLECTION_ENDPOINT}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "User-Agent": "test-model/1.0.0", // Identificar tu aplicación
        },
        // Timeout después de 10 segundos
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`BioDigital API error ${response.status}:`, errorText);

      return NextResponse.json(
        {
          error: "Error al obtener datos de BioDigital",
          status: response.status,
          details: response.statusText,
        },
        { status: response.status }
      );
    }

    const data: BioDigitalResponse = await response.json();

    // Validar estructura de respuesta
    if (!data.myhuman || !Array.isArray(data.myhuman)) {
      console.error("Estructura de respuesta inválida:", data);
      return NextResponse.json(
        { error: "Estructura de datos inválida" },
        { status: 502 }
      );
    }

    // Log solo en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log("Datos obtenidos exitosamente:", {
        count: data.myhuman.length,
        firstModel: data.myhuman[0]?.id || "N/A",
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en get-human-data:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error interno del servidor";
    const isTimeoutError =
      error instanceof Error && error.name === "TimeoutError";

    return NextResponse.json(
      {
        error: isTimeoutError
          ? "Timeout al conectar con BioDigital"
          : errorMessage,
        type: isTimeoutError ? "timeout" : "unknown",
      },
      { status: isTimeoutError ? 504 : 500 }
    );
  }
}

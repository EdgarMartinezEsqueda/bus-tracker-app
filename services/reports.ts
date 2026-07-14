/**
 * Reportes anónimos vía Supabase REST (sin SDK: un POST basta).
 * La tabla `reports` tiene RLS insert-only para el rol anon: nadie puede
 * leer los reportes con la anon key, solo insertarlos. Ver README.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export type ReportType =
  | "parada_incorrecta"
  | "parada_faltante"
  | "ruta_modificada"
  | "recorrido_incorrecto"
  | "comentario";

export const REPORT_TYPES: Array<{ value: ReportType; label: string }> = [
  { value: "parada_incorrecta", label: "Parada incorrecta" },
  { value: "parada_faltante", label: "Parada faltante" },
  { value: "ruta_modificada", label: "Ruta modificada" },
  { value: "recorrido_incorrecto", label: "Recorrido incorrecto" },
  { value: "comentario", label: "Comentario general" },
];

export const isReportingConfigured = (): boolean =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

interface ReportPayload {
  type: ReportType;
  routeCode: string | null;
  description: string;
}

export const submitReport = async ({
  type,
  routeCode,
  description,
}: ReportPayload): Promise<boolean> => {
  if (!isReportingConfigured()) return false;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        type,
        route_code: routeCode,
        description: description.trim() || null,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
};
